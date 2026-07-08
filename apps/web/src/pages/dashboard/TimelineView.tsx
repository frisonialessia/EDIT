import type { Event } from '@edit-os/core';
import { useEffect, useState } from 'react';
import { fetchEvent } from '@/lib/api';

const DEMO_EVENT_ID = 'event-1';

const phases = [
  {
    label: 'Preparation',
    range: 'Dec 20 – Dec 25',
    tasks: ['Vendor confirmation', 'Weather monitoring', 'Plan B staging'],
  },
  {
    label: 'Arrival & Setup',
    range: '15:15 – 17:30',
    tasks: ['Catering montaje', 'Acoustic check', 'Guest transport routing'],
  },
  {
    label: 'Experience',
    range: '18:00 – 22:30',
    tasks: ['Cóctel terraza', 'DJ ambient set', 'Cena de autor'],
  },
  {
    label: 'Close',
    range: '22:30 – 23:30',
    tasks: ['Guest flow exit', 'Inventory reconciliation', 'Vendor debrief'],
  },
];

export function TimelineView(): React.JSX.Element {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    void fetchEvent(DEMO_EVENT_ID).then(setEvent).catch(() => setEvent(null));
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <header className="border-b border-neutral-200 px-10 py-10 dark:border-neutral-800">
        <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">Journey highlights</p>
        <h1 className="mt-3 text-[42px] font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
          Timeline
        </h1>
        <p className="mt-2 text-[13px] text-neutral-500">
          Plan {event?.activePlan ?? 'A'} · {event?.location}
        </p>
      </header>

      <main className="px-10 py-12">
        <div className="relative">
          <div className="absolute inset-x-0 top-[52px] grid grid-cols-4 gap-0">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="h-[320px] border-r border-dotted border-neutral-200 dark:border-neutral-800"
              />
            ))}
          </div>

          <div className="relative space-y-16">
            {phases.map((phase, index) => (
              <section key={phase.label} style={{ marginLeft: `${index * 12}%` }}>
                <div className="inline-flex min-w-[220px] items-center justify-center rounded-full bg-neutral-950 px-8 py-4 text-[13px] font-semibold text-white dark:bg-white dark:text-neutral-950">
                  {phase.label}
                </div>
                <p className="mt-3 font-mono text-[12px] text-neutral-500">{phase.range}</p>
                <ul className="mt-5 space-y-2">
                  {phase.tasks.map((task) => (
                    <li key={task} className="text-[13px] text-neutral-700 dark:text-neutral-300">
                      {task}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
