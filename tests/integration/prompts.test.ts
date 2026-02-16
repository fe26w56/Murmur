import { describe, it, expect } from 'vitest';
import { buildTranslationPrompt, buildSystemPrompt } from '@/lib/prompts/translation';

describe('buildTranslationPrompt', () => {
  it('includes utterance in output', () => {
    const result = buildTranslationPrompt({ utterance: 'Hello world' });
    expect(result).toContain('Hello world');
    expect(result).toContain('Translate this');
  });

  it('includes context info when provided', () => {
    const result = buildTranslationPrompt({
      utterance: 'Welcome',
      context: {
        title: 'Space Mountain',
        type: 'theme_park',
        glossary: [{ en: 'Cast Member', ja: 'キャスト' }],
      },
    });

    expect(result).toContain('Space Mountain');
    expect(result).toContain('theme_park');
    expect(result).toContain('Cast Member');
    expect(result).toContain('キャスト');
  });

  it('includes history when provided', () => {
    const result = buildTranslationPrompt({
      utterance: 'Next sentence',
      history: [
        { original: 'First', translated: '最初' },
        { original: 'Second', translated: '二番目' },
      ],
    });

    expect(result).toContain('最初');
    expect(result).toContain('二番目');
    expect(result).toContain('Recent translations');
  });

  it('works with minimal params', () => {
    const result = buildTranslationPrompt({ utterance: 'Test' });
    expect(result).toContain('Test');
    expect(result).not.toContain('Context');
    expect(result).not.toContain('Recent translations');
  });
});

describe('buildSystemPrompt', () => {
  it('returns non-empty string', () => {
    const result = buildSystemPrompt();
    expect(result.length).toBeGreaterThan(0);
  });

  it('mentions Japanese translation', () => {
    const result = buildSystemPrompt();
    expect(result).toContain('Japanese');
  });
});
