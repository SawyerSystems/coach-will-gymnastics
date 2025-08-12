import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ParentModal, ParentModalSection, ParentModalGrid } from "@/components/parent-ui/ParentModal";
import { ParentFormInput, ParentFormTextarea, ParentFormSelectTrigger, Select, SelectContent, SelectItem, SelectValue } from "@/components/parent-ui/ParentFormComponents";
import { useGenders } from "@/hooks/useGenders";
import { useCreateAthlete } from "@/hooks/use-athlete";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { FormEvent, useState, useCallback, useEffect, useRef, memo } from "react";
import { Switch } from "@/components/ui/switch";
import { useQueryClient } from "@tanstack/react-query";

interface AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAthleteModal = memo(function AddAthleteModal({ isOpen, onClose }: AddAthleteModalProps) {
  const { genderOptions } = useGenders();
  const { toast } = useToast();
  const createAthleteMutation = useCreateAthlete();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  
  // Refs for form inputs to manage focus
  const firstNameRef = useRef<HTMLInputElement>(null);
  const lastNameRef = useRef<HTMLInputElement>(null);
  
  // Form state - initialize with empty values
  const [formData, setFormData] = useState(() => ({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    allergies: "",
    experience: "beginner" as "beginner" | "intermediate" | "advanced",
    isGymMember: false,
  }));

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        allergies: "",
        experience: "beginner",
        isGymMember: false,
      });
      setAgeError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);
  
  // Function to calculate age and validate minimum age requirement
  const validateAge = useCallback((dateOfBirth: string) => {
    if (!dateOfBirth) {
      setAgeError(null);
      return true;
    }

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 6) {
      setAgeError(`Athletes must be at least 6 years old. Current age: ${age} years.`);
      return false;
    } else {
      setAgeError(null);
      return true;
    }
  }, []);

  const handleSwitchChange = useCallback((checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isGymMember: checked
    }));
  }, []);

  // Individual field handlers to prevent inline function creation
  const handleFirstNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      firstName: value
    }));
  }, []);

  const handleLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      lastName: value
    }));
  }, []);

  const handleDateOfBirthChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      dateOfBirth: value
    }));
    validateAge(value);
  }, [validateAge]);

  const handleAllergiesChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      allergies: e.target.value
    }));
  }, []);

  const handleGenderChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      gender: value
    }));
  }, []);

  const handleExperienceChange = useCallback((value: string) => {
    setFormData(prev => ({
      ...prev,
      experience: value as "beginner" | "intermediate" | "advanced"
    }));
  }, []);
  
  const handleSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    
    if (ageError) {
      toast({
        title: "Validation Error",
        description: "Please fix the age validation error before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.experience) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createAthleteMutation.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender || undefined,
        allergies: formData.allergies,
        experience: formData.experience,
        isGymMember: formData.isGymMember,
      });
      
      // Refresh athletes list
      queryClient.invalidateQueries({ queryKey: ['/api/parent/athletes'] });
      
      // Close modal (form will be reset by useEffect)
      onClose();
      
      toast({
        title: "Success",
        description: "Athlete created successfully!",
      });
    } catch (error) {
      console.error("Error creating athlete:", error);
      toast({
        title: "Error",
        description: "Failed to create athlete. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, ageError, createAthleteMutation, queryClient, onClose, toast]);
  
  return (
    <ParentModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Athlete"
      description="Enter the athlete's information to add them to your account"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <ParentModalSection title="Basic Information">
          <ParentModalGrid>
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#0F0276] dark:text-white">First Name</Label>
              <ParentFormInput
                key="firstName"
                ref={firstNameRef}
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName || ""}
                onChange={handleFirstNameChange}
                required
                autoComplete="given-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#0F0276] dark:text-white">Last Name</Label>
              <ParentFormInput
                key="lastName"
                ref={lastNameRef}
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName || ""}
                onChange={handleLastNameChange}
                required
                autoComplete="family-name"
              />
            </div>
          </ParentModalGrid>
        </ParentModalSection>

        <ParentModalSection title="Personal Details">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-[#0F0276] dark:text-white">Gender</Label>
              <Select 
                value={formData.gender} 
                onValueChange={handleGenderChange}
              >
                <ParentFormSelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </ParentFormSelectTrigger>
                <SelectContent>
                  {genderOptions.map((gender: string) => (
                    <SelectItem key={gender} value={gender}>
                      {gender}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth" className="text-[#0F0276] dark:text-white">Date of Birth</Label>
              <ParentFormInput
                key="dateOfBirth"
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleDateOfBirthChange}
                required
                autoComplete="bday"
                className={ageError ? 'border-red-500' : ''}
              />
              {ageError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {ageError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </ParentModalSection>

        <ParentModalSection title="Experience & Membership">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="isGymMember" className="text-[#0F0276] dark:text-white">Already in Gym Classes?</Label>
              <div className="flex items-center justify-between rounded-md border p-3 border-gray-300 dark:border-[#B8860B]">
                <div>
                  <p className="font-medium text-[#0F0276] dark:text-white">Gym Member</p>
                  <p className="text-sm text-[#0F0276]/60 dark:text-white/60">Toggle on if this athlete is already enrolled in gym classes.</p>
                </div>
                <Switch
                  id="isGymMember"
                  checked={formData.isGymMember}
                  onCheckedChange={handleSwitchChange}
                  aria-label="Already in Gym Classes?"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0F0276] dark:text-white">Experience Level</Label>
              <RadioGroup
                value={formData.experience}
                onValueChange={handleExperienceChange}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner" className="text-[#0F0276] dark:text-white">Beginner - New to gymnastics</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate" className="text-[#0F0276] dark:text-white">Intermediate - Some gymnastics experience</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced" className="text-[#0F0276] dark:text-white">Advanced - Significant gymnastics experience</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </ParentModalSection>

        <ParentModalSection title="Additional Information">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="allergies" className="text-[#0F0276] dark:text-white">Allergies or Medical Conditions (Optional)</Label>
              <ParentFormTextarea
                key="allergies"
                id="allergies"
                value={formData.allergies}
                onChange={handleAllergiesChange}
                placeholder="Please list any allergies or medical conditions we should be aware of"
                rows={3}
              />
            </div>
            <p className="text-sm text-[#0F0276]/60 dark:text-white/60">
              Athletes must be at least 6 years old to participate in lessons.
            </p>
          </div>
        </ParentModalSection>

        <div className="flex justify-end gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="text-[#0F0276] border-[#0F0276]/50 hover:bg-[#0F0276]/10 dark:text-white dark:border-white/50 dark:hover:bg-white/20"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || !!ageError}
            className="bg-[#0F0276] hover:bg-[#0F0276]/90 text-white dark:bg-[#B8860B] dark:hover:bg-[#B8860B]/90 dark:text-[#0F0276]"
          >
            {isSubmitting ? "Creating..." : "Create Athlete"}
          </Button>
        </div>
      </form>
    </ParentModal>
  );
});
