import { NextResponse } from 'next/server';
import { z } from 'zod/v4';
import { getAuthUser } from '@/lib/auth';

const updateContextSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  context_type: z.enum(['theme_park', 'museum', 'theater', 'other']).optional(),
  source_url: z.url().nullable().optional(),
  description: z.string().nullable().optional(),
  glossary: z
    .array(z.object({ en: z.string(), ja: z.string() }))
    .max(20)
    .optional(),
  keywords: z.array(z.string()).optional(),
});

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await getAuthUser();
    const { id } = await params;

    const { data, error } = await supabase
      .from('contexts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Context not found' }, { status: 404 });
      }
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase } = await getAuthUser();
    const { id } = await params;
    const body = await request.json();
    const parsed = updateContextSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }

    const updates: Record<string, unknown> = {};
    const { title, context_type, source_url, description, glossary, keywords } = parsed.data;

    if (title !== undefined) updates.title = title;
    if (context_type !== undefined) updates.context_type = context_type;
    if (source_url !== undefined) updates.source_url = source_url;
    if (description !== undefined) updates.description = description;
    if (glossary !== undefined) {
      updates.glossary = glossary;
      // Auto-derive keywords from glossary if keywords not explicitly provided
      if (keywords === undefined) {
        updates.keywords = glossary.map((g) => g.en).filter((k) => k.length > 0);
      }
    }
    if (keywords !== undefined) updates.keywords = keywords;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contexts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Context not found' }, { status: 404 });
      }
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

    const { error } = await supabase.from('contexts').delete().eq('id', id);

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
