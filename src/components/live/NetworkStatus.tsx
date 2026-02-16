'use client';

import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function NetworkStatus() {
  const isOnline = useNetworkStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-destructive px-4 py-2 text-center text-sm font-medium text-destructive-foreground">
      ネットワーク接続がありません
    </div>
  );
}
