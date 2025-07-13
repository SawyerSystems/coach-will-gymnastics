import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useAvailableTimes(date: string, lessonType: string) {
  return useQuery({
    queryKey: ['/api/available-times', date, lessonType],
    queryFn: async (): Promise<string[]> => {
      const response = await apiRequest("GET", `/api/available-times/${date}/${lessonType}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch available times');
      }
      
      const data = await response.json();
      return data.availableTimes || [];
    },
    enabled: !!date && !!lessonType,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

