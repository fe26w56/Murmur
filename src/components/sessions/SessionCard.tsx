import Link from 'next/link';

interface SessionCardProps {
  id: string;
  title: string;
  translation_tier: 'lite' | 'standard' | 'premium';
  started_at: string;
  duration_seconds: number | null;
  context_title: string | null;
}

export function SessionCard({
  id,
  title,
  translation_tier,
  started_at,
  duration_seconds,
  context_title,
}: SessionCardProps) {
  const time = new Date(started_at).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const duration = duration_seconds !== null
    ? `${Math.round(duration_seconds / 60)}分`
    : '進行中';

  return (
    <Link
      href={`/sessions/${id}`}
      className="flex items-center justify-between rounded-xl bg-card p-4 transition-colors hover:bg-accent"
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {context_title && <>{context_title} · </>}
          {translation_tier} · {duration}
        </p>
      </div>
      <span className="text-sm text-muted-foreground">{time}</span>
    </Link>
  );
}
