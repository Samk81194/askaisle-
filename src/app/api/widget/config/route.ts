import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const key = req.nextUrl.searchParams.get('key');
    if (!key) {
      return NextResponse.json({ error: 'Missing key parameter' }, { status: 400 });
    }

    const { data: widget, error } = await supabaseAdmin
      .from('widgets')
      .select('id, color, display_name, welcome_message, allowed_domains, shops!inner(shopify_domain, plan)')
      .eq('public_key', key)
      .single();

    if (error || !widget) {
      return NextResponse.json({ error: 'Widget configuration not found' }, { status: 404 });
    }

    const shop = Array.isArray(widget.shops) ? widget.shops[0] : widget.shops;
    const showBranding = (shop.plan || 'trial') === 'starter' || (shop.plan || 'trial') === 'trial';

    return NextResponse.json(
      {
        id: widget.id,
        color: widget.color,
        display_name: widget.display_name,
        welcome_message: widget.welcome_message,
        allowed_domains: widget.allowed_domains || [],
        show_branding: showBranding,
      },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

/**
 * PATCH /api/widget/config
 * Saves merchant widget customization (Requirement C1)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { shop_id, public_key, color, display_name, welcome_message, allowed_domains } = body;

    if (!shop_id && !public_key) {
      return NextResponse.json({ error: 'Missing shop_id or public_key' }, { status: 400 });
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (color) updatePayload.color = color;
    if (display_name) updatePayload.display_name = display_name;
    if (welcome_message) updatePayload.welcome_message = welcome_message;
    if (Array.isArray(allowed_domains)) updatePayload.allowed_domains = allowed_domains;

    let query = supabaseAdmin.from('widgets').update(updatePayload);
    if (shop_id) query = query.eq('shop_id', shop_id);
    else if (public_key) query = query.eq('public_key', public_key);

    const { data, error } = await query.select().single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, widget: data });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to update widget config';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
