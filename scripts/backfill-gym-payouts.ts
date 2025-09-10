#!/usr/bin/env -S tsx --require dotenv/config
/**
 * Backfill gym payout fields via storage layer.
 * - Fills missing membership and duration snapshots
 * - Computes rate and owed for rows with owed null
 *
 * Usage:
 *   tsx scripts/backfill-gym-payouts.ts --periodStart=YYYY-MM-DD --periodEnd=YYYY-MM-DD
 *   tsx scripts/backfill-gym-payouts.ts --allSince=YYYY-MM-01   # iterates months to today
 */
import { storage } from '../server/storage';

function getArg(name: string): string | undefined {
  const entry = process.argv.find(a => a.startsWith(`--${name}=`));
  return entry ? entry.split('=')[1] : undefined;
}

function* monthRanges(start: Date, end: Date): Generator<{ start: string; end: string }> {
  const s = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const e = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));
  while (s <= e) {
    const monthStart = new Date(s);
    const next = new Date(Date.UTC(s.getUTCFullYear(), s.getUTCMonth() + 1, 1));
    const monthEnd = new Date(next.getTime() - 24 * 3600 * 1000);
    const toIso = (d: Date) => d.toISOString().slice(0, 10);
    yield { start: toIso(monthStart), end: toIso(monthEnd) };
    s.setUTCMonth(s.getUTCMonth() + 1);
  }
}

async function run() {
  const periodStart = getArg('periodStart');
  const periodEnd = getArg('periodEnd');
  const allSince = getArg('allSince');

  if (periodStart && periodEnd) {
    console.log('Backfilling period', { periodStart, periodEnd });
    const result = await storage.backfillGymPayouts(periodStart, periodEnd);
    console.log(result);
    return;
  }

  if (allSince) {
    const start = new Date(allSince + 'T00:00:00.000Z');
    const now = new Date();
    let total = 0, updated = 0, skipped = 0;
    for (const { start: s, end: e } of monthRanges(start, now)) {
      console.log('Backfilling month', s, 'to', e);
      const r = await storage.backfillGymPayouts(s, e);
      total += r.total; updated += r.updated; skipped += r.skipped;
    }
    console.log({ total, updated, skipped });
    return;
  }

  console.error('Provide --periodStart=YYYY-MM-DD --periodEnd=YYYY-MM-DD or --allSince=YYYY-MM-01');
  process.exit(1);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
