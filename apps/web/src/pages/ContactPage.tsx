import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicNav } from '@/components/layout/PublicNav';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const plans = [
  {
    id: 'studio',
    name: 'Studio',
    price: '€2,400',
    period: '/ month',
    description: 'For independent event architects running up to 4 events per quarter.',
    features: ['Orchestration console', 'Weather & traffic domino', 'Vendor messaging', 'Email support'],
  },
  {
    id: 'estate',
    name: 'Estate',
    price: '€6,800',
    period: '/ month',
    description: 'For luxury houses managing multiple venues and concurrent events.',
    features: [
      'Everything in Studio',
      'Guest flow & consumption sensors',
      'Plan A/B automation',
      'Priority onboarding',
    ],
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For global brands requiring bespoke integrations and dedicated infrastructure.',
    features: ['Dedicated environment', 'Custom sensor integrations', 'SLA & white-glove support', 'Multi-region deploy'],
  },
];

interface ContactPageProps {
  isDark: boolean;
  onToggleTheme: () => void;
}

export function ContactPage({ isDark, onToggleTheme }: ContactPageProps): React.JSX.Element {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <PublicNav isDark={isDark} onToggleTheme={onToggleTheme} />

      <main className="mx-auto max-w-7xl px-6 pt-28">
        <div className="border-b border-neutral-200 pb-12 dark:border-neutral-800">
          <SectionLabel>Plans & acquisition</SectionLabel>
          <h1 className="mt-4 font-serif text-4xl font-normal tracking-tight md:text-5xl">
            Operate events at architectural precision.
          </h1>
          <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-neutral-500">
            Select a plan aligned with your operational scale. Our team configures EDIT-OS for your
            venues, vendors, and orchestration rules within 48 hours.
          </p>
        </div>

        <section className="grid gap-0 border-b border-neutral-200 py-16 md:grid-cols-3 md:divide-x md:divide-neutral-200 dark:border-neutral-800 dark:md:divide-neutral-800">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="flex flex-col md:px-8 md:first:pl-0 md:last:pr-0"
            >
              <SectionLabel>{plan.name}</SectionLabel>
              <p className="mt-4 text-3xl font-medium tabular-nums">
                {plan.price}
                <span className="text-[13px] font-normal text-neutral-500">{plan.period}</span>
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-neutral-500">{plan.description}</p>
              <ul className="mt-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="border-l border-neutral-300 pl-3 text-[12px] text-neutral-600 dark:border-neutral-700 dark:text-neutral-400">
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <a href="#inquiry">
                  <Button variant={plan.highlighted ? 'default' : 'outline'} className="w-full">
                    {plan.id === 'enterprise' ? 'Contact sales' : 'Select plan'}
                  </Button>
                </a>
              </div>
            </article>
          ))}
        </section>

        <section id="inquiry" className="grid gap-16 py-16 lg:grid-cols-[1fr_420px]">
          <div>
            <SectionLabel>Inquiry</SectionLabel>
            <h2 className="mt-3 text-[20px] font-medium">Request access or schedule a briefing</h2>
            <p className="mt-3 max-w-lg text-[13px] leading-relaxed text-neutral-500">
              Complete the form and our team will respond within one business day with onboarding
              details and a tailored deployment scope.
            </p>

            <div className="mt-10 grid gap-8 sm:grid-cols-2">
              <div>
                <SectionLabel>Direct line</SectionLabel>
                <p className="mt-3 text-[13px] text-neutral-700 dark:text-neutral-300">contact@edit-os.com</p>
              </div>
              <div>
                <SectionLabel>Studios</SectionLabel>
                <p className="mt-3 text-[13px] text-neutral-700 dark:text-neutral-300">Como · Milan · Paris</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="border border-neutral-200 p-6 dark:border-neutral-800">
            {submitted ? (
              <div>
                <SectionLabel>Received</SectionLabel>
                <p className="mt-4 text-[13px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                  Your inquiry has been recorded. We will contact you shortly.
                </p>
                <Link to="/dashboard" className="mt-6 inline-block">
                  <Button variant="outline">Open console preview</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" required placeholder="Alessia Rossi" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" required placeholder="you@studio.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plan">Plan interest</Label>
                    <Input id="plan" placeholder="Estate" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <Input id="message" placeholder="Event volume, venues, timeline" />
                  </div>
                </div>
                <div className="mt-6 flex gap-2">
                  <Button type="submit">Submit inquiry</Button>
                  <Link to="/">
                    <Button type="button" variant="ghost">
                      Back
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
