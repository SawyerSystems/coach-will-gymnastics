import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useApparatusList, useSkills, type Skill } from '@/hooks/useSkills';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athleteId: number;
  onPickSkill?: (skill: Skill) => void;
};

export default function AddAthleteSkillDialog({ open, onOpenChange, athleteId, onPickSkill }: Props) {
  const { data: apparatus = [] } = useApparatusList();
  const [apparatusId, setApparatusId] = useState<number | 'all'>('all');
  const [level, setLevel] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const { data: skills = [] } = useSkills({ apparatusId: apparatusId === 'all' ? undefined : apparatusId, level: level === 'all' ? undefined : level });
  const searchRef = useRef<HTMLInputElement | null>(null);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (skills || []).filter(s => {
      if (!q) return true;
      return (s.name || '').toLowerCase().includes(q) || (s.category || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
    }).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0) || (a.name || '').localeCompare(b.name || ''));
  }, [skills, search]);

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => searchRef.current?.focus());
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add/Test a Skill</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="sm:col-span-2">
            <Label>Search</Label>
            <Input
              placeholder="Search by name/category/description"
              value={search}
              ref={searchRef}
              autoFocus
              onKeyDown={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                setSearch(e.target.value);
              }}
            />
          </div>
          <div>
            <Label>Apparatus</Label>
            <Select
              value={apparatusId === 'all' ? 'all' : String(apparatusId)}
              onValueChange={(v) => {
                setApparatusId(v === 'all' ? 'all' : Number(v));
                // Blur select trigger and focus search to capture typing
                const el = document.activeElement as HTMLElement | null;
                if (el && typeof el.blur === 'function') el.blur();
                requestAnimationFrame(() => searchRef.current?.focus());
              }}
            >
              <SelectTrigger><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {apparatus.map(ap => (<SelectItem key={ap.id} value={String(ap.id)}>{ap.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-3">
            <Label>Level</Label>
            <Select
              value={level === 'all' ? 'all' : level}
              onValueChange={(v) => {
                setLevel(v);
                const el = document.activeElement as HTMLElement | null;
                if (el && typeof el.blur === 'function') el.blur();
                requestAnimationFrame(() => searchRef.current?.focus());
              }}
            >
              <SelectTrigger><SelectValue placeholder="All levels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {Array.from(new Set((skills || []).map(s => (s.level || '').toString()).filter(Boolean))).sort().map(l => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <ScrollArea className="h-72 border rounded">
          <div className="p-2 grid grid-cols-1 gap-2">
            {visible.map(s => (
              <div key={s.id} className="p-2 rounded border flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name || `Skill #${s.id}`}</div>
                  <div className="text-xs text-slate-500">{s.category || 'General'}{s.level ? ` · Level ${s.level}` : ''}</div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    // Defuse focus before closing to avoid aria-hidden on focused element
                    const el = document.activeElement as HTMLElement | null;
                    if (el && typeof el.blur === 'function') el.blur();
                    // Close the picker, then open the tester after exit transition
                    onOpenChange(false);
                    setTimeout(() => onPickSkill?.(s), 250);
                  }}
                >
                  Test
                </Button>
              </div>
            ))}
            {!visible.length && (
              <div className="text-sm text-slate-600 p-4 text-center">No skills match your filters.</div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
