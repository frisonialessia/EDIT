import type { Event, TimelineBlock } from '@edit-os/core';
import { Fragment, useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { fetchEvent } from '@/lib/api';
import { cn } from '@/lib/utils';

const DEMO_EVENT_ID = 'event-1';
const HOURS = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const DAYS = ['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18', 'Sat 19', 'Sun 20'];

function hourIndex(time: string): number {
  const hour = Number(time.split(':')[0]);
  return Math.max(0, hour - 14);
}

export function CalendarView(): React.JSX.Element {
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    void fetchEvent(DEMO_EVENT_ID).then(setEvent).catch(() => setEvent(null));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <PageHeader
        eyebrow="Schedule"
        title="Calendar"
        description={event?.name ?? 'Como Villa Gala'}
      />

      <main className="overflow-x-auto px-10 py-10">
        <div className="min-w-[960px] border border-neutral-200 dark:border-neutral-800">
          <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))]">
            <div className="border-b border-neutral-200 dark:border-neutral-800" />
            {DAYS.map((day) => (
              <div
                key={day}
                className="border-b border-l border-neutral-200 py-3 text-center text-[10px] uppercase tracking-[0.14em] text-neutral-500 dark:border-neutral-800"
              >
                {day}
              </div>
            ))}

            {HOURS.map((hour, rowIndex) => (
              <Fragment key={`row-${hour}`}>
                <div className="border-b border-neutral-200 py-4 pr-3 text-right font-mono text-[10px] text-neutral-400 dark:border-neutral-800">
                  {hour}
                </div>
                {DAYS.map((day, colIndex) => {
                  const block = event?.timeline.find(
                    (b) => hourIndex(b.startsAt) === rowIndex && colIndex === 5,
                  );

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="min-h-[52px] border-b border-l border-neutral-200 dark:border-neutral-800"
                    >
                      {block ? (
                        <div className="m-px border border-neutral-300 bg-neutral-100 px-2 py-2 text-[10px] uppercase tracking-[0.08em] text-neutral-700 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300">
                          {block.label}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </Fragment>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <SectionLabel>Legend</SectionLabel>
          <p className="mt-3 text-[12px] text-neutral-500">
            Service blocks for {event?.date ?? '2026-09-15'} · Plan {event?.activePlan ?? 'A'}
          </p>
        </div>
      </main>
    </div>
  );
}
