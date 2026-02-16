import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { supabase, user } = await getAuthUser();
    const { id } = await params;

    // Fetch the template
    const { data: template, error: templateError } = await supabase
      .from('context_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (templateError) {
      if (templateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Template not found' }, { status: 404 });
      }
      return NextResponse.json({ error: templateError.message }, { status: 500 });
    }

    // Create context from template
    const { data: context, error: insertError } = await supabase
      .from('contexts')
      .insert({
        user_id: user.id,
        title: template.title,
        context_type: template.context_type,
        status: 'ready',
        description: template.description,
        glossary: template.glossary,
        keywords: template.keywords,
        metadata: template.metadata,
        template_id: template.id,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(context, { status: 201 });
  } catch (e) {
    if (e instanceof Response) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
