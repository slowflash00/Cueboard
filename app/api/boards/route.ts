import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Fetch boards with posts count and projects count
    const { data: boards, error } = await supabase
      .from('boards')
      .select(`
        *,
        posts:posts(id, image_url, video_thumbnail_url),
        projects:projects(id)
      `)
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Boards fetch error:', error.message);
      return NextResponse.json({ boards: [] });
    }

    const enrichedBoards = (boards || []).map((b: any) => {
      const postsCount = b.posts ? b.posts.length : 0;
      const projectsCount = b.projects ? b.projects.length : 0;
      const firstCover =
        b.cover_url ||
        b.posts?.[0]?.image_url ||
        b.posts?.[0]?.video_thumbnail_url ||
        null;

      return {
        id: b.id,
        user_id: b.user_id,
        title: b.title,
        cover_url: b.cover_url,
        cover_image_url: firstCover,
        position: b.position,
        posts_count: postsCount,
        projects_count: projectsCount,
        created_at: b.created_at,
        updated_at: b.updated_at,
      };
    });

    return NextResponse.json({ boards: enrichedBoards });
  } catch (err: unknown) {
    console.error('API /api/boards GET error:', err);
    return NextResponse.json({ boards: [] });
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
        { error: 'You must be logged in to create a board.' },
        { status: 401 }
      );
    }

    const userId = user.id;

    const { data, error } = await supabase
      .from('boards')
      .insert({
        title: body.title,
        cover_url: body.cover_url || null,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ board: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create board';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
