import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { conversation_id, email, widget_key } = await req.json();

    if (!conversation_id || !email || !widget_key) {
      return NextResponse.json(
        { error: 'Missing conversation_id, email, or widget_key' },
        { status: 400 }
      );
    }

    // Verify email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Update conversation record
    const { error } = await supabaseAdmin
      .from('conversations')
      .update({ visitor_email: email })
      .eq('id', conversation_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Email saved. The shop owner has been notified.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
