import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boardId = searchParams.get('boardId');

  try {
    const supabase = await createClient();
    let query = supabase
      .from('projects')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (boardId) {
      query = query.eq('board_id', boardId);
    }

    const { data, error } = await query;

    if (error) {
      console.warn('Projects fetch error:', error.message);
      return NextResponse.json({ projects: [] });
    }

    return NextResponse.json({ projects: data || [] });
  } catch (err: unknown) {
    console.error('API /api/projects GET error:', err);
    return NextResponse.json({ projects: [] });
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

    const { data, error } = await supabase
      .from('projects')
      .insert({
        board_id: body.board_id,
        title: body.title,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ project: data });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create project';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
