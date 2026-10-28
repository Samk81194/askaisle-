import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

/**
 * DELETE /api/sources/:id
 * Deletes a knowledge source and cascades to its chunks (Requirement B3 & Section 9)
 */
export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing source id' }, { status: 400 });
    }

    // Chunks have ON DELETE CASCADE, so deleting the source removes all its vectors
    const { error } = await supabaseAdmin.from('sources').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deleted_id: id });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Failed to delete source';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

