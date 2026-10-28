import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/conversations/:id
 * Returns full details and message history of a single conversation (Requirement E1 & Section 9)
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data: conversation, error } = await supabaseAdmin
      .from('conversations')
      .select(
        'id, widget_id, shop_id, visitor_id, visitor_email, started_at, last_message_at, messages(id, role, content, sources_used, answered, tokens_in, tokens_out, cost_usd, created_at)'
      )
      .eq('id', id)
      .single();

    if (error || !conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    return NextResponse.json({ conversation });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch conversation';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

