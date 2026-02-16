import { z } from 'zod/v4';
import { getAuthUser } from '@/lib/auth';
import { translateStream } from '@/lib/translation';

const translateRequestSchema = z.object({
  utterance: z.string().min(1),
  sequenceNumber: z.number().int().min(0),
  context: z
    .object({
      title: z.string().optional(),
      type: z.string().optional(),
      description: z.string().optional(),
      glossary: z.array(z.object({ en: z.string(), ja: z.string() })).optional(),
    })
    .optional(),
  history: z
    .array(z.object({ original: z.string(), translated: z.string() }))
    .max(3)
    .optional(),
  tier: z.enum(['lite', 'standard', 'premium']),
  sessionId: z.string(),
});

export async function POST(request: Request) {
  try {
    const { supabase } = await getAuthUser();
    const body = await request.json();
    const parsed = translateRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { utterance, sequenceNumber, context, history, tier, sessionId } = parsed.data;

    const encoder = new TextEncoder();
    let fullText = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          const llmStream = translateStream({
            utterance,
            tier,
            context,
            history,
          });

          for await (const chunk of llmStream) {
            fullText += chunk;
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: chunk, done: false })}\n\n`,
              ),
            );
          }

          // Save to transcripts before closing (Vercel Hobby constraint)
          await supabase.from('transcripts').insert({
            session_id: sessionId,
            sequence_number: sequenceNumber,
            original_text: utterance,
            translated_text: fullText,
            timestamp_ms: Date.now(),
            translation_tier: tier,
          });

          // Send done event
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                text: fullText,
                done: true,
                original: utterance,
                sequenceNumber,
              })}\n\n`,
            ),
          );
          controller.close();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Translation failed';
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errorMessage, done: true })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (e) {
    if (e instanceof Response) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
