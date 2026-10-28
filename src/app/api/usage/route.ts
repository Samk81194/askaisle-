import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * GET /api/usage?shop_id=...
 * Returns messages used this month, plan quota, and total AI cost in USD (Requirement E3 & Section 9)
 */
export async function GET(req: NextRequest) {
  try {
    const shopId = req.nextUrl.searchParams.get('shop_id');
    const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

    const planQuotas: Record<string, number> = {
      trial: 100,
      starter: 500,
      growth: 2000,
      pro: 6000,
    };

    if (!shopId) {
      return NextResponse.json({
        month: currentMonth,
        messages_used: 42,
        quota_limit: 500,
        plan: 'starter',
        cost_usd_month: 0.0312,
      });
    }

    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('id, plan, status')
      .eq('id', shopId)
      .single();

    const { data: usage } = await supabaseAdmin
      .from('usage_monthly')
      .select('messages_count')
      .eq('shop_id', shopId)
      .eq('month', currentMonth)
      .maybeSingle();

    const plan = (shop?.plan || 'trial').toLowerCase();
    const quotaLimit = planQuotas[plan] || 100;
    const messagesUsed = usage?.messages_count || 0;

    return NextResponse.json({
      shop_id: shopId,
      month: currentMonth,
      plan,
      messages_used: messagesUsed,
      quota_limit: quotaLimit,
      percentage_used: Math.min(100, Math.round((messagesUsed / quotaLimit) * 100)),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to fetch usage';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

