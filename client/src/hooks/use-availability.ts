import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Availability, InsertAvailability, AvailabilityException, InsertAvailabilityException } from "@shared/schema";

// Availability hooks
export function useAvailability() {
  return useQuery<Availability[]>({
    queryKey: ["/api/availability"],
    queryFn: () => apiRequest("GET", "/api/availability").then(res => res.json()),
  });
}

export function useCreateAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (availability: InsertAvailability) => {
      const response = await apiRequest("POST", "/api/availability", availability);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
    },
  });
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertAvailability }) => {
      const response = await apiRequest("PUT", `/api/availability/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
    },
  });
}

export function useDeleteAvailability() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/availability/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
    },
  });
}

// Availability Exceptions hooks
export function useAvailabilityExceptions() {
  return useQuery<AvailabilityException[]>({
    queryKey: ["/api/availability-exceptions"],
    queryFn: () => apiRequest("GET", "/api/availability-exceptions").then(res => res.json()),
  });
}

export function useCreateAvailabilityException() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (exception: InsertAvailabilityException) => {
      const response = await apiRequest("POST", "/api/availability-exceptions", exception);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability-exceptions"] });
    },
  });
}

export function useUpdateAvailabilityException() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InsertAvailabilityException }) => {
      const response = await apiRequest("PUT", `/api/availability-exceptions/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability-exceptions"] });
    },
  });
}

export function useDeleteAvailabilityException() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/availability-exceptions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/availability-exceptions"] });
    },
  });
}