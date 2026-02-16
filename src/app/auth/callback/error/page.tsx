export default function AuthCallbackErrorPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-8">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold">認証エラー</h1>
        <p className="text-muted-foreground mt-2">
          認証処理に失敗しました。もう一度お試しください。
        </p>
        <a href="/auth/login" className="text-primary mt-4 inline-block text-sm underline">
          ログイン画面に戻る
        </a>
      </div>
    </main>
  );
}
