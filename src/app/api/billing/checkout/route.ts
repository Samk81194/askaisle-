import { NextRequest, NextResponse } from 'next/server';
import { stripe, STRIPE_PLANS } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * POST /api/billing/checkout
 * Creates a checkout session for the chosen plan (Starter $19, Growth $39, Pro $79)
 * Supports Lemon Squeezy (recommended by PRD Section 11 for Côte d'Ivoire payouts) or Stripe
 */
export async function POST(req: NextRequest) {
  try {
    const { shop_id, plan = 'growth', provider = 'lemonsqueezy' } = await req.json();
    const normalizedPlan = plan.toLowerCase() as keyof typeof STRIPE_PLANS;
    const planConfig = STRIPE_PLANS[normalizedPlan] || STRIPE_PLANS.growth;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    // 1. If Lemon Squeezy Store Checkout URL is configured (0$ fixed cost, handles VAT & Payoneer/Wire payouts)
    const lemonCheckoutBase = process.env.LEMONSQUEEZY_CHECKOUT_URL;
    if (provider === 'lemonsqueezy' && lemonCheckoutBase) {
      const checkoutUrl = `${lemonCheckoutBase}?checkout[custom][shop_id]=${encodeURIComponent(shop_id || '')}&checkout[custom][plan]=${encodeURIComponent(normalizedPlan)}`;
      return NextResponse.json({ url: checkoutUrl, provider: 'lemonsqueezy' });
    }

    // 2. If Stripe Secret Key is configured
    if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_...')) {
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: planConfig.priceId, quantity: 1 }],
        subscription_data: {
          trial_period_days: 14,
          metadata: { shop_id: shop_id || '', plan: normalizedPlan },
        },
        metadata: { shop_id: shop_id || '', plan: normalizedPlan },
        success_url: `${appUrl}/dashboard?billing=success&plan=${normalizedPlan}`,
        cancel_url: `${appUrl}/dashboard?billing=canceled`,
      });
      return NextResponse.json({ url: session.url, provider: 'stripe' });
    }

    // 3. Fallback when payment keys aren't filled yet
    return NextResponse.json({
      url: `${appUrl}/dashboard?billing=trial_activated&plan=${normalizedPlan}`,
      provider: 'trial_mode',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Checkout creation failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

/**
 * DELETE /api/billing/checkout
 * 2-Click Subscription Cancellation — maintains access until period end (Requirement F3)
 */
export async function DELETE(req: NextRequest) {
  try {
    const { shop_id } = await req.json();
    if (!shop_id) {
      return NextResponse.json({ error: 'Missing shop_id' }, { status: 400 });
    }

    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, provider_subscription_id, provider')
      .eq('shop_id', shop_id)
      .maybeSingle();

    if (sub?.provider === 'stripe' && sub.provider_subscription_id && process.env.STRIPE_SECRET_KEY) {
      await stripe.subscriptions.update(sub.provider_subscription_id, {
        cancel_at_period_end: true,
      });
    }

    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('shop_id', shop_id);

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled. Access remains active until the end of the current billing period.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Cancellation failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
