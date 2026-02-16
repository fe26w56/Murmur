import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { getAuthUser } from '@/lib/auth';

const createSessionSchema = z.object({
  contextId: z.string().uuid().optional(),
  title: z.string().optional(),
  translationTier: z.enum(['lite', 'standard', 'premium']).default('standard'),
});

export async function GET(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
    const offset = Math.max(Number(searchParams.get('offset') ?? 0), 0);

    const { data, error, count } = await supabase
      .from('sessions')
      .select('*, contexts:context_id(title)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten context title into session object
    const sessions = (data ?? []).map((s) => {
      const { contexts, ...rest } = s as Record<string, unknown>;
      const ctx = contexts as { title: string } | null;
      return { ...rest, context_title: ctx?.title ?? null };
    });

    return NextResponse.json({ data: sessions, total: count ?? 0 });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, user } = await getAuthUser();
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { contextId, title, translationTier } = parsed.data;
    const now = new Date().toISOString();

    // Auto-generate title if not provided
    const sessionTitle =
      title ?? `セッション ${new Date().toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`;

    const { data, error } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        context_id: contextId ?? null,
        title: sessionTitle,
        translation_tier: translationTier,
        started_at: now,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
