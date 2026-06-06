'use client';

import { useState } from 'react';
import {
  Building2, Users, Puzzle, Shield, Upload, Plus,
  BookOpen, Key, LogOut, Monitor,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Tabs } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

const currencies = [
  { value: 'usd', label: 'USD — US Dollar' },
  { value: 'eur', label: 'EUR — Euro' },
  { value: 'gbp', label: 'GBP — British Pound' },
  { value: 'cad', label: 'CAD — Canadian Dollar' },
];

interface TeamMember {
  name: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
}

const mockTeam: TeamMember[] = [
  { name: 'Alex Rivera', email: 'alex@freightaudit.ai', role: 'admin' },
  { name: 'Jordan Chen', email: 'jordan@freightaudit.ai', role: 'member' },
  { name: 'Taylor Kim', email: 'taylor@freightaudit.ai', role: 'viewer' },
];

const integrations = [
  { name: 'QuickBooks', icon: BookOpen },
  { name: 'Xero', icon: BookOpen },
  { name: 'SAP', icon: BookOpen },
];

const mockSessions = [
  { device: 'Chrome on Windows', lastActive: '2 minutes ago', current: true },
  { device: 'Safari on macOS', lastActive: '3 hours ago', current: false },
  { device: 'Mobile App (iOS)', lastActive: '1 day ago', current: false },
];

function SettingsCard({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [orgName, setOrgName] = useState('FreightAudit AI');
  const [currency, setCurrency] = useState('usd');
  const [inviteEmail, setInviteEmail] = useState('');
  const [resendKey, setResendKey] = useState('');
  const [llamaKey, setLlamaKey] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const settingsTabs = [
    {
      value: 'organization',
      label: 'Organization',
      content: (
        <div className="space-y-6">
          <SettingsCard>
            <h3 className="font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
              Company Information
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Update your organization details visible on dispute letters and invoices.
            </p>
            <Separator className="my-4" />
            <div className="space-y-4">
              <Input
                label="Company Name"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-2)]">
                  <Building2 size={24} className="text-[var(--text-muted)]" />
                </div>
                <Button variant="outline" size="sm">
                  <Upload size={14} className="mr-1" />
                  Upload Logo
                </Button>
              </div>
              <Select
                label="Default Currency"
                options={currencies}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <div className="mt-6 flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </SettingsCard>
        </div>
      ),
    },
    {
      value: 'team',
      label: 'Team',
      content: (
        <div className="space-y-6">
          <SettingsCard>
            <h3 className="font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
              Invite Team Members
            </h3>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Send an invitation to join your organization.
            </p>
            <Separator className="my-4" />
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  placeholder="colleague@company.com"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button>
                <Plus size={16} className="mr-1" />
                Invite
              </Button>
            </div>
          </SettingsCard>

          <SettingsCard>
            <h3 className="font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
              Team Members
            </h3>
            <Separator className="my-4" />
            <div className="space-y-3">
              {mockTeam.map((member) => (
                <div
                  key={member.email}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">{member.name}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{member.email}</p>
                  </div>
                  <Badge
                    variant={
                      member.role === 'admin'
                        ? 'info'
                        : member.role === 'member'
                          ? 'default'
                          : 'secondary'
                    }
                  >
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </SettingsCard>
        </div>
      ),
    },
    {
      value: 'integrations',
      label: 'Integrations',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            {integrations.map((int) => {
              const Icon = int.icon;
              return (
                <Card key={int.name}>
                  <CardHeader className="flex flex-row items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--surface-2)]">
                      <Icon size={20} className="text-[var(--text-secondary)]" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{int.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Badge variant="secondary">Coming Soon</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <SettingsCard>
            <h3 className="font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
              API Keys
            </h3>
            <Separator className="my-4" />
            <div className="space-y-4">
              <Input
                label="Resend API Key"
                type="password"
                placeholder="re_..."
                value={resendKey}
                onChange={(e) => setResendKey(e.target.value)}
              />
              <Input
                label="LlamaParse API Key"
                type="password"
                placeholder="llx-..."
                value={llamaKey}
                onChange={(e) => setLlamaKey(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button>Save Keys</Button>
            </div>
          </SettingsCard>
        </div>
      ),
    },
    {
      value: 'security',
      label: 'Security',
      content: (
        <div className="space-y-6">
          <SettingsCard>
            <h3 className="font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
              Change Password
            </h3>
            <Separator className="my-4" />
            <div className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button>Update Password</Button>
            </div>
          </SettingsCard>

          <SettingsCard>
            <h3 className="font-[var(--font-syne)] text-lg font-semibold text-[var(--text-primary)]">
              Active Sessions
            </h3>
            <Separator className="my-4" />
            <div className="space-y-3">
              {mockSessions.map((session) => (
                <div
                  key={session.device}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] p-3"
                >
                  <div className="flex items-center gap-3">
                    <Monitor size={18} className="text-[var(--text-muted)]" />
                    <div>
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {session.device}
                        {session.current && (
                          <span className="ml-2 text-xs text-[var(--primary)]">Current</span>
                        )}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        Last active: {session.lastActive}
                      </p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button variant="ghost" size="sm">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="danger">
                <LogOut size={14} className="mr-1" />
                Sign Out All Devices
              </Button>
            </div>
          </SettingsCard>
        </div>
      ),
    },
  ];

  return (
    <main className="px-6 py-10">
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader title="Settings" description="Manage your organization, team, integrations, and security." />
        <Tabs tabs={settingsTabs} defaultValue="organization" />
      </div>
    </main>
  );
}
