import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGenders } from "@/hooks/useGenders";
import { useCreateAthlete } from "@/hooks/use-athlete";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface AddAthleteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddAthleteModal({ isOpen, onClose }: AddAthleteModalProps) {
  const { genderOptions } = useGenders();
  const { toast } = useToast();
  const createAthleteMutation = useCreateAthlete();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ageError, setAgeError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    allergies: "",
    experience: "beginner" as "beginner" | "intermediate" | "advanced"
  });
  
  // Function to calculate age and validate minimum age requirement
  const validateAge = (dateOfBirth: string) => {
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
  };
  
  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    if (field === 'dateOfBirth') {
      validateAge(value);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
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
      });
      
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        allergies: "",
        experience: "beginner"
      });
      
      // Refresh athletes list
      queryClient.invalidateQueries({ queryKey: ['/api/parent/athletes'] });
      
      // Close modal
      onClose();
    } catch (error) {
      console.error("Error creating athlete:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-lg md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-green-50 md:bg-white">
        <DialogHeader className="px-0 pt-0">
          <DialogTitle className="text-xl md:text-2xl text-blue-900">Add New Athlete</DialogTitle>
          <DialogDescription className="text-sm md:text-base text-gray-700">
            Enter the athlete's information to add them to your account
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
                className="min-h-[48px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
                className="min-h-[48px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select 
              value={formData.gender} 
              onValueChange={(value) => handleChange('gender', value)}
            >
              <SelectTrigger className="min-h-[48px]">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
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
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange('dateOfBirth', e.target.value)}
              required
              className={`min-h-[48px] ${ageError ? 'border-red-500' : ''}`}
            />
            {ageError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {ageError}
                </AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-muted-foreground">
              Athletes must be at least 6 years old to participate in lessons.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies or Medical Conditions (Optional)</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
              placeholder="Please list any allergies or medical conditions we should be aware of"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Experience Level</Label>
            <RadioGroup
              value={formData.experience}
              onValueChange={(value) => handleChange('experience', value as "beginner" | "intermediate" | "advanced")}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="beginner" id="beginner" />
                <Label htmlFor="beginner">Beginner (New to gymnastics)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="intermediate" id="intermediate" />
                <Label htmlFor="intermediate">Intermediate (1-2 years experience)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="advanced" id="advanced" />
                <Label htmlFor="advanced">Advanced (3+ years experience)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !!ageError}
              className="min-h-[48px]"
            >
              {isSubmitting ? "Creating..." : "Create Athlete"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
