import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/server';
import { syncShopifyProducts } from '@/lib/shopify/sync';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const code = searchParams.get('code');
    const hmac = searchParams.get('hmac');

    if (!shop || !code) {
      return NextResponse.json({ error: 'Missing shop or code parameter' }, { status: 400 });
    }

    const apiKey = process.env.SHOPIFY_API_KEY;
    const apiSecret = process.env.SHOPIFY_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Shopify API credentials not configured in environment' },
        { status: 500 }
      );
    }

    // Exchange authorization code for permanent access token
    const tokenUrl = `https://${shop}/admin/oauth/access_token`;
    const tokenRes = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    });

    if (!tokenRes.ok) {
      const errText = await tokenRes.text();
      return NextResponse.json(
        { error: `Token exchange failed: ${errText}` },
        { status: 400 }
      );
    }

    const { access_token } = await tokenRes.json();

    // 1. Create or update shop
    const { data: shopRecord, error: shopErr } = await supabaseAdmin
      .from('shops')
      .upsert(
        {
          shopify_domain: shop,
          shopify_token: access_token,
          status: 'active',
          plan: 'trial',
        },
        { onConflict: 'shopify_domain' }
      )
      .select('id')
      .single();

    if (shopErr || !shopRecord) {
      return NextResponse.json({ error: 'Database shop registration failed' }, { status: 500 });
    }

    // 2. Generate widget configuration if not exists
    const randomKey = 'wk_live_' + crypto.randomBytes(12).toString('hex');
    await supabaseAdmin
      .from('widgets')
      .upsert(
        {
          shop_id: shopRecord.id,
          public_key: randomKey,
          display_name: shop.replace('.myshopify.com', ''),
          color: '#0f172a',
          welcome_message: `Welcome to ${shop.replace('.myshopify.com', '')}! How can I help you today?`,
        },
        { onConflict: 'shop_id' }
      );

    // 3. Trigger initial background product sync
    syncShopifyProducts(shopRecord.id, shop, access_token).catch((err) =>
      console.error('Initial product sync error:', err)
    );

    // Redirect to dashboard with shop id
    return NextResponse.redirect(new URL(`/dashboard?shop_id=${shopRecord.id}&connected=true`, req.url));
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
