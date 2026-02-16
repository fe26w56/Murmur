import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { z } from "zod";

const createContextSchema = z.object({
  type: z.enum(["theme_park", "museum", "theater", "other"]).default("other"),
  title: z.string().min(1),
  source_url: z.string().url().optional().or(z.literal("")),
  glossary: z
    .array(z.object({ en: z.string(), ja: z.string(), category: z.string().optional() }))
    .max(20)
    .default([]),
  keywords: z.array(z.string()).default([]),
});

export async function GET(request: Request) {
  const { supabase } = await getAuthUser();
  const { searchParams } = new URL(request.url);

  const limit = Math.min(Number(searchParams.get("limit") || "20"), 50);
  const offset = Number(searchParams.get("offset") || "0");

  const { data, error, count } = await supabase
    .from("contexts")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, total: count });
}

export async function POST(request: Request) {
  const { supabase, user } = await getAuthUser();

  const body = createContextSchema.parse(await request.json());

  const { data, error } = await supabase
    .from("contexts")
    .insert({
      user_id: user.id,
      type: body.type,
      title: body.title,
      source_url: body.source_url || null,
      glossary: body.glossary,
      keywords:
        body.keywords.length > 0
          ? body.keywords
          : body.glossary.map((g) => g.en),
      status: "ready" as const,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
