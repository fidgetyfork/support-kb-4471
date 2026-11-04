<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { splitTicket, type Problem } from '#lib/kb/split';

  // issues: problem → link to the ticket filed for it.
  let { ticket, issues = {} }: { ticket: number; issues?: Partial<Record<Problem, string>> } = $props();

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const raw = (reports as Report[]).filter((r) => r.mergedInto === ticket).length;
  const label: Record<Problem, string> = {
    parser: 'parser reads day-first dates month first',
    hint: 'booking-v3 form hint says MM/DD, form reads DD/MM',
    'one-day': 'date moves by one day',
    unplaced: 'no tenant on file',
  };
</script>

<p class="sum">
  <strong>{split.merged.length}</strong> reports merged into #{ticket} ({raw} rows in the export, {raw - split.merged.length} of them repeats) ·
  <strong>{split.groups.length}</strong> problems
</p>
<p class="how">Counted the desk's way: each report stays where its tenant and channel file it. The one-day reports are also listed on their own row.</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> · {label[g.problem]}</td>
        <td>{g.reports.length}{#if g.readAsOneDay} <small>({g.readAsOneDay} read as a one-day move)</small>{/if}{#if g.alsoIn} <small>(also counted under <code>{g.alsoIn}</code>)</small>{/if}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if issues[g.problem]}<a href={issues[g.problem]}>{issues[g.problem]?.replace(/^.*\/issues\//, '#')}</a>{:else}none yet{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .how, small { color: var(--muted); font-size: 0.85em; }
</style>
