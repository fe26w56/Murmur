'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TemplatePicker } from '@/components/contexts/TemplatePicker';
import { ContextForm } from '@/components/contexts/ContextForm';

type Tab = 'template' | 'manual';

export default function NewContextPage() {
  const [tab, setTab] = useState<Tab>('template');

  return (
    <div className="mx-auto max-w-lg">
      {/* Sub-header */}
      <div className="flex items-center border-b border-border px-4 py-3">
        <Link href="/contexts" className="text-sm text-muted-foreground hover:text-foreground">
          ← 戻る
        </Link>
        <span className="flex-1 text-center text-sm font-medium">コンテキスト作成</span>
        <div className="w-10" />
      </div>

      <div className="p-4">
        {/* Tab switcher */}
        <div className="mb-6 flex rounded-[22px] bg-muted p-1">
          <button
            onClick={() => setTab('template')}
            className={`flex-1 rounded-[18px] py-2.5 text-sm font-medium transition-colors ${
              tab === 'template' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            テンプレート
          </button>
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 rounded-[18px] py-2.5 text-sm font-medium transition-colors ${
              tab === 'manual' ? 'bg-background shadow-sm' : 'text-muted-foreground'
            }`}
          >
            手動作成
          </button>
        </div>

        {/* Tab content */}
        {tab === 'template' ? <TemplatePicker /> : <ContextForm mode="create" />}
      </div>
    </div>
  );
}
