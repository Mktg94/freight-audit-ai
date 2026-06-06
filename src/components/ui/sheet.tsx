'use client';

import { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

function Sheet({ open, onClose, title, children }: SheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg border-l border-[var(--border)] bg-[var(--surface)] shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
          {title && (
            <h3 className="font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </>
  );
}

export { Sheet };
export type { SheetProps };
