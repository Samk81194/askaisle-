import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { cleanHtml, indexSourceDocument } from '@/lib/shopify/sync';

/**
 * GET /api/sources?shop_id=...
 * Lists all knowledge sources for a shop
 */
export async function GET(req: NextRequest) {
  try {
    const shopId = req.nextUrl.searchParams.get('shop_id');
    let query = supabaseAdmin
      .from('sources')
      .select('id, shop_id, type, title, url, status, content_hash, synced_at, created_at')
      .order('created_at', { ascending: false });

    if (shopId) {
      query = query.eq('shop_id', shopId);
    }

    const { data, error } = await query.limit(200);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ sources: data || [] });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch sources';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

/**
 * POST /api/sources
 * Adds a manual FAQ source: URL, pasted text, or PDF text content (Requirement B3)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop_id, type, title, url, content } = body;

    if (!shop_id || !type || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: shop_id, type, title' },
        { status: 400 }
      );
    }

    if (!['url', 'text', 'pdf', 'qa'].includes(type)) {
      return NextResponse.json({ error: 'Invalid source type' }, { status: 400 });
    }

    // Enforce 10 MB payload limit for PDF / Text (Requirement B3)
    const rawSize = Buffer.byteLength(content || '', 'utf8');
    if (rawSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Document exceeds the 10 MB maximum size limit' },
        { status: 413 }
      );
    }

    let extractedText = content || '';

    // If type is URL, fetch and clean HTML automatically
    if (type === 'url' && url) {
      const pageRes = await fetch(url, {
        headers: { 'User-Agent': 'AskAisleBot/1.0 (+https://askaisle.com)' },
      });
      if (!pageRes.ok) {
        return NextResponse.json(
          { error: `Could not fetch URL (${pageRes.status})` },
          { status: 400 }
        );
      }
      const html = await pageRes.text();
      extractedText = cleanHtml(html);
    }

    if (!extractedText.trim()) {
      return NextResponse.json(
        { error: 'Source content is empty after extraction' },
        { status: 400 }
      );
    }

    const indexed = await indexSourceDocument({
      shopId: shop_id,
      type,
      title,
      url,
      fullContent: `${title}\n${extractedText}`,
    });

    return NextResponse.json({
      success: true,
      source_id: indexed.sourceId,
      chunks_created: indexed.chunksCreated,
      skipped: indexed.skipped,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to index source';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

