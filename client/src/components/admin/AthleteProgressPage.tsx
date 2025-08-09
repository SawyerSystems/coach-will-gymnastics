import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useApparatusList } from "@/hooks/useSkills";
import { SKILL_STATUSES, useAthleteSkills } from "@/hooks/useAthleteProgress";
import type { Athlete } from "@shared/schema";

type Apparatus = { id: number; name: string };

function useAthletes() {
  return useQuery<Athlete[]>({
    queryKey: ["/api/athletes"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/athletes");
      return res.json();
    },
  });
}

export default function AthleteProgressPage() {
  const { data: athletes = [], isLoading: loadingAthletes } = useAthletes();
  const { data: apparatus = [] } = useApparatusList();

  const [athleteId, setAthleteId] = useState<number | undefined>(undefined);
  const [apparatusId, setApparatusId] = useState<number | "all">("all");
  const [level, setLevel] = useState<string | "all">("all");
  const [search, setSearch] = useState("");

  const filteredAthletes = useMemo(() => {
    if (!search.trim()) return athletes;
    const q = search.toLowerCase();
    return athletes.filter(a => {
      const name = `${a.firstName || ""} ${a.lastName || ""}`.toLowerCase();
      return name.includes(q) || (a as any)?.name?.toLowerCase?.().includes(q);
    });
  }, [athletes, search]);

  const { data: athleteSkills = [], isLoading: loadingSkills } = useAthleteSkills(athleteId);

  // Collect levels present for the selected athlete to populate the level filter
  const availableLevels = useMemo(() => {
    const s = new Set<string>();
    (athleteSkills || []).forEach((as) => {
      const lvl = as.skill?.level?.toString()?.trim();
      if (lvl) s.add(lvl);
    });
    return Array.from(s).sort();
  }, [athleteSkills]);

  const apparatusById = useMemo(() => {
    const map = new Map<number, Apparatus>();
    (apparatus || []).forEach((ap) => map.set(ap.id, ap));
    return map;
  }, [apparatus]);

  // Filter skills based on selected apparatus and level
  const visibleSkills = useMemo(() => {
    return (athleteSkills || []).filter((as) => {
      if (apparatusId !== "all" && as.skill?.apparatusId !== apparatusId) return false;
      if (level !== "all") {
        const lvl = as.skill?.level?.toString?.();
        if (lvl !== level) return false;
      }
      return true;
    });
  }, [athleteSkills, apparatusId, level]);

  // Summary computations
  const overall = useMemo(() => {
    const total = visibleSkills.length;
    const counts: Record<string, number> = {};
    SKILL_STATUSES.forEach((s) => (counts[s] = 0));
    visibleSkills.forEach((as) => {
      if (as.status && typeof as.status === "string") {
        const key = as.status.toLowerCase();
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    const mastered = counts["mastered"] || 0;
    const consistent = counts["consistent"] || 0;
    const masteredPct = total ? Math.round((mastered / total) * 100) : 0;
    const consistentPct = total ? Math.round(((mastered + consistent) / total) * 100) : 0;
    return { total, counts, masteredPct, consistentPct };
  }, [visibleSkills]);

  const perApparatus = useMemo(() => {
    const groups = new Map<number, typeof overall>();
    visibleSkills.forEach((as) => {
      const apId = as.skill?.apparatusId;
      if (!apId) return;
      if (!groups.has(apId)) groups.set(apId, { total: 0, counts: {}, masteredPct: 0, consistentPct: 0 } as any);
      const g: any = groups.get(apId)!;
      g.total += 1;
      const key = (as.status || "").toString().toLowerCase();
      g.counts[key] = (g.counts[key] || 0) + 1;
    });
    // compute percentages
    const rows = Array.from(groups.entries()).map(([apId, g]: any) => {
      const mastered = g.counts["mastered"] || 0;
      const consistent = g.counts["consistent"] || 0;
      const masteredPct = g.total ? Math.round((mastered / g.total) * 100) : 0;
      const consistentPct = g.total ? Math.round(((mastered + consistent) / g.total) * 100) : 0;
      return {
        apparatusId: apId,
        total: g.total,
        counts: g.counts,
        masteredPct,
        consistentPct,
      };
    });
    // stable sort by apparatus name
    return rows.sort((a, b) => (apparatusById.get(a.apparatusId)?.name || "").localeCompare(apparatusById.get(b.apparatusId)?.name || ""));
  }, [visibleSkills, apparatusById]);

  const perApparatusLevel = useMemo(() => {
    const map = new Map<number, Map<string, { total: number; mastered: number; consistent: number }>>();
    visibleSkills.forEach(as => {
      const ap = as.skill?.apparatusId; if (!ap) return;
      const lvl = (as.skill?.level || 'Unknown').toString();
      if (!map.has(ap)) map.set(ap, new Map());
      const inner = map.get(ap)!;
      if (!inner.has(lvl)) inner.set(lvl, { total: 0, mastered: 0, consistent: 0 });
      const s = inner.get(lvl)!;
      s.total += 1;
      const st = (as.status || '').toString().toLowerCase();
      if (st === 'mastered') s.mastered += 1;
      if (st === 'consistent' || st === 'mastered') s.consistent += 1;
    });
    return Array.from(map.entries()).map(([ap, inner]) => ({
      apparatusId: ap,
      levels: Array.from(inner.entries()).map(([lvl, s]) => ({
        level: lvl,
        total: s.total,
        masteredPct: s.total ? Math.round((s.mastered / s.total) * 100) : 0,
        consistentPct: s.total ? Math.round((s.consistent / s.total) * 100) : 0,
      })).sort((a, b) => a.level.localeCompare(b.level))
    })).sort((a, b) => (apparatusById.get(a.apparatusId)?.name || '').localeCompare(apparatusById.get(b.apparatusId)?.name || ''));
  }, [visibleSkills, apparatusById]);

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <Label>Search Athletes</Label>
            <Input placeholder="Type a name…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <Label>Select Athlete</Label>
            <Select value={athleteId ? String(athleteId) : undefined} onValueChange={(v) => setAthleteId(v ? Number(v) : undefined)}>
              <SelectTrigger>
                <SelectValue placeholder={loadingAthletes ? "Loading…" : "Choose an athlete"} />
              </SelectTrigger>
              <SelectContent>
                {filteredAthletes.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {`${a.firstName || ""} ${a.lastName || ""}`.trim() || (a as any)?.name || `Athlete #${a.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Apparatus</Label>
            <Select value={apparatusId === "all" ? "all" : String(apparatusId)} onValueChange={(v) => setApparatusId(v === "all" ? "all" : Number(v))}>
              <SelectTrigger>
                <SelectValue placeholder="All apparatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {apparatus.map((ap) => (
                  <SelectItem key={ap.id} value={String(ap.id)}>{ap.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-3">
            <Label>Level</Label>
            <Select value={level === "all" ? "all" : level} onValueChange={(v) => setLevel(v)}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {availableLevels.map((lvl) => (
                  <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {!athleteId ? (
        <Card>
          <CardContent className="py-10 text-center text-slate-600">Select an athlete to see progress.</CardContent>
        </Card>
      ) : loadingSkills ? (
        <Card>
          <CardContent className="py-10 text-center">Loading progress…</CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Mastered</span>
                    <span className="text-slate-600">{overall.masteredPct}%</span>
                  </div>
                  <Progress value={overall.masteredPct} />
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Consistent or Mastered</span>
                    <span className="text-slate-600">{overall.consistentPct}%</span>
                  </div>
                  <Progress value={overall.consistentPct} />
                </div>
                <div className="text-xs text-slate-600 mt-1">
                  Total skills: {overall.total} · Mastered: {overall.counts["mastered"] || 0} · Consistent: {overall.counts["consistent"] || 0} · Learning: {overall.counts["learning"] || 0} · Working: {overall.counts["working"] || 0}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {perApparatus.map((row) => (
              <Card key={row.apparatusId}>
                <CardHeader>
                  <CardTitle className="text-base">{apparatusById.get(row.apparatusId)?.name || `Apparatus #${row.apparatusId}`}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Mastered</span>
                    <span className="text-slate-600">{row.masteredPct}%</span>
                  </div>
                  <Progress value={row.masteredPct} />
                  <div className="flex items-center justify-between text-sm mb-1 mt-3">
                    <span>Consistent or Mastered</span>
                    <span className="text-slate-600">{row.consistentPct}%</span>
                  </div>
                  <Progress value={row.consistentPct} />
                  <div className="text-xs text-slate-600 mt-1">
                    Total: {row.total} · M: {row.counts["mastered"] || 0} · C: {row.counts["consistent"] || 0} · L: {row.counts["learning"] || 0} · W: {row.counts["working"] || 0}
                  </div>
                </CardContent>
              </Card>
            ))}
            {!perApparatus.length && (
              <Card className="md:col-span-2">
                <CardContent className="py-10 text-center text-slate-600">No skills match the selected filters.</CardContent>
              </Card>
            )}
          </div>
          {perApparatusLevel.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Progress by Level</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {perApparatusLevel.map(group => (
                    <div key={group.apparatusId}>
                      <div className="font-medium mb-2">{apparatusById.get(group.apparatusId)?.name || `Apparatus #${group.apparatusId}`}</div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {group.levels.map(l => (
                          <div key={l.level} className="p-2 rounded border">
                            <div className="text-sm mb-1">Level {l.level}</div>
                            <div className="flex items-center justify-between text-xs mb-1"><span>Mastered</span><span>{l.masteredPct}%</span></div>
                            <Progress value={l.masteredPct} />
                            <div className="flex items-center justify-between text-xs mb-1 mt-2"><span>Consistent or Mastered</span><span>{l.consistentPct}%</span></div>
                            <Progress value={l.consistentPct} />
                            <div className="text-[11px] text-slate-600 mt-1">Total: {l.total} {l.masteredPct === 100 ? '· Completed' : ''}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </div>
  );
}
