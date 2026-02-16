export default function ContextsPage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-display text-lg font-bold text-text-primary">
        コンテキスト
      </h2>
      <div className="mt-8 flex flex-col items-center py-12 text-center">
        <p className="text-sm text-text-muted">
          コンテキストがありません。
          <br />
          テンプレートから追加するか、手動で作成しましょう。
        </p>
      </div>
    </div>
  );
}
