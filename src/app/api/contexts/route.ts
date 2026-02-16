import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { getAuthUser } from '@/lib/auth';

const createContextSchema = z.object({
  title: z.string().min(1).max(100),
  context_type: z.enum(['theme_park', 'museum', 'theater', 'other']).default('other'),
  source_url: z.url().nullable().optional(),
  description: z.string().nullable().optional(),
  glossary: z
    .array(z.object({ en: z.string(), ja: z.string() }))
    .max(20)
    .default([]),
  keywords: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 50);
    const offset = Math.max(Number(searchParams.get('offset') ?? 0), 0);

    const { data, error, count } = await supabase
      .from('contexts')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data, total: count ?? 0 });
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
    const parsed = createContextSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const { title, context_type, source_url, description, glossary, keywords } = parsed.data;

    // Extract keywords from glossary EN terms if not provided
    const derivedKeywords =
      keywords.length > 0
        ? keywords
        : glossary.map((g) => g.en).filter((k) => k.length > 0);

    const { data, error } = await supabase
      .from('contexts')
      .insert({
        user_id: user.id,
        title,
        context_type,
        status: 'ready',
        source_url: source_url ?? null,
        description: description ?? null,
        glossary,
        keywords: derivedKeywords,
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
