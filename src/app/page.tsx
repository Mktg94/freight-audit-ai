import Link from 'next/link';
import { FileText, Scale, Send } from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'AI Extraction',
    description:
      'Automatically extract line items from any freight invoice PDF using advanced AI.',
  },
  {
    icon: Scale,
    title: 'Contract Matching',
    description:
      'Instantly compare charges against your carrier contracts to catch overbilling.',
  },
  {
    icon: Send,
    title: 'Dispute Automation',
    description:
      'Generate professional dispute letters and send them with one click.',
  },
];

const stats = [
  { value: '$2.4B+', label: 'saved industry-wide' },
  { value: '15-25%', label: 'avg error rate' },
  { value: '30 min', label: 'daily review time' },
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)]">
      <nav className="flex items-center justify-between px-6 py-5 lg:px-12">
        <span className="font-[var(--font-syne)] text-xl font-bold text-[var(--primary)]">
          LogiMatriks
        </span>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="inline-flex h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)]"
          >
            Login
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex h-10 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--primary-hover)]"
          >
            Get Started Free
          </Link>
        </div>
      </nav>

      <section className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="pointer-events-none absolute inset-0 bg-grid" />
        <div className="relative z-10 max-w-4xl animate-fade-up">
          <h1 className="font-[var(--font-syne)] text-5xl font-bold leading-tight text-white md:text-6xl">
            Stop Overpaying on Freight. Automatically.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[var(--text-secondary)] md:text-xl">
            LogiMatriks AI catches billing errors across every invoice — before
            you pay them.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="inline-flex h-12 items-center justify-center rounded-lg bg-[var(--primary)] px-6 text-base font-medium text-[var(--background)] shadow-[0_0_24px_rgba(45,212,191,0.5)] transition-colors hover:bg-[var(--primary-hover)]"
            >
              Start Free Audit
            </Link>
            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-[var(--border)] px-6 text-base font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface-2)]"
            >
              See How It Works
            </a>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="px-6 py-24 lg:px-12"
      >
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl border border-[var(--primary)]/20 bg-[var(--surface)] p-6 transition-colors hover:border-[var(--primary)]/40"
              >
                <Icon className="mb-4 h-8 w-8 text-[var(--primary)]" />
                <h3 className="font-[var(--font-syne)] text-lg font-bold text-[var(--text-primary)]">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="border-y border-[var(--border)] px-6 py-16 lg:px-12">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 sm:flex-row">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <p className="font-[var(--font-syne)] text-4xl font-bold text-[var(--primary)]">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="px-6 py-8 text-center text-sm text-[var(--text-muted)]">
        &copy; 2024 LogiMatriks. All rights reserved.
      </footer>
    </div>
  );
}
