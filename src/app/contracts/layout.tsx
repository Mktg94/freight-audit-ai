export default function ContractsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">{children}</div>;
}

