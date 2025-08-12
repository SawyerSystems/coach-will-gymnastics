import React, { useMemo, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCard, AdminCardContent, AdminCardHeader, AdminCardTitle } from "@/components/admin-ui/AdminCard";
import { Separator } from "@/components/ui/separator";
import { useApparatusList, useCreateSkill, useDeleteSkill, useSkills, useUpdateSkill, useSkillRelations, useSaveSkillRelations, type Skill } from "@/hooks/useSkills";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { StableTextInput, StableSelect, StableCheckbox } from "./StableFormFields";

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
  const [dragging, setDragging] = useState<{ groupId: number; levelId: string; index: number } | null>(null);
  const [dragOver, setDragOver] = useState<{ groupId: number; levelId: string; index: number } | null>(null);

  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const deleteSkill = useDeleteSkill();
  const qc = useQueryClient();

  // Separate state variables for form inputs to prevent unmounting
  const [nameText, setNameText] = useState<string>("");
  const [categoryText, setCategoryText] = useState<string>("");
  const [descriptionText, setDescriptionText] = useState<string>("");
  const [displayOrderText, setDisplayOrderText] = useState<string>("");
  const [levelValue, setLevelValue] = useState<string>("beginner");
  const [apparatusId, setApparatusId] = useState<number | undefined>(undefined);
  const [isConnectedCombo, setIsConnectedCombo] = useState<boolean>(false);
  const [prerequisiteIds, setPrerequisiteIds] = useState<number[]>([]);
  const [componentIds, setComponentIds] = useState<number[]>([]);

  const [selectedSkillId, setSelectedSkillId] = useState<number | undefined>(undefined);
  const [editingId, setEditingId] = useState<number | undefined>(undefined);
  const [editDraft, setEditDraft] = useState<Partial<Skill>>({});
  const { data: relations } = useSkillRelations(selectedSkillId);
  const saveRelations = useSaveSkillRelations();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState<Set<number>>(new Set());
  const prerequisiteScrollRef = useRef<HTMLDivElement>(null);

  // Get unique categories from existing skills
  const uniqueCategories = useMemo(() => {
    const categories = skills
      .map(skill => skill.category)
      .filter((category): category is string => Boolean(category))
      .filter((category, index, arr) => arr.indexOf(category) === index)
      .sort();
    return categories;
  }, [skills]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const onCreate = async () => {
    if (!nameText) return;
    // Build skill data from separate state variables
    const skillData = {
      name: nameText,
      category: categoryText || undefined,
      description: descriptionText || undefined,
      level: levelValue,
      apparatusId: apparatusId,
      displayOrder: displayOrderText === "" ? undefined : Number(displayOrderText),
      isConnectedCombo: isConnectedCombo,
      prerequisiteIds: prerequisiteIds,
      componentIds: componentIds
    };
    await createSkill.mutateAsync(skillData);
    // Reset all form fields
    setNameText("");
    setCategoryText("");
    setDescriptionText("");
    setDisplayOrderText("");
    setLevelValue("beginner");
    setApparatusId(undefined);
    setIsConnectedCombo(false);
    setPrerequisiteIds([]);
    setComponentIds([]);
  };

  // Define the change handlers with useCallback to ensure they don't change between renders
  const handleNameChange = useCallback((value: string) => {
    setNameText(value);
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setCategoryText(value);
  }, []);

  const handleDescriptionChange = useCallback((value: string) => {
    setDescriptionText(value);
  }, []);

  const handleDisplayOrderChange = useCallback((value: string) => {
    setDisplayOrderText(value);
  }, []);

  const handleLevelChange = useCallback((value: string) => {
    setLevelValue(value);
  }, []);

  const handleConnectedComboChange = useCallback((checked: boolean) => {
    setIsConnectedCombo(checked);
  }, []);

  const handleApparatusChange = useCallback((value: string) => {
    const newApparatusId = value ? Number(value) : undefined;
    // If apparatus changes, clear prerequisites and components that don't belong to the new apparatus
    if (newApparatusId !== apparatusId) {
      const filteredSkills = skills.filter(s => s.apparatusId === newApparatusId);
      const validSkillIds = new Set(filteredSkills.map(s => s.id));
      const filteredPrerequisiteIds = prerequisiteIds.filter(id => validSkillIds.has(id));
      const filteredComponentIds = componentIds.filter(id => validSkillIds.has(id));
      
      setApparatusId(newApparatusId);
      setPrerequisiteIds(filteredPrerequisiteIds);
      setComponentIds(filteredComponentIds);
    } else {
      setApparatusId(newApparatusId);
    }
  }, [apparatusId, skills, prerequisiteIds, componentIds]);

  const handlePrerequisiteChange = useCallback((skillId: number, checked: boolean) => {
    const scrollPosition = prerequisiteScrollRef.current?.scrollTop || 0;
    const set = new Set(prerequisiteIds);
    if (checked) set.add(skillId); else set.delete(skillId);
    setPrerequisiteIds(Array.from(set));
    // Restore scroll position after state update
    setTimeout(() => {
      if (prerequisiteScrollRef.current) {
        prerequisiteScrollRef.current.scrollTop = scrollPosition;
      }
    }, 0);
  }, [prerequisiteIds]);

  const handleComponentAdd = useCallback((value: string) => {
    setComponentIds(prev => [...prev, Number(value)]);
  }, []);

  const handleClearForm = useCallback(() => {
    setNameText("");
    setCategoryText("");
    setDescriptionText("");
    setDisplayOrderText("");
    setLevelValue("beginner");
    setApparatusId(undefined);
    setIsConnectedCombo(false);
    setPrerequisiteIds([]);
    setComponentIds([]);
  }, []);

  const handleMoveComponentUp = useCallback((idx: number) => {
    setComponentIds(prev => {
      const arr = [...prev];
      if (idx > 0) [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  }, []);

  const handleMoveComponentDown = useCallback((idx: number) => {
    setComponentIds(prev => {
      const arr = [...prev];
      if (idx < arr.length - 1) [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
      return arr;
    });
  }, []);

  const handleRemoveComponent = useCallback((idx: number) => {
    setComponentIds(prev => prev.filter((_, i) => i !== idx));
  }, []);

  // Memoize the apparatus options to prevent unnecessary re-renders
  const apparatusOptions = useMemo(() => {
    return apparatus.map(a => ({ value: String(a.id), label: a.name }));
  }, [apparatus]);

  // Memoize the level options
  const levelOptions = useMemo(() => {
    return LEVELS.map(l => ({ value: l, label: l }));
  }, []);

  // Custom equality function for SkillForm
  const skillFormPropsAreEqual = (prevProps: any, nextProps: any) => {
    // Only re-render when specific input values change
    return (
      prevProps.nameText === nextProps.nameText &&
      prevProps.categoryText === nextProps.categoryText &&
      prevProps.descriptionText === nextProps.descriptionText &&
      prevProps.displayOrderText === nextProps.displayOrderText &&
      prevProps.levelValue === nextProps.levelValue &&
      prevProps.apparatusId === nextProps.apparatusId &&
      prevProps.isConnectedCombo === nextProps.isConnectedCombo &&
      prevProps.isCreating === nextProps.isCreating &&
      JSON.stringify(prevProps.prerequisiteIds) === JSON.stringify(nextProps.prerequisiteIds) &&
      JSON.stringify(prevProps.componentIds) === JSON.stringify(nextProps.componentIds)
    );
  };

  // Define the SkillForm component that will be memoized
  const SkillForm = React.memo(({
    nameText,
    onNameChange,
    categoryText,
    onCategoryChange,
    descriptionText,
    onDescriptionChange,
    displayOrderText,
    onDisplayOrderChange,
    levelValue,
    onLevelChange,
    apparatusId,
    onApparatusChange,
    isConnectedCombo,
    onConnectedComboChange,
    prerequisiteIds,
    onPrerequisiteChange,
    componentIds,
    onComponentAdd,
    onMoveComponentUp,
    onMoveComponentDown,
    onRemoveComponent,
    uniqueCategories,
    apparatus,
    skills,
    onSubmit,
    onClear,
    onCancel,
    isCreating
  }) => {
    const prerequisiteScrollRef = useRef<HTMLDivElement>(null);
    
    // Memoize the apparatus options to prevent unnecessary re-renders
    const apparatusOptions = useMemo(() => {
      return apparatus.map(a => ({ value: String(a.id), label: a.name }));
    }, [apparatus]);

    // Memoize the level options
    const levelOptions = useMemo(() => {
      return LEVELS.map(l => ({ value: l, label: l }));
    }, []);
    
    return (
      <div className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-4 shadow-lg dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/90">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <StableTextInput
            label="Name"
            value={nameText}
            onChange={onNameChange}
          />
          
          <StableSelect
            label="Apparatus"
            value={apparatusId ? String(apparatusId) : ""}
            onValueChange={onApparatusChange}
            options={apparatusOptions}
            placeholder="Select apparatus"
          />
          
          <StableSelect
            label="Level"
            value={levelValue}
            onValueChange={onLevelChange}
            options={levelOptions}
          />
          
          <StableTextInput
            label="Category"
            value={categoryText}
            onChange={onCategoryChange}
            placeholder="Select or type category"
            list="categories-list"
          />
          <datalist id="categories-list">
            {uniqueCategories.map(category => (
              <option key={category} value={category} />
            ))}
          </datalist>
          
          <div className="md:col-span-2">
            <StableTextInput
              label="Description"
              value={descriptionText}
              onChange={onDescriptionChange}
            />
          </div>
          
          <StableTextInput
            label="Display Order"
            value={displayOrderText}
            onChange={onDisplayOrderChange}
            placeholder="e.g. 10, 20, 30..."
            type="number"
          />
          
          <StableCheckbox
            label="Connected Combo"
            checked={isConnectedCombo}
            onChange={onConnectedComboChange}
          />
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Label className="text-[#0F0276] dark:text-white font-medium">Prerequisites (optional)</Label>
              <div 
                ref={prerequisiteScrollRef}
                className="border border-slate-200/60 rounded-lg p-3 max-h-40 overflow-auto space-y-2 bg-white/60 supports-[backdrop-filter]:bg-white/30 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/30"
              >
                {apparatusId ? (
                  skills.filter(s => s.apparatusId === apparatusId).map(s => (
                    <label key={s.id} className="flex items-center gap-3 text-sm p-2 rounded-md hover:bg-white/50 dark:hover:bg-[#0F0276]/50 transition-colors duration-200">
                      <input
                        type="checkbox"
                        checked={prerequisiteIds.includes(s.id)}
                        onChange={(e) => {
                          const scrollPosition = prerequisiteScrollRef.current?.scrollTop || 0;
                          onPrerequisiteChange(s.id, e.target.checked);
                          // Restore scroll position after state update
                          setTimeout(() => {
                            if (prerequisiteScrollRef.current) {
                              prerequisiteScrollRef.current.scrollTop = scrollPosition;
                            }
                          }, 0);
                        }}
                        className="rounded border-slate-300 text-[#0F0276] focus:ring-[#0F0276] focus:ring-offset-0"
                      />
                      <span className="text-slate-700 dark:text-white">{s.name || `Skill #${s.id}`}</span>
                    </label>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-500 dark:text-white/60 text-sm">
                    Select an apparatus first to see available prerequisites
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <Label className="text-[#0F0276] dark:text-white font-medium">Connected Components (optional)</Label>
              <div className="space-y-3">
                {componentIds.map((id, idx) => (
                  <div key={`${id}-${idx}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/60 supports-[backdrop-filter]:bg-white/30 backdrop-blur-sm border border-slate-200/40 dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/30">
                    <span className="text-xs w-6 h-6 flex items-center justify-center rounded-full bg-[#D8BD2A]/20 text-[#0F0276] dark:text-white font-medium">{idx + 1}</span>
                    <span className="flex-1 text-sm text-slate-700 dark:text-white">{skills.find(sk => sk.id === id)?.name || `Skill #${id}`}</span>
                    <div className="flex gap-1">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onMoveComponentUp(idx)} 
                        className="h-7 w-7 p-0 border-slate-300 dark:border-[#2A4A9B]/40 hover:bg-white/50 dark:hover:bg-[#0F0276]/50"
                      >
                        ↑
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => onMoveComponentDown(idx)} 
                        className="h-7 w-7 p-0 border-slate-300 dark:border-[#2A4A9B]/40 hover:bg-white/50 dark:hover:bg-[#0F0276]/50"
                      >
                        ↓
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => onRemoveComponent(idx)} 
                        className="h-7 w-7 p-0"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                ))}
                {apparatusId ? (
                  <Select onValueChange={onComponentAdd}>
                    <SelectTrigger className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50 hover:bg-white/90 dark:hover:bg-[#0F0276]/70 transition-colors duration-200">
                      <SelectValue placeholder="Add component skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.filter(sk => sk.apparatusId === apparatusId && !componentIds.includes(sk.id)).map(sk => (
                        <SelectItem key={sk.id} value={String(sk.id)}>{sk.name || `Skill #${sk.id}`}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-center py-3 text-slate-500 dark:text-white/60 text-sm border border-dashed border-slate-300 dark:border-[#2A4A9B]/40 rounded-lg">
                    Select an apparatus first to add component skills
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 pt-4">
          <Button 
            onClick={onSubmit} 
            disabled={isCreating || !nameText}
            className="bg-gradient-to-r from-[#0F0276] to-[#2A4A9B] hover:from-[#0F0276]/90 hover:to-[#2A4A9B]/90 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform-gpu hover:scale-[1.02]"
          >
            {isCreating ? 'Creating...' : 'Add Skill'}
          </Button>
          <Button 
            variant="outline" 
            onClick={onClear}
            className="border-slate-200/60 bg-white/80 hover:bg-white/90 dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/30 dark:hover:bg-[#0F0276]/50 backdrop-blur-sm transition-all duration-200"
          >
            Clear
          </Button>
          <Button 
            variant="ghost" 
            onClick={onCancel}
            className="text-[#0F0276]"
          >
            Cancel
          </Button>
        </div>
        <Separator className="my-2" />
      </div>
    );
  }, skillFormPropsAreEqual);
  
  SkillForm.displayName = "SkillForm";

  // Define the CreateForm that renders the SkillForm
  const CreateForm = React.memo(() => {
    return (
      <SkillForm
        nameText={nameText}
        onNameChange={handleNameChange}
        categoryText={categoryText}
        onCategoryChange={handleCategoryChange}
        descriptionText={descriptionText}
        onDescriptionChange={handleDescriptionChange}
        displayOrderText={displayOrderText}
        onDisplayOrderChange={handleDisplayOrderChange}
        levelValue={levelValue}
        onLevelChange={handleLevelChange}
        apparatusId={apparatusId}
        onApparatusChange={handleApparatusChange}
        isConnectedCombo={isConnectedCombo}
        onConnectedComboChange={handleConnectedComboChange}
        prerequisiteIds={prerequisiteIds}
        onPrerequisiteChange={handlePrerequisiteChange}
        componentIds={componentIds}
        onComponentAdd={handleComponentAdd}
        onMoveComponentUp={handleMoveComponentUp}
        onMoveComponentDown={handleMoveComponentDown}
        onRemoveComponent={handleRemoveComponent}
        uniqueCategories={uniqueCategories}
        apparatus={apparatus}
        skills={skills}
        onSubmit={onCreate}
        onClear={handleClearForm}
        onCancel={() => setIsCreateOpen(false)}
        isCreating={createSkill.isPending}
      />
    );
  }, () => true); // Always return true to prevent re-renders since all props are stable

  CreateForm.displayName = "CreateForm";

  const filteredSkills = useMemo(() => skills, [skills]);

  const groups = useMemo(() => {
    const byApp: Record<number, Record<string, Skill[]>> = {};
    const levelOrder = ['beginner', 'intermediate', 'advanced', 'elite'];
    
    filteredSkills.forEach(s => {
      const aid = s.apparatusId ?? -1;
      const level = s.level || 'beginner';
      byApp[aid] = byApp[aid] || {};
      byApp[aid][level] = byApp[aid][level] || [];
      byApp[aid][level].push(s);
    });
    
    const sortedApparatus = [...apparatus].sort((a, b) => a.name.localeCompare(b.name));
    const unknownGroupSkills = byApp[-1] || {};
    
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
    
    const result: { 
      apparatusId: number; 
      apparatusName: string; 
      levelGroups: { level: string; levelDisplayName: string; items: Skill[] }[] 
    }[] = [];
    
    sortedApparatus.forEach(a => {
      const skillsByLevel = byApp[a.id] || {};
      const levelGroups: { level: string; levelDisplayName: string; items: Skill[] }[] = [];
      
      // Add levels in order, only if they have skills
      levelOrder.forEach(level => {
        if (skillsByLevel[level] && skillsByLevel[level].length > 0) {
          levelGroups.push({
            level,
            levelDisplayName: level.charAt(0).toUpperCase() + level.slice(1),
            items: makeSorted(skillsByLevel[level])
          });
        }
      });
      
      // Add any other levels not in the standard order
      Object.keys(skillsByLevel).forEach(level => {
        if (!levelOrder.includes(level) && skillsByLevel[level].length > 0) {
          levelGroups.push({
            level,
            levelDisplayName: level.charAt(0).toUpperCase() + level.slice(1),
            items: makeSorted(skillsByLevel[level])
          });
        }
      });
      
      if (levelGroups.length > 0) {
        result.push({ 
          apparatusId: a.id, 
          apparatusName: a.name, 
          levelGroups 
        });
      }
    });
    
    // Handle unassigned skills
    if (Object.keys(unknownGroupSkills).length > 0) {
      const levelGroups: { level: string; levelDisplayName: string; items: Skill[] }[] = [];
      
      levelOrder.forEach(level => {
        if (unknownGroupSkills[level] && unknownGroupSkills[level].length > 0) {
          levelGroups.push({
            level,
            levelDisplayName: level.charAt(0).toUpperCase() + level.slice(1),
            items: makeSorted(unknownGroupSkills[level])
          });
        }
      });
      
      Object.keys(unknownGroupSkills).forEach(level => {
        if (!levelOrder.includes(level) && unknownGroupSkills[level].length > 0) {
          levelGroups.push({
            level,
            levelDisplayName: level.charAt(0).toUpperCase() + level.slice(1),
            items: makeSorted(unknownGroupSkills[level])
          });
        }
      });
      
      if (levelGroups.length > 0) {
        result.push({ 
          apparatusId: -1, 
          apparatusName: 'Unassigned', 
          levelGroups 
        });
      }
    }
    
    return result;
  }, [filteredSkills, apparatus, sortWithin]);

  if (!auth?.loggedIn) {
    return (
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>Skills</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="space-y-3">
          <div className="text-sm text-slate-600 dark:text-white/80">Admin login required to view and edit skills.</div>
          <Button onClick={() => setLocation("/admin-login")}>Go to Admin Login</Button>
        </AdminCardContent>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      <AdminCard>
        <AdminCardHeader>
          <AdminCardTitle>Filters</AdminCardTitle>
        </AdminCardHeader>
        <AdminCardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-[#0F0276] dark:text-white">Apparatus</Label>
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
                  <div className="px-2 py-1 text-sm text-slate-500 dark:text-white/70">Loading…</div>
                ) : apparatus.map(a => (
                  <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[#0F0276] dark:text-white">Level</Label>
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
            <Label className="text-[#0F0276] dark:text-white">Sort within apparatus</Label>
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
        </AdminCardContent>
      </AdminCard>

      <AdminCard>
        <AdminCardHeader>
          <div className="flex items-center justify-between gap-3">
            <AdminCardTitle>Skills</AdminCardTitle>
            <Button
              onClick={() => setIsCreateOpen(v => !v)}
              className="bg-[#0F0276] hover:bg-[#0F0276]/90 text-white dark:bg-[#D8BD2A] dark:hover:bg-[#D8BD2A]/90 dark:text-[#0F0276]"
            >
              {isCreateOpen ? 'Close' : 'New Skill'}
            </Button>
          </div>
        </AdminCardHeader>
        <AdminCardContent>
          <div className="space-y-4">
            {isCreateOpen ? <CreateForm /> : null}
            {isLoading ? (
              <div>Loading…</div>
            ) : error ? (
              <div className="text-sm text-red-600">{(error as any)?.message || "Failed to load skills."}</div>
            ) : (
              <div className="space-y-6">
                {groups.map(group => (
                  <div key={group.apparatusId} className="space-y-4">
                    <button
                      type="button" 
                      className="text-left w-full group flex items-center gap-3 p-3 rounded-xl border border-slate-200/60 bg-gradient-to-r from-white/70 to-white/50 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md hover:from-white/80 hover:to-white/60 shadow-sm hover:shadow-md transition-all duration-300 dark:border-[#2A4A9B]/60 dark:from-[#0F0276]/60 dark:to-[#0F0276]/40 dark:hover:from-[#0F0276]/70 dark:hover:to-[#0F0276]/50"
                      onClick={() => setCollapsedGroups(prev => {
                        const next = new Set(prev);
                        if (next.has(group.apparatusId)) next.delete(group.apparatusId); else next.add(group.apparatusId);
                        return next;
                      })}
                    >
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#0F0276]/10 to-[#2A4A9B]/10 group-hover:from-[#0F0276]/20 group-hover:to-[#2A4A9B]/20 transition-all duration-300">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0F0276] dark:text-white transition-transform duration-300 group-hover:scale-110">
                          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d={collapsedGroups.has(group.apparatusId) ? "M12 8v8M8 12h8" : "M8 12h8"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-bold text-[#0F0276] dark:text-white group-hover:text-[#2A4A9B] dark:group-hover:text-[#D8BD2A] transition-colors duration-300">
                          {group.apparatusName}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-white/70 mt-0.5">
                          {group.levelGroups.reduce((total, lg) => total + lg.items.length, 0)} skill{group.levelGroups.reduce((total, lg) => total + lg.items.length, 0) !== 1 ? 's' : ''} across {group.levelGroups.length} level{group.levelGroups.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-white/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {collapsedGroups.has(group.apparatusId) ? 'Click to expand' : 'Click to collapse'}
                      </div>
                    </button>
                    {!collapsedGroups.has(group.apparatusId) && (
                      <div className="space-y-6">
                        {group.levelGroups.map(levelGroup => (
                          <div key={`${group.apparatusId}-${levelGroup.level}`} className="space-y-3">
                            <div className="flex items-center gap-3 px-4">
                              <div className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-[#D8BD2A]/20 to-[#D8BD2A]/10">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0F0276] dark:text-white">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-[#0F0276] dark:text-white">
                                  {levelGroup.levelDisplayName}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-white/70">
                                  {levelGroup.items.length} skill{levelGroup.items.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4">
                              {levelGroup.items.map((s, idx) => (
                        <Card
                          key={s.id}
                          draggable
                          onDragStart={(e) => {
                            setDragging({ groupId: group.apparatusId, levelId: levelGroup.level, index: idx });
                            e.dataTransfer.effectAllowed = 'move';
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            if (dragging && dragging.groupId === group.apparatusId && dragging.levelId === levelGroup.level) {
                              setDragOver({ groupId: group.apparatusId, levelId: levelGroup.level, index: idx });
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (!dragging || dragging.groupId !== group.apparatusId || dragging.levelId !== levelGroup.level) { 
                              setDragging(null); 
                              setDragOver(null); 
                              return; 
                            }
                            const from = dragging.index;
                            const to = idx;
                            if (from === to) { setDragging(null); setDragOver(null); return; }
                            const arr = [...levelGroup.items];
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
                          className={`${dragOver && dragOver.groupId === group.apparatusId && dragOver.levelId === levelGroup.level && dragOver.index === idx ? 'ring-2 ring-[#D8BD2A] shadow-xl' : ''} ${expandedIds.has(s.id) ? 'col-span-2 md:col-span-4' : ''} rounded-xl border border-slate-200/60 bg-white/80 supports-[backdrop-filter]:bg-white/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-300 dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/80 overflow-hidden group cursor-pointer`}
                        >
                          <CardContent className="p-0 overflow-hidden">
                            {(!expandedIds.has(s.id)) ? (
                              <button
                                type="button"
                                className="w-full aspect-square rounded-xl flex flex-col items-start justify-center p-4 text-left hover:bg-gradient-to-br hover:from-white/20 hover:to-transparent dark:hover:from-[#2A4A9B]/10 overflow-hidden transition-all duration-300 group-hover:scale-[1.02] transform-gpu"
                                onClick={() => setExpandedIds(prev => { const next = new Set(prev); next.has(s.id) ? next.delete(s.id) : next.add(s.id); return next; })}
                              >
                                <div
                                  className="text-sm font-bold text-[#0F0276] dark:text-white w-full break-words leading-tight"
                                  style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                                >
                                  {s.name || `Skill #${s.id}`}
                                </div>
                                <div className="text-xs text-slate-600 dark:text-white/70 mt-2 truncate w-full flex items-center gap-1">
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#D8BD2A]/20 text-[#0F0276] dark:text-white">
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </span>
                                  {apparatus.find(a => a.id === s.apparatusId)?.name || '—'}
                                </div>
                                <div className="text-xs mt-2 truncate w-full">
                                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-[#0F0276]/10 to-[#2A4A9B]/10 text-[#0F0276] dark:text-white font-medium">
                                    {s.level || 'beginner'}
                                  </span>
                                </div>
                                {s.category && (
                                  <div className="text-xs mt-2 truncate w-full">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-[#D8BD2A]/20 text-[#0F0276] dark:text-white font-medium">
                                      {s.category}
                                    </span>
                                  </div>
                                )}
                              </button>
                            ) : (
                              <div
                                className="space-y-4 p-6"
                                onClick={(e) => {
                                  const el = e.target as HTMLElement | null;
                                  if (!el) return;
                                  // Ignore clicks on interactive elements
                                  if (el.closest('button, a, input, textarea, select, [role="button"]')) return;
                                  // Collapse this card
                                  setExpandedIds(prev => {
                                    const next = new Set(prev);
                                    next.delete(s.id);
                                    return next;
                                  });
                                }}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg font-bold text-[#0F0276] dark:text-white mb-2">{s.name || `Skill #${s.id}`}</CardTitle>
                                    <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-white/80">
                                      <div className="flex items-center gap-1">
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-r from-[#D8BD2A]/20 to-[#D8BD2A]/30">
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0F0276] dark:text-white">
                                            <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </span>
                                        <span className="font-medium">{apparatus.find(a => a.id === s.apparatusId)?.name || '—'}</span>
                                      </div>
                                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-[#0F0276]/10 to-[#2A4A9B]/10 text-[#0F0276] dark:text-white font-medium text-xs">
                                        {s.level || 'beginner'}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {editingId === s.id ? (
                                      <>
                                        <Button 
                                          size="sm" 
                                          onClick={() => {
                                          if (!editingId) return;
                                          updateSkill.mutate({ id: editingId, patch: editDraft });
                                          setEditingId(undefined);
                                          setEditDraft({});
                                        }}
                                        className="bg-gradient-to-r from-[#0F0276] to-[#2A4A9B] hover:from-[#0F0276]/90 hover:to-[#2A4A9B]/90 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                        >
                                          Save
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline" 
                                          onClick={() => { setEditingId(undefined); setEditDraft({}); }}
                                          className="border-slate-200/60 bg-white/80 backdrop-blur-sm text-slate-700 hover:bg-white/90 dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/50 dark:text-white dark:hover:bg-[#0F0276]/70"
                                        >
                                          Cancel
                                        </Button>
                                      </>
                                    ) : (
                                      <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => { setEditingId(s.id); setEditDraft({ name: s.name || '', category: s.category || '', level: s.level || 'beginner', displayOrder: s.displayOrder ?? undefined, apparatusId: s.apparatusId ?? undefined, description: s.description || '' }); }}
                                        className="border-slate-200/60 bg-white/80 backdrop-blur-sm text-[#0F0276] hover:bg-white/90 dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/50 dark:text-white dark:hover:bg-[#0F0276]/70"
                                      >
                                        Edit
                                      </Button>
                                    )}
                                    <Button 
                                      size="sm" 
                                      variant={selectedSkillId === s.id ? 'secondary' : 'outline'} 
                                      onClick={(e) => { e.stopPropagation?.(); setSelectedSkillId(prev => prev === s.id ? undefined : s.id); }}
                                      className={selectedSkillId === s.id ? 
                                        "bg-gradient-to-r from-[#D8BD2A]/20 to-[#D8BD2A]/30 text-[#0F0276] hover:from-[#D8BD2A]/30 hover:to-[#D8BD2A]/40 dark:text-white border-[#D8BD2A]/40" : 
                                        "border-slate-200/60 bg-white/80 backdrop-blur-sm text-[#0F0276] hover:bg-white/90 dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/50 dark:text-white dark:hover:bg-[#0F0276]/70"}
                                    >
                                      Relations
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive" 
                                      onClick={(e) => { e.stopPropagation?.(); deleteSkill.mutate(s.id); }}
                                      className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
                                    >
                                      Delete
                                    </Button>
                                  </div>
                                </div>

                                {editingId === s.id ? (
                                  <div className="rounded-xl border border-slate-200/60 bg-white/70 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-4 shadow-lg dark:border-[#2A4A9B]/60 dark:bg-[#0F0276]/80">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                      <div className="space-y-2">
                                        <Label className="text-[#0F0276] dark:text-white font-medium">Name</Label>
                                        <Input 
                                          value={(editDraft.name as string) || ''} 
                                          onChange={(e) => setEditDraft(d => ({ ...d, name: e.target.value }))} 
                                          className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-[#0F0276] dark:text-white font-medium">Category</Label>
                                        <Input 
                                          value={(editDraft.category as string) || ''} 
                                          onChange={(e) => setEditDraft(d => ({ ...d, category: e.target.value }))} 
                                          className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-[#0F0276] dark:text-white font-medium">Level</Label>
                                        <Select value={(editDraft.level as string) || 'beginner'} onValueChange={(v) => setEditDraft(d => ({ ...d, level: v }))}>
                                          <SelectTrigger className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {LEVELS.map(l => (<SelectItem key={l} value={l}>{l}</SelectItem>))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-[#0F0276] dark:text-white font-medium">Display Order</Label>
                                        <Input 
                                          type="number" 
                                          value={editDraft.displayOrder ?? ''} 
                                          onChange={(e) => setEditDraft(d => ({ ...d, displayOrder: e.target.value === '' ? undefined : Number(e.target.value) }))} 
                                          className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50"
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-[#0F0276] dark:text-white font-medium">Apparatus</Label>
                                        <Select value={editDraft.apparatusId ? String(editDraft.apparatusId) : ''} onValueChange={(v) => setEditDraft(d => ({ ...d, apparatusId: v ? Number(v) : undefined }))}>
                                          <SelectTrigger className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50">
                                            <SelectValue placeholder="Select apparatus" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {apparatus.map(a => (<SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                                        <Label className="text-[#0F0276] dark:text-white font-medium">Description</Label>
                                        <Input 
                                          value={(editDraft.description as string) || ''} 
                                          onChange={(e) => setEditDraft(d => ({ ...d, description: e.target.value }))} 
                                          className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="rounded-xl border border-slate-200/40 bg-gradient-to-br from-white/60 to-white/40 supports-[backdrop-filter]:bg-white/30 backdrop-blur-sm p-4 shadow-sm dark:border-[#2A4A9B]/40 dark:from-[#0F0276]/40 dark:to-[#0F0276]/20">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                      <div>
                                        <div className="text-xs text-slate-500 dark:text-white/60 font-medium mb-1">Category</div>
                                        <div className="text-slate-700 dark:text-white">{s.category || '—'}</div>
                                      </div>
                                      <div>
                                        <div className="text-xs text-slate-500 dark:text-white/60 font-medium mb-1">Display Order</div>
                                        <div className="text-slate-700 dark:text-white">{s.displayOrder ?? '—'}</div>
                                      </div>
                                      <div className="sm:col-span-2 lg:col-span-3">
                                        <div className="text-xs text-slate-500 dark:text-white/60 font-medium mb-1">Description</div>
                                        <div className="text-slate-700 dark:text-white break-words">{s.description || '—'}</div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                      {selectedSkillId === s.id && (
                        <div className="mt-4 rounded-xl border border-slate-200/60 bg-gradient-to-br from-white/70 to-white/50 supports-[backdrop-filter]:bg-white/40 backdrop-blur-md p-6 shadow-lg dark:border-[#2A4A9B]/60 dark:from-[#0F0276]/60 dark:to-[#0F0276]/40">
                          <div className="font-bold text-[#0F0276] dark:text-white flex items-center gap-3 mb-4">
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-[#D8BD2A]/20 to-[#D8BD2A]/30">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-[#0F0276] dark:text-white">
                                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <span className="text-lg">Edit Relations</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="rounded-lg border border-slate-200/40 bg-white/60 supports-[backdrop-filter]:bg-white/30 backdrop-blur-sm p-4 dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/30">
                              <div className="text-sm font-semibold mb-3 text-[#0F0276] dark:text-white flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0F0276]/10 dark:bg-white/10">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                                Prerequisites
                              </div>
                              <div className="max-h-64 overflow-auto space-y-2">
                                {s.apparatusId ? (
                                  skills.filter(sk => sk.apparatusId === s.apparatusId).map(sk => (
                                    <label key={sk.id} className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-white/40 dark:hover:bg-[#0F0276]/40 transition-colors duration-200">
                                      <input
                                        type="checkbox"
                                        checked={!!relations?.prerequisiteIds?.includes(sk.id)}
                                        onChange={(e) => {
                                          const current = new Set(relations?.prerequisiteIds || []);
                                          if (e.target.checked) current.add(sk.id); else current.delete(sk.id);
                                          saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: Array.from(current), componentIds: relations?.componentIds || [] } });
                                        }}
                                        className="rounded border-slate-300 text-[#0F0276] focus:ring-[#0F0276] focus:ring-offset-0"
                                      />
                                      <span className="text-slate-700 dark:text-white">{sk.name || `Skill #${sk.id}`}</span>
                                    </label>
                                  ))
                                ) : (
                                  <div className="text-center py-4 text-slate-500 dark:text-white/60 text-sm">
                                    No apparatus assigned to this skill
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="rounded-lg border border-slate-200/40 bg-white/60 supports-[backdrop-filter]:bg-white/30 backdrop-blur-sm p-4 dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/30">
                              <div className="text-sm font-semibold mb-3 text-[#0F0276] dark:text-white flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#0F0276]/10 dark:bg-white/10">
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </span>
                                Connected Components (order matters)
                              </div>
                              <div className="space-y-3">
                                {(relations?.componentIds || []).map((id, idx) => {
                                  const skill = skills.find(sk => sk.id === id);
                                  return (
                                    <div key={`${id}-${idx}`} className="flex items-center gap-3 p-3 rounded-lg bg-white/50 dark:bg-[#0F0276]/50 border border-slate-200/40 dark:border-[#2A4A9B]/40">
                                      <span className="text-xs w-6 h-6 flex items-center justify-center rounded-full bg-[#D8BD2A]/20 text-[#0F0276] dark:text-white font-medium">{idx + 1}</span>
                                      <span className="flex-1 text-sm text-slate-700 dark:text-white">{skill?.name || `Skill #${id}`}</span>
                                      <div className="flex gap-1">
                                        <Button size="sm" variant="outline" onClick={() => {
                                          const arr = [...(relations?.componentIds || [])];
                                          if (idx > 0) {
                                            [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
                                            saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                          }
                                        }} className="h-7 w-7 p-0 border-slate-300 dark:border-[#2A4A9B]/40">
                                          ↑
                                        </Button>
                                        <Button size="sm" variant="outline" onClick={() => {
                                          const arr = [...(relations?.componentIds || [])];
                                          if (idx < arr.length - 1) {
                                            [arr[idx + 1], arr[idx]] = [arr[idx], arr[idx + 1]];
                                            saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                          }
                                        }} className="h-7 w-7 p-0 border-slate-300 dark:border-[#2A4A9B]/40">
                                          ↓
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => {
                                          const arr = (relations?.componentIds || []).filter((v, i) => i !== idx);
                                          saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                        }} className="h-7 w-7 p-0">
                                          ×
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                                <div className="flex items-center gap-2">
                                  {s.apparatusId ? (
                                    <Select onValueChange={(v) => {
                                      const id = Number(v);
                                      if (!Number.isFinite(id)) return;
                                      const arr = [...(relations?.componentIds || []), id];
                                      saveRelations.mutate({ skillId: s.id, relations: { prerequisiteIds: relations?.prerequisiteIds || [], componentIds: arr } });
                                    }}>
                                      <SelectTrigger className="border-slate-200/60 bg-white/80 backdrop-blur-sm dark:border-[#2A4A9B]/40 dark:bg-[#0F0276]/50">
                                        <SelectValue placeholder="Add component skill" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {skills.filter(sk => sk.apparatusId === s.apparatusId && !relations?.componentIds?.includes(sk.id)).map(sk => (
                                          <SelectItem key={sk.id} value={String(sk.id)}>{sk.name || `Skill #${sk.id}`}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <div className="text-center py-2 text-slate-500 dark:text-white/60 text-sm flex-1 border border-dashed border-slate-300 dark:border-[#2A4A9B]/40 rounded-lg">
                                      No apparatus assigned to this skill
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {filteredSkills.length === 0 && (
                  <div className="text-sm text-gray-500">No skills found for current filters.</div>
                )}
              </div>
            )}
            
          </div>
        </AdminCardContent>
      </AdminCard>
    </div>
  );
}
