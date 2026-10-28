import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Initiates 1-Click Shopify OAuth flow (Requirement B1 & Section 9)
 * Supports both GET (/api/shops/connect?shop=...) and POST
 */
export async function GET(req: NextRequest) {
  const shopParam = req.nextUrl.searchParams.get('shop');
  return handleShopifyConnect(req, shopParam);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return handleShopifyConnect(req, body.shop);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

function handleShopifyConnect(req: NextRequest, rawShop: string | null) {
  if (!rawShop) {
    return NextResponse.json({ error: 'Missing Shopify store domain' }, { status: 400 });
  }

  const cleanShop = rawShop
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, '');

  const shopDomain = cleanShop.includes('.myshopify.com')
    ? cleanShop
    : `${cleanShop}.myshopify.com`;

  const apiKey = process.env.SHOPIFY_API_KEY;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_content';
  const appUrl = process.env.SHOPIFY_APP_URL || process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

  // If Shopify Partner keys are not yet configured, redirect smoothly to Dashboard in preview mode
  if (!apiKey || apiKey === 'your_shopify_api_key') {
    const previewUrl = new URL('/dashboard', req.url);
    previewUrl.searchParams.set('shop', shopDomain);
    previewUrl.searchParams.set('demo_mode', 'true');
    return NextResponse.redirect(previewUrl);
  }

  const stateNonce = crypto.randomBytes(16).toString('hex');
  const redirectUri = `${appUrl.replace(/\/$/, '')}/api/shopify/callback`;

  const installUrl =
    `https://${shopDomain}/admin/oauth/authorize` +
    `?client_id=${encodeURIComponent(apiKey)}` +
    `&scope=${encodeURIComponent(scopes)}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${encodeURIComponent(stateNonce)}`;

  return NextResponse.redirect(installUrl);
}

