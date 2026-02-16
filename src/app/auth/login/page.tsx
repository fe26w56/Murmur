'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type AuthMode = 'login' | 'signup';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);

  const handleGoogleLogin = async () => {
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const supabase = createClient();
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        setError(error.message);
      } else {
        setIsConfirmationSent(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        router.replace('/');
      }
    }
    setIsLoading(false);
  };

  if (isConfirmationSent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-6 text-center">
          <h1 className="font-heading text-3xl font-bold">メール確認</h1>
          <p className="text-muted-foreground">
            {email} に確認メールを送信しました。メール内のリンクをクリックしてアカウントを有効化してください。
          </p>
          <button
            onClick={() => {
              setIsConfirmationSent(false);
              setMode('login');
            }}
            className="text-primary text-sm underline"
          >
            ログイン画面に戻る
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl font-bold">Murmur</h1>
          <p className="text-muted-foreground mt-2">リアルタイム翻訳字幕アプリ</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="border-border flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border bg-white text-sm font-medium transition-colors hover:bg-gray-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Googleでログイン
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background text-muted-foreground px-2">または</span>
          </div>
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-input border-border h-[52px] w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="mail@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-input border-border h-[52px] w-full rounded-xl border px-4 text-sm outline-none focus:ring-2 focus:ring-primary"
              placeholder="6文字以上"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-primary text-primary-foreground flex h-[52px] w-full items-center justify-center rounded-xl text-sm font-medium transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <div className="border-primary-foreground h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
            ) : mode === 'login' ? (
              'ログイン'
            ) : (
              'アカウント作成'
            )}
          </button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          {mode === 'login' ? (
            <>
              アカウントをお持ちでない方は
              <button onClick={() => setMode('signup')} className="text-primary ml-1 underline">
                新規登録
              </button>
            </>
          ) : (
            <>
              すでにアカウントをお持ちの方は
              <button onClick={() => setMode('login')} className="text-primary ml-1 underline">
                ログイン
              </button>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
