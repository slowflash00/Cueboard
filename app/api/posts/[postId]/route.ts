import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        prompt:prompts(
          id,
          title,
          parts:prompt_parts(
            id,
            subheading,
            body_text,
            position
          )
        )
      `)
      .eq('id', postId)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ post: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params;

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error deleting post';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
