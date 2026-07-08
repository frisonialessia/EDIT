import type { Event, TimelineBlock } from '@edit-os/core';
import { Fragment, useEffect, useState } from 'react';
import { fetchEvent } from '@/lib/api';
import { cn } from '@/lib/utils';

const DEMO_EVENT_ID = 'event-1';
const HOURS = ['14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const DAYS = ['Mon 14', 'Tue 15', 'Wed 16', 'Thu 17', 'Fri 18', 'Sat 19', 'Sun 20'];

const blockColors: Record<TimelineBlock['status'], string> = {
  scheduled: 'bg-sky-100 border-sky-200 text-sky-900 dark:bg-sky-950/40 dark:border-sky-900/50 dark:text-sky-200',
  delayed: 'bg-amber-100 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-200',
  adjusted: 'bg-violet-100 border-violet-200 text-violet-900 dark:bg-violet-950/40 dark:border-violet-900/50 dark:text-violet-200',
  completed: 'bg-emerald-100 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-200',
};

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
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-neutral-950">
      <header className="border-b border-neutral-200/70 bg-white/80 px-10 py-8 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/80">
        <h1 className="text-[28px] font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
          Calendar
        </h1>
        <p className="mt-2 text-[13px] text-neutral-500">
          Weekly service blocks · {event?.name ?? 'Como Villa Gala'}
        </p>
      </header>

      <main className="overflow-x-auto px-6 py-8">
        <div className="min-w-[960px] rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
          <div className="grid grid-cols-[80px_repeat(7,minmax(0,1fr))] gap-2">
            <div />
            {DAYS.map((day) => (
              <div key={day} className="pb-3 text-center text-[12px] font-medium text-neutral-500">
                {day}
              </div>
            ))}

            {HOURS.map((hour, rowIndex) => (
              <Fragment key={`row-${hour}`}>
                <div className="pr-3 text-right text-[11px] text-neutral-400">{hour}</div>
                {DAYS.map((day, colIndex) => {
                  const block = event?.timeline.find(
                    (b) => hourIndex(b.startsAt) === rowIndex && colIndex === 5,
                  );

                  return (
                    <div
                      key={`${day}-${hour}`}
                      className="min-h-[56px] rounded-xl border border-dashed border-neutral-100 dark:border-neutral-900"
                    >
                      {block ? (
                        <div
                          className={cn(
                            'm-1 rounded-xl border px-2 py-2 text-[11px] font-medium',
                            blockColors[block.status],
                          )}
                        >
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
      </main>
    </div>
  );
}
