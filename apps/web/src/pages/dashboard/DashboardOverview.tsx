import type { Event } from '@edit-os/core';
import { AlertTriangle, CloudRain, Users, Wine } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { fetchEvent } from '@/lib/api';

const DEMO_EVENT_ID = 'event-1';

export function DashboardOverview(): React.JSX.Element {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    void fetchEvent(DEMO_EVENT_ID)
      .then(setEvent)
      .catch(() => setEvent(null));
  }, []);

  const criticalSignals = event?.riskProfile.signals.filter((s) => s.level === 'high' || s.level === 'critical') ?? [];

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-neutral-950">
      <header className="border-b border-neutral-200/70 bg-white/80 px-10 py-8 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/80">
        <p className="text-[12px] text-neutral-500">Wednesday · Lago di Como</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
          Good evening, Alessia
        </h1>
        <p className="mt-2 text-[13px] text-neutral-500">
          {event?.pendingProposals.length ?? 0} orchestration proposals awaiting approval
        </p>
      </header>

      <main className="space-y-8 px-10 py-10">
        <section className="grid gap-4 md:grid-cols-4">
          {[
            { label: 'Active plan', value: event ? `Plan ${event.activePlan}` : '—', icon: AlertTriangle },
            { label: 'Risk signals', value: String(event?.riskProfile.signals.length ?? 0), icon: CloudRain },
            { label: 'Timeline blocks', value: String(event?.timeline.length ?? 0), icon: Users },
            { label: 'Pending proposals', value: String(event?.pendingProposals.length ?? 0), icon: Wine },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950"
            >
              <div className="flex items-center justify-between">
                <p className="text-[12px] text-neutral-500">{label}</p>
                <Icon className="h-4 w-4 text-neutral-400" />
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
                {value}
              </p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
                Activity · today
              </h2>
              <Link to="/dashboard/orchestration" className="text-[12px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
                View all
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {event?.timeline.map((block) => (
                <div
                  key={block.id as string}
                  className="min-w-[180px] rounded-2xl border border-neutral-200/70 bg-neutral-50 p-4 dark:border-neutral-800/70 dark:bg-neutral-900/40"
                >
                  <p className="font-mono text-[11px] text-neutral-500">{block.startsAt}</p>
                  <p className="mt-2 text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">
                    {block.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
            <h2 className="text-[15px] font-semibold text-neutral-900 dark:text-neutral-100">
              Critical signals
            </h2>
            <div className="mt-4 space-y-3">
              {criticalSignals.length === 0 ? (
                <p className="text-[13px] text-neutral-500">All systems nominal.</p>
              ) : (
                criticalSignals.map((signal) => (
                  <div
                    key={signal.category}
                    className="rounded-xl border border-amber-200/70 bg-amber-50/50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20"
                  >
                    <p className="text-[12px] font-semibold capitalize text-amber-800 dark:text-amber-300">
                      {signal.category.replace('_', ' ')}
                    </p>
                    <p className="mt-1 text-[12px] text-neutral-600 dark:text-neutral-400">{signal.message}</p>
                  </div>
                ))
              )}
            </div>
            <Link to="/dashboard/orchestration" className="mt-5 inline-block">
              <Button className="shadow-none">Review orchestration</Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
