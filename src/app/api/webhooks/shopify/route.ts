import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const topic = req.headers.get('x-shopify-topic');
    const shop = req.headers.get('x-shopify-shop-domain');
    const hmacHeader = req.headers.get('x-shopify-hmac-sha256');
    const rawBody = await req.text();

    const apiSecret = process.env.SHOPIFY_API_SECRET;
    if (apiSecret && hmacHeader) {
      const hash = crypto
        .createHmac('sha256', apiSecret)
        .update(rawBody, 'utf8')
        .digest('base64');

      if (hash !== hmacHeader) {
        return NextResponse.json({ error: 'HMAC verification failed' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody || '{}');

    // Handle mandatory Shopify compliance & lifecycle topics
    switch (topic) {
      case 'app/uninstalled': {
        if (shop) {
          await supabaseAdmin
            .from('shops')
            .update({ status: 'uninstalled', shopify_token: null })
            .eq('shopify_domain', shop);
        }
        break;
      }
      case 'customers/redact':
      case 'shop/redact': {
        // Clear stored conversation logs for GDPR compliance
        if (shop) {
          const { data: s } = await supabaseAdmin.from('shops').select('id').eq('shopify_domain', shop).single();
          if (s) {
            await supabaseAdmin.from('conversations').delete().eq('shop_id', s.id);
          }
        }
        break;
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Webhook error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
