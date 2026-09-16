import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('boards')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Boards fetch error:', error.message);
      return NextResponse.json({ boards: [] });
    }

    return NextResponse.json({ boards: data || [] });
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

    const userId = user?.id || '00000000-0000-0000-0000-000000000000';

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
