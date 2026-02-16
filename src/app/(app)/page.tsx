'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SessionCard } from '@/components/sessions/SessionCard';

interface Session {
  id: string;
  title: string;
  translation_tier: 'lite' | 'standard' | 'premium';
  started_at: string;
  duration_seconds: number | null;
}

export default function HomePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [monthlyMinutes, setMonthlyMinutes] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Fetch recent sessions
        const res = await fetch('/api/sessions?limit=10');
        if (res.ok) {
          const json = await res.json();
          setSessions(json.data ?? []);

          // Calculate monthly usage from sessions this month
          const now = new Date();
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          const thisMonthSessions = (json.data ?? []) as Session[];
          const totalSeconds = thisMonthSessions
            .filter((s) => new Date(s.started_at) >= monthStart && s.duration_seconds)
            .reduce((sum: number, s: Session) => sum + (s.duration_seconds ?? 0), 0);
          setMonthlyMinutes(Math.round(totalSeconds / 60));
        }
      } catch {
        // Silently handle fetch errors
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const maxMinutes = 60;
  const usagePercent = Math.min((monthlyMinutes / maxMinutes) * 100, 100);

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      {/* Monthly usage */}
      <div className="rounded-xl bg-card p-4">
        <p className="text-sm font-medium text-muted-foreground">月間利用時間</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {monthlyMinutes}分 / {maxMinutes}分
          </span>
        </div>
      </div>

      {/* New session button */}
      <Link
        href="/live"
        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
        新しいセッションを開始
      </Link>

      {/* Recent sessions section */}
      <div>
        <h2 className="mb-3 text-sm font-medium">最近のセッション</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground/50"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
            <p className="mt-4 text-sm text-muted-foreground">
              セッションがありません。
              <br />
              新しいセッションを開始しましょう。
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <SessionCard
                key={s.id}
                id={s.id}
                title={s.title}
                translation_tier={s.translation_tier}
                started_at={s.started_at}
                duration_seconds={s.duration_seconds}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
