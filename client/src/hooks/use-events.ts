import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export interface EventRow {
  id: string;
  seriesId: string;
  parentEventId?: string | null;
  title: string;
  notes?: string | null;
  location?: string | null;
  isAllDay: boolean;
  timezone: string;
  startAt: string; // ISO
  endAt: string;   // ISO
  recurrenceRule?: string | null;
  recurrenceEndAt?: string | null;
  recurrenceExceptions?: string[];
  // Availability blocking fields
  isAvailabilityBlock?: boolean;
  blockingReason?: string | null;
  // Audit fields
  createdBy?: number | null;
  updatedBy?: number | null;
  isDeleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export function useEvents(range?: { start: string; end: string }) {
  const qs = range ? `?start=${encodeURIComponent(range.start)}&end=${encodeURIComponent(range.end)}` : '';
  return useQuery<EventRow[]>({
    queryKey: ["/api/events", range?.start, range?.end],
    queryFn: async () => apiRequest("GET", `/api/events${qs}`).then(r => r.json()),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: Partial<EventRow>) => apiRequest("POST", "/api/events", input).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/events"] }),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EventRow> }) => apiRequest("PUT", `/api/events/${id}`, data).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/events"] }),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/events/${id}`).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/events"] }),
  });
}
