import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6 p-4">
      {/* Monthly usage placeholder */}
      <div className="rounded-xl bg-card p-4">
        <p className="text-sm font-medium text-muted-foreground">月間利用時間</p>
        <div className="mt-2 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-muted">
            <div className="h-2 w-0 rounded-full bg-primary" />
          </div>
          <span className="text-sm font-medium">0分 / 60分</span>
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
      </div>
    </div>
  );
}
