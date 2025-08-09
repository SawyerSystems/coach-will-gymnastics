import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useApparatusList, useCreateSkill, useDeleteSkill, useSkills, useUpdateSkill, useSkillRelations, useSaveSkillRelations, type Skill } from "@/hooks/useSkills";
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
  const [sortWithin, setSortWithin] = useState<'display' | 'name'>('display');
  const [dragging, setDragging] = useState<{ groupId: number; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ groupId: number; index: number } | null>(null);

  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const qc = useQueryClient();

  const [draft, setDraft] = useState<Partial<Skill> & { prerequisiteIds?: number[]; componentIds?: number[]; isConnectedCombo?: boolean }>({ level: "beginner", prerequisiteIds: [], componentIds: [], isConnectedCombo: false });
  const [selectedSkillId, setSelectedSkillId] = useState<number | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [editDraft, setEditDraft] = useState<Partial<Skill>>({});
  const { data: relations } = useSkillRelations(selectedSkillId);
  const saveRelations = useSaveSkillRelations();

  const filteredSkills = useMemo(() => skills, [skills]);

  const groups = useMemo(() => {
    const byApp: Record<number, Skill[]> = {};
    filteredSkills.forEach(s => {
      const aid = s.apparatusId ?? -1;
      byApp[aid] = byApp[aid] || [];
      byApp[aid].push(s);
    });
    const sortedApparatus = [...apparatus].sort((a, b) => a.name.localeCompare(b.name));
    const unknownGroupSkills = byApp[-1] || [];
    const makeSorted = (arr: Skill[]) => {
      if (sortWithin === 'name') return [...arr].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      // default: by displayOrder then name
      return [...arr].sort((a, b) => {
        const ao = a.displayOrder ?? 1_000_000;
        const bo = b.displayOrder ?? 1_000_000;
        if (ao !== bo) return ao - bo;
        return (a.name || '').localeCompare(b.name || '');
      });
    };
    const result: { apparatusId: number; apparatusName: string; items: Skill[] }[] = [];
    sortedApparatus.forEach(a => {
      const items = byApp[a.id] ? makeSorted(byApp[a.id]) : [];
      if (items.length) result.push({ apparatusId: a.id, apparatusName: a.name, items });
    });
    if (unknownGroupSkills.length) {
      result.push({ apparatusId: -1, apparatusName: 'Unassigned', items: makeSorted(unknownGroupSkills) });
    }
    return result;
  }, [filteredSkills, apparatus, sortWithin]);

  const onCreate = async () => {
    if (!draft.name) return;
    await createSkill.mutateAsync(draft);
    setDraft({ level: draft.level || "beginner", prerequisiteIds: [], componentIds: [], isConnectedCombo: false });
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <div className="space-y-2">
            <Label>Sort within apparatus</Label>
            <Select value={sortWithin} onValueChange={(v) => setSortWithin(v as 'display' | 'name')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="display">Display Order</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
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
              <div className="space-y-2">
                <Label>Connected Combo</Label>
                <div className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={!!draft.isConnectedCombo} onChange={e => setDraft(d => ({ ...d, isConnectedCombo: e.target.checked }))} />
                  <span>Mark this as a connected combo</span>
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Prerequisites (optional)</Label>
                  <div className="border rounded p-2 max-h-40 overflow-auto space-y-1">
                    {skills.map(s => (
                      <label key={s.id} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={(draft.prerequisiteIds || []).includes(s.id)}
                          onChange={(e) => setDraft(d => {
                            const set = new Set(d.prerequisiteIds || []);
                            if (e.target.checked) set.add(s.id); else set.delete(s.id);
                            return { ...d, prerequisiteIds: Array.from(set) };
                          })}
                        />
                        <span>{s.name || `Skill #${s.id}`}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Connected Components (optional)</Label>
                  <div className="space-y-2">
                    {(draft.componentIds || []).map((id, idx) => (
                      <div key={`${id}-${idx}`} className="flex items-center gap-2">
                        <span className="text-xs w-6 text-gray-500">{idx + 1}.</span>
                        <span className="flex-1 text-sm">{skills.find(sk => sk.id === id)?.name || `Skill #${id}`}</span>
                        <Button size="sm" variant="outline" onClick={() => setDraft(d => {
                          const arr = [...(d.componentIds || [])];
                          if (idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                          return { ...d, componentIds: arr };
                        })}>Up</Button>
                        <Button size="sm" variant="outline" onClick={() => setDraft(d => {
                          const arr = [...(d.componentIds || [])];
                          if (idx < arr.length - 1) [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                          return { ...d, componentIds: arr };
                        })}>Down</Button>
                        <Button size="sm" variant="destructive" onClick={() => setDraft(d => ({ ...d, componentIds: (d.componentIds || []).filter((_, i) => i !== idx) }))}>Remove</Button>
                      </div>
                    ))}
                    <Select onValueChange={(v) => setDraft(d => ({ ...d, componentIds: [...(d.componentIds || []), Number(v)] }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Add component skill" />
                      </SelectTrigger>
                      <SelectContent>
                        {skills.map(sk => (
                          <SelectItem key={sk.id} value={String(sk.id)}>{sk.name || `Skill #${sk.id}`}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
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
              <div className="space-y-6">
                {groups.map(group => (
                  <div key={group.apparatusId}>
                    <div className="text-sm font-semibold text-muted-foreground mb-2">{group.apparatusName}</div>
                    <div className="space-y-2">
                      {group.items.map((s, idx) => (
                        <Card
                          key={s.id}
                          draggable
                          onDragStart={(e) => {
                            setDragging({ groupId: group.apparatusId, index: idx });
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragging && dragging.groupId === group.apparatusId) {
                              setDragOver({ groupId: group.apparatusId, index: idx });
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (!dragging || dragging.groupId !== group.apparatusId) { setDragging(null); setDragOver(null); return; }
                            const from = dragging.index;
                            const to = idx;
                            if (from === to) { setDragging(null); setDragOver(null); return; }
                            const arr = [...group.items];
                            const moved = arr.splice(from, 1)[0];
                            arr.splice(to, 0, moved);
                            // Persist new display order in 10s
                            arr.forEach((item, i) => {
                              const newOrder = (i + 1) * 10;
                              if (item.displayOrder !== newOrder) {
                                updateSkill.mutate({ id: item.id, patch: { displayOrder: newOrder } });
                              }
                            });
                            setDragging(null);
                            setDragOver(null);
                            // Invalidate to reflect new order
                            qc.invalidateQueries({ queryKey: ["/api/admin/skills"], exact: false });
                          }}
                          className={dragOver && dragOver.groupId === group.apparatusId && dragOver.index === idx ? 'ring-2 ring-primary' : ''}
                        >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <CardTitle className="text-base">{s.name || `Skill #${s.id}`}</CardTitle>
                                <div className="text-xs text-muted-foreground">{apparatus.find(a => a.id === s.apparatusId)?.name || '—'} • {s.level || 'beginner'}</div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {editingId === s.id ? (
                            <>
                              <Button size="sm" onClick={() => {
                                if (!editingId) return;
                                updateSkill.mutate({ id: editingId, patch: editDraft });
                                setEditingId(undefined);
                                setEditDraft({});
                              }}>Save</Button>
                              <Button size="sm" variant="outline" onClick={() => { setEditingId(undefined); setEditDraft({}); }}>Cancel</Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => { setEditingId(s.id); setEditDraft({ name: s.name || '', category: s.category || '', level: s.level || 'beginner', displayOrder: s.displayOrder ?? undefined, apparatusId: s.apparatusId ?? undefined, description: s.description || '' }); }}>Edit</Button>
                          )}
                          <Button size="sm" variant={selectedSkillId === s.id ? 'secondary' : 'outline'} onClick={() => setSelectedSkillId(prev => prev === s.id ? undefined : s.id)}>Relations</Button>
                          <Button size="sm" variant="destructive" onClick={() => deleteSkill.mutate(s.id)}>Delete</Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {editingId === s.id ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <Label>Name</Label>
                            <Input value={(editDraft.name as string) || ''} onChange={(e) => setEditDraft(d => ({ ...d, name: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label>Category</Label>
                            <Input value={(editDraft.category as string) || ''} onChange={(e) => setEditDraft(d => ({ ...d, category: e.target.value }))} />
                          </div>
                          <div className="space-y-1">
                            <Label>Level</Label>
                            <Select value={(editDraft.level as string) || 'beginner'} onValueChange={(v) => setEditDraft(d => ({ ...d, level: v }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {LEVELS.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1">
                            <Label>Display Order</Label>
                            <Input type="number" value={editDraft.displayOrder ?? ''} onChange={(e) => setEditDraft(d => ({ ...d, displayOrder: e.target.value === '' ? undefined : Number(e.target.value) }))} />
                          </div>
                          <div className="space-y-1">
                            <Label>Apparatus</Label>
                            <Select value={editDraft.apparatusId ? String(editDraft.apparatusId) : ''} onValueChange={(v) => setEditDraft(d => ({ ...d, apparatusId: v ? Number(v) : undefined }))}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select apparatus" />
                              </SelectTrigger>
                              <SelectContent>
                                {apparatus.map(a => (<SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1 sm:col-span-2 lg:col-span-3">
                            <Label>Description</Label>
                            <Input value={(editDraft.description as string) || ''} onChange={(e) => setEditDraft(d => ({ ...d, description: e.target.value }))} />
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-muted-foreground">Category</div>
                            <div>{s.category || '—'}</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground">Display Order</div>
                            <div>{s.displayOrder ?? '—'}</div>
                          </div>
                          <div className="sm:col-span-2 lg:col-span-3">
                            <div className="text-xs text-muted-foreground">Description</div>
                            <div className="break-words">{s.description || '—'}</div>
                          </div>
                        </div>
                      )}

                      {selectedSkillId === s.id && (
                        <div className="mt-4 border rounded p-3 space-y-3">
                          <div className="font-medium">Edit Relations</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <div className="text-sm font-medium mb-2">Prerequisites</div>
                              <div className="max-h-64 overflow-auto space-y-1">
                                {skills.map(sk => (
                                  <label key={sk.id} className="flex items-center gap-2 text-sm">
                                    <input
                                      type="checkbox"
                                      checked={!!relations?.prerequisiteIds?.includes(sk.id)}
                                      onChange={(e) => {
                                        const current = new Set(relations?.prerequisiteIds || []);
                                        if (e.target.checked) current.add(sk.id); else current.delete(sk.id);
                                        saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: Array.from(current), componentIds: relations?.componentIds || [] } });
                                      }}
                                    />
                                    <span>{sk.name || `Skill #${sk.id}`}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-sm font-medium mb-2">Connected Components (order matters)</div>
                              <div className="space-y-2">
                                {(relations?.componentIds || []).map((id, idx) => {
                                  const skill = skills.find(sk => sk.id === id);
                                  return (
                                    <div key={`${id}-${idx}`} className="flex items-center gap-2">
                                      <span className="text-xs w-6 text-gray-500">{idx + 1}.</span>
                                      <span className="flex-1 text-sm">{skill?.name || `Skill #${id}`}</span>
                                      <Button size="sm" variant="outline" onClick={() => {
                                        const arr = [...(relations?.componentIds || [])];
                                        if (idx > 0) {
                                          [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                          saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                        }
                                      }}>Up</Button>
                                      <Button size="sm" variant="outline" onClick={() => {
                                        const arr = [...(relations?.componentIds || [])];
                                        if (idx < arr.length - 1) {
                                          [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                          saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                        }
                                      }}>Down</Button>
                                      <Button size="sm" variant="destructive" onClick={() => {
                                        const arr = (relations?.componentIds || []).filter((v, i) => i !== idx);
                                        saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                      }}>Remove</Button>
                                    </div>
                                  );
                                })}
                                <div className="flex items-center gap-2">
                                  <Select onValueChange={(v) => {
                                    const id = Number(v);
                                    if (!Number.isFinite(id)) return;
                                    const arr = [...(relations?.componentIds || []), id];
                                    saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                  }}>
                                    <SelectTrigger className="w-full">
                                      <SelectValue placeholder="Add component skill" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {skills.map(sk => (
                                        <SelectItem key={sk.id} value={String(sk.id)}>{sk.name || `Skill #${sk.id}`}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                        </Card>
                      ))}
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
