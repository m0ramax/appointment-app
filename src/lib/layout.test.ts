import { describe, it, expect } from 'vitest';
import { layoutAppointments, type LayoutItem } from './layout';

describe('layoutAppointments', () => {
  it('returns empty maps for an empty array', () => {
    const { colOf, totalOf } = layoutAppointments([]);
    expect(colOf.size).toBe(0);
    expect(totalOf.size).toBe(0);
  });

  it('single appointment gets col=0 and total=1', () => {
    const appts: LayoutItem[] = [
      { id: 1, dateTime: '2026-04-18T09:00:00.000Z', durationMinutes: 30 },
    ];
    const { colOf, totalOf } = layoutAppointments(appts);
    expect(colOf.get(1)).toBe(0);
    expect(totalOf.get(1)).toBe(1);
  });

  it('two non-overlapping appointments each get col=0 and total=1', () => {
    const appts: LayoutItem[] = [
      { id: 1, dateTime: '2026-04-18T09:00:00.000Z', durationMinutes: 30 },
      { id: 2, dateTime: '2026-04-18T10:00:00.000Z', durationMinutes: 30 },
    ];
    const { colOf, totalOf } = layoutAppointments(appts);
    expect(colOf.get(1)).toBe(0);
    expect(colOf.get(2)).toBe(0);
    expect(totalOf.get(1)).toBe(1);
    expect(totalOf.get(2)).toBe(1);
  });

  it('two overlapping appointments (same start time) get col=0 and col=1, both total=2', () => {
    const appts: LayoutItem[] = [
      { id: 1, dateTime: '2026-04-18T09:00:00.000Z', durationMinutes: 60 },
      { id: 2, dateTime: '2026-04-18T09:00:00.000Z', durationMinutes: 60 },
    ];
    const { colOf, totalOf } = layoutAppointments(appts);
    const cols = [colOf.get(1)!, colOf.get(2)!].sort();
    expect(cols).toEqual([0, 1]);
    expect(totalOf.get(1)).toBe(2);
    expect(totalOf.get(2)).toBe(2);
  });

  it('three appointments: two overlap at 09:00, one at 11:00 gets col=0 and total=1', () => {
    const appts: LayoutItem[] = [
      { id: 1, dateTime: '2026-04-18T09:00:00.000Z', durationMinutes: 60 },
      { id: 2, dateTime: '2026-04-18T09:00:00.000Z', durationMinutes: 60 },
      { id: 3, dateTime: '2026-04-18T11:00:00.000Z', durationMinutes: 30 },
    ];
    const { colOf, totalOf } = layoutAppointments(appts);
    // The two overlapping ones get cols 0 and 1, total 2 each
    const overlappingCols = [colOf.get(1)!, colOf.get(2)!].sort();
    expect(overlappingCols).toEqual([0, 1]);
    expect(totalOf.get(1)).toBe(2);
    expect(totalOf.get(2)).toBe(2);
    // The 11:00 appointment does not overlap with anything, reuses col=0, total=1
    expect(colOf.get(3)).toBe(0);
    expect(totalOf.get(3)).toBe(1);
  });
});
