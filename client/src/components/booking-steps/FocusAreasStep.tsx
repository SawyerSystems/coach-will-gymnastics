import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { cn } from "@/lib/utils";
import { GYMNASTICS_EVENTS, LESSON_TYPES } from "@/lib/constants";
import { ChevronLeft, AlertCircle } from "lucide-react";

export function FocusAreasStep() {
  const { state, updateState } = useBookingFlow();
  const [selectedApparatus, setSelectedApparatus] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<'apparatus' | 'skills'>('apparatus');
  const [warningMessage, setWarningMessage] = useState<string>('');
  
  const selectedAreas = state.focusAreas || [];
  const lessonType = state.lessonType;
  
  // Get focus area limit from lesson type
  const getLessonTypeConfig = () => {
    if (!lessonType) return { maxFocusAreas: 2, duration: '30 minutes' };
    return LESSON_TYPES[lessonType as keyof typeof LESSON_TYPES] || { maxFocusAreas: 2, duration: '30 minutes' };
  };
  
  const lessonConfig = getLessonTypeConfig();
  const maxFocusAreas = lessonConfig.maxFocusAreas;
  const lessonDuration = lessonConfig.duration;

  // Available apparatus options including Side Quests
  const apparatusOptions = [
    { name: 'Tumbling', skills: GYMNASTICS_EVENTS.tumbling?.skills || [] },
    { name: 'Beam', skills: GYMNASTICS_EVENTS.beam?.skills || [] },
    { name: 'Bars', skills: GYMNASTICS_EVENTS.bars?.skills || [] },
    { name: 'Vault', skills: GYMNASTICS_EVENTS.vault?.skills || [] },
    { 
      name: 'Side Quests', 
      skills: GYMNASTICS_EVENTS["side-quests"]?.skills || []
    }
  ];

  // Auto-trim focus areas if lesson type changed and current selection exceeds limit
  const trimFocusAreasIfNeeded = () => {
    if (selectedAreas.length > maxFocusAreas) {
      const trimmedAreas = selectedAreas.slice(0, maxFocusAreas);
      updateState({ focusAreas: trimmedAreas });
      setWarningMessage(`Focus areas automatically reduced to ${maxFocusAreas} due to lesson type change.`);
      setTimeout(() => setWarningMessage(''), 5000);
    }
  };

  // Effect to handle lesson type changes
  useEffect(() => {
    trimFocusAreasIfNeeded();
  }, [lessonType, maxFocusAreas]);

  // Run trimming when lesson type changes
  useEffect(() => {
    if (selectedAreas.length > maxFocusAreas) {
      trimFocusAreasIfNeeded();
    }
  }, [lessonType, maxFocusAreas]);

  const toggleApparatus = (apparatus: string) => {
    const updated = selectedApparatus.includes(apparatus)
      ? selectedApparatus.filter(a => a !== apparatus)
      : [...selectedApparatus, apparatus];
    
    // Allow up to maxFocusAreas apparatus selection
    if (updated.length <= maxFocusAreas) {
      setSelectedApparatus(updated);
      setWarningMessage('');
    } else {
      const limitMessage = lessonDuration.includes('30') 
        ? "Limit reached: You can only choose up to 2 focus areas for 30-minute lessons."
        : "Limit reached: You can only select up to 4 focus areas for a 1-hour session.";
      setWarningMessage(limitMessage);
    }
  };

  const proceedToSkills = () => {
    if (selectedApparatus.length > 0) {
      setCurrentStep('skills');
      setWarningMessage('');
    }
  };

  const backToApparatus = () => {
    setCurrentStep('apparatus');
    setWarningMessage('');
  };

  const toggleSkill = (apparatus: string, skill: string) => {
    const skillKey = `${apparatus}: ${skill}`;
    const currentAreas = selectedAreas || [];
    
    if (currentAreas.includes(skillKey)) {
      // Remove skill
      const updatedAreas = currentAreas.filter(a => a !== skillKey);
      updateState({ focusAreas: updatedAreas });
      setWarningMessage('');
    } else {
      // Add skill with limit check
      if (currentAreas.length >= maxFocusAreas) {
        const limitMessage = lessonDuration.includes('30') 
          ? "Limit reached: You can only choose up to 2 focus areas for 30-minute lessons."
          : "Limit reached: You can only select up to 4 focus areas for a 1-hour session.";
        setWarningMessage(limitMessage);
        return;
      }
      
      const updatedAreas = [...currentAreas, skillKey];
      updateState({ focusAreas: updatedAreas });
      setWarningMessage('');
    }
  };

  // Client-side validation for form submission
  const validateCurrentFocusAreas = () => {
    if (selectedAreas.length === 0) {
      setWarningMessage('Please select at least one focus area before continuing.');
      return false;
    }
    
    if (selectedAreas.length > maxFocusAreas) {
      const limitMessage = lessonDuration.includes('30') 
        ? "Limit reached: You can only choose up to 2 focus areas for 30-minute lessons."
        : "Limit reached: You can only select up to 4 focus areas for a 1-hour session.";
      setWarningMessage(limitMessage);
      return false;
    }
    
    return true;
  };

  if (currentStep === 'apparatus') {
    return (
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Step 1: Choose Apparatus</h2>
          <p className="text-muted-foreground">
            Select up to {maxFocusAreas} apparatus you'd like to focus on during your {lessonDuration} lesson.
          </p>
          <p className="text-sm text-orange-600">
            Selected: {selectedApparatus.length}/{maxFocusAreas}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apparatusOptions.map((apparatus) => (
            <Card 
              key={apparatus.name}
              className={cn(
                "cursor-pointer transition-all border-2",
                selectedApparatus.includes(apparatus.name)
                  ? "border-orange-500 bg-orange-50"
                  : "border-gray-200 hover:border-gray-300",
                selectedApparatus.length >= maxFocusAreas && !selectedApparatus.includes(apparatus.name)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              )}
              onClick={() => toggleApparatus(apparatus.name)}
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center justify-between">
                  {apparatus.name}
                  {selectedApparatus.includes(apparatus.name) && (
                    <Badge variant="default" className="bg-orange-500">
                      Selected
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {apparatus.skills.length} skills available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {apparatus.skills.slice(0, 3).join(', ')}
                  {apparatus.skills.length > 3 && '...'}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Warning Message */}
        {warningMessage && (
          <Alert className="border-orange-500 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              {warningMessage}
            </AlertDescription>
          </Alert>
        )}

        {selectedApparatus.length > 0 && (
          <div className="flex justify-center">
            <Button onClick={proceedToSkills} className="min-h-[48px]">
              Continue to Skills Selection
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Step 2: Choose Skills</h2>
        <p className="text-muted-foreground">
          Select specific skills you'd like to work on for each apparatus.
        </p>
        <p className="text-sm text-orange-600">
          Selected: {selectedAreas.length}/{maxFocusAreas} Focus Areas
        </p>
      </div>

      <Button
        variant="outline"
        onClick={backToApparatus}
        className="mb-4"
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Apparatus Selection
      </Button>

      <div className="space-y-4">
        {selectedApparatus.map((apparatus) => {
          const apparatusData = apparatusOptions.find(a => a.name === apparatus);
          if (!apparatusData) return null;

          const selectedSkillsForApparatus = selectedAreas.filter(area => 
            area.startsWith(`${apparatus}:`)
          );

          return (
            <Card key={apparatus}>
              <CardHeader>
                <CardTitle className="text-lg">{apparatus}</CardTitle>
                <CardDescription>
                  {selectedSkillsForApparatus.length} skill(s) selected
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {apparatusData.skills.map((skill) => {
                    const skillKey = `${apparatus}: ${skill}`;
                    const isSelected = selectedAreas.includes(skillKey);
                    const isDisabled = !isSelected && selectedAreas.length >= maxFocusAreas;
                    
                    return (
                      <Button
                        key={skill}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => toggleSkill(apparatus, skill)}
                        disabled={isDisabled}
                        className={cn(
                          "h-auto p-3 text-sm text-left justify-start",
                          isSelected && "ring-2 ring-orange-500",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {skill}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Warning Message */}
      {warningMessage && (
        <Alert className="border-orange-500 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {warningMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Show selected skills summary */}
      {selectedAreas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selected Skills ({selectedAreas.length}/{maxFocusAreas})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedAreas.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                  <button
                    onClick={() => {
                      const [apparatus, skill] = area.split(': ');
                      toggleSkill(apparatus, skill);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Export validation function for use by parent components
export const validateFocusAreas = (focusAreas: string[], lessonType: string) => {
  const lessonConfig = LESSON_TYPES[lessonType as keyof typeof LESSON_TYPES] || { maxFocusAreas: 2, duration: '30 minutes' };
  const maxFocusAreas = lessonConfig.maxFocusAreas;
  const lessonDuration = lessonConfig.duration;

  if (focusAreas.length === 0) {
    return { isValid: false, message: 'Please select at least one focus area before continuing.' };
  }
  
  if (focusAreas.length > maxFocusAreas) {
    const limitMessage = lessonDuration.includes('30') 
      ? "Limit reached: You can only choose up to 2 focus areas for 30-minute lessons."
      : "Limit reached: You can only select up to 4 focus areas for a 1-hour session.";
    return { isValid: false, message: limitMessage };
  }
  
  return { isValid: true, message: '' };
};