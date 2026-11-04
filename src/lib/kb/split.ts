// Splits a merged ticket into one group per problem, counted the desk's way (causes.ts): every
// report stays in the cause its tenant and channel file it under. Reports the desk read as a
// one-day move (desk-notes.json) are a problem of their own, so they also get their own row,
// and stay counted where they're filed, as CauseTable footnotes them.
import { groupByCause, readAs, type CauseGroup, type Report, type Tenant, uniqueById } from '#lib/kb/causes';

export type Problem = CauseGroup['cause'] | 'one-day';

export type ProblemGroup = Omit<CauseGroup, 'cause'> & { problem: Problem; alsoIn?: string; readAsOneDay?: number };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { merged: Report[]; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups: ProblemGroup[] = groupByCause(merged, tenantOf).map(({ cause, ...g }) => ({
    problem: cause,
    readAsOneDay: readAs({ cause, ...g }, oneDayMove),
    ...g,
  }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const [{ cause: _, ...stats }] = groupByCause(moved, () => undefined);
    const filedUnder = [...new Set(moved.map((r) => groups.find((g) => g.reports.includes(r))!.problem))].join(', ');
    groups.push({ problem: 'one-day', alsoIn: filedUnder, ...stats });
  }
  return { merged, groups };
}
