import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postIds, groupColor } = body;

    if (!postIds || !Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json({ error: 'Post IDs are required' }, { status: 400 });
    }

    const groupKey = crypto.randomUUID();
    const supabase = await createClient();

    const { error } = await supabase
      .from('posts')
      .update({
        group_key: groupKey,
        group_color: groupColor,
      })
      .in('id', postIds);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, groupKey });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to group posts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupKey = searchParams.get('groupKey');

    if (!groupKey) {
      return NextResponse.json({ error: 'Group key is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('posts')
      .update({
        group_key: null,
        group_color: null,
      })
      .eq('group_key', groupKey);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to ungroup posts';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
