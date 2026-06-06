'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import type { ContractCustomRule } from '@/types';

interface ContractFormData {
  carrier_name: string;
  effective_date: string;
  expiry_date: string;
  rate_per_lb: string;
  rate_per_mile: string;
  minimum_charge: string;
  fuel_surcharge: string;
  residential_delivery_fee: string;
  liftgate_fee: string;
  detention_rate: string;
  inside_delivery_fee: string;
  redelivery_fee: string;
  custom_rules: ContractCustomRule[];
}

interface ContractFormProps {
  initialData?: Partial<ContractFormData>;
  onSubmit: (data: ContractFormData) => void;
  loading?: boolean;
}

const emptyForm: ContractFormData = {
  carrier_name: '',
  effective_date: '',
  expiry_date: '',
  rate_per_lb: '',
  rate_per_mile: '',
  minimum_charge: '',
  fuel_surcharge: '',
  residential_delivery_fee: '',
  liftgate_fee: '',
  detention_rate: '',
  inside_delivery_fee: '',
  redelivery_fee: '',
  custom_rules: [],
};

function ContractForm({ initialData, onSubmit, loading }: ContractFormProps) {
  const [form, setForm] = useState<ContractFormData>({
    ...emptyForm,
    ...initialData,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContractFormData, string>>>({});

  const set = <K extends keyof ContractFormData>(key: K, value: ContractFormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.carrier_name.trim()) errs.carrier_name = 'Carrier name is required.';
    if (!form.effective_date) errs.effective_date = 'Required.';
    if (!form.expiry_date) errs.expiry_date = 'Required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(form);
  };

  const addRule = () =>
    set('custom_rules', [
      ...form.custom_rules,
      { name: '', expectedValue: '', type: 'Fixed Fee' },
    ]);

  const removeRule = (idx: number) =>
    set(
      'custom_rules',
      form.custom_rules.filter((_, i) => i !== idx),
    );

  const updateRule = (idx: number, field: keyof ContractCustomRule, value: string) => {
    const rules = [...form.custom_rules];
    if (field === 'type') {
      rules[idx] = { ...rules[idx], [field]: value as ContractCustomRule['type'] };
    } else {
      rules[idx] = { ...rules[idx], [field]: value };
    }
    set('custom_rules', rules);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Carrier Info */}
      <div>
        <h3 className="mb-4 font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
          Carrier Information
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="sm:col-span-3">
            <Input
              label="Carrier Name"
              value={form.carrier_name}
              onChange={(e) => set('carrier_name', e.target.value)}
              error={errors.carrier_name}
            />
          </div>
          <Input
            label="Effective Date"
            type="date"
            value={form.effective_date}
            onChange={(e) => set('effective_date', e.target.value)}
            error={errors.effective_date}
          />
          <Input
            label="Expiry Date"
            type="date"
            value={form.expiry_date}
            onChange={(e) => set('expiry_date', e.target.value)}
            error={errors.expiry_date}
          />
        </div>
      </div>

      <Separator />

      {/* Base Rates */}
      <div>
        <h3 className="mb-4 font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
          Base Rates
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input
            label="Rate per lb ($)"
            type="number"
            step="0.001"
            value={form.rate_per_lb}
            onChange={(e) => set('rate_per_lb', e.target.value)}
          />
          <Input
            label="Rate per mile ($)"
            type="number"
            step="0.01"
            value={form.rate_per_mile}
            onChange={(e) => set('rate_per_mile', e.target.value)}
          />
          <Input
            label="Minimum charge ($)"
            type="number"
            step="0.01"
            value={form.minimum_charge}
            onChange={(e) => set('minimum_charge', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Accessorial Charges */}
      <div>
        <h3 className="mb-4 font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
          Accessorial Charges
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Fuel surcharge (%)"
            type="number"
            step="0.1"
            value={form.fuel_surcharge}
            onChange={(e) => set('fuel_surcharge', e.target.value)}
          />
          <Input
            label="Residential delivery fee ($)"
            type="number"
            step="0.01"
            value={form.residential_delivery_fee}
            onChange={(e) => set('residential_delivery_fee', e.target.value)}
          />
          <Input
            label="Liftgate fee ($)"
            type="number"
            step="0.01"
            value={form.liftgate_fee}
            onChange={(e) => set('liftgate_fee', e.target.value)}
          />
          <Input
            label="Detention rate ($)"
            type="number"
            step="0.01"
            value={form.detention_rate}
            onChange={(e) => set('detention_rate', e.target.value)}
          />
          <Input
            label="Inside delivery fee ($)"
            type="number"
            step="0.01"
            value={form.inside_delivery_fee}
            onChange={(e) => set('inside_delivery_fee', e.target.value)}
          />
          <Input
            label="Redelivery fee ($)"
            type="number"
            step="0.01"
            value={form.redelivery_fee}
            onChange={(e) => set('redelivery_fee', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      {/* Custom Rules */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-[var(--font-syne)] text-base font-semibold text-[var(--text-primary)]">
            Custom Rules
          </h3>
          <Button type="button" variant="outline" size="sm" onClick={addRule}>
            <Plus size={16} className="mr-1" /> Add Rule
          </Button>
        </div>

        {form.custom_rules.length === 0 && (
          <p className="text-sm text-[var(--text-muted)]">
            No custom rules added. Click &quot;Add Rule&quot; to create one.
          </p>
        )}

        <div className="space-y-3">
          {form.custom_rules.map((rule, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--border)] p-4"
            >
              <div className="flex-1">
                <Input
                  label="Rule Name"
                  value={rule.name}
                  onChange={(e) => updateRule(idx, 'name', e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Expected Value"
                  value={rule.expectedValue}
                  onChange={(e) => updateRule(idx, 'expectedValue', e.target.value)}
                />
              </div>
              <div className="w-36">
                <Label className="mb-1.5 block">Type</Label>
                <Select
                  value={rule.type}
                  onChange={(e) => updateRule(idx, 'type', e.target.value)}
                  options={[
                    { value: 'Fixed Fee', label: 'Fixed Fee' },
                    { value: 'Percentage', label: 'Percentage' },
                    { value: 'Not Allowed', label: 'Not Allowed' },
                  ]}
                />
              </div>
              <button
                type="button"
                onClick={() => removeRule(idx)}
                className="mb-1 text-[var(--danger)] hover:text-[var(--danger)]"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <Button type="submit" size="lg" disabled={loading}>
        {loading ? 'Saving...' : initialData ? 'Update Contract' : 'Create Contract'}
      </Button>
    </form>
  );
}

export { ContractForm };
export type { ContractFormData, ContractFormProps };
