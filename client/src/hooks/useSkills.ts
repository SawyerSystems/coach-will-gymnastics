import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type Apparatus = { id: number; name: string };
export type Skill = {
  id: number;
  name?: string | null;
  category?: string | null;
  level?: string | null;
  description?: string | null;
  displayOrder?: number | null;
  apparatusId?: number | null;
};

export function useApparatusList() {
  return useQuery<Apparatus[]>({
    queryKey: ["/api/apparatus"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/apparatus");
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSkills(filters?: { apparatusId?: number; level?: string }) {
  const params = new URLSearchParams();
  if (filters?.apparatusId) params.set("apparatusId", String(filters.apparatusId));
  if (filters?.level) params.set("level", filters.level);
  const key = `/api/admin/skills${params.toString() ? `?${params.toString()}` : ""}`;

  return useQuery<Skill[]>({
    queryKey: [key],
    queryFn: async () => {
      const res = await apiRequest("GET", key);
      return res.json();
    },
  });
}

export function useCreateSkill() {
  return useMutation({
    mutationFn: async (input: Partial<Skill>) => {
      const res = await apiRequest("POST", "/api/admin/skills", input);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate all admin skills queries
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"], exact: false });
    },
  });
}

export function useUpdateSkill() {
  return useMutation({
    mutationFn: async ({ id, patch }: { id: number; patch: Partial<Skill> }) => {
      const res = await apiRequest("PATCH", `/api/admin/skills/${id}`, patch);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"], exact: false });
    },
  });
}

export function useDeleteSkill() {
  return useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/skills/${id}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/skills"], exact: false });
    },
  });
}
