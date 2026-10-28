import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';
import { syncShopifyProducts } from '@/lib/shopify/sync';

/**
 * POST /api/shops/:id/sync
 * Triggers a manual or scheduled re-synchronization of the Shopify store catalog, pages & policies (Requirement B4)
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shopId } = await context.params;

    const { data: shop, error } = await supabaseAdmin
      .from('shops')
      .select('id, shopify_domain, shopify_token')
      .eq('id', shopId)
      .single();

    if (error || !shop) {
      return NextResponse.json({ error: 'Shop not found' }, { status: 404 });
    }

    if (!shop.shopify_token) {
      return NextResponse.json(
        { error: 'Shop has no active Shopify OAuth token' },
        { status: 400 }
      );
    }

    const result = await syncShopifyProducts(
      shop.id,
      shop.shopify_domain,
      shop.shopify_token
    );

    return NextResponse.json({
      shop_id: shop.id,
      ...result,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Catalog sync failed';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
