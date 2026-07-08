import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Button } from '@/components/ui/button';

const scenarios = [
  {
    title: 'Como Villa Gala',
    location: 'Villa del Balbianello · Lago di Como',
    tone: 'from-neutral-300 via-neutral-200 to-neutral-100 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950',
    tags: ['Outdoor', 'Plan B armed'],
  },
  {
    title: 'Milano Private Salon',
    location: 'Brera · Milano',
    tone: 'from-neutral-400 via-neutral-300 to-neutral-200 dark:from-neutral-700 dark:via-neutral-900 dark:to-neutral-950',
    tags: ['Indoor', 'Acoustic control'],
  },
  {
    title: 'Paris Atelier Dinner',
    location: 'Le Marais · Paris',
    tone: 'from-neutral-500 via-neutral-300 to-neutral-100 dark:from-neutral-600 dark:via-neutral-900 dark:to-neutral-950',
    tags: ['Consumption', 'Guest flow'],
  },
];

const utilities = [
  { n: '01', title: 'Weather domino', copy: 'Rain >60% triggers Plan B, catering alerts, timeline recalculation.' },
  { n: '02', title: 'Traffic cascade', copy: 'Route delays propagate to cocktail, kitchen, and entertainment blocks.' },
  { n: '03', title: 'Staff reassignment', copy: 'Key vendor delays activate backup protocols before guests notice.' },
  { n: '04', title: 'Ambient control', copy: 'Sound and light profiles adapt to storms and residential thresholds.' },
];

interface LandingPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingPage({ isDark, onToggleTheme }: LandingPageProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <PublicNav isDark={isDark} onToggleTheme={onToggleTheme} />

      <section className="mx-auto grid max-w-7xl gap-0 px-6 pb-0 pt-28 lg:grid-cols-[280px_1fr]">
        <aside className="hidden border-r border-neutral-200 pr-8 dark:border-neutral-800 lg:block">
          <SectionLabel>System status</SectionLabel>
          <div className="mt-6 space-y-4 border-b border-neutral-200 pb-8 dark:border-neutral-800">
            <div>
              <p className="text-[11px] text-neutral-500">Active event</p>
              <p className="mt-1 text-[13px] font-medium">Como Villa Gala</p>
            </div>
            <div>
              <p className="text-[11px] text-neutral-500">Pending proposals</p>
              <p className="mt-1 text-3xl font-medium tabular-nums">1</p>
            </div>
          </div>
          <div className="mt-8">
            <SectionLabel>Pinned alert</SectionLabel>
            <p className="mt-4 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
              Weather Plan B · 72% rain probability. One-click approval shifts cocktail indoors.
            </p>
          </div>
        </aside>

        <div className="lg:pl-12">
          <SectionLabel>Ultra-luxury event intelligence</SectionLabel>
          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-normal leading-[1.02] tracking-tight md:text-7xl">
            Orchestration for the <span className="italic">modern</span> event architect.
          </h1>
          <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-neutral-500">
            EDIT-OS recalculates the entire event chain when weather, traffic, staff, or guest flow
            shifts. Zero manual replanning under pressure.
          </p>
          <div className="mt-10 flex flex-wrap gap-2">
            <Link to="/dashboard">
              <Button>Open command console</Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline">View plans</Button>
            </Link>
            <Link to="/contact#inquiry">
              <Button variant="ghost">Contact sales</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-20 border-t border-neutral-200 dark:border-neutral-800">
        <div className="edit-editorial-image mx-auto max-w-7xl">
          <div className="h-56 w-full bg-gradient-to-r from-neutral-300 via-neutral-200 to-neutral-100 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-950" />
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-20 dark:border-neutral-800">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between gap-6 border-b border-neutral-200 pb-8 dark:border-neutral-800">
            <div>
              <SectionLabel>Active scenarios</SectionLabel>
              <h2 className="mt-3 font-serif text-3xl font-normal tracking-tight">Events under orchestration</h2>
            </div>
            <Link
              to="/dashboard/orchestration"
              className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.14em] text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Open orchestration
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-0 md:grid-cols-3 md:divide-x md:divide-neutral-200 dark:md:divide-neutral-800">
            {scenarios.map((scenario) => (
              <article key={scenario.title} className="md:px-8 md:first:pl-0 md:last:pr-0">
                <div className={`edit-editorial-image mb-6 bg-gradient-to-br ${scenario.tone}`} />
                <SectionLabel>{scenario.location}</SectionLabel>
                <h3 className="mt-2 text-[16px] font-medium">{scenario.title}</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {scenario.tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-neutral-200 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-neutral-500 dark:border-neutral-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-20 dark:border-neutral-800">
        <div className="mx-auto grid max-w-7xl gap-0 md:grid-cols-2 lg:grid-cols-4 md:divide-x md:divide-neutral-200 dark:md:divide-neutral-800">
          {utilities.map(({ n, title, copy }) => (
            <article key={n} className="py-2 md:px-8 md:first:pl-0 md:last:pr-0">
              <SectionLabel>Module {n}</SectionLabel>
              <h3 className="mt-3 text-[14px] font-medium">{title}</h3>
              <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-neutral-200 px-6 py-16 dark:border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
          <p className="font-serif text-2xl font-normal">Ready to operate at precision?</p>
          <div className="flex gap-2">
            <Link to="/contact">
              <Button>Request estate plan</Button>
            </Link>
            <Link to="/dashboard">
              <Button variant="outline">Launch console</Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-8 dark:border-neutral-800">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 text-[11px] uppercase tracking-[0.12em] text-neutral-500">
          <span>EDIT-OS · Casa Convivium</span>
          <span>Como · Milan · Paris</span>
          <Link to="/contact" className="hover:text-neutral-900 dark:hover:text-neutral-100">
            Contact
          </Link>
        </div>
      </footer>
    </div>
  );
}
