import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');

  try {
    const supabase = await createClient();

    // 1. Get post IDs already in this project
    const { data: linkedRows } = await supabase
      .from('project_posts')
      .select('post_id')
      .eq('project_id', projectId);

    const linkedIds = (linkedRows || []).map((r: any) => r.post_id);

    // 2. Fetch all board posts not in linkedIds
    let query = supabase
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
      .order('created_at', { ascending: false });

    if (boardId) {
      query = query.eq('board_id', boardId);
    }

    if (linkedIds.length > 0) {
      query = query.not('id', 'in', `(${linkedIds.join(',')})`);
    }

    const { data: availablePosts, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ posts: availablePosts || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch available posts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
