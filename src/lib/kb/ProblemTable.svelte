<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { uniqueById, type Report } from '#lib/kb/causes';
  import { groupByProblem, PROBLEM_TEXT } from '#lib/kb/problems';
  import { tenantOf } from '#lib/kb/locales';

  // tickets: problem → URL of the ticket that tracks it.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, string> } = $props();

  const all = $derived(uniqueById(reports as Report[]));
  const merged = $derived(all.filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByProblem(reports as Report[], ticket, tenantOf, notes.oneDayMove));
  const rows = (reports as Report[]).length;
  const label = (u: string) => '#' + u.split('/').pop();
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} ·
  <strong>{groups.length}</strong> {groups.length === 1 ? 'problem' : 'problems'} ·
  export has {rows} rows, {rows - all.length} of them repeats
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code><br /><span class="what">{g.problem === 'unplaced' ? 'no tenant on file' : PROBLEM_TEXT[g.problem]}</span></td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if tickets[g.problem]}<a href={tickets[g.problem]}>{label(tickets[g.problem])}</a>{:else}<span class="none">none</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
  <tfoot><tr><td>total</td><td>{groups.reduce((n, g) => n + g.reports.length, 0)}</td><td colspan="3"></td></tr></tfoot>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .none { color: var(--warn); font-weight: 600; }
  tfoot td { font-weight: 600; }
</style>
