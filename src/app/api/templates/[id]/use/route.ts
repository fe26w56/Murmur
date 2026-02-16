import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { supabase, user } = await getAuthUser();

  // Fetch the template
  const { data: template, error: templateError } = await supabase
    .from("context_templates")
    .select("*")
    .eq("id", id)
    .single();

  if (templateError || !template) {
    return NextResponse.json(
      { error: "Template not found" },
      { status: 404 },
    );
  }

  // Create a context from the template
  const { data: context, error: contextError } = await supabase
    .from("contexts")
    .insert({
      user_id: user.id,
      type: template.type,
      title: template.title,
      researched_data: template.researched_data,
      glossary: template.glossary,
      keywords: template.keywords,
      status: "ready" as const,
    })
    .select()
    .single();

  if (contextError) {
    return NextResponse.json(
      { error: contextError.message },
      { status: 500 },
    );
  }

  return NextResponse.json(context, { status: 201 });
}
