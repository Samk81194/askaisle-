import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { createEmbedding } from '@/lib/ai/embeddings';
import { streamClaudeResponse, ChunkContext } from '@/lib/ai/claude';

// In-memory sliding window rate limiter per IP & widget_key (PRD Section 6: Anti-Abuse)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 15;
const MAX_MESSAGE_LENGTH = 500; // PRD Section 10: Max 500 chars per visitor message

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  entry.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { widget_key, conversation_id, message, visitor_id } = body;

    if (!widget_key || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing widget_key or message' },
        { status: 400 }
      );
    }

    // 0. Guardrail: Maximum visitor message length (500 characters - PRD Section 10)
    const trimmedMessage = String(message).trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    // 0b. Guardrail: Rate Limiting per IP + Widget Key (PRD Section 6)
    const clientIp =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown_ip';

    if (!checkRateLimit(`${clientIp}:${widget_key}`)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a moment before sending another question.' },
        { status: 429 }
      );
    }

    // 1. Validate widget and get associated shop
    const { data: widget, error: widgetError } = await supabaseAdmin
      .from('widgets')
      .select('id, shop_id, display_name, allowed_domains, shops!inner(id, shopify_domain, plan, status)')
      .eq('public_key', widget_key)
      .single();

    if (widgetError || !widget) {
      return NextResponse.json(
        { error: 'Invalid or inactive widget key' },
        { status: 403 }
      );
    }

    const shop = Array.isArray(widget.shops) ? widget.shops[0] : widget.shops;
    const shopId = widget.shop_id;
    const shopName = widget.display_name || shop.shopify_domain.replace('.myshopify.com', '');

    // 1b. Guardrail: Verify allowed_domains if configured (PRD Section 6)
    const originHeader = req.headers.get('origin') || req.headers.get('referer') || '';
    if (Array.isArray(widget.allowed_domains) && widget.allowed_domains.length > 0 && originHeader) {
      try {
        const requestHost = new URL(originHeader).hostname.toLowerCase();
        const isAllowed =
          requestHost === 'localhost' ||
          requestHost.endsWith('.vercel.app') ||
          requestHost === shop.shopify_domain.toLowerCase() ||
          widget.allowed_domains.some((d: string) => requestHost === d.toLowerCase().trim());

        if (!isAllowed) {
          return NextResponse.json(
            { error: 'Origin domain not authorized for this widget key' },
            { status: 403 }
          );
        }
      } catch {
        // Ignore malformed referer
      }
    }

    // 2. Check monthly usage quota (Requirement F2)
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'
    const planLimits: Record<string, number> = {
      starter: 500,
      growth: 2000,
      pro: 6000,
      trial: 100,
    };

    const maxMessages = planLimits[shop.plan?.toLowerCase() || 'trial'] || 100;

    const { data: usage } = await supabaseAdmin
      .from('usage_monthly')
      .select('messages_count')
      .eq('shop_id', shopId)
      .eq('month', currentMonth)
      .maybeSingle();

    const currentCount = usage?.messages_count || 0;
    if (currentCount >= maxMessages) {
      return NextResponse.json(
        {
          error: 'Monthly quota reached. Please upgrade plan to continue receiving responses.',
          quota_reached: true,
        },
        { status: 429 }
      );
    }

    // 3. Resolve or create conversation
    let currentConvId = conversation_id;
    if (!currentConvId) {
      const { data: newConv } = await supabaseAdmin
        .from('conversations')
        .insert({
          widget_id: widget.id,
          shop_id: shopId,
          visitor_id: visitor_id || 'anonymous_' + Math.random().toString(36).substring(2, 9),
        })
        .select('id')
        .single();

      currentConvId = newConv?.id;
    }

    // 4. Vector Search for relevant chunks (5 to 8 closest chunks - PRD Section 10)
    let chunks: ChunkContext[] = [];
    try {
      const queryEmbedding = await createEmbedding(trimmedMessage);
      const { data: matchData, error: matchError } = await supabaseAdmin.rpc('match_chunks', {
        query_embedding: queryEmbedding,
        filter_shop_id: shopId,
        match_threshold: 0.55,
        match_count: 6,
      });

      if (!matchError && matchData) {
        chunks = matchData as ChunkContext[];
      }
    } catch (embErr) {
      console.warn('Embedding search failed or API key not set:', embErr);
    }

    const encoder = new TextEncoder();

    // 5. If no relevant chunks found -> Return courteous fallback immediately ($0 LLM cost!)
    if (chunks.length === 0) {
      const stream = new ReadableStream({
        async start(controller) {
          const fallbackText =
            "I'm sorry, I don't have information regarding this in our store catalog. Would you like to leave your email so our support team can answer you directly?";

          controller.enqueue(
            encoder.encode(`event: token\ndata: ${JSON.stringify(fallbackText)}\n\n`)
          );

          if (currentConvId) {
            await supabaseAdmin.from('messages').insert([
              {
                conversation_id: currentConvId,
                role: 'user',
                content: trimmedMessage,
              },
              {
                conversation_id: currentConvId,
                role: 'assistant',
                content: fallbackText,
                answered: false,
                tokens_in: 0,
                tokens_out: 0,
                cost_usd: 0,
              },
            ]);
          }

          await supabaseAdmin.from('usage_monthly').upsert(
            {
              shop_id: shopId,
              month: currentMonth,
              messages_count: currentCount + 1,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'shop_id,month' }
          );

          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({
                conversation_id: currentConvId,
                answered: false,
              })}\n\n`
            )
          );
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      });
    }

    // 6. Chunks were found -> Stream Claude Haiku response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const claudeStream = await streamClaudeResponse({
            shopName,
            userMessage: trimmedMessage,
            contextChunks: chunks,
          });

          let fullAssistantText = '';
          let inputTokens = 300;
          let outputTokens = 60;

          for await (const chunk of claudeStream) {
            if (
              chunk.type === 'content_block_delta' &&
              chunk.delta.type === 'text_delta'
            ) {
              const text = chunk.delta.text;
              fullAssistantText += text;
              controller.enqueue(
                encoder.encode(`event: token\ndata: ${JSON.stringify(text)}\n\n`)
              );
            } else if (chunk.type === 'message_start' && chunk.message?.usage) {
              inputTokens = chunk.message.usage.input_tokens || inputTokens;
            } else if (chunk.type === 'message_delta' && chunk.usage) {
              outputTokens = chunk.usage.output_tokens || outputTokens;
            }
          }

          // Calculate real Claude Haiku cost in USD ($0.80 / 1M input, $4.00 / 1M output)
          const calculatedCostUsd = Number(
            ((inputTokens * 0.0000008) + (outputTokens * 0.000004)).toFixed(6)
          );

          const sources = chunks.map((c) => ({
            title: c.metadata?.title || 'Shop Information',
            url: c.metadata?.url || null,
          }));

          controller.enqueue(
            encoder.encode(`event: sources\ndata: ${JSON.stringify(sources)}\n\n`)
          );

          if (currentConvId) {
            await supabaseAdmin.from('messages').insert([
              {
                conversation_id: currentConvId,
                role: 'user',
                content: trimmedMessage,
              },
              {
                conversation_id: currentConvId,
                role: 'assistant',
                content: fullAssistantText,
                sources_used: sources,
                answered: true,
                tokens_in: inputTokens,
                tokens_out: outputTokens,
                cost_usd: calculatedCostUsd,
              },
            ]);
          }

          await supabaseAdmin.from('usage_monthly').upsert(
            {
              shop_id: shopId,
              month: currentMonth,
              messages_count: currentCount + 1,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'shop_id,month' }
          );

          controller.enqueue(
            encoder.encode(
              `event: done\ndata: ${JSON.stringify({
                conversation_id: currentConvId,
                answered: true,
              })}\n\n`
            )
          );
        } catch (err: unknown) {
          const errorMsg = err instanceof Error ? err.message : 'Error generating response';
          controller.enqueue(
            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: errorMsg })}\n\n`)
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
