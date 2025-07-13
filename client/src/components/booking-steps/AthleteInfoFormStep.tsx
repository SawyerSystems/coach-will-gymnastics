import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { GENDER_OPTIONS } from "@/lib/constants";
import { AlertCircle, PlusCircle, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

export function AthleteInfoFormStep() {
  const { state, updateState } = useBookingFlow();
  const [ageErrors, setAgeErrors] = useState<{ [key: number]: string }>({});

  // Function to calculate age and validate minimum age requirement
  const validateAge = (dateOfBirth: string, index: number) => {
    if (!dateOfBirth) {
      const errors = { ...ageErrors };
      delete errors[index];
      setAgeErrors(errors);
      return;
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 6) {
      setAgeErrors(prev => ({
        ...prev,
        [index]: `Athletes must be at least 6 years old. Current age: ${age} years.`
      }));
    } else {
      const errors = { ...ageErrors };
      delete errors[index];
      setAgeErrors(errors);
    }
  };

  const handleAddAthlete = () => {
    const newAthlete = {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      allergies: '',
      experience: 'beginner' as const,
      gender: '',
    };
    updateState({ athleteInfo: [...state.athleteInfo, newAthlete] });
  };

  const handleRemoveAthlete = (index: number) => {
    const updated = state.athleteInfo.filter((_, i) => i !== index);
    updateState({ athleteInfo: updated });
  };

  const handleAthleteChange = (index: number, field: string, value: string) => {
    const updated = [...state.athleteInfo];
    updated[index] = { ...updated[index], [field]: value };
    updateState({ athleteInfo: updated });

    // Validate age when date of birth changes
    if (field === 'dateOfBirth') {
      validateAge(value, index);
    }
  };

  // Initialize with one athlete if none exist
  useEffect(() => {
    if (state.athleteInfo.length === 0) {
      handleAddAthlete();
    }
  }, []); // Only run on mount

  // Ensure all athletes have the gender field (migration)
  useEffect(() => {
    const needsUpdate = state.athleteInfo.some(athlete => !athlete.hasOwnProperty('gender'));
    if (needsUpdate) {
      const updated = state.athleteInfo.map(athlete => ({
        ...athlete,
        gender: (athlete as any).gender || '',
      }));
      updateState({ athleteInfo: updated });
    }
  }, [state.athleteInfo.length]); // Run when athletes are added/removed

  const maxAthletes = state.lessonType.includes('semi-private') ? 2 : 1;

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Athlete Information</h3>
        <p className="text-muted-foreground">
          Tell us about your gymnast{state.lessonType.includes('semi-private') ? 's' : ''}
        </p>
      </div>

      {state.athleteInfo.map((athlete, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Athlete {state.athleteInfo.length > 1 ? index + 1 : ''}
              </CardTitle>
              {state.athleteInfo.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAthlete(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`firstName-${index}`}>First Name</Label>
                <Input
                  id={`firstName-${index}`}
                  value={athlete.firstName}
                  onChange={(e) => handleAthleteChange(index, 'firstName', e.target.value)}
                  required
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`lastName-${index}`}>Last Name</Label>
                <Input
                  id={`lastName-${index}`}
                  value={athlete.lastName}
                  onChange={(e) => handleAthleteChange(index, 'lastName', e.target.value)}
                  required
                  className="min-h-[48px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`gender-${index}`}>Gender</Label>
              <Select 
                value={(athlete as any).gender || ""} 
                onValueChange={(value) => handleAthleteChange(index, 'gender', value)}
              >
                <SelectTrigger className="min-h-[48px]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((gender) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
              <Input
                id={`dob-${index}`}
                type="date"
                value={athlete.dateOfBirth}
                onChange={(e) => handleAthleteChange(index, 'dateOfBirth', e.target.value)}
                required
                className={`min-h-[48px] ${ageErrors[index] ? 'border-red-500' : ''}`}
              />
              {ageErrors[index] && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {ageErrors[index]}
                  </AlertDescription>
                </Alert>
              )}
              <p className="text-sm text-muted-foreground">
                Athletes must be at least 6 years old to participate in lessons.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`allergies-${index}`}>Allergies or Medical Conditions (Optional)</Label>
              <Textarea
                id={`allergies-${index}`}
                value={athlete.allergies}
                onChange={(e) => handleAthleteChange(index, 'allergies', e.target.value)}
                placeholder="Please list any allergies or medical conditions we should be aware of"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Experience Level</Label>
              <RadioGroup
                value={athlete.experience}
                onValueChange={(value) => handleAthleteChange(index, 'experience', value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id={`beginner-${index}`} />
                  <Label htmlFor={`beginner-${index}`}>Beginner (New to gymnastics)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id={`intermediate-${index}`} />
                  <Label htmlFor={`intermediate-${index}`}>Intermediate (1-2 years experience)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id={`advanced-${index}`} />
                  <Label htmlFor={`advanced-${index}`}>Advanced (3+ years experience)</Label>
                </div>
              </RadioGroup>
            </div>
          </CardContent>
        </Card>
      ))}

      {state.lessonType.includes('semi-private') && state.athleteInfo.length < maxAthletes && (
        <Button 
          variant="outline" 
          onClick={handleAddAthlete}
          className="w-full"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Another Athlete
        </Button>
      )}
    </div>
  );
}