import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddAthleteSkillVideo, useAthleteSkillVideos, useUpsertAthleteSkill } from "@/hooks/useAthleteProgress";
import type { InsertAthleteSkill, Skill } from "@shared/schema";
import React, { useMemo, useState } from "react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athleteId: number;
  skill: Skill;
  existing?: { athleteSkillId?: number; status?: string | null; notes?: string | null };
}

export function TestSkillDialog({ open, onOpenChange, athleteId, skill, existing }: Props) {
  const [status, setStatus] = useState(existing?.status || "working");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoTitle, setVideoTitle] = useState("");

  const upsert = useUpsertAthleteSkill();
  const addVideo = useAddAthleteSkillVideo();

  // Only fetch videos if we know an athleteSkillId
  const athleteSkillId = existing?.athleteSkillId;
  const { data: videos = [] } = useAthleteSkillVideos(athleteSkillId);

  const handleSave = async () => {
    const payload: InsertAthleteSkill = {
      athleteId,
      skillId: skill.id,
      status,
      notes,
      lastTestedAt: new Date().toISOString() as any,
      firstTestedAt: existing?.athleteSkillId ? undefined : (new Date().toISOString() as any),
    } as any;
    const saved = await upsert.mutateAsync(payload);

    if (videoUrl.trim()) {
      await addVideo.mutateAsync({
        athleteSkillId: saved.id,
        url: videoUrl.trim(),
        title: videoTitle || null,
        recordedAt: new Date().toISOString(),
      });
      setVideoUrl("");
      setVideoTitle("");
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Test Skill: {skill.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { key: "working", label: "Working" },
                { key: "learning", label: "Learning" },
                { key: "consistent", label: "Consistent" },
                { key: "mastered", label: "Mastered" },
              ].map((opt) => (
                <Button
                  key={opt.key}
                  type="button"
                  variant={status === opt.key ? "default" : "outline"}
                  onClick={() => setStatus(opt.key)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Coach Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observations, next steps, drills..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="videoUrl">Video URL (optional)</Label>
              <Input id="videoUrl" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="videoTitle">Video Title</Label>
              <Input id="videoTitle" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} placeholder="e.g. First consistent reps" />
            </div>
          </div>

          {!!videos.length && (
            <div>
              <Label>Previous Clips</Label>
              <ul className="mt-2 space-y-2 text-sm">
                {videos.map((v) => (
                  <li key={v.id} className="p-2 rounded border">
                    <div className="font-medium">{v.title || "Untitled Clip"}</div>
                    <a className="text-blue-600 underline break-all" href={v.url ?? undefined} target="_blank" rel="noreferrer">
                      {v.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsert.isPending || addVideo.isPending}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
