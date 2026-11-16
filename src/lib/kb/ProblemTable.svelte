<script lang="ts">
  // The problems in a merged ticket, counted with the desk's own view (causes.ts, as exported):
  // each report counted where it is filed; the ones the desk read differently (desk-notes.json)
  // get a row of their own, footnoted to where they are filed.
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import { groupByCause, readAs, uniqueById, type Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';

  type Ticket = { url: string; state: string; what: string };
  // tickets: row key (a cause, or 'one-day') → its ticket.
  let { ticket, tickets = {} }: { ticket: number; tickets?: Record<string, Ticket> } = $props();

  const merged = $derived(uniqueById(reports as Report[]).filter((r) => r.mergedInto === ticket));
  const groups = $derived(groupByCause(merged, tenantOf));
  const rows = $derived([
    ...groups.map((g) => ({ key: g.cause as string, n: g.reports.length, tenants: g.tenants, seen: `${g.firstSeen} → ${g.lastSeen}`, note: '' })),
    ...groups.flatMap((g) => {
      const moved = g.reports.filter((r) => notes.oneDayMove.includes(r.id));
      if (!readAs(g, notes.oneDayMove)) return [];
      const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
      return [{ key: 'one-day', n: moved.length, tenants: new Set(moved.map((r) => r.tenant)).size, seen: `${days[0]} → ${days[days.length - 1]}`, note: `also counted in ${g.cause}, where the desk files them by tenant` }];
    }),
  ]);
  const label = (u: string) => '#' + u.split('/').pop();
</script>

<p class="sum">
  <strong>{merged.length}</strong> reports in #{ticket} · <strong>{rows.length}</strong> problems ·
  {(reports as Report[]).length - uniqueById(reports as Report[]).length} repeated rows in the export not counted
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each rows as r (r.key)}
      {@const t = tickets[r.key]}
      <tr class:open={t?.state === 'open'}>
        <td><code>{r.key}</code>{#if t}<br /><span class="what">{t.what}</span>{/if}{#if r.note}<br /><span class="what">{r.note}</span>{/if}</td>
        <td>{r.n}</td>
        <td>{r.tenants}</td>
        <td>{r.seen}</td>
        <td>{#if t}<a href={t.url}>{label(t.url)}</a> <span class="state">{t.state}</span>{:else}<span class="none">none</span>{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
  .what { color: var(--muted); font-size: 0.85em; }
  .state { font-size: 0.8em; border: 1px solid var(--line); border-radius: 99px; padding: 0 0.4rem; }
  .none { color: var(--warn); font-weight: 600; }
  .open td { background: var(--warn-bg); }
</style>
