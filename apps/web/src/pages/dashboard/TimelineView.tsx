import type { Event } from '@edit-os/core';
import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { fetchEvent } from '@/lib/api';

const DEMO_EVENT_ID = 'event-1';

const phases = [
  { label: 'Preparation', range: 'Dec 20 – Dec 25', tasks: ['Vendor confirmation', 'Weather monitoring', 'Plan B staging'] },
  { label: 'Arrival & Setup', range: '15:15 – 17:30', tasks: ['Catering montaje', 'Acoustic check', 'Transport routing'] },
  { label: 'Experience', range: '18:00 – 22:30', tasks: ['Cóctel terraza', 'DJ ambient set', 'Cena de autor'] },
  { label: 'Close', range: '22:30 – 23:30', tasks: ['Guest flow exit', 'Inventory reconciliation', 'Vendor debrief'] },
];

export function TimelineView(): React.JSX.Element {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    void fetchEvent(DEMO_EVENT_ID).then(setEvent).catch(() => setEvent(null));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <PageHeader
        eyebrow="Journey highlights"
        title="Timeline"
        description={`Plan ${event?.activePlan ?? 'A'} · ${event?.location ?? ''}`}
      />

      <main className="px-10 py-12">
        <div className="relative border-t border-neutral-200 dark:border-neutral-800">
          {phases.map((phase, index) => (
            <section
              key={phase.label}
              className="border-b border-neutral-200 py-10 dark:border-neutral-800"
              style={{ marginLeft: `${index * 8}%`, maxWidth: '520px' }}
            >
              <div className="inline-block border border-neutral-900 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-900 dark:border-white dark:text-neutral-100">
                {phase.label}
              </div>
              <p className="mt-4 font-mono text-[11px] text-neutral-500">{phase.range}</p>
              <ul className="mt-6 space-y-2">
                {phase.tasks.map((task) => (
                  <li key={task} className="border-l border-neutral-300 pl-3 text-[13px] text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
                    {task}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800">
          <SectionLabel>Live blocks</SectionLabel>
          <div className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
            {event?.timeline.map((block) => (
              <div key={block.id as string} className="grid grid-cols-[72px_1fr_auto] gap-4 py-3">
                <span className="font-mono text-[11px] text-neutral-500">{block.startsAt}</span>
                <span className="text-[13px]">{block.label}</span>
                <span className="text-[10px] uppercase tracking-[0.12em] text-neutral-400">{block.status}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
