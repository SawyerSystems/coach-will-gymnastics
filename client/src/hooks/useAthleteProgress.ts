import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { AthleteSkill, AthleteSkillVideo, InsertAthleteSkill, ProgressShareLink, Skill } from "@shared/schema";

export type AthleteSkillWithMeta = AthleteSkill & { skill?: Skill | null };

export const SKILL_STATUSES = [
  "working",
  "learning",
  "consistent",
  "mastered",
] as const;
export type SkillStatus = typeof SKILL_STATUSES[number] | string;

export function useAthleteSkills(athleteId?: number) {
  const key = athleteId ? `/api/admin/athletes/${athleteId}/skills` : undefined;
  return useQuery<AthleteSkillWithMeta[]>({
    queryKey: [key || ""],
    queryFn: async () => {
      const res = await apiRequest("GET", key!);
      return res.json();
    },
    enabled: !!athleteId,
  });
}

export function useUpsertAthleteSkill() {
  return useMutation({
    mutationFn: async (input: InsertAthleteSkill) => {
      const res = await apiRequest("POST", "/api/admin/athlete-skills", input);
      return res.json() as Promise<AthleteSkill>;
    },
    onSuccess: (_data, variables) => {
      if ((variables as any).athleteId) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/athletes/${(variables as any).athleteId}/skills`] });
      }
    },
  });
}

export function useAthleteSkillVideos(athleteSkillId?: number) {
  const key = athleteSkillId ? `/api/admin/athlete-skill-videos?athleteSkillId=${athleteSkillId}` : undefined;
  return useQuery<AthleteSkillVideo[]>({
    queryKey: [key || ""],
    queryFn: async () => {
      const res = await apiRequest("GET", key!);
      return res.json();
    },
    enabled: !!athleteSkillId,
  });
}

export function useAddAthleteSkillVideo() {
  return useMutation({
    mutationFn: async (input: { athleteSkillId: number; url: string; title?: string | null; recordedAt?: string | null }) => {
      const res = await apiRequest("POST", "/api/admin/athlete-skill-videos", input);
      return res.json() as Promise<AthleteSkillVideo>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/admin/athlete-skill-videos?athleteSkillId=${data.athleteSkillId}`] });
    },
  });
}

export function useDeleteAthleteSkillVideo() {
  return useMutation({
    mutationFn: async (input: { id: number; athleteSkillId?: number | null }) => {
      const res = await apiRequest("DELETE", `/api/admin/athlete-skill-videos/${input.id}`);
      await res.json().catch(() => ({}));
      return input;
    },
    onSuccess: (input) => {
      if (input.athleteSkillId) {
        queryClient.invalidateQueries({ queryKey: [`/api/admin/athlete-skill-videos?athleteSkillId=${input.athleteSkillId}`] });
      } else {
        // Fallback: invalidate all video lists
        queryClient.invalidateQueries({ queryKey: ["/api/admin/athlete-skill-videos"], exact: false });
      }
    },
  });
}

// Upload a media file (video) and return a public URL
export function useUploadMedia() {
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: form,
        // credentials handled globally; this endpoint is admin-protected
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || res.statusText);
      }
      const data = await res.json();
      return data?.url as string;
    },
  });
}

export function useCreateProgressShareLink() {
  return useMutation({
    mutationFn: async (input: { athleteId: number; token?: string; expiresAt?: string | null }) => {
      const payload = { token: crypto.randomUUID(), ...input };
      const res = await apiRequest("POST", "/api/parent/progress-share-links", payload);
      return res.json() as Promise<ProgressShareLink>;
    },
    onSuccess: (data) => {
      if (data.athleteId) {
        queryClient.invalidateQueries({ queryKey: [
          `/api/admin/progress-share-links?athleteId=${data.athleteId}`,
        ]});
      }
    }
  });
}

export function useProgressByToken(token?: string) {
  const key = token ? `/api/progress/${token}` : undefined;
  return useQuery<{
    athlete: any;
    skills: { athleteSkill: AthleteSkillWithMeta; skill?: Skill | null; videos: AthleteSkillVideo[] }[];
    link: ProgressShareLink | null;
  }>({
    queryKey: [key || ""],
    queryFn: async () => {
      const res = await apiRequest("GET", key!);
      return res.json();
    },
    enabled: !!token,
  });
}

export function useProgressShareLinks(athleteId?: number) {
  const key = athleteId ? `/api/admin/progress-share-links?athleteId=${athleteId}` : undefined;
  return useQuery<ProgressShareLink[]>({
    queryKey: [key || ""],
    queryFn: async () => {
      const res = await apiRequest("GET", key!);
      return res.json();
    },
    enabled: !!athleteId,
  });
}

export function useDeleteProgressShareLink() {
  return useMutation({
    mutationFn: async (input: { id: number; athleteId: number }) => {
      const res = await apiRequest("DELETE", `/api/admin/progress-share-links/${input.id}`);
      await res.json().catch(() => ({}));
      return input;
    },
    onSuccess: (input) => {
      queryClient.invalidateQueries({ queryKey: [
        `/api/admin/progress-share-links?athleteId=${input.athleteId}`,
      ]});
    },
  });
}

export function useRevokeProgressShareLink() {
  return useMutation({
    mutationFn: async (input: { id: number; athleteId: number }) => {
      const res = await apiRequest("POST", `/api/admin/progress-share-links/${input.id}/revoke`);
      return res.json() as Promise<ProgressShareLink>;
    },
    onSuccess: (data) => {
      if (data.athleteId) {
        queryClient.invalidateQueries({ queryKey: [
          `/api/admin/progress-share-links?athleteId=${data.athleteId}`,
        ]});
      }
    },
  });
}
