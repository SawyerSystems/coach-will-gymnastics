import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";  
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

interface Apparatus {
  id: number;
  name: string;
  sortOrder?: number;
}

interface FocusArea {
  id: number;
  name: string;
  apparatus_id: number;
  apparatusName?: string;
  level?: string;
}

interface TwoStepFocusAreasProps {
  selectedFocusAreas: FocusArea[];
  onFocusAreasChange: (focusAreas: FocusArea[]) => void;
  maxFocusAreas: number;
  lessonDuration: string;
}

export function TwoStepFocusAreas({ 
  selectedFocusAreas, 
  onFocusAreasChange, 
  maxFocusAreas,
  lessonDuration 
}: TwoStepFocusAreasProps) {
  const [currentStep, setCurrentStep] = useState<'apparatus' | 'focus-areas'>('apparatus');
  const [selectedApparatus, setSelectedApparatus] = useState<Apparatus | null>(null);
  const [warningMessage, setWarningMessage] = useState<string>('');

  // Fetch apparatus list
  const { data: apparatus = [], isLoading: isApparatusLoading } = useQuery<Apparatus[]>({
    queryKey: ['/api/apparatus'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch focus areas for selected apparatus
  const { data: focusAreas = [], isLoading: isFocusAreasLoading } = useQuery<FocusArea[]>({
    queryKey: ['/api/focus-areas', selectedApparatus?.id],
    queryFn: async () => {
      if (!selectedApparatus) return [];
      const response = await apiRequest('GET', `/api/focus-areas?apparatusId=${selectedApparatus.id}`);
      if (!response.ok) throw new Error('Failed to fetch focus areas');
      return response.json();
    },
    enabled: !!selectedApparatus,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Auto-trim focus areas if they exceed the limit
  useEffect(() => {
    if (selectedFocusAreas.length > maxFocusAreas) {
      const trimmedAreas = selectedFocusAreas.slice(0, maxFocusAreas);
      onFocusAreasChange(trimmedAreas);
      setWarningMessage(`Focus areas automatically reduced to ${maxFocusAreas} due to lesson duration.`);
      setTimeout(() => setWarningMessage(''), 5000);
    }
  }, [selectedFocusAreas, maxFocusAreas, onFocusAreasChange]);

  const selectApparatus = (selectedApp: Apparatus) => {
    setSelectedApparatus(selectedApp);
    setCurrentStep('focus-areas');
    setWarningMessage('');
  };

  const backToApparatus = () => {
    setCurrentStep('apparatus');
    setSelectedApparatus(null);
    setWarningMessage('');
  };

  const toggleFocusArea = (focusArea: FocusArea) => {
    const isSelected = selectedFocusAreas.some(area => area.id === focusArea.id);
    
    if (isSelected) {
      // Remove focus area
      const updated = selectedFocusAreas.filter(area => area.id !== focusArea.id);
      onFocusAreasChange(updated);
    } else {
      // Check if we can add more focus areas
      if (selectedFocusAreas.length >= maxFocusAreas) {
        setWarningMessage(`You can only select up to ${maxFocusAreas} focus areas for a ${lessonDuration} lesson.`);
        setTimeout(() => setWarningMessage(''), 5000);
        return;
      }
      
      // Add focus area with apparatus info
      const focusAreaWithApparatus = {
        ...focusArea,
        apparatusName: selectedApparatus?.name
      };
      const updated = [...selectedFocusAreas, focusAreaWithApparatus];
      onFocusAreasChange(updated);
    }
  };

  if (currentStep === 'apparatus') {
    return (
      <div className="space-y-4">
        <div>
          <Label className="text-base font-medium">Select Apparatus ({lessonDuration} lesson - up to {maxFocusAreas} focus areas)</Label>
          <p className="text-sm text-gray-600 mt-1">
            Select which apparatus you'd like to focus on during your lesson.
          </p>
        </div>

        {warningMessage && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertDescription className="text-orange-800">
              {warningMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Current Selection Display */}
        {selectedFocusAreas.length > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Current Focus Areas ({selectedFocusAreas.length}/{maxFocusAreas})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedFocusAreas.map((area, index) => (
                <Badge key={`${area.id}-${index}`} variant="default" className="bg-blue-600">
                  {area.apparatusName}: {area.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isApparatusLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apparatus.map((app) => (
              <Card 
                key={app.id} 
                className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-orange-200"
                onClick={() => selectApparatus(app)}
              >
                <CardHeader className="text-center">
                  <CardTitle className="text-lg">{app.name}</CardTitle>
                  <CardDescription>
                    Click to select focus areas
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button 
          type="button"
          variant="ghost" 
          size="sm" 
          onClick={backToApparatus}
          className="p-1"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <div>
          <Label className="text-base font-medium">
            Select {selectedApparatus?.name} Focus Areas
          </Label>
          <p className="text-sm text-gray-600">
            Choose specific skills to work on ({selectedFocusAreas.length}/{maxFocusAreas} selected)
          </p>
        </div>
      </div>

      {warningMessage && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertDescription className="text-orange-800">
            {warningMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Current Selection Display */}
      {selectedFocusAreas.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Current Focus Areas ({selectedFocusAreas.length}/{maxFocusAreas})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedFocusAreas.map((area, index) => (
              <Badge key={`${area.id}-${index}`} variant="default" className="bg-blue-600">
                {area.apparatusName}: {area.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {isFocusAreasLoading ? (
        <div className="grid grid-cols-1 gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : focusAreas.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No focus areas available for {selectedApparatus?.name}</p>
          <Button 
            type="button"
            variant="outline" 
            onClick={backToApparatus} 
            className="mt-4"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back to Apparatus Selection
          </Button>
        </div>
      ) : (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {focusAreas.map((focusArea) => {
            const isSelected = selectedFocusAreas.some(area => area.id === focusArea.id);
            return (
              <label 
                key={focusArea.id} 
                className={`flex items-center space-x-3 cursor-pointer p-3 rounded-lg border-2 transition-all ${
                  isSelected 
                    ? 'border-orange-500 bg-orange-50' 
                    : 'border-gray-200 hover:border-orange-200 hover:bg-orange-50'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleFocusArea(focusArea)}
                  className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <span className="text-sm font-medium">{focusArea.name}</span>
                {focusArea.level && (
                  <Badge variant="outline" className="text-xs">
                    {focusArea.level}
                  </Badge>
                )}
              </label>
            );
          })}
        </div>
      )}

      <div className="flex justify-between items-center pt-4">
        <Button 
          type="button"
          variant="outline" 
          onClick={backToApparatus}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back to Apparatus
        </Button>
        
        <div className="text-sm text-gray-600">
          {selectedFocusAreas.length} of {maxFocusAreas} selected
        </div>
      </div>
    </div>
  );
}
