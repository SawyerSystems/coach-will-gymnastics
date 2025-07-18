import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { useQuery } from "@tanstack/react-query";
import { PlusCircle, User } from "lucide-react";
import { useEffect, useState } from "react";

interface AthleteSelectStepProps {
  skipIfNotSemi?: boolean;
}

export function AthleteSelectStep({ skipIfNotSemi = false }: AthleteSelectStepProps) {
  const { state, updateState, nextStep } = useBookingFlow();
  const [showNewAthleteOption, setShowNewAthleteOption] = useState(false);
  
  // For admin flows, fetch all athletes; for parent flows, fetch parent's athletes
  const isAdminFlow = state.isAdminFlow || state.flowType.startsWith('admin-');
  
  const { data: parentData } = useQuery({
    queryKey: ['/api/parent-auth/status'],
    enabled: !isAdminFlow,
  }) as { data: any };

  const parentId = state.parentId || parentData?.parentId;

  const { data: athletes = [] } = useQuery({
    queryKey: isAdminFlow ? ['/api/athletes'] : [`/api/parents/${parentId}/athletes`],
    enabled: isAdminFlow || !!parentId,
  }) as { data: any[] };

  // Auto-skip for non-semi-private lessons
  useEffect(() => {
    if (skipIfNotSemi && !state.lessonType.includes('semi-private')) {
      nextStep();
    }
  }, [skipIfNotSemi, state.lessonType, nextStep]);

  const handleAthleteToggle = (athleteId: number) => {
    const currentSelected = state.selectedAthletes;
    const isSelected = currentSelected.includes(athleteId);
    
    if (isSelected) {
      updateState({ 
        selectedAthletes: currentSelected.filter(id => id !== athleteId) 
      });
    } else {
      // For semi-private, limit to 2 athletes
      if (state.lessonType.includes('semi-private') && currentSelected.length >= 2) {
        return;
      }
      updateState({ 
        selectedAthletes: [...currentSelected, athleteId] 
      });
    }
  };

  const handleAddNewAthlete = () => {
    if (isAdminFlow) {
      // For admin flows, show option to create new athlete
      setShowNewAthleteOption(true);
    } else {
      // For public flows, switch to new athlete form flow
      updateState({ flowType: 'new-user' });
    }
  };

  const handleCreateNewAthlete = () => {
    // Switch to athlete info form step to create new athlete
    if (isAdminFlow) {
      updateState({ 
        flowType: 'admin-new-athlete',
        currentStep: 1, // Go to athlete info form step
        athleteInfo: [] // Clear any existing athlete info
      });
    }
  };

  if (skipIfNotSemi && !state.lessonType.includes('semi-private')) {
    return null;
  }

  const maxAthletes = state.lessonType.includes('semi-private') ? 2 : 1;

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Athletes</h3>
        <p className="text-muted-foreground">
          {isAdminFlow 
            ? `Choose from existing athletes or create new ones for this ${state.lessonType} lesson`
            : state.lessonType.includes('semi-private') 
              ? `Choose up to 2 athletes for this semi-private lesson`
              : `Select the athlete for this private lesson`}
        </p>
      </div>

      {/* Admin Parent Selection */}
      {isAdminFlow && showNewAthleteOption && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Create New Athlete
            </CardTitle>
            <div className="space-y-4">
              <p className="text-sm text-blue-700">
                Create a new athlete and associated parent account for this booking.
              </p>
              <div className="flex gap-3">
                <Button onClick={handleCreateNewAthlete} size="sm">
                  Create New Athlete
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowNewAthleteOption(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>
      )}

      <div className="space-y-3">
        {athletes.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {isAdminFlow ? "No athletes found" : "No athletes registered yet"}
            </p>
            <Button onClick={handleAddNewAthlete} variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add First Athlete
            </Button>
          </Card>
        ) : (
          athletes.map((athlete: any) => (
            <Card 
              key={athlete.id}
              className={`cursor-pointer transition-all ${
                state.selectedAthletes.includes(athlete.id)
                  ? 'ring-2 ring-orange-500 border-orange-500'
                  : 'hover:border-gray-400'
              }`}
              onClick={() => handleAthleteToggle(athlete.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Checkbox 
                    id={`athlete-${athlete.id}`}
                    checked={state.selectedAthletes.includes(athlete.id)}
                    onCheckedChange={() => handleAthleteToggle(athlete.id)}
                  />
                  <Label htmlFor={`athlete-${athlete.id}`} className="cursor-pointer flex-1">
                    <CardTitle className="text-base">
                      {athlete.firstName && athlete.lastName 
                        ? `${athlete.firstName} ${athlete.lastName}`
                        : athlete.name}
                    </CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                      Age: {(() => {
                        const today = new Date();
                        const [year, month, day] = athlete.dateOfBirth.split('-').map(Number);
                        let age = today.getFullYear() - year;
                        const monthDiff = today.getMonth() + 1 - month;
                        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
                          age--;
                        }
                        return age;
                      })()} • 
                      Experience: {athlete.experience}
                      {isAdminFlow && athlete.parentId && (
                        <span> • Parent ID: {athlete.parentId}</span>
                      )}
                    </div>
                  </Label>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {athletes.length > 0 && !showNewAthleteOption && (
        <Button 
          variant="outline" 
          onClick={handleAddNewAthlete}
          className="w-full"
          disabled={state.selectedAthletes.length >= maxAthletes}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          {isAdminFlow ? "Create New Athlete" : "Add New Athlete"}
        </Button>
      )}

      {state.lessonType.includes('semi-private') && state.selectedAthletes.length === 1 && (
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-900">
            <strong>Note:</strong> You've selected 1 athlete for a semi-private lesson. 
            You can add another athlete or continue with just one (the price remains the same).
          </p>
        </div>
      )}
    </div>
  );
}