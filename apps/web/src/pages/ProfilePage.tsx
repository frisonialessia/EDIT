import type { NotificationPreferences, ProfileState } from '@edit-os/core';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchProfile, updateProfile } from '@/lib/api';
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
      setProfile(await updateProfile(partial));
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
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-neutral-950">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Identity, team, alerts, integrations, and billing"
      />

      <main className="grid gap-0 px-10 py-10 lg:grid-cols-[200px_1fr] lg:divide-x lg:divide-neutral-200 dark:lg:divide-neutral-800">
        <nav className="space-y-0 lg:pr-10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex h-9 w-full items-center border-l-2 px-3 text-left text-[12px] transition-colors',
                activeTab === tab.id
                  ? 'border-neutral-900 font-medium text-neutral-900 dark:border-white dark:text-neutral-100'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-300',
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <section className="mt-10 lg:mt-0 lg:pl-10">
          {activeTab === 'identity' ? (
            <div className="space-y-8">
              <div>
                <SectionLabel>Identity</SectionLabel>
                <p className="mt-3 text-[18px] font-medium">{profile.profile.name}</p>
                <p className="mt-1 text-[13px] text-neutral-500">{profile.profile.title}</p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
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
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {profile.team.map((member) => (
                <div key={member.id} className="grid grid-cols-[1fr_auto] gap-4 py-4">
                  <div>
                    <p className="text-[13px] font-medium">{member.name}</p>
                    <p className="mt-1 text-[12px] text-neutral-500">{member.role}</p>
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">{member.status}</span>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'notifications' ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {Object.entries(profile.notifications).map(([key, enabled]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => void toggleNotification(key as keyof NotificationPreferences)}
                  className="flex w-full items-center justify-between py-4 text-left"
                >
                  <span className="text-[13px] capitalize text-neutral-800 dark:text-neutral-200">
                    {key.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-500">
                    {enabled ? 'On' : 'Off'}
                  </span>
                </button>
              ))}
            </div>
          ) : null}

          {activeTab === 'integrations' ? (
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              <div className="py-4">
                <SectionLabel>OpenWeather</SectionLabel>
                <p className="mt-2 text-[13px] text-neutral-600 dark:text-neutral-400">
                  {profile.integrations.openWeatherConfigured ? 'Connected' : 'Mock fallback active'}
                </p>
              </div>
              <div className="py-4">
                <SectionLabel>Google Maps Traffic</SectionLabel>
                <p className="mt-2 text-[13px] text-neutral-600 dark:text-neutral-400">
                  {profile.integrations.googleMapsConfigured ? 'Connected' : 'Mock fallback active'}
                </p>
              </div>
            </div>
          ) : null}

          {activeTab === 'billing' ? (
            <div className="space-y-6">
              <div>
                <SectionLabel>Current plan</SectionLabel>
                <p className="mt-3 text-3xl font-medium capitalize">{profile.billing.plan}</p>
              </div>
              <p className="text-[13px] text-neutral-500">
                {profile.billing.eventsRemaining} events remaining · renews {profile.billing.renewsAt}
              </p>
              <Button variant="outline">Manage subscription</Button>
            </div>
          ) : null}

          {isSaving ? <p className="mt-8 text-[11px] uppercase tracking-[0.12em] text-neutral-500">Saving…</p> : null}
        </section>
      </main>
    </div>
  );
}
