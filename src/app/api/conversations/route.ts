import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/conversations
 * Returns filterable list of conversations for the merchant dashboard (Requirement E1 & Section 9)
 */
export async function GET(req: NextRequest) {
  try {
    const shopId = req.nextUrl.searchParams.get('shop_id');
    const fromDate = req.nextUrl.searchParams.get('from');
    const toDate = req.nextUrl.searchParams.get('to');

    let query = supabaseAdmin
      .from('conversations')
      .select(
        'id, widget_id, shop_id, visitor_id, visitor_email, started_at, last_message_at, messages(id, role, content, answered, sources_used, cost_usd, created_at)'
      )
      .order('started_at', { ascending: false })
      .limit(100);

    if (shopId) {
      query = query.eq('shop_id', shopId);
    }
    if (fromDate) {
      query = query.gte('started_at', fromDate);
    }
    if (toDate) {
      query = query.lte('started_at', toDate);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: data || [] });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch conversations';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

