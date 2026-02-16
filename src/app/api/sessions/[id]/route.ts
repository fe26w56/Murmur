import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { getAuthUser } from '@/lib/auth';

const updateSessionSchema = z.object({
  endedAt: z.string().optional(),
  title: z.string().optional(),
  translationTier: z.enum(['lite', 'standard', 'premium']).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await getAuthUser();
    const { id } = await params;

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    // Also fetch transcripts
    const { data: transcripts } = await supabase
      .from('transcripts')
      .select('*')
      .eq('session_id', id)
      .order('timestamp_ms', { ascending: true });

    return NextResponse.json({ ...session, transcripts: transcripts ?? [] });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await getAuthUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    if (parsed.data.endedAt) updates.ended_at = parsed.data.endedAt;
    if (parsed.data.title) updates.title = parsed.data.title;
    if (parsed.data.translationTier) updates.translation_tier = parsed.data.translationTier;

    // Calculate duration if ended_at is set
    if (parsed.data.endedAt) {
      const { data: session } = await supabase
        .from('sessions')
        .select('started_at')
        .eq('id', id)
        .single();

      if (session?.started_at) {
        const duration = Math.round(
          (new Date(parsed.data.endedAt).getTime() - new Date(session.started_at).getTime()) /
            1000,
        );
        updates.duration_seconds = duration;
      }
    }

    const { data, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { supabase } = await getAuthUser();
    const { id } = await params;

    const { error } = await supabase.from('sessions').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new Response(null, { status: 204 });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
