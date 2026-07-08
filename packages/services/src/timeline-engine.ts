import type { TimelineBlock, TimelineBlockId } from '@edit-os/core';

export function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (mins ?? 0);
}

export function minutesToTime(totalMinutes: number): string {
  const normalized = ((totalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function shiftBlock(block: TimelineBlock, delayMinutes: number): TimelineBlock {
  return {
    ...block,
    startsAt: minutesToTime(timeToMinutes(block.startsAt) + delayMinutes),
    endsAt: minutesToTime(timeToMinutes(block.endsAt) + delayMinutes),
    status: block.status === 'completed' ? 'completed' : 'delayed',
  };
}

export function collectTransitiveDependents(
  blocks: readonly TimelineBlock[],
  anchorIds: readonly TimelineBlockId[],
): Set<TimelineBlockId> {
  const shifted = new Set<TimelineBlockId>(anchorIds);
  let added = true;

  while (added) {
    added = false;
    for (const block of blocks) {
      if (shifted.has(block.id)) {
        continue;
      }

      if (block.dependsOn?.some((dep) => shifted.has(dep))) {
        shifted.add(block.id);
        added = true;
      }
    }
  }

  return shifted;
}

export function findBlocksByTarget(
  blocks: readonly TimelineBlock[],
  target: string,
): TimelineBlockId[] {
  const normalized = target.toLowerCase();

  return blocks
    .filter((block) => {
      const labelMatch = block.label.toLowerCase().includes(normalized);
      const categoryMatch = block.vendorCategory?.toLowerCase() === normalized;
      return labelMatch || categoryMatch;
    })
    .map((block) => block.id);
}

export function cascadeShift(
  blocks: readonly TimelineBlock[],
  anchorIds: readonly TimelineBlockId[],
  delayMinutes: number,
): TimelineBlock[] {
  if (anchorIds.length === 0 || delayMinutes === 0) {
    return [...blocks];
  }

  const toShift = collectTransitiveDependents(blocks, anchorIds);

  return blocks.map((block) => (toShift.has(block.id) ? shiftBlock(block, delayMinutes) : block));
}

export function parseDelayMinutes(detail: string): number | null {
  const match = detail.match(/([+-]?\d+)\s*min/i);
  if (!match?.[1]) {
    return null;
  }

  return Number.parseInt(match[1], 10);
}

export function applyShiftActions(
  blocks: readonly TimelineBlock[],
  actions: readonly { type: string; target: string; detail: string }[],
): TimelineBlock[] {
  let timeline = [...blocks];

  for (const action of actions) {
    if (action.type !== 'shift_timeline') {
      continue;
    }

    const delayMinutes = parseDelayMinutes(action.detail);
    if (delayMinutes === null) {
      continue;
    }

    const anchorIds = findBlocksByTarget(timeline, action.target);
    timeline = cascadeShift(timeline, anchorIds, delayMinutes);
  }

  return timeline;
}
