import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAddAthleteSkillVideo, useAthleteSkillVideos, useUpsertAthleteSkill, useUploadMedia, useDeleteAthleteSkillVideo } from "@/hooks/useAthleteProgress";
import type { InsertAthleteSkill, Skill } from "@shared/schema";
import React, { useEffect, useMemo, useRef, useState } from "react";

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
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [recordedAt, setRecordedAt] = useState<string>(new Date().toISOString().slice(0, 10));
  const notesRef = useRef<HTMLTextAreaElement | null>(null);

  const upsert = useUpsertAthleteSkill();
  const addVideo = useAddAthleteSkillVideo();
  const uploadMedia = useUploadMedia();
  const delVideo = useDeleteAthleteSkillVideo();

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

    // Handle optional video attachment: file upload takes precedence, then URL
    let finalUrl = videoUrl.trim();
    if (videoFile) {
      const url = await uploadMedia.mutateAsync(videoFile);
      finalUrl = url;
    }
    if (finalUrl) {
      await addVideo.mutateAsync({
        athleteSkillId: saved.id,
        url: finalUrl,
        title: videoTitle || null,
        recordedAt: recordedAt ? new Date(recordedAt).toISOString() : new Date().toISOString(),
      });
      setVideoUrl("");
      setVideoTitle("");
      setVideoFile(null);
    }

    onOpenChange(false);
  };

  useEffect(() => {
    if (open) {
      // Focus notes when dialog opens
      requestAnimationFrame(() => notesRef.current?.focus());
    }
  }, [open]);

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
                  onMouseDown={(e) => {
                    // Avoid moving focus to the button on click and immediately focus notes
                    e.preventDefault();
                    notesRef.current?.focus();
                  }}
                  onClick={() => {
                    setStatus(opt.key);
                    // After selecting status, focus notes so the next keystroke goes into the textarea
                    requestAnimationFrame(() => notesRef.current?.focus());
                  }}
                  onKeyDown={(e) => {
                    // Avoid space/enter toggling status again and stealing focus
                    if (e.key === ' ' || e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      (e.currentTarget as HTMLButtonElement).blur();
                      requestAnimationFrame(() => notesRef.current?.focus());
                    }
                  }}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Coach Notes</Label>
            <Textarea
              id="notes"
              ref={notesRef}
              autoFocus
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observations, next steps, drills..."
            />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="videoFile">Or Upload Video</Label>
              <Input id="videoFile" type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} />
            </div>
            <div>
              <Label htmlFor="recordedAt">Recorded Date</Label>
              <Input id="recordedAt" type="date" value={recordedAt} onChange={(e) => setRecordedAt(e.target.value)} />
            </div>
          </div>

          {!!videos.length && (
            <div>
              <Label>Previous Clips</Label>
              <ul className="mt-2 space-y-2 text-sm">
                {videos.map((v) => (
                  <li key={v.id} className="p-2 rounded border flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{v.title || "Untitled Clip"}</div>
                      <div className="text-xs text-slate-500">{v.recordedAt ? new Date(v.recordedAt as any).toLocaleDateString() : ''}</div>
                      <a className="text-blue-600 underline break-all" href={v.url ?? undefined} target="_blank" rel="noreferrer">
                        {v.url}
                      </a>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => delVideo.mutate({ id: v.id, athleteSkillId: v.athleteSkillId ?? undefined })}
                    >
                      Delete
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsert.isPending || addVideo.isPending || uploadMedia.isPending}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
