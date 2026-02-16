import Link from 'next/link';

interface ContextCardProps {
  id: string;
  title: string;
  context_type: 'theme_park' | 'museum' | 'theater' | 'other';
  glossary: { en: string; ja: string }[];
  template_id: string | null;
}

const typeConfig: Record<string, { icon: string; label: string }> = {
  theme_park: { icon: '\u{1F3F0}', label: 'テーマパーク' },
  museum: { icon: '\u{1F3DB}\uFE0F', label: '博物館' },
  theater: { icon: '\u{1F3AD}', label: '演劇' },
  other: { icon: '\u{1F4C4}', label: 'その他' },
};

export function ContextCard({ id, title, context_type, glossary, template_id }: ContextCardProps) {
  const config = typeConfig[context_type] ?? typeConfig.other;
  const glossaryCount = Array.isArray(glossary) ? glossary.length : 0;

  return (
    <Link
      href={`/contexts/${id}`}
      className="block rounded-xl bg-card p-4 transition-colors hover:bg-accent"
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {config.icon} {config.label} · 用語{glossaryCount}件
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {template_id ? 'テンプレートから作成' : '手動作成'}
      </p>
    </Link>
  );
}
