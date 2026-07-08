import type { TimelineBlock, TimelineBlockId } from '@edit-os/core';
import { describe, expect, it } from 'vitest';
import {
  applyShiftActions,
  cascadeShift,
  collectTransitiveDependents,
  findBlocksByTarget,
  parseDelayMinutes,
  shiftBlock,
  timeToMinutes,
} from './timeline-engine.js';

function blockId(id: string): TimelineBlockId {
  return id as TimelineBlockId;
}

const chain: TimelineBlock[] = [
  {
    id: blockId('setup'),
    label: 'Montaje catering',
    startsAt: '16:00',
    endsAt: '17:30',
    vendorCategory: 'catering',
    status: 'scheduled',
    planVariant: 'A',
  },
  {
    id: blockId('cocktail'),
    label: 'Cóctel — Terraza lago',
    startsAt: '18:00',
    endsAt: '19:30',
    vendorCategory: 'catering',
    dependsOn: [blockId('setup')],
    status: 'scheduled',
    planVariant: 'A',
  },
  {
    id: blockId('dj'),
    label: 'DJ — Ambient set',
    startsAt: '19:00',
    endsAt: '23:00',
    vendorCategory: 'entertainment',
    dependsOn: [blockId('cocktail')],
    status: 'scheduled',
    planVariant: 'A',
  },
];

describe('timeline-engine', () => {
  it('collects transitive dependents from anchor blocks', () => {
    const shifted = collectTransitiveDependents(chain, [blockId('cocktail')]);

    expect([...shifted]).toEqual(['cocktail', 'dj']);
  });

  it('cascade-shifts anchor and dependent blocks', () => {
    const result = cascadeShift(chain, [blockId('cocktail')], 30);

    expect(result.find((b) => b.id === blockId('setup'))?.startsAt).toBe('16:00');
    expect(result.find((b) => b.id === blockId('cocktail'))?.startsAt).toBe('18:30');
    expect(result.find((b) => b.id === blockId('dj'))?.startsAt).toBe('19:30');
  });

  it('finds blocks by label or category target', () => {
    expect(findBlocksByTarget(chain, 'cóctel')).toEqual([blockId('cocktail')]);
    expect(findBlocksByTarget(chain, 'catering')).toHaveLength(2);
  });

  it('parses delay minutes from action detail', () => {
    expect(parseDelayMinutes('Retrasar inicio del cóctel +30 min')).toBe(30);
    expect(parseDelayMinutes('Adelantar montaje -45 min')).toBe(-45);
  });

  it('applies shift_timeline actions in sequence', () => {
    const timeline = applyShiftActions(chain, [
      {
        type: 'shift_timeline',
        target: 'cóctel',
        detail: 'Retrasar inicio del cóctel +30 min.',
      },
    ]);

    expect(timeToMinutes(timeline.find((b) => b.id === blockId('cocktail'))!.startsAt)).toBe(
      timeToMinutes('18:30'),
    );
    expect(timeToMinutes(timeline.find((b) => b.id === blockId('dj'))!.startsAt)).toBe(
      timeToMinutes('19:30'),
    );
  });

  it('marks shifted blocks as delayed unless completed', () => {
    const shifted = shiftBlock(chain[1]!, 30);
    expect(shifted.status).toBe('delayed');
  });
});
