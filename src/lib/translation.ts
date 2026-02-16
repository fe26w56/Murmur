import { buildTranslationPrompt, buildSystemPrompt } from '@/lib/prompts/translation';

type TranslationTier = 'lite' | 'standard' | 'premium';

interface TranslateParams {
  utterance: string;
  tier: TranslationTier;
  context?: {
    title?: string;
    type?: string;
    glossary?: { en: string; ja: string }[];
    description?: string;
  };
  history?: { original: string; translated: string }[];
}

const tierConfig: Record<TranslationTier, { provider: 'gemini' | 'anthropic'; model: string }> = {
  lite: { provider: 'gemini', model: 'gemini-2.5-flash-lite-preview-06-17' },
  standard: { provider: 'gemini', model: 'gemini-2.5-flash-preview-05-20' },
  premium: { provider: 'anthropic', model: 'claude-sonnet-4-5-20250929' },
};

export async function* translateStream(
  params: TranslateParams,
): AsyncGenerator<string, void, unknown> {
  const config = tierConfig[params.tier];
  const prompt = buildTranslationPrompt(params);
  const systemPrompt = buildSystemPrompt();

  if (config.provider === 'gemini') {
    yield* streamGemini(config.model, systemPrompt, prompt);
  } else {
    yield* streamAnthropic(config.model, systemPrompt, prompt);
  }
}

async function* streamGemini(
  model: string,
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 256,
        },
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini API error: ${res.status} ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // Skip malformed JSON
      }
    }
  }
}

async function* streamAnthropic(
  model: string,
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string, void, unknown> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 256,
      stream: true,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic API error: ${res.status} ${text}`);
  }

  const reader = res.body?.getReader();
  if (!reader) throw new Error('No response body');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const jsonStr = line.slice(6).trim();
      if (!jsonStr || jsonStr === '[DONE]') continue;

      try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          yield parsed.delta.text;
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }
}
