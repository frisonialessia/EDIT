import type { Event, EventStatus, Vendor, VendorCategory } from '@edit-os/core';
import { Loader2, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EventTimeline } from '@/components/orchestration/EventTimeline';
import { RiskMonitor } from '@/components/orchestration/RiskMonitor';
import { WorkflowProposalPanel } from '@/components/orchestration/WorkflowProposalPanel';
import { Button } from '@/components/ui/button';
import {
  ApiError,
  approveProposal,
  evaluateEvent,
  fetchEvent,
  rejectProposal,
} from '@/lib/api';
import { getAvatarGradient, getInitials } from '@/lib/avatar';
import { cn } from '@/lib/utils';

const DEMO_EVENT_ID = 'event-1';

const categoryColors: Record<VendorCategory, string> = {
  venue: 'bg-violet-500',
  catering: 'bg-amber-500',
  floristry: 'bg-pink-500',
  entertainment: 'bg-purple-500',
  transport: 'bg-sky-500',
  accommodation: 'bg-teal-500',
  other: 'bg-neutral-400',
};

function VendorRow({ vendor }: { vendor: Vendor }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-neutral-200/70 py-4 last:border-b-0 dark:border-neutral-800/70">
      <div className="flex min-w-0 items-center gap-3">
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-semibold text-white',
            getAvatarGradient(vendor.id as string),
          )}
        >
          {getInitials(vendor.name)}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full', categoryColors[vendor.category])} />
            <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{vendor.name}</p>
          </div>
          <p className="text-[12px] capitalize text-neutral-500">{vendor.category}</p>
        </div>
      </div>
    </div>
  );
}

export function OrchestrationView(): React.JSX.Element {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isProposalProcessing, setIsProposalProcessing] = useState(false);

  const loadEvent = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      setEvent(await fetchEvent(DEMO_EVENT_ID));
    } catch {
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  async function handleEvaluate(): Promise<void> {
    setIsEvaluating(true);
    try {
      setEvent(await evaluateEvent(DEMO_EVENT_ID));
    } finally {
      setIsEvaluating(false);
    }
  }

  async function handleApprove(proposalId: string): Promise<void> {
    setIsProposalProcessing(true);
    try {
      setEvent(await approveProposal(DEMO_EVENT_ID, proposalId));
    } finally {
      setIsProposalProcessing(false);
    }
  }

  async function handleReject(proposalId: string): Promise<void> {
    setIsProposalProcessing(true);
    try {
      setEvent(await rejectProposal(DEMO_EVENT_ID, proposalId));
    } finally {
      setIsProposalProcessing(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5] dark:bg-neutral-950">
        <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5] text-neutral-500 dark:bg-neutral-950">
        Event not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F4F5] dark:bg-neutral-950">
      <header className="flex items-start justify-between gap-6 border-b border-neutral-200/70 bg-white/80 px-10 py-8 backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/80">
        <div>
          <h1 className="text-[28px] font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
            {event.name}
          </h1>
          <p className="mt-2 text-[13px] text-neutral-500">
            Orchestration · {event.location} · Plan {event.activePlan}
          </p>
        </div>
        <Button variant="outline" disabled={isEvaluating} onClick={() => void handleEvaluate()} className="shadow-none">
          {isEvaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Re-evaluar sensores
        </Button>
      </header>

      <main className="space-y-12 px-10 py-10">
        <section>
          <p className="enterprise-section-label mb-5">Propuestas pendientes</p>
          <WorkflowProposalPanel
            proposals={event.pendingProposals}
            contingencyPlans={event.contingencyPlans}
            activePlan={event.activePlan}
            isProcessing={isProposalProcessing}
            onApprove={(id) => void handleApprove(id)}
            onReject={(id) => void handleReject(id)}
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-neutral-200/70 bg-white p-6 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
            <p className="enterprise-section-label mb-5">Timeline operativa</p>
            <EventTimeline
              timeline={event.timeline}
              activePlan={event.activePlan}
              contingencyPlans={event.contingencyPlans}
            />
          </div>
          <div>
            <p className="enterprise-section-label mb-5">Vendors</p>
            <div className="rounded-2xl border border-neutral-200/70 bg-white px-5 shadow-sm dark:border-neutral-800/70 dark:bg-neutral-950">
              {event.vendors.length === 0 ? (
                <p className="py-6 text-[13px] text-neutral-500">No vendors assigned.</p>
              ) : (
                event.vendors.map((vendor) => <VendorRow key={vendor.id as string} vendor={vendor} />)
              )}
            </div>
          </div>
        </section>

        <section>
          <p className="enterprise-section-label mb-5">Variables de riesgo</p>
          <RiskMonitor signals={event.riskProfile.signals} />
        </section>
      </main>
    </div>
  );
}
