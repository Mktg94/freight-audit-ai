'use client';

import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';

interface Tab {
  value: string;
  label: string;
  content: ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultValue?: string;
}

function Tabs({ tabs, defaultValue }: TabsProps) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value ?? '');

  return (
    <div>
      <div className="flex border-b border-[var(--border)]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-colors',
              active === tab.value
                ? 'border-b-2 border-[var(--primary)] text-[var(--primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4">
        {tabs.find((t) => t.value === active)?.content}
      </div>
    </div>
  );
}

export { Tabs };
export type { TabsProps, Tab };
