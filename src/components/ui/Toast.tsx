'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface ToastItem {
  id: number;
  message: string;
  type: 'info' | 'error' | 'success';
}

let toastIdCounter = 0;
const listeners: Set<(item: ToastItem) => void> = new Set();

export function showToast(message: string, type: 'info' | 'error' | 'success' = 'info') {
  const item: ToastItem = { id: toastIdCounter++, message, type };
  listeners.forEach((fn) => fn(item));
}

const MAX_TOASTS = 3;
const TOAST_DURATION = 3000;

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const addToast = useCallback((item: ToastItem) => {
    setToasts((prev) => {
      const next = [...prev, item];
      return next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next;
    });

    const timer = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== item.id));
      timersRef.current.delete(item.id);
    }, TOAST_DURATION);

    timersRef.current.set(item.id, timer);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  const colorMap = {
    info: 'bg-card border-border',
    error: 'bg-destructive/10 border-destructive',
    success: 'bg-green-50 border-green-500 dark:bg-green-950',
  };

  return (
    <div className="fixed top-16 left-1/2 z-[90] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-in slide-in-from-top rounded-lg border px-4 py-3 text-sm shadow-lg ${colorMap[t.type]}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
