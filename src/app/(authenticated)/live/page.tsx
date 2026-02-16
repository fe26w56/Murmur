export default function LivePage() {
  return (
    <div className="px-4 py-6">
      <h2 className="font-display text-lg font-bold text-text-primary">
        ライブ翻訳
      </h2>
      <div className="mt-8 flex flex-col items-center py-12 text-center">
        <p className="text-sm text-text-muted">
          コンテキストを選択して翻訳を開始しましょう。
        </p>
      </div>
    </div>
  );
}
