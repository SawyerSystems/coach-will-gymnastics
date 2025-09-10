#!/usr/bin/env -S tsx --require dotenv/config
/**
 * Repair gym payouts by clearing and recomputing for a given period.
 * - Resets owed/rate/computed_at for rows in range, respecting locked payout runs
 * - Then backfills to recompute owed from current rates
 *
 * Usage:
 *   tsx --require dotenv/config scripts/repair-gym-payouts.ts --periodStart=YYYY-MM-DD --periodEnd=YYYY-MM-DD
 */
import { storage } from '../server/storage';

function getArg(name: string): string | undefined {
  const entry = process.argv.find(a => a.startsWith(`--${name}=`));
  return entry ? entry.split('=')[1] : undefined;
}

async function run() {
  const periodStart = getArg('periodStart');
  const periodEnd = getArg('periodEnd');
  if (!periodStart || !periodEnd) {
    console.error('Provide --periodStart=YYYY-MM-DD --periodEnd=YYYY-MM-DD');
    process.exit(1);
  }
  console.log('Clearing payouts for', { periodStart, periodEnd });
  const cleared = await storage.clearGymPayouts(periodStart, periodEnd);
  if ((cleared as any).locked) {
    console.error('Payout run is locked for this period. Aborting.');
    process.exit(2);
  }
  console.log('Cleared:', cleared);
  console.log('Recomputing payouts for', { periodStart, periodEnd });
  const backfilled = await storage.backfillGymPayouts(periodStart, periodEnd);
  console.log('Backfilled:', backfilled);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
