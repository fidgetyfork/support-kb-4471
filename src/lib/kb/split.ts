// Splits a merged ticket into one group per problem. causes.ts files a report by its tenant and
// channel; a report whose date moved by one day (desk-notes.json) is a different problem from a
// month/day swap, whatever its tenant, so it gets its own group here.
import { groupByCause, uniqueById, type CauseGroup, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  const rest = merged.filter((r) => !oneDayMove.includes(r.id));
  const groups: ProblemGroup[] = groupByCause(rest, tenantOf).map(({ cause, ...g }) => ({ problem: cause, ...g }));
  if (moved.length) {
    const [g] = groupByCause(moved, () => undefined); // one group: 'unplaced'
    const { cause: _, ...stats } = g;
    groups.push({ problem: 'one-day', ...stats });
  }
  return { merged, groups: groups.sort((a, b) => b.reports.length - a.reports.length) };
}
