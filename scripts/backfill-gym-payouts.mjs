#!/usr/bin/env node
/**
 * Backfill gym payout fields on booking_athletes.
 * - Populates gym_member_at_booking if null (from athletes.is_gym_member)
 * - Populates duration_minutes if null (from lesson_types via bookings)
 * - Computes gym_rate_applied_cents based on duration + membership and rate effective on preferred_date
 * - Sets gym_payout_owed_cents (respects override if present)
 * - Sets gym_payout_computed_at when owed is set
 *
 * Env required:
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional args:
 *   --periodStart=YYYY-MM-DD
 *   --periodEnd=YYYY-MM-DD
 *   --dryRun (no writes)
 */

import { createClient } from '@supabase/supabase-js';

function getArg(name, fallback = undefined) {
  const p = process.argv.find(a => a.startsWith(`--${name}=`));
  if (!p) return fallback;
  return p.split('=')[1];
}

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const periodStart = getArg('periodStart', null);
const periodEnd = getArg('periodEnd', null);
const dryRun = process.argv.includes('--dryRun');

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

async function resolveDurationMinutes(lessonTypeId) {
  if (!lessonTypeId) return null;
  const { data, error } = await supabase
    .from('lesson_types')
    .select('duration_minutes')
    .eq('id', lessonTypeId)
    .maybeSingle();
  if (error) return null;
  return data?.duration_minutes ?? null;
}

async function resolveMembershipIfMissing(athleteId) {
  if (!athleteId) return false;
  const { data, error } = await supabase
    .from('athletes')
    .select('is_gym_member')
    .eq('id', athleteId)
    .maybeSingle();
  if (error) return false;
  return !!data?.is_gym_member;
}

async function resolveRateCents(durationMinutes, isMember, effectiveIso) {
  if (durationMinutes == null) return null;
  const { data, error } = await supabase
    .from('gym_payout_rates')
    .select('rate_cents')
    .eq('duration_minutes', durationMinutes)
    .eq('is_member', !!isMember)
    .lte('effective_from', effectiveIso)
    .or('effective_to.is.null,effective_to.gte.' + effectiveIso)
    .order('effective_from', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return data?.rate_cents ?? null;
}

async function main() {
  let query = supabase
    .from('booking_athletes')
    .select('id, athlete_id, gym_member_at_booking, duration_minutes, gym_rate_applied_cents, gym_payout_override_cents, gym_payout_owed_cents, gym_payout_computed_at, bookings!inner(preferred_date, lesson_type_id)')
    .or('duration_minutes.is.null,gym_rate_applied_cents.is.null,gym_payout_owed_cents.is.null,gym_payout_computed_at.is.null');

  if (periodStart) query = query.gte('bookings.preferred_date', periodStart);
  if (periodEnd) query = query.lte('bookings.preferred_date', periodEnd);

  const { data: rows, error } = await query;
  if (error) {
    console.error('Failed to load booking_athletes for backfill:', error);
    process.exit(1);
  }
  const list = rows || [];
  console.log(`Scanning ${list.length} booking_athletes rows for backfill...`);

  let updated = 0, skipped = 0;
  for (const row of list) {
    try {
      const effectiveIso = row.bookings?.preferred_date || new Date().toISOString();
      // membership snapshot
      let isMember = row.gym_member_at_booking;
      if (isMember == null) {
        isMember = await resolveMembershipIfMissing(row.athlete_id);
      }
      // duration
      let duration = row.duration_minutes;
      if (duration == null) {
        duration = await resolveDurationMinutes(row.bookings?.lesson_type_id);
      }
      // rate
      let rateCents = row.gym_rate_applied_cents;
      if (rateCents == null) {
        rateCents = await resolveRateCents(duration, isMember, effectiveIso);
      }
      // owed prefers override
      const owed = row.gym_payout_override_cents ?? row.gym_payout_owed_cents ?? rateCents ?? null;
      const computedAt = owed != null ? (row.gym_payout_computed_at || new Date().toISOString()) : row.gym_payout_computed_at || null;

      const patch = {};
      if (row.gym_member_at_booking == null) patch.gym_member_at_booking = isMember;
      if (row.duration_minutes == null && duration != null) patch.duration_minutes = duration;
      if (row.gym_rate_applied_cents == null && rateCents != null) patch.gym_rate_applied_cents = rateCents;
      if (row.gym_payout_owed_cents == null && owed != null) patch.gym_payout_owed_cents = owed;
      if (row.gym_payout_computed_at == null && computedAt != null) patch.gym_payout_computed_at = computedAt;

      if (Object.keys(patch).length === 0) { skipped++; continue; }

      if (dryRun) {
        console.log('[DRY-RUN] Would update booking_athletes', row.id, patch);
        updated++;
        continue;
      }

      const { error: updErr } = await supabase
        .from('booking_athletes')
        .update(patch)
        .eq('id', row.id);
      if (updErr) {
        console.error('Failed to update booking_athletes', row.id, updErr);
        skipped++;
      } else {
        updated++;
      }
    } catch (e) {
      console.error('Exception processing row', row?.id, e);
      skipped++;
    }
  }

  console.log(JSON.stringify({ total: list.length, updated, skipped }, null, 2));
}

main().catch(e => {
  console.error('Backfill failed:', e);
  process.exit(1);
});
