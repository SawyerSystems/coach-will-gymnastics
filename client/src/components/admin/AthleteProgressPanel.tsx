import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAthleteSkills } from "@/hooks/useAthleteProgress";
import type { Skill } from "@shared/schema";
import { TestSkillDialog } from "./TestSkillDialog";

interface Props {
  athleteId: number;
}

export function AthleteProgressPanel({ athleteId }: Props) {
  const { data: rows = [], isLoading, error } = useAthleteSkills(athleteId);
  const [testingSkill, setTestingSkill] = useState<{ skill: Skill; athleteSkillId?: number; status?: string | null; notes?: string | null } | null>(null);

  const grouped = useMemo(() => {
    const map = new Map<string, typeof rows>();
    for (const r of rows) {
      const key = `${r.skill?.apparatusId || 'unknown'}|${r.skill?.category || 'General'}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(r);
    }
    return Array.from(map.entries()).map(([k, v]) => {
      const [apparatusId, category] = k.split("|");
      return { apparatusId, category, items: v };
    });
  }, [rows]);

  if (isLoading) return <div className="text-sm text-slate-500">Loading progress…</div>;
  if (error) return <div className="text-sm text-red-600">Failed to load progress.</div>;

  return (
    <div className="space-y-4">
      {grouped.map((g) => (
        <Card key={`${g.apparatusId}-${g.category}`}>
          <CardHeader>
            <CardTitle className="text-base">{g.category} {g.apparatusId !== 'unknown' ? `(Apparatus #${g.apparatusId})` : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {g.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded border">
                  <div>
                    <div className="font-medium">{item.skill?.name || `Skill #${item.skillId}`}</div>
                    <div className="text-xs text-slate-500">Status: {item.status || '—'}</div>
                    {item.notes && <div className="text-xs text-slate-600 mt-1 line-clamp-2">{item.notes}</div>}
                  </div>
                  {item.skill && (
                    <Button size="sm" onClick={() => setTestingSkill({ skill: item.skill!, athleteSkillId: item.id, status: item.status, notes: item.notes })}>Test</Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {testingSkill && (
        <TestSkillDialog
          open={!!testingSkill}
          onOpenChange={(o) => !o && setTestingSkill(null)}
          athleteId={athleteId}
          skill={testingSkill.skill}
          existing={{ athleteSkillId: testingSkill.athleteSkillId, status: testingSkill.status, notes: testingSkill.notes }}
        />
      )}
    </div>
  );
}
