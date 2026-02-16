export default function HomePage() {
  return (
    <div className="px-4 py-6">
      {/* Usage card placeholder */}
      <div className="rounded-xl bg-bg-card p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-text-secondary">今月の利用時間</span>
          <span className="text-sm font-medium text-text-primary">
            0分 / 60分
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full w-0 rounded-full bg-primary" />
        </div>
      </div>

      {/* New session button */}
      <button className="mt-4 w-full rounded-xl bg-primary py-[13px] text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
        新しいセッションを開始
      </button>

      {/* Sessions list placeholder */}
      <div className="mt-8">
        <h2 className="font-display text-base font-bold text-text-primary">
          最近のセッション
        </h2>
        <div className="mt-4 flex flex-col items-center py-12 text-center">
          <p className="text-sm text-text-muted">
            セッションがありません。
            <br />
            新しいセッションを開始しましょう。
          </p>
        </div>
      </div>
    </div>
  );
}
