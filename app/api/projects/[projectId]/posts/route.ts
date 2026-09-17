import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const supabase = await createClient();

    // Query posts joined with project_posts
    const { data, error } = await supabase
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
      .order('position', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Flatten to post array with position
    const posts = (data || []).map((row: any) => ({
      ...row.post,
      project_position: row.position,
    }));

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to fetch project posts';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

    const { data, error } = await supabase
      .from('project_posts')
      .insert({
        project_id: projectId,
        post_id: postId,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, project_post: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to add post to project';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ error: 'postId is required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('project_posts')
      .delete()
      .eq('project_id', projectId)
      .eq('post_id', postId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to unlink post from project';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
