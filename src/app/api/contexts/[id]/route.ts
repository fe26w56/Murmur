import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const updateContextSchema = z.object({
  type: z.enum(["theme_park", "museum", "theater", "other"]).optional(),
  title: z.string().min(1).optional(),
  source_url: z.string().url().optional().or(z.literal("")).or(z.null()),
  glossary: z
    .array(z.object({ en: z.string(), ja: z.string(), category: z.string().optional() }))
    .max(20)
    .optional(),
  keywords: z.array(z.string()).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase } = await getAuthUser();

  const { data, error } = await supabase
    .from("contexts")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase } = await getAuthUser();

  const body = updateContextSchema.parse(await request.json());

  const updateData: Record<string, unknown> = {};
  if (body.type !== undefined) updateData.type = body.type;
  if (body.title !== undefined) updateData.title = body.title;
  if (body.source_url !== undefined)
    updateData.source_url = body.source_url || null;
  if (body.glossary !== undefined) {
    updateData.glossary = body.glossary;
    // Auto-extract keywords from glossary EN side
    if (!body.keywords) {
      updateData.keywords = body.glossary.map((g) => g.en);
    }
  }
  if (body.keywords !== undefined) updateData.keywords = body.keywords;

  const { data, error } = await supabase
    .from("contexts")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase } = await getAuthUser();

  const { error } = await supabase.from("contexts").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new Response(null, { status: 204 });
}
