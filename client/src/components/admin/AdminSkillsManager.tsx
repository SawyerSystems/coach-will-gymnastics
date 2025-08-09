import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApparatusList, useCreateSkill, useDeleteSkill, useSkills, useUpdateSkill, type Skill } from "@/hooks/useSkills";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";

const LEVELS = ["beginner", "intermediate", "advanced", "elite"] as const;

type Filters = { apparatusId?: number; level?: string };

export default function AdminSkillsManager() {
  const [, setLocation] = useLocation();
  const { data: auth } = useQuery<{ loggedIn: boolean }>({
    queryKey: ["/api/auth/status"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 30_000,
  });
  const [filters, setFilters] = useState<Filters>({});
  const { data: apparatus = [], isLoading: isAppLoading } = useApparatusList();
  const { data: skills = [], isLoading, error } = useSkills(filters);

  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const qc = useQueryClient();

  const [draft, setDraft] = useState<Partial<Skill>>({ level: "beginner" });

  const filteredSkills = useMemo(() => skills, [skills]);

  const onCreate = async () => {
    if (!draft.name) return;
    await createSkill.mutateAsync(draft);
    setDraft({ level: draft.level || "beginner" });
  };

  if (!auth?.loggedIn) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600">Admin login required to view and edit skills.</div>
          <Button onClick={() => setLocation("/admin-login")}>Go to Admin Login</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Apparatus</Label>
            <Select
              value={filters.apparatusId ? String(filters.apparatusId) : ""}
              onValueChange={(v) => setFilters(f => ({ ...f, apparatusId: v === 'all' ? undefined : Number(v) }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All apparatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {isAppLoading ? (
                  <div className="px-2 py-1 text-sm text-gray-500">Loading…</div>
                ) : apparatus.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Level</Label>
            <Select
              value={filters.level || ""}
              onValueChange={(v) => setFilters(f => ({ ...f, level: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {LEVELS.map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={draft.name || ""} onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={draft.category || ""} onChange={e => setDraft(d => ({ ...d, category: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={draft.level || "beginner"} onValueChange={v => setDraft(d => ({ ...d, level: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LEVELS.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Apparatus</Label>
                <Select value={draft.apparatusId ? String(draft.apparatusId) : ""} onValueChange={v => setDraft(d => ({ ...d, apparatusId: v ? Number(v) : undefined }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select apparatus" />
                  </SelectTrigger>
                  <SelectContent>
                    {apparatus.map(a => (<SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <Label>Description</Label>
                <Input value={draft.description || ""} onChange={e => setDraft(d => ({ ...d, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Display Order</Label>
                <Input type="number" value={draft.displayOrder ?? ""} onChange={e => setDraft(d => ({ ...d, displayOrder: e.target.value === "" ? undefined : Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onCreate} disabled={createSkill.isPending || !draft.name}>Add Skill</Button>
              <Button variant="outline" onClick={() => setDraft({ level: "beginner" })}>Clear</Button>
            </div>
            <Separator className="my-2" />
            {isLoading ? (
              <div>Loading…</div>
            ) : error ? (
              <div className="text-sm text-red-600">{(error as any)?.message || "Failed to load skills."}</div>
            ) : (
              <div className="space-y-2">
                {filteredSkills.map((s) => (
                  <div key={s.id} className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center border rounded p-2">
                    <Input className="md:col-span-2" defaultValue={s.name || ''} onBlur={(e) => e.target.value !== (s.name || '') && updateSkill.mutate({ id: s.id, patch: { name: e.target.value } })} />
                    <Input defaultValue={s.category || ''} onBlur={(e) => e.target.value !== (s.category || '') && updateSkill.mutate({ id: s.id, patch: { category: e.target.value } })} />
                    <Select defaultValue={s.level ?? 'beginner'} onValueChange={(v) => updateSkill.mutate({ id: s.id, patch: { level: v } })}>
                      <SelectTrigger>
                        <SelectValue placeholder="level" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEVELS.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                      </SelectContent>
                    </Select>
                    <Input type="number" defaultValue={s.displayOrder ?? undefined} onBlur={(e) => updateSkill.mutate({ id: s.id, patch: { displayOrder: e.target.value === '' ? undefined : Number(e.target.value) } })} />
                    <div className="flex justify-end">
                      <Button variant="destructive" onClick={() => deleteSkill.mutate(s.id)}>Delete</Button>
                    </div>
                  </div>
                ))}
                {filteredSkills.length === 0 && (
                  <div className="text-sm text-gray-500">No skills found for current filters.</div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
