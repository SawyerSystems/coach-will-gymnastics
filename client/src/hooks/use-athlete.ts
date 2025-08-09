import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export interface CreateAthletePayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender?: string;
  allergies?: string;
  experience: 'beginner' | 'intermediate' | 'advanced' | 'elite';
  isGymMember?: boolean;
}

export function useCreateAthlete() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (athlete: CreateAthletePayload) => {
      const response = await apiRequest("POST", "/api/parent/athletes", athlete);
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Get the parent ID from the returned athlete or from a stored value
      const parentId = data.parentId;
      if (parentId) {
        queryClient.invalidateQueries({ queryKey: [`/api/parents/${parentId}/athletes`] });
      }
      
      toast({
        title: "Athlete Created",
        description: `${variables.firstName} ${variables.lastName} has been successfully added.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Create Athlete",
        description: error.message || "There was an error creating the athlete. Please try again.",
        variant: "destructive",
      });
    },
  });
}
