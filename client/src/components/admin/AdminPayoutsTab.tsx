import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, DollarSign, Filter, RefreshCw, Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useBackfillPayouts, useDeletePayoutRun, useGeneratePayoutRun, useLockPayoutRun, usePayoutRuns } from '@/hooks/useAdminPayouts';
import { usePayoutRates, useCreatePayoutRate, useRetirePayoutRate } from '@/hooks/usePayoutRates';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

type MembershipFilter = 'all' | 'member' | 'non-member';
type AttendanceFilter = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show' | 'manual';

type PayoutSummary = {
	totalSessions: number;
	totalOwedCents: number;
	uniqueAthletes: number;
};

type PayoutListRow = {
	id: number;
	booking_id: number;
	athlete_id: number;
	duration_minutes?: number | null;
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
	const [state, setState] = useState<AttendanceFilter>('all');
	const [duration, setDuration] = useState<string>('all');

	// Derived query string
	const queryParams = useMemo(() => {
		const params = new URLSearchParams();
		if (start) params.set('start', start);
		if (end) params.set('end', end);
		if (membership !== 'all') params.set('membership', membership);
		if (athleteId) params.set('athleteId', athleteId);
    if (state !== 'all') params.set('state', state);
    if (duration !== 'all') params.set('duration', duration);
		return params.toString();
	}, [start, end, membership, athleteId, state, duration]);

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

	const onExportPdf = async () => {
		try {
			const url = `/api/admin/payouts/export.pdf?${queryParams}`;
			const a = document.createElement('a');
			a.href = url;
			a.download = `payouts-${start}_to_${end}.pdf`;
			document.body.appendChild(a);
			a.click();
			a.remove();
		} catch (e: any) {
			toast({ title: 'Export failed', description: e?.message || 'Could not export PDF', variant: 'destructive' });
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
					<Button className="w-full sm:w-auto" onClick={onExportPdf}>
						<Download className="h-4 w-4 mr-2" /> PDF
					</Button>
						<ManualInvoiceDialog defaultStart={start} defaultEnd={end} />
				</div>
		{/* Filters */}
				<div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
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
						<div className="space-y-1">
							<Label>Attendance</Label>
							<Select value={state} onValueChange={(v: AttendanceFilter) => setState(v)}>
								<SelectTrigger>
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="pending">Pending</SelectItem>
									<SelectItem value="confirmed">Confirmed</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
									<SelectItem value="cancelled">Cancelled</SelectItem>
									<SelectItem value="no-show">No-show</SelectItem>
									<SelectItem value="manual">Manual</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label>Duration</Label>
							<Select value={duration} onValueChange={(v: string) => setDuration(v)}>
								<SelectTrigger>
									<SelectValue placeholder="All" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="30">30 min</SelectItem>
									<SelectItem value="60">60 min</SelectItem>
								</SelectContent>
							</Select>
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
								<th className="text-left px-4 py-2">Duration</th>
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
											<td className="px-4 py-2">{row.duration_minutes ? `${row.duration_minutes} min` : '—'}</td>
											<td className="px-4 py-2 text-right">{formatCents(row.gym_payout_owed_cents)}</td>
											<td className="px-4 py-2 text-right text-slate-500">{formatCents(row.gym_rate_applied_cents)}</td>
										</tr>
									);
								})
							)}
						</tbody>
						<tfoot className="bg-slate-50">
							<tr className="border-t">
								<td className="px-4 py-2" colSpan={4}>Totals (visible)</td>
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
									<PayoutRatesPanel />
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
									<th className="text-right px-4 py-2">Actions</th>
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
											<td className="px-4 py-2 text-right">
		                    <RunActions r={r} onChanged={async () => { await refetch(); await onDataChanged?.(); }} />
		                  </td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</div>
			);
		}

		function RunActions({ r, onChanged }: { r: { id: number; status: string }; onChanged?: () => void | Promise<void> }) {
			const lockRun = useLockPayoutRun();
			const deleteRun = useDeletePayoutRun();
			const { toast } = useToast();
			const isLocked = r.status === 'locked';

			return (
				<div className="flex items-center justify-end gap-2">
					<Button size="sm" variant={isLocked ? 'secondary' : 'default'} disabled={isLocked || lockRun.isPending} onClick={async () => {
						try {
							await lockRun.mutateAsync(r.id);
							await onChanged?.();
							toast({ title: 'Run locked' });
						} catch (e: any) {
							toast({ title: 'Failed to lock', description: e?.message || 'Unknown error', variant: 'destructive' });
						}
					}}>Lock</Button>
					<Button size="sm" variant="destructive" disabled={deleteRun.isPending} onClick={async () => {
						if (!confirm('Delete this payout run? This cannot be undone.')) return;
						try {
							await deleteRun.mutateAsync(r.id);
							await onChanged?.();
							toast({ title: 'Run deleted' });
						} catch (e: any) {
							toast({ title: 'Failed to delete', description: e?.message || 'Unknown error', variant: 'destructive' });
						}
					}}>Delete</Button>
				</div>
			);
		}

// ———————————————————————————————
// Manual Invoice Dialog UI
// ———————————————————————————————

type AdminAthlete = { id: number; name?: string | null; first_name?: string | null; last_name?: string | null };
type InvoiceLine = {
	athleteId?: number;
	athleteName?: string;
	date: string; // YYYY-MM-DD
	durationMinutes?: number;
	member?: boolean;
	rateDollars?: string; // UI only; convert to cents
	amountDollars?: string; // UI only; convert to cents
	description?: string;
	// internal flags
	_userEditedRate?: boolean;
};

function ManualInvoiceDialog({ defaultStart, defaultEnd }: { defaultStart: string; defaultEnd: string }) {
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [invoiceTitle, setInvoiceTitle] = useState<string>('Manual Invoice');
	const [periodStart, setPeriodStart] = useState<string>(defaultStart);
	const [periodEnd, setPeriodEnd] = useState<string>(defaultEnd);
	const [timezone, setTimezone] = useState<string>('America/Los_Angeles');
	const [notes, setNotes] = useState<string>('');

	// Athletes list for selection
	const { data: athletes = [] } = useQuery<AdminAthlete[]>({
		queryKey: ['/api/athletes'],
		queryFn: async () => {
			const res = await apiRequest('GET', '/api/athletes');
			if (!res.ok) throw new Error('Failed to load athletes');
			return res.json();
		},
		enabled: open, // only fetch when dialog opens
		staleTime: 60_000,
	});

	const athleteLabel = (a: AdminAthlete) => a?.name || [a?.first_name, a?.last_name].filter(Boolean).join(' ') || `Athlete #${a?.id}`;

	const todayISO = new Date().toISOString().slice(0, 10);
	const [lines, setLines] = useState<InvoiceLine[]>([{ date: todayISO }]);

	const addLine = () => setLines((ls) => [...ls, { date: todayISO }]);
	const removeLine = (idx: number) => setLines((ls) => ls.filter((_, i) => i !== idx));
	const updateLine = (idx: number, patch: Partial<InvoiceLine>) => setLines((ls) => ls.map((l, i) => (i === idx ? { ...l, ...patch } : l)));

	// Fetch active payout rates to auto-fill rate when duration+member are chosen
	const { data: activeRates = [] } = usePayoutRates('active');
	const rateLookup = useMemo(() => {
		const m = new Map<string, number>();
		for (const r of activeRates) {
			const key = `${r.duration_minutes}:${r.is_member ? '1' : '0'}`;
			m.set(key, r.rate_cents);
		}
		return m;
	}, [activeRates]);
	const getRateDollars = (duration?: number, member?: boolean): string | undefined => {
		if (!duration || typeof member !== 'boolean') return undefined;
		const cents = rateLookup.get(`${duration}:${member ? '1' : '0'}`);
		if (typeof cents === 'number') return (cents / 100).toFixed(2);
		return undefined;
	};

	function getApiBaseUrl() {
		if (import.meta.env.MODE === 'development') return 'http://localhost:5001';
		return '';
	}

	function parseFilenameFromDisposition(header: string | null): string | null {
		if (!header) return null;
		const match = /filename\*=UTF-8''([^;]+)|filename="?([^;"]+)"?/i.exec(header);
		return decodeURIComponent((match?.[1] || match?.[2] || '').trim() || '');
	}

	const onSubmit = async () => {
		try {
			if (!lines.length) {
				toast({ title: 'Add at least one line', variant: 'destructive' });
				return;
			}
			// Map dollars -> cents (integers)
			const lineItems = lines.map((l) => ({
				athleteId: l.athleteId || undefined,
				athleteName: l.athleteName?.trim() ? l.athleteName.trim() : undefined,
				date: l.date,
				durationMinutes: l.durationMinutes || undefined,
				member: typeof l.member === 'boolean' ? l.member : undefined,
				rateCents: l.rateDollars && l.rateDollars.trim() !== '' ? Math.round(parseFloat(l.rateDollars) * 100) : undefined,
				amountCents: l.amountDollars && l.amountDollars.trim() !== '' ? Math.round(parseFloat(l.amountDollars) * 100) : undefined,
				description: l.description?.trim() || undefined,
			}));

			const payload = {
				invoiceTitle: invoiceTitle?.trim() || undefined,
				periodStart: periodStart || undefined,
				periodEnd: periodEnd || undefined,
				timezone: timezone || undefined,
				notes: notes?.trim() || undefined,
				lineItems,
			};

			const res = await fetch(`${getApiBaseUrl()}/api/admin/invoices/manual/export.pdf`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
				credentials: 'include',
			});
			if (!res.ok) {
				let message = `Request failed: ${res.status}`;
				try {
					if (res.headers.get('content-type')?.includes('application/json')) {
						const err = await res.json();
						message = err?.error || err?.message || message;
					} else {
						const txt = await res.text();
						if (txt) message = txt;
					}
				} catch {}
				throw new Error(message);
			}
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			const disp = res.headers.get('Content-Disposition');
			const fileName = parseFilenameFromDisposition(disp) || `manual-invoice-${periodStart || ''}_to_${periodEnd || ''}.pdf`;
			a.href = url;
			a.download = fileName;
			document.body.appendChild(a);
			a.click();
			a.remove();
			URL.revokeObjectURL(url);
			setOpen(false);
			toast({ title: 'Invoice generated', description: 'Downloaded PDF' });
		} catch (e: any) {
			toast({ title: 'Failed to generate invoice', description: e?.message || 'Unknown error', variant: 'destructive' });
		}
	};

		return (
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogTrigger asChild>
					<Button className="w-full sm:w-auto" variant="outline">
						<Plus className="h-4 w-4 mr-2" /> Manual Invoice
					</Button>
				</DialogTrigger>
				<DialogContent className="max-w-4xl p-0 overflow-hidden">
					<div className="border-b px-6 py-4 bg-gradient-to-r from-white to-slate-50/60">
						<DialogHeader className="space-y-1">
							<DialogTitle className="text-lg font-semibold tracking-tight">Create Manual Invoice</DialogTitle>
							<p className="text-xs text-muted-foreground">Generate a branded PDF invoice with custom line items and notes.</p>
						</DialogHeader>
					</div>
					<div className="px-6 py-5 space-y-6 max-h-[70vh] overflow-y-auto">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="space-y-1">
								<Label>Title</Label>
								<Input value={invoiceTitle} onChange={(e) => setInvoiceTitle(e.target.value)} placeholder="Manual Invoice" />
							</div>
							<div className="space-y-1">
								<Label>Timezone</Label>
								<Input value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="America/Los_Angeles" />
								<p className="text-[10px] text-muted-foreground">Default America/Los_Angeles</p>
							</div>
							<div className="space-y-1">
								<Label>Period Start</Label>
								<Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
							</div>
							<div className="space-y-1">
								<Label>Period End</Label>
								<Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
							</div>
							<div className="sm:col-span-2 space-y-1">
								<Label>Notes</Label>
								<Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional notes that appear beneath the header" />
							</div>
						</div>

						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<div className="font-semibold tracking-tight">Line Items</div>
								<Button size="sm" variant="secondary" onClick={addLine}><Plus className="h-4 w-4 mr-1" /> Add line</Button>
							</div>
							<div className="overflow-x-auto rounded-md border bg-white shadow-sm">
								<table className="w-full text-sm border-collapse">
									<thead className="bg-slate-50 sticky top-0 z-10 shadow-xs">
										<tr className="text-[11px] uppercase tracking-wide text-slate-600">
											<th className="text-left px-3 py-2 font-medium">Athlete</th>
											<th className="text-left px-3 py-2 font-medium">Custom name</th>
											<th className="text-left px-3 py-2 font-medium">Date</th>
											<th className="text-left px-3 py-2 font-medium">Dur</th>
											<th className="text-left px-3 py-2 font-medium">Member</th>
											<th className="text-right px-3 py-2 font-medium">Rate $</th>
											<th className="text-right px-3 py-2 font-medium">Amount $</th>
											<th className="text-left px-3 py-2 font-medium">Description</th>
											<th className="px-2 py-2" />
										</tr>
									</thead>
									<tbody className="divide-y divide-slate-100">
								{lines.map((l, idx) => (
									<tr key={idx} className="border-t align-top">
															<td className="px-3 py-2 min-w-[180px]">
																<Select value={l.athleteId ? String(l.athleteId) : 'none'} onValueChange={(v) => updateLine(idx, { athleteId: v === 'none' ? undefined : Number(v) })}>
												<SelectTrigger>
													<SelectValue placeholder="Select athlete (optional)" />
												</SelectTrigger>
												<SelectContent>
																		<SelectItem value="none">—</SelectItem>
													{athletes.map((a) => (
														<SelectItem key={a.id} value={String(a.id)}>{athleteLabel(a)}</SelectItem>
													))}
												</SelectContent>
											</Select>
										</td>
										<td className="px-3 py-2">
											<Input value={l.athleteName || ''} onChange={(e) => updateLine(idx, { athleteName: e.target.value })} placeholder="Or type a custom name" />
										</td>
										<td className="px-3 py-2">
											<Input type="date" value={l.date} onChange={(e) => updateLine(idx, { date: e.target.value })} />
										</td>
															<td className="px-3 py-2 w-28">
																<Select
																					value={l.durationMinutes ? String(l.durationMinutes) : 'none'}
																					onValueChange={(v) => {
																						const dur = v === 'none' ? undefined : Number(v);
																						const autoRate = (!l._userEditedRate) ? getRateDollars(dur, l.member) : undefined;
																						updateLine(idx, {
																							durationMinutes: dur,
																							...(autoRate ? { rateDollars: autoRate } : {}),
																						});
																					}}
																				>
												<SelectTrigger>
													<SelectValue placeholder="—" />
												</SelectTrigger>
												<SelectContent>
																		<SelectItem value="none">—</SelectItem>
													<SelectItem value="30">30</SelectItem>
													<SelectItem value="60">60</SelectItem>
												</SelectContent>
											</Select>
										</td>
										<td className="px-3 py-2 text-center">
											<Switch
																checked={!!l.member}
																onCheckedChange={(v) => {
																	const autoRate = (!l._userEditedRate) ? getRateDollars(l.durationMinutes, v) : undefined;
																	updateLine(idx, {
																		member: v,
																		...(autoRate ? { rateDollars: autoRate } : {}),
																	});
																}}
															/>
										</td>
										<td className="px-3 py-2">
											<Input
																inputMode="decimal"
																placeholder="0.00"
																value={l.rateDollars || ''}
																onChange={(e) => {
																	const val = e.target.value;
																	// mark as user-edited when non-empty; if cleared, allow auto-fill on next dur/member change
																	updateLine(idx, { rateDollars: val, _userEditedRate: val.trim() !== '' });
																}}
																className="text-right"
															/>
										</td>
										<td className="px-3 py-2">
											<Input inputMode="decimal" placeholder="0.00" value={l.amountDollars || ''} onChange={(e) => updateLine(idx, { amountDollars: e.target.value })} className="text-right" />
										</td>
										<td className="px-3 py-2">
											<Input placeholder="Description" value={l.description || ''} onChange={(e) => updateLine(idx, { description: e.target.value })} />
										</td>
										<td className="px-3 py-2">
											<Button size="icon" variant="ghost" onClick={() => removeLine(idx)} aria-label="Remove line">
												<Trash2 className="h-4 w-4" />
											</Button>
										</td>
									</tr>
								))}
						</tbody>
					</table>
					{!lines.length && (
						<div className="p-6 text-center text-xs text-muted-foreground">No line items — add one to begin.</div>
					)}
				</div>
						</div>
					</div>
					<div className="px-6 py-4 border-t bg-slate-50 flex items-center justify-between">
						<p className="text-[11px] text-muted-foreground">All currency values should be entered in dollars (will be converted to cents).</p>
						<div className="space-x-2">
							<Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
							<Button onClick={onSubmit}>Generate PDF</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		);
}

// Payout Rates Management Panel
function PayoutRatesPanel() {
	const { data: rates = [], refetch, isLoading } = usePayoutRates('all');
	const createRate = useCreatePayoutRate();
	const retireRate = useRetirePayoutRate();
	const { toast } = useToast();
	const [showForm, setShowForm] = useState(false);
	const [form, setForm] = useState({ durationMinutes: '30', isMember: 'true', rateDollars: '', effectiveFrom: '' });

	const onSubmit = async () => {
		try {
			const durationMinutes = parseInt(form.durationMinutes, 10);
			const isMember = form.isMember === 'true';
			const rateCents = Math.round(parseFloat(form.rateDollars) * 100);
			if (!durationMinutes || !rateCents) {
				toast({ title: 'Missing fields', description: 'Duration and rate required', variant: 'destructive' });
				return;
			}
			await createRate.mutateAsync({ durationMinutes, isMember, rateCents, effectiveFrom: form.effectiveFrom || undefined });
			toast({ title: 'Rate created', description: `${durationMinutes}m ${isMember ? 'Member' : 'Non-member'}` });
			setShowForm(false);
			setForm({ durationMinutes: '30', isMember: 'true', rateDollars: '', effectiveFrom: '' });
			await refetch();
		} catch (e: any) {
			toast({ title: 'Create failed', description: e?.message || 'Error', variant: 'destructive' });
		}
	};

	const now = Date.now();

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<div className="font-semibold text-slate-700 flex items-center gap-2"><DollarSign className="h-4 w-4" /> Payout Rates</div>
				<div className="flex gap-2">
					<Button variant={showForm ? 'secondary' : 'default'} onClick={() => setShowForm(v => !v)}>{showForm ? 'Cancel' : 'New Rate'}</Button>
				</div>
			</div>
			{showForm && (
				<div className="rounded-xl border bg-white p-4 space-y-3">
					<div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
						<div>
							<Label className="text-xs">Duration</Label>
							<select className="w-full border rounded px-2 py-1" value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}>
								<option value="30">30 min</option>
								<option value="60">60 min</option>
							</select>
						</div>
						<div>
							<Label className="text-xs">Membership</Label>
							<select className="w-full border rounded px-2 py-1" value={form.isMember} onChange={e => setForm(f => ({ ...f, isMember: e.target.value }))}>
								<option value="true">Member</option>
								<option value="false">Non-member</option>
							</select>
						</div>
						<div>
							<Label className="text-xs">Rate (USD)</Label>
							<Input type="number" step="0.01" value={form.rateDollars} placeholder="e.g. 150.00" onChange={e => setForm(f => ({ ...f, rateDollars: e.target.value }))} />
						</div>
						<div>
							<Label className="text-xs">Effective From (optional)</Label>
							<Input type="datetime-local" value={form.effectiveFrom ? form.effectiveFrom.slice(0,16) : ''} onChange={e => setForm(f => ({ ...f, effectiveFrom: e.target.value ? new Date(e.target.value).toISOString() : '' }))} />
						</div>
						<div className="flex items-end">
							<Button className="w-full" disabled={createRate.isPending} onClick={onSubmit}>{createRate.isPending ? 'Saving…' : 'Save'}</Button>
						</div>
					</div>
					<p className="text-xs text-slate-500">Creating a new rate automatically retires the previous active rate for the same duration & membership.</p>
				</div>
			)}
			<div className="overflow-x-auto rounded-xl border bg-white">
				<table className="w-full text-sm">
					<thead className="bg-slate-50">
						<tr>
							<th className="text-left px-4 py-2">Duration</th>
							<th className="text-left px-4 py-2">Membership</th>
							<th className="text-right px-4 py-2">Rate</th>
							<th className="text-left px-4 py-2">Effective From</th>
							<th className="text-left px-4 py-2">Effective To</th>
							<th className="text-left px-4 py-2">Status</th>
							<th className="text-right px-4 py-2">Actions</th>
						</tr>
					</thead>
					<tbody>
						{isLoading ? (
							<tr><td className="px-4 py-4" colSpan={7}>Loading…</td></tr>
						) : rates.length === 0 ? (
							<tr><td className="px-4 py-6 text-slate-500" colSpan={7}>No rates configured.</td></tr>
						) : (
							rates.map(r => {
								const active = !r.effective_to || new Date(r.effective_to).getTime() > now;
								return (
									<tr key={r.id} className="border-t">
										<td className="px-4 py-2">{r.duration_minutes} min</td>
										<td className="px-4 py-2">{r.is_member ? 'Member' : 'Non-member'}</td>
										<td className="px-4 py-2 text-right">{(r.rate_cents/100).toLocaleString(undefined,{style:'currency',currency:'USD'})}</td>
										<td className="px-4 py-2 whitespace-nowrap">{r.effective_from}</td>
										<td className="px-4 py-2 whitespace-nowrap">{r.effective_to || '—'}</td>
										<td className="px-4 py-2">{active ? <span className="text-green-600 font-medium">Active</span> : 'Historical'}</td>
										<td className="px-4 py-2 text-right">
											{active && !r.effective_to && (
												<Button size="sm" variant="secondary" disabled={retireRate.isPending} onClick={async () => {
													try {
														await retireRate.mutateAsync({ id: r.id });
														toast({ title: 'Rate retired', description: `${r.duration_minutes}m ${r.is_member ? 'Member' : 'Non-member'}` });
														await refetch();
													} catch (e: any) {
														toast({ title: 'Retire failed', description: e?.message || 'Error', variant: 'destructive' });
													}
												}}>Retire</Button>
											)}
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}

