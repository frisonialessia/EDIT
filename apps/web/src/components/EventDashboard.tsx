import type { Event, EventStatus, Vendor, VendorCategory } from '@edit-os/core';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';
import { ApiError, assignVendorToEvent, fetchEvent } from '@/lib/api';
import { getAvatarGradient, getInitials } from '@/lib/avatar';
import { cn } from '@/lib/utils';

const DEMO_EVENT_ID = 'event-1';

const statusLabels: Record<EventStatus, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  executed: 'Executed',
  cancelled: 'Cancelled',
};

const statusStyles: Record<EventStatus, string> = {
  draft:
    'border-neutral-200 bg-neutral-100 text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  confirmed:
    'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300',
  executed:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300',
  cancelled:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300',
};

const categoryColors: Record<VendorCategory, string> = {
  venue: 'bg-violet-500',
  catering: 'bg-amber-500',
  floristry: 'bg-pink-500',
  entertainment: 'bg-purple-500',
  transport: 'bg-sky-500',
  accommodation: 'bg-teal-500',
  other: 'bg-neutral-400',
};

interface EventDashboardProps {
  eventId?: string;
  isDark: boolean;
  onToggleTheme: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <p className="enterprise-section-label mb-5">{children}</p>;
}

function DataGridRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="grid grid-cols-[minmax(160px,220px)_1fr] items-center gap-x-12 gap-y-1 border-b border-neutral-200/70 py-5 last:border-b-0 dark:border-neutral-800/70">
      <dt className="text-[13px] font-normal text-neutral-500 dark:text-neutral-400">{label}</dt>
      <dd className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{value}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: EventStatus }): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-[11px] font-semibold',
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

function PersonAvatar({
  name,
  seed,
  size = 'md',
}: {
  name: string;
  seed: string;
  size?: 'sm' | 'md' | 'lg';
}): React.JSX.Element {
  const sizeClass =
    size === 'lg' ? 'h-11 w-11 text-sm' : size === 'sm' ? 'h-7 w-7 text-[10px]' : 'h-9 w-9 text-xs';

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold text-white shadow-sm ring-2 ring-white dark:ring-neutral-950',
        sizeClass,
        getAvatarGradient(seed),
      )}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  );
}

function VendorRow({ vendor }: { vendor: Vendor }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-neutral-200/70 py-5 last:border-b-0 dark:border-neutral-800/70">
      <div className="flex min-w-0 items-center gap-4">
        <PersonAvatar name={vendor.name} seed={vendor.id as string} size="lg" />
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={cn('h-2 w-2 shrink-0 rounded-full', categoryColors[vendor.category])}
              aria-hidden
            />
            <p className="truncate text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
              {vendor.name}
            </p>
          </div>
          <p className="mt-1 text-[12px] font-normal capitalize text-neutral-500">{vendor.category}</p>
        </div>
      </div>
      <code className="shrink-0 font-mono text-[11px] font-medium text-neutral-400">
        {vendor.id as string}
      </code>
    </div>
  );
}

export function EventDashboard({
  eventId = DEMO_EVENT_ID,
  isDark,
  onToggleTheme,
}: EventDashboardProps): React.JSX.Element {
  const { toast } = useToast();
  const [event, setEvent] = useState<Event | null>(null);
  const [vendorId, setVendorId] = useState('vendor-1');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  const loadEvent = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const data = await fetchEvent(eventId);
      setEvent(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Unable to load event';
      toast({ variant: 'error', title: 'Failed to load event', description: message });
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, [eventId, toast]);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  async function handleAssignVendor(submitEvent: React.FormEvent<HTMLFormElement>): Promise<void> {
    submitEvent.preventDefault();
    setIsSubmitting(true);

    try {
      const updated = await assignVendorToEvent(eventId, vendorId.trim());
      setEvent(updated);
      setIsAssignOpen(false);
      toast({
        variant: 'success',
        title: 'Vendor assigned',
        description: `${vendorId.trim()} linked successfully.`,
      });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Unable to assign vendor to event';
      toast({ variant: 'error', title: 'Assignment failed', description: message });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AppShell isDark={isDark} onToggleTheme={onToggleTheme}>
      <div className="min-h-screen bg-[#FCFCFC] dark:bg-neutral-950">
        <header className="flex h-14 items-center border-b border-neutral-200/70 px-10 dark:border-neutral-800/70">
          <nav className="flex items-center gap-2 text-[12px] font-normal text-neutral-400">
            <span>EDIT-OS</span>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span>Events</span>
            <span className="text-neutral-300 dark:text-neutral-600">/</span>
            <span className="font-medium text-neutral-600 dark:text-neutral-300">{eventId}</span>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-10 py-14">
          <div className="mb-16 flex items-start justify-between gap-12">
            <div className="min-w-0 flex-1">
              {isLoading ? (
                <div className="flex items-center gap-2 text-[13px] font-normal text-neutral-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading event record…
                </div>
              ) : (
                <>
                  <h1 className="truncate text-[30px] font-semibold leading-9 tracking-tight text-neutral-950 dark:text-neutral-50">
                    {event?.name ?? 'Event not found'}
                  </h1>
                  <p className="mt-3 text-[13px] font-normal text-neutral-500 dark:text-neutral-400">
                    Operational control · {eventId}
                    {event ? ` · ${event.date}` : ''}
                  </p>
                </>
              )}
            </div>

            <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={isLoading} className="shrink-0 shadow-none">
                  Assign vendor
                </Button>
              </DialogTrigger>
              <DialogContent className="overflow-hidden p-0">
                <DialogHeader>
                  <DialogTitle>Assign vendor</DialogTitle>
                  <DialogDescription>
                    Enter a vendor identifier to link it to this event.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => void handleAssignVendor(e)}>
                  <DialogBody>
                    <div className="space-y-2">
                      <Label htmlFor="vendorId">Vendor ID</Label>
                      <Input
                        id="vendorId"
                        value={vendorId}
                        onChange={(e) => setVendorId(e.target.value)}
                        placeholder="vendor-1"
                        disabled={isSubmitting}
                        className="font-mono shadow-none"
                      />
                    </div>
                  </DialogBody>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsAssignOpen(false)}
                      className="shadow-none"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="min-w-[120px] shadow-none">
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          Saving…
                        </>
                      ) : (
                        'Confirm'
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {event ? (
            <div className="grid grid-cols-12 gap-16">
              <section className="col-span-12 lg:col-span-8">
                <SectionLabel>Event details</SectionLabel>
                <dl className="rounded-xl border border-neutral-200/70 bg-white px-8 dark:border-neutral-800/70 dark:bg-neutral-950">
                  <DataGridRow label="Event name" value={event.name} />
                  <DataGridRow
                    label="Event ID"
                    value={
                      <code className="rounded-md bg-neutral-100 px-2 py-1 font-mono text-[12px] font-semibold text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300">
                        {event.id as string}
                      </code>
                    }
                  />
                  <DataGridRow label="Date" value={event.date} />
                  <DataGridRow label="Status" value={<StatusBadge status={event.status} />} />
                  <DataGridRow
                    label="Client"
                    value={
                      <span className="flex items-center gap-3">
                        <PersonAvatar name={event.client.name} seed={event.client.id as string} />
                        {event.client.name}
                      </span>
                    }
                  />
                  <DataGridRow label="Email" value={event.client.email} />
                </dl>

                <div className="mt-20">
                  <SectionLabel>Assigned vendors</SectionLabel>
                  {event.vendors.length === 0 ? (
                    <p className="text-[13px] font-normal text-neutral-500">
                      No vendors linked to this event.
                    </p>
                  ) : (
                    <div className="rounded-xl border border-neutral-200/70 bg-white px-8 dark:border-neutral-800/70 dark:bg-neutral-950">
                      {event.vendors.map((vendor) => (
                        <VendorRow key={vendor.id as string} vendor={vendor} />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <aside className="col-span-12 lg:col-span-4">
                <SectionLabel>At a glance</SectionLabel>
                <div className="space-y-8 rounded-xl border border-neutral-200/70 bg-white p-8 dark:border-neutral-800/70 dark:bg-neutral-950">
                  <div>
                    <p className="text-[12px] font-normal text-neutral-500">Status</p>
                    <div className="mt-3">
                      <StatusBadge status={event.status} />
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-8 dark:border-neutral-800/70">
                    <p className="text-[12px] font-normal text-neutral-500">Client</p>
                    <div className="mt-4 flex items-center gap-3">
                      <PersonAvatar name={event.client.name} seed={event.client.id as string} size="lg" />
                      <div>
                        <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                          {event.client.name}
                        </p>
                        <p className="mt-1 text-[12px] font-normal text-neutral-500">
                          {event.client.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-200/70 pt-8 dark:border-neutral-800/70">
                    <p className="text-[12px] font-normal text-neutral-500">Vendor network</p>
                    <p className="mt-3 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                      {event.vendors.length}
                    </p>
                    <p className="mt-1 text-[12px] font-normal text-neutral-500">active assignments</p>
                  </div>
                </div>
              </aside>
            </div>
          ) : null}
        </main>
      </div>
    </AppShell>
  );
}
