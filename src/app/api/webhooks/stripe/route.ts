import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing stripe signature or secret' }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: `Webhook signature error: ${errorMsg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const shopId = session.metadata?.shop_id;
        const plan = session.metadata?.plan || 'starter';

        if (shopId) {
          await supabaseAdmin
            .from('shops')
            .update({ plan: plan, status: 'active' })
            .eq('id', shopId);

          await supabaseAdmin.from('subscriptions').upsert(
            {
              shop_id: shopId,
              provider: 'stripe',
              provider_customer_id: session.customer,
              provider_subscription_id: session.subscription,
              plan: plan,
              status: 'active',
            },
            { onConflict: 'shop_id' }
          );
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const status = subscription.status; // active, past_due, canceled

        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('provider_subscription_id', subscription.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Webhook handler failure';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
