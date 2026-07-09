import type { Event, OrchestrationPolicy, Vendor, VendorCategory } from '@edit-os/core';
import { Loader2, RefreshCw, Shield } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ActionHistoryPanel } from '@/components/orchestration/ActionHistoryPanel';
import { EventTimeline } from '@/components/orchestration/EventTimeline';
import { RiskMonitor } from '@/components/orchestration/RiskMonitor';
import { WorkflowProposalPanel } from '@/components/orchestration/WorkflowProposalPanel';
import { PageHeader } from '@/components/layout/PageHeader';
import { SectionLabel } from '@/components/layout/SectionLabel';
import { Button } from '@/components/ui/button';
import {
  approveProposal,
  evaluateEvent,
  fetchEvent,
  fetchEventPolicies,
  rejectProposal,
} from '@/lib/api';
import { cn } from '@/lib/utils';

const DEMO_EVENT_ID = 'event-1';

const categoryColors: Record<VendorCategory, string> = {
  venue: 'bg-neutral-600',
  catering: 'bg-neutral-800',
  floristry: 'bg-neutral-500',
  entertainment: 'bg-neutral-700',
  transport: 'bg-neutral-400',
  accommodation: 'bg-neutral-500',
  other: 'bg-neutral-400',
};

function VendorRow({ vendor }: { vendor: Vendor }): React.JSX.Element {
  return (
    <div className="grid grid-cols-[12px_1fr] items-center gap-4 border-b border-neutral-200 py-4 last:border-b-0 dark:border-neutral-800">
      <span className={cn('h-2 w-2', categoryColors[vendor.category])} />
      <div>
        <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{vendor.name}</p>
        <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-neutral-500">{vendor.category}</p>
      </div>
    </div>
  );
}

function PolicySummary({ policy }: { policy: OrchestrationPolicy }): React.JSX.Element {
  const enabledRules = policy.autoApproveRules.filter((rule) => rule.enabled);

  return (
    <div className="border border-neutral-200 dark:border-neutral-800">
      <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-neutral-500" />
          <SectionLabel>Auto-approve policy</SectionLabel>
        </div>
        <p className="mt-2 text-[12px] text-neutral-500">
          Crisis compuesta activa cuando lluvia &gt; {policy.thresholds.weather.rainProbability}% y tráfico &gt;{' '}
          {policy.thresholds.traffic.delayMinutes} min.
        </p>
      </div>
      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {enabledRules.map((rule) => (
          <li key={rule.id} className="grid grid-cols-[1fr_auto] gap-4 px-5 py-4 text-[12px]">
            <span className="text-neutral-700 dark:text-neutral-300">{rule.label}</span>
            <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-neutral-500">
              {rule.trigger}
              {rule.minValue > 0 ? ` ≥ ${rule.minValue}` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OrchestrationView(): React.JSX.Element {
  const [event, setEvent] = useState<Event | null>(null);
  const [policy, setPolicy] = useState<OrchestrationPolicy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isProposalProcessing, setIsProposalProcessing] = useState(false);

  const loadEvent = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [nextEvent, policyResponse] = await Promise.all([
        fetchEvent(DEMO_EVENT_ID),
        fetchEventPolicies(DEMO_EVENT_ID),
      ]);
      setEvent(nextEvent);
      setPolicy(policyResponse.policy);
    } catch {
      setEvent(null);
      setPolicy(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvent();
  }, [loadEvent]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] dark:bg-neutral-950">
        <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] text-neutral-500 dark:bg-neutral-950">
        Event not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-neutral-950">
      <PageHeader
        eyebrow={`${event.location} · Plan ${event.activePlan}`}
        title={event.name}
        description="Domino orchestration · policy-driven auto-approve for crisis scenarios"
        actions={
          <Button
            variant="outline"
            size="sm"
            disabled={isEvaluating}
            onClick={() => {
              setIsEvaluating(true);
              void evaluateEvent(DEMO_EVENT_ID)
                .then(async (nextEvent) => {
                  setEvent(nextEvent);
                  const policyResponse = await fetchEventPolicies(DEMO_EVENT_ID);
                  setPolicy(policyResponse.policy);
                })
                .finally(() => setIsEvaluating(false));
            }}
          >
            {isEvaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Re-evaluate
          </Button>
        }
      />

      <main className="space-y-16 px-10 py-12">
        {policy ? (
          <section>
            <SectionLabel>Policy engine</SectionLabel>
            <div className="mt-6">
              <PolicySummary policy={policy} />
            </div>
          </section>
        ) : null}

        <section>
          <SectionLabel>Pending proposals</SectionLabel>
          <div className="mt-6">
            <WorkflowProposalPanel
              proposals={event.pendingProposals}
              contingencyPlans={event.contingencyPlans}
              activePlan={event.activePlan}
              isProcessing={isProposalProcessing}
              onApprove={(id) => {
                setIsProposalProcessing(true);
                void approveProposal(DEMO_EVENT_ID, id)
                  .then(setEvent)
                  .finally(() => setIsProposalProcessing(false));
              }}
              onReject={(id) => {
                setIsProposalProcessing(true);
                void rejectProposal(DEMO_EVENT_ID, id)
                  .then(setEvent)
                  .finally(() => setIsProposalProcessing(false));
              }}
            />
          </div>
        </section>

        <section>
          <SectionLabel>Action audit trail</SectionLabel>
          <div className="mt-6">
            <ActionHistoryPanel records={event.actionHistory} />
          </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr] lg:divide-x lg:divide-neutral-200 dark:lg:divide-neutral-800">
          <div className="lg:pr-12">
            <SectionLabel>Operational timeline</SectionLabel>
            <div className="mt-6">
              <EventTimeline
                timeline={event.timeline}
                activePlan={event.activePlan}
                contingencyPlans={event.contingencyPlans}
              />
            </div>
          </div>
          <div className="lg:pl-12">
            <SectionLabel>Vendor network</SectionLabel>
            <div className="mt-6">
              {event.vendors.length === 0 ? (
                <p className="text-[13px] text-neutral-500">No vendors assigned.</p>
              ) : (
                event.vendors.map((vendor) => <VendorRow key={vendor.id as string} vendor={vendor} />)
              )}
            </div>
          </div>
        </section>

        <section>
          <SectionLabel>Risk variables</SectionLabel>
          <div className="mt-6">
            <RiskMonitor signals={event.riskProfile.signals} />
          </div>
        </section>
      </main>
    </div>
  );
}
