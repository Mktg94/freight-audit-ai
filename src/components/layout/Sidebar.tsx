'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  Scale,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/contracts', label: 'Contracts', icon: FileSignature },
  { href: '/disputes', label: 'Disputes', icon: Scale },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-[var(--border)] px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-sm font-bold text-[var(--background)]">
          L
        </div>
        <span className="font-[var(--font-syne)] text-lg font-bold text-[var(--primary)]">
          LogiMatriks
        </span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navLinks.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive(href)
                ? 'border-l-2 border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]',
            )}
          >
            <Icon size={20} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <div className="border-t border-[var(--border)] p-4">
        <div className="mb-3 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--surface-2)] text-xs font-semibold text-[var(--text-secondary)]">
            U
          </div>
          <div className="flex-1 truncate text-sm text-[var(--text-primary)]">
            User Name
          </div>
        </div>
        <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--danger)]">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] lg:hidden"
      >
        <Menu size={20} />
      </button>

      <aside className="hidden lg:flex lg:w-60 lg:flex-col lg:border-r lg:border-[var(--border)] lg:bg-[var(--surface)]">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-60 bg-[var(--surface)] shadow-xl">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMobileOpen(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={20} />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export { Sidebar };
