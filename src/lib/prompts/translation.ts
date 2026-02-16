interface GlossaryEntry {
  en: string;
  ja: string;
}

interface HistoryEntry {
  original: string;
  translated: string;
}

interface CompactContext {
  title?: string;
  type?: string;
  glossary?: GlossaryEntry[];
  description?: string;
}

interface BuildPromptParams {
  utterance: string;
  context?: CompactContext;
  history?: HistoryEntry[];
}

export function buildTranslationPrompt({ utterance, context, history }: BuildPromptParams): string {
  const parts: string[] = [];

  // System instruction
  parts.push(
    'You are a real-time English-to-Japanese translator for live subtitle display.',
    'Translate the following English text into natural, fluent Japanese.',
    'Output ONLY the Japanese translation, nothing else.',
    '',
  );

  // Context section
  if (context) {
    parts.push('## Context');
    if (context.title) parts.push(`Content: ${context.title}`);
    if (context.type) parts.push(`Type: ${context.type}`);
    if (context.description) parts.push(`Description: ${context.description}`);

    if (context.glossary && context.glossary.length > 0) {
      parts.push('', 'Glossary (use these translations for these terms):');
      for (const entry of context.glossary) {
        parts.push(`- "${entry.en}" → "${entry.ja}"`);
      }
    }
    parts.push('');
  }

  // Sliding window history
  if (history && history.length > 0) {
    parts.push('## Recent translations (for consistency):');
    for (const h of history.slice(-3)) {
      parts.push(`EN: ${h.original}`);
      parts.push(`JA: ${h.translated}`);
      parts.push('');
    }
  }

  // Current utterance
  parts.push('## Translate this:');
  parts.push(utterance);

  return parts.join('\n');
}

export function buildSystemPrompt(): string {
  return [
    'You are a real-time English-to-Japanese translator.',
    'Your task is to translate spoken English into natural, accurate Japanese for live subtitle display.',
    'Rules:',
    '- Output ONLY the Japanese translation text',
    '- Use natural Japanese (not machine-translated style)',
    '- Preserve proper nouns as-is unless a glossary translation is provided',
    '- Keep the translation concise for subtitle readability',
    '- Maintain consistency with recent translations provided in context',
  ].join('\n');
}
