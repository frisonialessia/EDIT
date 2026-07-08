import type { NotificationPreferences, ProfileState } from '@edit-os/core';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchProfile, updateProfile } from '@/lib/api';
import { getAvatarGradient, getInitials } from '@/lib/avatar';
import { cn } from '@/lib/utils';

type ProfileTab = 'identity' | 'team' | 'notifications' | 'integrations' | 'billing';

const tabs: Array<{ id: ProfileTab; label: string }> = [
  { id: 'identity', label: 'Identity' },
  { id: 'team', label: 'Team' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'billing', label: 'Billing' },
];

export function ProfilePage(): React.JSX.Element {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [activeTab, setActiveTab] = useState<ProfileTab>('identity');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void fetchProfile().then(setProfile).catch(() => setProfile(null));
  }, []);

  async function saveProfile(partial: Partial<ProfileState>): Promise<void> {
    setIsSaving(true);
    try {
      const updated = await updateProfile(partial);
      setProfile(updated);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleNotification(key: keyof NotificationPreferences): Promise<void> {
    if (!profile) {
      return;
    }

    await saveProfile({
      notifications: {
        ...profile.notifications,
        [key]: !profile.notifications[key],
      },
    });
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5] dark:bg-neutral-950">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-neutral-950">
      <header className="border-b border-neutral-200/70 bg-white/80 px-10 py-8 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/80">
        <h1 className="text-[28px] font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">Profile</h1>
        <p className="mt-2 text-[13px] text-neutral-500">Account, team, alerts, and integrations</p>
      </header>

      <main className="grid gap-8 px-10 py-10 lg:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex h-10 w-full items-center rounded-xl px-4 text-left text-[13px] transition-colors',
                activeTab === tab.id
                  ? 'bg-white font-medium text-neutral-900 shadow-sm dark:bg-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-500 hover:bg-white/70 dark:hover:bg-neutral-900/50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="rounded-2xl border border-neutral-200/70 bg-white p-8 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
          {activeTab === 'identity' ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br text-lg font-semibold text-white',
                    getAvatarGradient(profile.profile.id as string),
                  )}
                >
                  {getInitials(profile.profile.name)}
                </div>
                <div>
                  <h2 className="text-[20px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {profile.profile.name}
                  </h2>
                  <p className="text-[13px] text-neutral-500">{profile.profile.title}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue={profile.profile.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={profile.profile.email} />
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === 'team' ? (
            <div className="space-y-4">
              {profile.team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-200/70 px-4 py-4 dark:border-neutral-800/70"
                >
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{member.name}</p>
                    <p className="text-[12px] text-neutral-500">{member.role}</p>
                  </div>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] capitalize text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                    {member.status}
                  </span>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'notifications' ? (
            <div className="space-y-3">
              {Object.entries(profile.notifications).map(([key, enabled]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => void toggleNotification(key as keyof NotificationPreferences)}
                  className="flex w-full items-center justify-between rounded-xl border border-neutral-200/70 px-4 py-4 text-left dark:border-neutral-800/70"
                >
                  <span className="text-[13px] capitalize text-neutral-800 dark:text-neutral-200">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-semibold',
                      enabled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-900',
                    )}
                  >
                    {enabled ? 'On' : 'Off'}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {activeTab === 'integrations' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200/70 px-4 py-4 dark:border-neutral-800/70">
                <p className="text-[13px] font-semibold">OpenWeather</p>
                <p className="mt-1 text-[12px] text-neutral-500">
                  {profile.integrations.openWeatherConfigured ? 'Connected' : 'Using mock fallback'}
                </p>
              </div>
              <div className="rounded-xl border border-neutral-200/70 px-4 py-4 dark:border-neutral-800/70">
                <p className="text-[13px] font-semibold">Google Maps Traffic</p>
                <p className="mt-1 text-[12px] text-neutral-500">
                  {profile.integrations.googleMapsConfigured ? 'Connected' : 'Using mock fallback'}
                </p>
              </div>
            </div>
          ) : null}

          {activeTab === 'billing' ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-neutral-200/70 px-4 py-4 dark:border-neutral-800/70">
                <p className="text-[12px] uppercase tracking-[0.08em] text-neutral-400">Current plan</p>
                <p className="mt-2 text-2xl font-semibold capitalize text-neutral-900 dark:text-neutral-100">
                  {profile.billing.plan}
                </p>
              </div>
              <p className="text-[13px] text-neutral-500">
                {profile.billing.eventsRemaining} events remaining · renews {profile.billing.renewsAt}
              </p>
              <Button variant="outline" className="shadow-none">Manage subscription</Button>
            </div>
          ) : null}

          {isSaving ? (
            <p className="mt-6 text-[12px] text-neutral-500">Saving…</p>
          ) : null}
        </section>
      </main>
    </div>
  );
}
