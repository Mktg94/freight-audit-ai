'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UploadDropzone } from '@/components/invoices/UploadDropzone';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, Upload, FileSearch, GitCompare, FileText } from 'lucide-react';

interface Contract {
  id: string;
  carrier_name: string;
}

const steps = [
  { key: 'uploading', label: 'Uploading invoice', icon: Upload },
  { key: 'extracting', label: 'Extracting line items', icon: FileSearch },
  { key: 'comparing', label: 'Comparing against contract', icon: GitCompare },
  { key: 'generating', label: 'Generating audit report', icon: FileText },
];

export default function UploadInvoicePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [contractId, setContractId] = useState('');
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [step, setStep] = useState<'form' | 'processing'>('form');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pollAttempts, setPollAttempts] = useState(0);

  useEffect(() => {
    fetch('/api/contracts')
      .then((r) => r.json())
      .then((data) => {
        const list = data.contracts ?? data ?? [];
        setContracts(list);
      })
      .catch(() => {});
  }, []);

  const advanceStep = useCallback(() => {
    setCompletedSteps((prev) => new Set(prev).add(currentStep));
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!invoiceId || currentStep >= steps.length) return;
    const timer = setTimeout(() => advanceStep(), 1200);
    return () => clearTimeout(timer);
  }, [currentStep, invoiceId, advanceStep]);

  useEffect(() => {
    if (!invoiceId || currentStep < steps.length - 1) return;
    if (pollAttempts > 30) return;
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        const data = await res.json();
        if (data.status === 'flagged' || data.status === 'approved' || data.status === 'disputed') {
          setCompletedSteps((prev) => new Set(prev).add(steps.length - 1));
          setTimeout(() => router.push(`/invoices/${invoiceId}`), 800);
        } else {
          setPollAttempts((p) => p + 1);
        }
      } catch {
        setPollAttempts((p) => p + 1);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [invoiceId, currentStep, pollAttempts, router]);

  const handleStartAudit = async () => {
    if (!file || !contractId) return;
    setError(null);
    setStep('processing');
    setCurrentStep(0);
    setCompletedSteps(new Set());

    const formData = new FormData();
    formData.append('file', file);
    formData.append('contract_id', contractId);

    try {
      const res = await fetch('/api/invoices/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Upload failed');
      }
      const data = await res.json();
      setInvoiceId(data.id);
      advanceStep();
    } catch (e: any) {
      setError(e.message || 'Upload failed. Please try again.');
      setStep('form');
    }
  };

  if (step === 'processing') {
    const progress = ((currentStep + (completedSteps.has(currentStep) ? 1 : 0)) / steps.length) * 100;
    return (
      <main className="px-6 py-10">
        <div className="mx-auto w-full max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Processing Invoice</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="mb-8" />
              <div className="space-y-4">
                {steps.map((s, idx) => {
                  const isComplete = completedSteps.has(idx);
                  const isActive = idx === currentStep;
                  const Icon = s.icon;
                  return (
                    <div key={s.key} className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center">
                        {isComplete ? (
                          <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />
                        ) : (
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-full ${
                              isActive
                                ? 'bg-[var(--primary)] text-[var(--background)]'
                                : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                            }`}
                          >
                            {isActive ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Icon size={14} />
                            )}
                          </div>
                        )}
                      </div>
                      <span
                        className={`text-sm ${
                          isComplete
                            ? 'text-[var(--text-primary)]'
                            : isActive
                              ? 'font-medium text-[var(--text-primary)]'
                              : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
              {currentStep >= steps.length - 1 && completedSteps.has(steps.length - 1) && (
                <p className="mt-6 text-center text-sm text-[var(--success)]">
                  Audit complete! Redirecting...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-3xl">
        <PageHeader
          title="Upload Invoice"
          description="Upload an invoice PDF and select the carrier contract for AI auditing."
        />

        <Card>
          <CardContent className="space-y-6 pt-6">
            <UploadDropzone onFileSelected={setFile} />

            <Select
              label="Contract"
              placeholder="Select a contract..."
              value={contractId}
              onChange={(e) => setContractId(e.target.value)}
              options={contracts.map((c) => ({
                value: c.id,
                label: c.carrier_name,
              }))}
            />

            {error && (
              <p className="text-sm text-[var(--danger)]">{error}</p>
            )}

            <Button
              size="lg"
              className="w-full"
              disabled={!file || !contractId}
              onClick={handleStartAudit}
            >
              Start AI Audit
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
