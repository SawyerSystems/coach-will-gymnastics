import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, DollarSign, Filter, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useBackfillPayouts, useGeneratePayoutRun, usePayoutRuns } from '@/hooks/useAdminPayouts';

type MembershipFilter = 'all' | 'member' | 'non-member';

type PayoutSummary = {
	totalSessions: number;
	totalOwedCents: number;
	uniqueAthletes: number;
};

type PayoutListRow = {
	id: number;
	booking_id: number;
	athlete_id: number;
	gym_payout_owed_cents: number | null;
	gym_rate_applied_cents: number | null;
	gym_member_at_booking: boolean;
	created_at: string;
	bookings: { preferred_date: string } | null;
	athletes?: { first_name?: string | null; last_name?: string | null; name?: string | null } | null;
};

function formatCents(cents: number | null | undefined) {
	const n = (cents ?? 0) / 100;
	return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}

function firstDayOfMonthISO(d = new Date()) {
	return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
}

function lastDayOfMonthISO(d = new Date()) {
	return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
}

export default function AdminPayoutsTab() {
	const { toast } = useToast();

	// Filters
	const [start, setStart] = useState<string>(firstDayOfMonthISO());
	const [end, setEnd] = useState<string>(lastDayOfMonthISO());
	const [membership, setMembership] = useState<MembershipFilter>('all');
	const [athleteId, setAthleteId] = useState<string>('');

	// Derived query string
	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		if (start) params.set('start', start);
		if (end) params.set('end', end);
		if (membership !== 'all') params.set('membership', membership);
		if (athleteId) params.set('athleteId', athleteId);
		return params.toString();
	}, [start, end, membership, athleteId]);

	// Summary
	const { data: summary, isLoading: loadingSummary, refetch: refetchSummary } = useQuery<PayoutSummary>({
		queryKey: ['/api/admin/payouts/summary', queryParams],
		queryFn: async () => {
			const res = await apiRequest('GET', `/api/admin/payouts/summary?${queryParams}`);
			if (!res.ok) throw new Error('Failed to fetch payout summary');
			return res.json();
		},
	});

	// List
	const { data: list = [], isLoading: loadingList, refetch: refetchList } = useQuery<PayoutListRow[]>({
		queryKey: ['/api/admin/payouts/list', queryParams],
		queryFn: async () => {
			const res = await apiRequest('GET', `/api/admin/payouts/list?${queryParams}`);
			if (!res.ok) throw new Error('Failed to fetch payout list');
			return res.json();
		},
	});

	const onRefresh = async () => {
		await Promise.all([refetchSummary(), refetchList()]);
		toast({ title: 'Refreshed', description: 'Payout data reloaded.' });
	};

	const onExportCsv = async () => {
		try {
			const url = `/api/admin/payouts/export.csv?${queryParams}`;
			// Use a hidden link to trigger download
			const a = document.createElement('a');
			a.href = url;
			a.download = `payouts-${start}_to_${end}.csv`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		} catch (e: any) {
			toast({ title: 'Export failed', description: e?.message || 'Could not export CSV', variant: 'destructive' });
		}
	};

	// Simple totals by membership for table footer
	const totals = useMemo(() => {
		const all = (list || []).reduce((acc, r) => acc + (r.gym_payout_owed_cents || 0), 0);
		const members = (list || [])
			.filter((r) => r.gym_member_at_booking)
			.reduce((acc, r) => acc + (r.gym_payout_owed_cents || 0), 0);
		const nonMembers = all - members;
		return { all, members, nonMembers };
	}, [list]);

	useEffect(() => {
		// ensure start <= end
		if (start && end && start > end) {
			setEnd(start);
		}
	}, [start, end]);

	return (
		<Card className="rounded-xl sm:rounded-2xl lg:rounded-3xl border-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/30 backdrop-blur-sm shadow-lg sm:shadow-xl hover:shadow-2xl transition-all duration-300 w-full">
			<CardHeader className="pb-3 sm:pb-4 lg:pb-6">
				<CardTitle className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-2 sm:gap-3">
					<DollarSign className="h-8 w-8 text-[#D8BD2A]" />
					Payouts
				</CardTitle>
			</CardHeader>
			<CardContent className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
				{/* Top toolbar */}
				<div className="flex items-center justify-end gap-2">
					<Button className="w-full sm:w-auto" variant="secondary" onClick={onRefresh}>
						<RefreshCw className="h-4 w-4 mr-2" /> Refresh
					</Button>
					<Button className="w-full sm:w-auto" onClick={onExportCsv}>
						<Download className="h-4 w-4 mr-2" /> CSV
					</Button>
				</div>
		{/* Filters */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
					<div className="space-y-1">
						<Label htmlFor="start-date">Start</Label>
						<Input id="start-date" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
					</div>
					<div className="space-y-1">
						<Label htmlFor="end-date">End</Label>
						<Input id="end-date" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
					</div>
					<div className="space-y-1">
						<Label>Membership</Label>
						<Select value={membership} onValueChange={(v: MembershipFilter) => setMembership(v)}>
							<SelectTrigger>
								<SelectValue placeholder="All" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All</SelectItem>
								<SelectItem value="member">Member</SelectItem>
								<SelectItem value="non-member">Non-member</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-1">
						<Label htmlFor="athlete-id">Athlete ID (optional)</Label>
						<Input
							id="athlete-id"
							name="athlete-id"
							// Hint browsers/extensions this is not an OTP or credential field
							autoComplete="off"
							autoCorrect="off"
							autoCapitalize="off"
							spellCheck={false}
							aria-autocomplete="none"
							// Use tel to get numeric keypad without triggering OTP managers
							inputMode="tel"
							pattern="[0-9]*"
							// Common password-manager ignore flags
							data-lpignore="true"
							data-1p-ignore="true"
							data-form-type="other"
							data-gramm="false"
							value={athleteId}
							onChange={(e) => setAthleteId(e.target.value)}
							placeholder="e.g. 123"
						/>
					</div>
				</div>

				{/* KPIs */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<div className="rounded-xl border bg-white p-4">
						<div className="text-sm text-slate-500">Total Sessions</div>
						<div className="text-2xl font-bold">{loadingSummary ? '—' : summary?.totalSessions ?? 0}</div>
					</div>
					<div className="rounded-xl border bg-white p-4">
						<div className="text-sm text-slate-500">Total Owed</div>
						<div className="text-2xl font-bold">{loadingSummary ? '—' : formatCents(summary?.totalOwedCents ?? 0)}</div>
					</div>
					<div className="rounded-xl border bg-white p-4">
						<div className="text-sm text-slate-500">Unique Athletes</div>
						<div className="text-2xl font-bold">{loadingSummary ? '—' : summary?.uniqueAthletes ?? 0}</div>
					</div>
				</div>

			{/* Table */}
				<div className="overflow-x-auto rounded-xl border bg-white">
					<table className="w-full text-sm">
						<thead className="bg-slate-50">
							<tr>
								<th className="text-left px-4 py-2">Date</th>
								<th className="text-left px-4 py-2">Athlete</th>
								<th className="text-left px-4 py-2">Membership</th>
								<th className="text-right px-4 py-2">Owed</th>
								<th className="text-right px-4 py-2">Rate</th>
							</tr>
						</thead>
						<tbody>
							{loadingList ? (
								<tr>
									<td className="px-4 py-4" colSpan={5}>Loading…</td>
								</tr>
							) : list.length === 0 ? (
								<tr>
									<td className="px-4 py-6 text-slate-500" colSpan={5}>No payout rows for the selected filters.</td>
								</tr>
							) : (
								list.map((row) => {
									const athleteName = row.athletes?.name || [row.athletes?.first_name, row.athletes?.last_name].filter(Boolean).join(' ');
									const date = row.bookings?.preferred_date || '';
									return (
										<tr key={row.id} className="border-t">
											<td className="px-4 py-2 whitespace-nowrap">{date}</td>
											<td className="px-4 py-2">{athleteName || `Athlete #${row.athlete_id}`}</td>
											<td className="px-4 py-2">{row.gym_member_at_booking ? 'Member' : 'Non-member'}</td>
											<td className="px-4 py-2 text-right">{formatCents(row.gym_payout_owed_cents)}</td>
											<td className="px-4 py-2 text-right text-slate-500">{formatCents(row.gym_rate_applied_cents)}</td>
										</tr>
									);
								})
							)}
						</tbody>
						<tfoot className="bg-slate-50">
							<tr className="border-t">
								<td className="px-4 py-2" colSpan={3}>Totals (visible)</td>
								<td className="px-4 py-2 text-right font-semibold">{formatCents(totals.all)}</td>
								<td className="px-4 py-2 text-right text-slate-500">
									<span className="mr-2">Members: {formatCents(totals.members)}</span>
									<span>Non-members: {formatCents(totals.nonMembers)}</span>
								</td>
							</tr>
						</tfoot>
					</table>
				</div>

						{/* Payout runs */}
						<PayoutRunsPanel start={start} end={end} onDataChanged={onRefresh} />
			</CardContent>
		</Card>
	);
}

		function PayoutRunsPanel({ start, end, onDataChanged }: { start: string; end: string; onDataChanged?: () => Promise<void> | void }) {
			const { data: runs = [], refetch } = usePayoutRuns(6);
			const gen = useGeneratePayoutRun();
			const backfill = useBackfillPayouts();
			const { toast } = useToast();

			const onGenerate = async () => {
				try {
					await gen.mutateAsync({ periodStart: start, periodEnd: end });
					await refetch();
					await onDataChanged?.();
					toast({ title: 'Payout run updated', description: `${start} → ${end}` });
				} catch (e: any) {
					toast({ title: 'Failed to generate payout run', description: e?.message || 'Unknown error', variant: 'destructive' });
				}
			};

			return (
				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<div className="font-semibold text-slate-700 flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Recent payout runs</div>
						<div className="flex gap-2">
							<Button onClick={onGenerate} disabled={gen.isPending}>
								{gen.isPending ? 'Updating…' : 'Generate/Refresh current period'}
							</Button>
							<Button variant="secondary" onClick={async () => {
								try {
									const result = await backfill.mutateAsync({ periodStart: start, periodEnd: end });
									await refetch();
									await onDataChanged?.();
									toast({ title: 'Backfill complete', description: `Updated ${result.updated} / ${result.total} rows` });
								} catch (e: any) {
									toast({ title: 'Backfill failed', description: e?.message || 'Unknown error', variant: 'destructive' });
								}
							}} disabled={backfill.isPending}>
								{backfill.isPending ? 'Backfilling…' : 'Backfill current period'}
							</Button>
						</div>
					</div>
					<div className="overflow-x-auto rounded-xl border bg-white">
						<table className="w-full text-sm">
							<thead className="bg-slate-50">
								<tr>
									<th className="text-left px-4 py-2">Period</th>
									<th className="text-left px-4 py-2">Status</th>
									<th className="text-right px-4 py-2">Sessions</th>
									<th className="text-right px-4 py-2">Total Owed</th>
									<th className="text-left px-4 py-2">Updated</th>
								</tr>
							</thead>
							<tbody>
								{runs.length === 0 ? (
									<tr>
										<td className="px-4 py-6 text-slate-500" colSpan={5}>No runs yet. Generate one for the current period.</td>
									</tr>
								) : (
									runs.map((r) => (
										<tr key={r.id} className="border-t">
											<td className="px-4 py-2">{r.period_start} → {r.period_end}</td>
											<td className="px-4 py-2 capitalize">{r.status}</td>
											<td className="px-4 py-2 text-right">{r.total_sessions}</td>
											<td className="px-4 py-2 text-right">{formatCents(r.total_owed_cents)}</td>
											<td className="px-4 py-2">{new Date(r.updated_at).toLocaleString()}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			);
		}

