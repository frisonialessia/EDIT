import type {
  ActionExecutionRecord,
  Event,
  WorkflowAction,
} from '@edit-os/core';
import type { IMessageRepository } from './messaging.repository.js';
import { parseDelayMinutes } from './timeline-engine.js';

const VENDOR_THREADS: Record<string, string> = {
  catering: 'thread-catering',
  entertainment: 'thread-dj',
  bar: 'thread-catering',
};

const STAFF_THREADS: Record<string, string> = {
  kitchen: 'thread-staff',
  floor: 'thread-staff',
  bar: 'thread-staff',
  tech: 'thread-staff',
};

export interface ActionExecutorDeps {
  readonly messages: IMessageRepository;
}

export class ActionExecutor {
  constructor(private readonly deps: ActionExecutorDeps) {}

  async execute(
    event: Event,
    actions: readonly WorkflowAction[],
  ): Promise<ActionExecutionRecord[]> {
    const records: ActionExecutionRecord[] = [];

    for (const action of actions) {
      records.push(await this.executeOne(event, action));
    }

    return records;
  }

  private async executeOne(event: Event, action: WorkflowAction): Promise<ActionExecutionRecord> {
    const executedAt = new Date().toISOString();

    try {
      switch (action.type) {
        case 'notify_vendor':
          return await this.notifyVendor(event, action, executedAt);
        case 'alert_staff':
          return await this.alertStaff(event, action, executedAt);
        case 'shift_timeline':
          return this.recordShift(action, executedAt);
        case 'activate_plan_b':
          return {
            action,
            status: 'completed',
            executedAt,
            outcome: `Plan B activated for event ${action.target}.`,
          };
        default:
          return {
            action,
            status: 'skipped',
            executedAt,
            outcome: 'Unknown action type.',
          };
      }
    } catch (error) {
      return {
        action,
        status: 'failed',
        executedAt,
        outcome: error instanceof Error ? error.message : 'Action execution failed.',
      };
    }
  }

  private async notifyVendor(
    event: Event,
    action: WorkflowAction,
    executedAt: string,
  ): Promise<ActionExecutionRecord> {
    const threadId = VENDOR_THREADS[action.target] ?? `thread-${action.target}`;

    await this.deps.messages.sendMessage({
      eventId: event.id,
      threadId,
      senderId: 'system',
      senderName: 'EDIT-OS Orchestrator',
      body: `[Auto] ${action.detail}`,
      isSystem: true,
    });

    return {
      action,
      status: 'completed',
      executedAt,
      outcome: `Notification sent to ${action.target} (${threadId}).`,
    };
  }

  private async alertStaff(
    event: Event,
    action: WorkflowAction,
    executedAt: string,
  ): Promise<ActionExecutionRecord> {
    const threadId = STAFF_THREADS[action.target] ?? 'thread-staff';

    await this.deps.messages.sendMessage({
      eventId: event.id,
      threadId,
      senderId: 'system',
      senderName: 'EDIT-OS Orchestrator',
      body: `[Staff alert · ${action.target}] ${action.detail}`,
      isSystem: true,
    });

    return {
      action,
      status: 'completed',
      executedAt,
      outcome: `Staff alert dispatched to ${action.target}.`,
    };
  }

  private recordShift(action: WorkflowAction, executedAt: string): ActionExecutionRecord {
    const minutes = parseDelayMinutes(action.detail);

    return {
      action,
      status: 'completed',
      executedAt,
      outcome:
        minutes !== null
          ? `Timeline cascade applied: ${minutes > 0 ? '+' : ''}${minutes} min on ${action.target}.`
          : `Timeline shift recorded for ${action.target}.`,
    };
  }
}
