"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signup") {
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
        setEmailSent(true);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/";
      }
    }
    setLoading(false);
  };

  if (emailSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-page px-6">
        <div className="w-full max-w-[390px] text-center">
          <div className="mb-4 text-5xl">📧</div>
          <h2 className="font-display text-xl font-bold text-text-primary">
            確認メールを送信しました
          </h2>
          <p className="mt-2 text-sm text-text-secondary">
            {email} に確認リンクを送信しました。
            <br />
            メールを確認してアカウントを有効化してください。
          </p>
          <button
            onClick={() => {
              setEmailSent(false);
              setMode("login");
            }}
            className="mt-6 text-sm font-medium text-primary"
          >
            ログイン画面に戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-page px-6">
      <div className="w-full max-w-[390px]">
        {/* Brand area */}
        <div className="mb-10 text-center">
          <h1 className="font-display text-4xl font-bold text-primary">
            Murmur
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            リアルタイム翻訳字幕
          </p>
        </div>

        {/* Google login button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-white px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-card disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Googleでログイン
        </button>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-text-muted">または</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Email form */}
        <form onSubmit={handleEmailAuth} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-[10px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="パスワード"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-[10px] border border-border bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-[13px] text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
          >
            {loading
              ? "処理中..."
              : mode === "login"
                ? "ログイン"
                : "アカウント作成"}
          </button>
        </form>

        {/* Mode toggle */}
        <p className="mt-6 text-center text-sm text-text-secondary">
          {mode === "login" ? (
            <>
              アカウントをお持ちでない方は
              <button
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="ml-1 font-medium text-primary"
              >
                新規登録
              </button>
            </>
          ) : (
            <>
              アカウントをお持ちの方は
              <button
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className="ml-1 font-medium text-primary"
              >
                ログイン
              </button>
            </>
          )}
        </p>

        {/* Legal links */}
        <div className="mt-8 flex justify-center gap-4 text-xs text-text-muted">
          <a href="/legal" className="hover:text-text-secondary">
            プライバシーポリシー
          </a>
          <a href="/legal?tab=terms" className="hover:text-text-secondary">
            利用規約
          </a>
        </div>
      </div>
    </div>
  );
}
