import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');
  const projectId = searchParams.get('projectId');
  const query = searchParams.get('q');

  try {
    const supabase = await createClient();

    let dbQuery = supabase
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
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (boardId) {
      dbQuery = dbQuery.eq('board_id', boardId);
    }

    if (projectId) {
      dbQuery = dbQuery.eq('project_id', projectId);
    }

    // Full-text search across prompt parts
    if (query && query.trim().length > 0) {
      dbQuery = dbQuery.textSearch('prompt.parts.search_vector', query.trim(), {
        type: 'websearch',
        config: 'english',
      });
    }

    const { data, error } = await dbQuery;

    if (error) {
      // If table does not exist or demo mode, return empty list gracefully
      console.warn('Supabase query error (may be using placeholder):', error.message);
      return NextResponse.json({ posts: [] });
    }

    return NextResponse.json({ posts: data || [] });
  } catch (err: unknown) {
    console.error('API /api/posts GET error:', err);
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    // 1. Insert post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        board_id: body.board_id,
        project_id: body.project_id || null,
        user_id: userId,
        media_type: body.media_type,
        image_url: body.image_url || null,
        image_width: body.image_width || null,
        image_height: body.image_height || null,
        video_url: body.video_url || null,
        video_thumbnail_url: body.video_thumbnail_url || null,
      })
      .select()
      .single();

    if (postError) {
      return NextResponse.json({ error: postError.message }, { status: 400 });
    }

    // 2. Insert prompt
    const { data: prompt, error: promptError } = await supabase
      .from('prompts')
      .insert({
        post_id: post.id,
        user_id: userId,
        title: body.prompt_title || null,
      })
      .select()
      .single();

    if (promptError) {
      return NextResponse.json({ error: promptError.message }, { status: 400 });
    }

    // 3. Insert prompt parts
    if (body.prompt_parts && body.prompt_parts.length > 0) {
      const partsToInsert = body.prompt_parts.map((p: { subheading?: string; body_text: string; position: number }) => ({
        prompt_id: prompt.id,
        user_id: userId,
        subheading: p.subheading || null,
        body_text: p.body_text,
        position: p.position || 0,
      }));

      const { error: partsError } = await supabase
        .from('prompt_parts')
        .insert(partsToInsert);

      if (partsError) {
        return NextResponse.json({ error: partsError.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('id');

  if (!postId) {
    return NextResponse.json({ error: 'Post ID is required' }, { status: 400 });
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to delete post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
