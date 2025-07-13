import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAvailableTimes(date: string | null, lessonType: string | null) {
  return useQuery({
    queryKey: ['available-times', date, lessonType],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/available-times/${date}/${lessonType}`);
      const data = await response.json();
      return data.availableTimes as string[];
    },
    enabled: !!(date && lessonType),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}