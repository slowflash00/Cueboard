import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');
  const projectId = searchParams.get('projectId');
  const standaloneOnly = searchParams.get('standalone') === 'true';
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '24', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  try {
    const supabase = await createClient();

    // If querying by specific project
    if (projectId) {
      const { data: projectPostRows, error: ppErr } = await supabase
        .from('project_posts')
        .select(`
          position,
          post:posts(
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
          )
        `)
        .eq('project_id', projectId)
        .order('position', { ascending: true })
        .range(offset, offset + limit - 1);

      if (ppErr) {
        return NextResponse.json({ posts: [] });
      }

      const posts = (projectPostRows || []).map((row: any) => ({
        ...row.post,
        project_position: row.position,
      }));

      return NextResponse.json({ posts });
    }

    // Default: fetch posts with their prompt and project memberships
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
        ),
        project_posts(project_id)
      `)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (boardId) {
      dbQuery = dbQuery.eq('board_id', boardId);
    }

    // Full-text search
    if (query && query.trim().length > 0) {
      dbQuery = dbQuery.textSearch('prompt.parts.search_vector', query.trim(), {
        type: 'websearch',
        config: 'english',
      });
    }

    // Pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    const { data, error } = await dbQuery;

    if (error) {
      console.warn('Supabase query error:', error.message);
      return NextResponse.json({ posts: [] });
    }

    let posts = data || [];

    // Filter standalone posts per PRD §9 & TRD §11 (must have 0 project memberships)
    if (standaloneOnly) {
      posts = posts.filter(
        (p: any) => !p.project_posts || p.project_posts.length === 0
      );
    }

    return NextResponse.json({ posts });
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

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to create a post.' },
        { status: 401 }
      );
    }

    if (!body.board_id || typeof body.board_id !== 'string' || !body.board_id.trim()) {
      return NextResponse.json(
        { error: 'A valid Board is required. Please select or create a board.' },
        { status: 400 }
      );
    }

    const userId = user.id;

    // 1. Insert post (without project_id column)
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        board_id: body.board_id.trim(),
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

    // 2. If created inside a project, link via project_posts join table
    if (body.project_id) {
      await supabase.from('project_posts').insert({
        project_id: body.project_id,
        post_id: post.id,
        user_id: userId,
      });
    }

    // 3. Insert prompt
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

    // 4. Insert prompt parts
    if (body.prompt_parts && body.prompt_parts.length > 0) {
      const partsToInsert = body.prompt_parts.map((p: any) => ({
        prompt_id: prompt.id,
        user_id: userId,
        subheading: p.subheading || null,
        body_text: p.body_text,
        position: p.position || 0,
      }));

      await supabase.from('prompt_parts').insert(partsToInsert);
    }

    return NextResponse.json({ success: true, post });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
