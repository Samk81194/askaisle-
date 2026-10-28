import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { indexSourceDocument } from '@/lib/shopify/sync';
import { sendShopperFollowUpEmail } from '@/lib/email/resend';

/**
 * POST /api/messages/:id/answer
 * The Learning Loop (Requirement E2 & Section 9):
 * Takes the merchant's answer to an unanswered question, indexes it as a `qa` source in pgvector,
 * marks the message as answered, and emails the shopper if their email was captured.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: messageId } = await context.params;
    const { answer, question_override, shop_id } = await req.json();

    if (!answer?.trim()) {
      return NextResponse.json({ error: 'Missing answer content' }, { status: 400 });
    }

    // 1. Lookup message & conversation if messageId is a UUID in DB
    const { data: msgRecord } = await supabaseAdmin
      .from('messages')
      .select('id, content, conversation_id, conversations(shop_id, visitor_email)')
      .eq('id', messageId)
      .maybeSingle();

    const conv = msgRecord?.conversations
      ? Array.isArray(msgRecord.conversations)
        ? msgRecord.conversations[0]
        : msgRecord.conversations
      : null;

    const resolvedShopId = conv?.shop_id || shop_id;
    const questionText = question_override || msgRecord?.content || 'Customer FAQ';

    if (!resolvedShopId) {
      return NextResponse.json({ error: 'Could not resolve shop_id for QA source' }, { status: 400 });
    }

    // 2. Create a `qa` source and index its vector chunk into `chunks`
    const qaContent = `Question: ${questionText}\nOfficial Answer: ${answer.trim()}`;
    const indexed = await indexSourceDocument({
      shopId: resolvedShopId,
      type: 'qa',
      title: `QA: ${questionText.slice(0, 90)}`,
      fullContent: qaContent,
    });

    // 3. Mark message as answered
    if (msgRecord?.id) {
      await supabaseAdmin
        .from('messages')
        .update({ answered: true })
        .eq('id', msgRecord.id);
    }

    // 4. Send follow-up email if visitor left their email address
    if (conv?.visitor_email) {
      await sendShopperFollowUpEmail({
        to: conv.visitor_email,
        question: questionText,
        answer: answer.trim(),
      });
    }

    return NextResponse.json({
      success: true,
      source_id: indexed.sourceId,
      chunks_created: indexed.chunksCreated,
      notified_visitor: Boolean(conv?.visitor_email),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to save QA answer';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

