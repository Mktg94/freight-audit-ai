'use client';

import { Menu } from 'lucide-react';

interface TopBarProps {
  title?: string;
  onMenuToggle?: () => void;
  children?: React.ReactNode;
}

function TopBar({ title, onMenuToggle, children }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--surface-2)] lg:hidden"
          >
            <Menu size={20} />
          </button>
        )}
        {title && (
          <h1 className="font-[var(--font-syne)] text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h1>
        )}
        {children}
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-secondary)]">
        U
      </div>
    </header>
  );
}

export { TopBar };
export type { TopBarProps };
