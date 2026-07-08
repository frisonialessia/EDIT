import type { Event } from '@edit-os/core';
import { RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MetricStrip } from '@/components/layout/MetricStrip';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
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

  const criticalSignals =
    event?.riskProfile.signals.filter((s) => s.level === 'high' || s.level === 'critical') ?? [];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <PageHeader
        eyebrow="Operations · Lago di Como"
        title="Command overview"
        description={`${event?.pendingProposals.length ?? 0} orchestration proposals awaiting approval`}
        actions={
          <>
            <Link to="/dashboard/orchestration">
              <Button variant="outline" size="sm">
                Orchestration
              </Button>
            </Link>
            <Link to="/dashboard/messages">
              <Button size="sm">Messages</Button>
            </Link>
          </>
        }
      />

      <main className="px-10">
        <MetricStrip
          metrics={[
            { label: 'Active plan', value: event ? `Plan ${event.activePlan}` : '—' },
            { label: 'Risk signals', value: String(event?.riskProfile.signals.length ?? 0) },
            { label: 'Timeline blocks', value: String(event?.timeline.length ?? 0) },
            { label: 'Pending proposals', value: String(event?.pendingProposals.length ?? 0) },
          ]}
        />

        <section className="grid gap-0 py-16 lg:grid-cols-[1.4fr_1fr] lg:divide-x lg:divide-neutral-200 dark:lg:divide-neutral-800">
          <div className="lg:pr-12">
            <div className="mb-6 flex items-center justify-between">
              <SectionLabel>Activity · today</SectionLabel>
              <Link
                to="/dashboard/timeline"
                className="text-[10px] uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                Full timeline
              </Link>
            </div>
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {event?.timeline.map((block) => (
                <div key={block.id as string} className="grid grid-cols-[80px_1fr_auto] gap-4 py-4">
                  <span className="font-mono text-[11px] text-neutral-500">{block.startsAt}</span>
                  <span className="text-[13px] text-neutral-900 dark:text-neutral-100">{block.label}</span>
                  <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">{block.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 lg:mt-0 lg:pl-12">
            <SectionLabel>Critical signals</SectionLabel>
            <div className="mt-6 divide-y divide-neutral-200 dark:divide-neutral-800">
              {criticalSignals.length === 0 ? (
                <p className="py-4 text-[13px] text-neutral-500">All systems nominal.</p>
              ) : (
                criticalSignals.map((signal) => (
                  <div key={signal.category} className="py-4">
                    <p className="text-[10px] uppercase tracking-[0.14em] text-neutral-500">
                      {signal.category.replace('_', ' ')}
                    </p>
                    <p className="mt-2 text-[13px] text-neutral-700 dark:text-neutral-300">{signal.message}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-8 flex gap-2">
              <Link to="/dashboard/orchestration">
                <Button>Review orchestration</Button>
              </Link>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
