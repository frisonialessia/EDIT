import { ArrowRight, Gauge, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function DashboardPreview(): React.JSX.Element {
  return (
    <div className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-lg border border-neutral-800/40">
      <div className="pointer-events-none select-none blur-sm">
        <div className="flex bg-neutral-950">
          <div className="w-12 border-r border-neutral-800 bg-neutral-900" />
          <div className="flex-1 p-8">
            <div className="mb-6 h-8 w-64 rounded bg-neutral-800" />
            <div className="space-y-3">
              <div className="h-4 w-full rounded bg-neutral-800/80" />
              <div className="h-4 w-5/6 rounded bg-neutral-800/60" />
              <div className="h-4 w-4/6 rounded bg-neutral-800/40" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
    </div>
  );
}

const features = [
  {
    icon: Layers,
    title: 'Vendor Orchestration',
    description: 'Coordinate luxury suppliers across global markets with precision routing.',
  },
  {
    icon: ShieldCheck,
    title: 'Budget Integrity',
    description: 'Maintain financial control with real-time visibility across every line item.',
  },
  {
    icon: Gauge,
    title: 'Real-Time Control',
    description: 'Monitor event status, assignments, and logistics from a single command view.',
  },
];

interface LandingPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function LandingPage({ isDark, onToggleTheme }: LandingPageProps): React.JSX.Element {
  return (
    <div className="min-h-screen bg-white text-neutral-900 dark:bg-black dark:text-neutral-100">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-neutral-200/60 bg-white/80 backdrop-blur-md dark:border-neutral-800/60 dark:bg-black/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
              <Button variant="outline" size="sm">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="flex min-h-screen flex-col items-center justify-center px-6 pb-20 pt-28 text-center">
        <p className="mb-6 text-xs uppercase tracking-[0.4em] text-neutral-500">
          Enterprise Event Intelligence
        </p>
        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight md:text-6xl">
          Precision Logistics for Ultra-Luxury Events.
        </h1>
        <p className="mt-6 max-w-2xl text-base font-light text-neutral-500 md:text-lg">
          The operating system for event architects who demand invisible technology,
          flawless execution, and absolute control at global scale.
        </p>
        <Link to="/dashboard" className="mt-10 inline-block">
          <button
            type="button"
            className="bg-neutral-900 px-10 py-4 text-xs font-medium uppercase tracking-[0.35em] text-white transition-opacity hover:opacity-90 dark:bg-white dark:text-black"
          >
            Request Access
          </button>
        </Link>
        <DashboardPreview />
      </section>

      <section className="border-t border-neutral-200 px-6 py-24 dark:border-neutral-800">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <article key={title} className="space-y-4">
              <Icon className="h-5 w-5 stroke-[1.5] text-neutral-400" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grain relative border-t border-neutral-200 px-6 py-28 dark:border-neutral-800">
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-neutral-500">
            Built for Product Architects
          </p>
          <blockquote className="mt-8 text-2xl font-medium leading-relaxed md:text-3xl">
            &ldquo;Ultra-luxury events fail in the margins. EDIT-OS exists to eliminate them.&rdquo;
          </blockquote>
          <p className="mt-6 text-sm text-neutral-500">
            Designed for teams orchestrating complexity at Como, Milan, and Paris.
          </p>
        </div>
      </section>

      <footer className="border-t border-neutral-200 px-6 py-10 dark:border-neutral-800">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 text-sm text-neutral-500 md:flex-row md:items-center">
          <p className="font-semibold text-neutral-900 dark:text-neutral-100">EDIT-OS</p>
          <p>Como · Milan · Paris</p>
          <a href="mailto:contact@edit-os.com" className="inline-flex items-center gap-1 hover:text-neutral-900 dark:hover:text-neutral-100">
            Contact
            <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </footer>
    </div>
  );
}
