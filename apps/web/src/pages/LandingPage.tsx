import { ArrowRight, CloudRain, Sparkles, Users, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const scenarios = [
  {
    title: 'Como Villa Gala',
    location: 'Villa del Balbianello',
    image: 'from-sky-100 to-emerald-100 dark:from-sky-950/40 dark:to-emerald-950/30',
    tags: ['Outdoor', 'Plan B ready'],
  },
  {
    title: 'Milano Private Salon',
    location: 'Brera District',
    image: 'from-violet-100 to-rose-100 dark:from-violet-950/40 dark:to-rose-950/30',
    tags: ['Indoor', 'Acoustic control'],
  },
  {
    title: 'Paris Atelier Dinner',
    location: 'Le Marais',
    image: 'from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/30',
    tags: ['Consumption tracking', 'Guest flow'],
  },
];

const utilities = [
  { icon: CloudRain, title: 'Weather domino', copy: 'Rain >60% triggers Plan B, catering alerts, and timeline shifts.' },
  { icon: Zap, title: 'Traffic recalculation', copy: 'Live route delays cascade to cocktail, kitchen, and DJ schedules.' },
  { icon: Users, title: 'Guest flow control', copy: 'Density sensors open new zones before the room feels crowded.' },
  { icon: Sparkles, title: 'Ambient intelligence', copy: 'Sound and light profiles adapt to storms and residential limits.' },
];

interface LandingPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingPage({ isDark, onToggleTheme }: LandingPageProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#F7F5F2] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200/60 bg-[#F7F5F2]/85 backdrop-blur-md dark:border-neutral-800/60 dark:bg-neutral-950/85">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <p className="text-sm font-semibold tracking-wide">EDIT-OS</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleTheme}
              className="text-xs text-neutral-500 transition-colors hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="rounded-full shadow-none">
                Open dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl gap-16 px-6 pb-24 pt-32 lg:grid-cols-[320px_1fr] lg:items-start">
        <aside className="rounded-[28px] border border-neutral-200/70 bg-white/80 p-6 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950/80">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-neutral-900 dark:bg-white" />
            <div>
              <p className="text-[13px] font-semibold">Alessia Rossi</p>
              <p className="text-[12px] text-neutral-500">Event Architect · Casa Convivium</p>
            </div>
          </div>
          <nav className="mt-8 space-y-2 text-[13px] text-neutral-500">
            <p className="rounded-xl bg-neutral-100 px-3 py-2 font-medium text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100">
              Orchestration
            </p>
            <p className="px-3 py-2">Timeline</p>
            <p className="px-3 py-2">Risk signals</p>
            <p className="px-3 py-2">Messages</p>
          </nav>
          <div className="mt-8 rounded-2xl border border-neutral-200/70 p-4 dark:border-neutral-800/70">
            <p className="text-[11px] uppercase tracking-[0.08em] text-neutral-400">Pinned alert</p>
            <p className="mt-2 text-[13px] font-semibold">Weather Plan B · Como Villa Gala</p>
            <p className="mt-2 text-[12px] leading-relaxed text-neutral-500">
              72% rain probability detected. One-click approval shifts cocktail indoors.
            </p>
          </div>
        </aside>

        <div>
          <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">Ultra-luxury event intelligence</p>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
            Ideas and orchestration for the{' '}
            <span className="font-serif italic">modern</span> event architect.
          </h1>
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-neutral-500">
            EDIT-OS recalculates the entire event chain when weather, traffic, staff, or guest flow
            shifts — so your team never replans under pressure.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/dashboard">
              <Button className="rounded-full px-8 shadow-none">Enter command center</Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" className="rounded-full px-8 shadow-none">
                View profile
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200/70 px-6 py-24 dark:border-neutral-800/70">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.14em] text-neutral-400">Active scenarios</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Events under orchestration</h2>
            </div>
            <Link to="/dashboard/orchestration" className="inline-flex items-center gap-1 text-[13px] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100">
              Open orchestration
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {scenarios.map((scenario) => (
              <article
                key={scenario.title}
                className="overflow-hidden rounded-[28px] border border-neutral-200/70 bg-white shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950"
              >
                <div className={cn('h-44 bg-gradient-to-br', scenario.image)} />
                <div className="p-6">
                  <h3 className="text-[18px] font-semibold">{scenario.title}</h3>
                  <p className="mt-1 text-[13px] text-neutral-500">{scenario.location}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {scenario.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-medium text-neutral-600 dark:bg-neutral-900 dark:text-neutral-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200/70 bg-white px-6 py-24 dark:border-neutral-800/70 dark:bg-neutral-950">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-4">
          {utilities.map(({ icon: Icon, title, copy }) => (
            <article key={title} className="rounded-[24px] border border-neutral-200/70 p-6 dark:border-neutral-800/70">
              <Icon className="h-5 w-5 text-neutral-400" />
              <h3 className="mt-5 text-[16px] font-semibold">{title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
