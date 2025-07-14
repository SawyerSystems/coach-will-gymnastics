import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { CheckCircle, Contact, Edit2, User } from "lucide-react";
import { useState } from "react";

interface ParentInfoStepProps {
  isPrefilled?: boolean;
}

export function ParentInfoStep({ isPrefilled = false }: ParentInfoStepProps) {
  const { state, updateState, nextStep } = useBookingFlow();
  const [isEditing, setIsEditing] = useState(!isPrefilled);

  console.log("ParentInfoStep state:", {
    parentId: state.parentId,
    flowType: state.flowType,
    parentInfo: state.parentInfo
  });

  const parentInfo = state.parentInfo || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  };

  const handleInputChange = (field: string, value: string) => {
    updateState({
      parentInfo: {
        ...parentInfo,
        [field]: value
      }
    });
  };

  const handleConfirmInfo = () => {
    nextStep();
  };

  const handleSaveChanges = () => {
    setIsEditing(false);
  };

  const isValid = parentInfo.firstName && parentInfo.lastName && 
                  parentInfo.email && parentInfo.phone && 
                  parentInfo.emergencyContactName && parentInfo.emergencyContactPhone;

  // If this is a returning parent with existing info (or at least email), show confirmation interface
  if (state.parentId && (parentInfo.firstName || parentInfo.email) && !isEditing) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Confirm Your Information</h2>
          <p className="text-muted-foreground">
            Please verify your contact information is up to date.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Parent Information
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">First Name</Label>
                <p className="text-lg">{parentInfo.firstName}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Last Name</Label>
                <p className="text-lg">{parentInfo.lastName}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Email Address</Label>
              <p className="text-lg">{parentInfo.email}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Phone Number</Label>
              <p className="text-lg">{parentInfo.phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contact className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Emergency Contact Name</Label>
              <p className="text-lg">{parentInfo.emergencyContactName || 'Not provided'}</p>
            </div>
            
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Emergency Contact Phone</Label>
              <p className="text-lg">{parentInfo.emergencyContactPhone || 'Not provided'}</p>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={handleConfirmInfo}
          className="w-full min-h-[48px]"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          Confirm Information
        </Button>
      </div>
    );
  }

  // If editing mode for returning parent
  if (state.flowType === 'parent-portal' && isEditing) {
    return (
      <div className="space-y-6 py-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Update Your Information</h2>
          <p className="text-muted-foreground">
            Make any necessary changes to your contact information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Parent Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={parentInfo.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="min-h-[48px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={parentInfo.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="min-h-[48px]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={parentInfo.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="min-h-[48px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={parentInfo.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="min-h-[48px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Contact className="h-5 w-5" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={parentInfo.emergencyContactName}
                onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
                placeholder="Full name of emergency contact"
                className="min-h-[48px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={parentInfo.emergencyContactPhone}
                onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
                placeholder="Emergency contact phone number"
                className="min-h-[48px]"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setIsEditing(false)}
            className="flex-1 min-h-[48px]"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveChanges}
            disabled={!isValid}
            className="flex-1 min-h-[48px]"
          >
            Save Changes
          </Button>
        </div>
      </div>
    );
  }

  // For new users or athlete-modal flow, show full form
  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Parent Information</h2>
        <p className="text-muted-foreground">
          We need your contact information for scheduling and emergency purposes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={parentInfo.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                required
                className="min-h-[48px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                value={parentInfo.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                required
                className="min-h-[48px]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={parentInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              required
              className="min-h-[48px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={parentInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 123-4567"
              required
              className="min-h-[48px]"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Contact className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Emergency Contact Name *</Label>
            <Input
              id="emergencyContactName"
              value={parentInfo.emergencyContactName}
              onChange={(e) => handleInputChange('emergencyContactName', e.target.value)}
              placeholder="Full name of emergency contact"
              required
              className="min-h-[48px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emergencyContactPhone">Emergency Contact Phone *</Label>
            <Input
              id="emergencyContactPhone"
              type="tel"
              value={parentInfo.emergencyContactPhone}
              onChange={(e) => handleInputChange('emergencyContactPhone', e.target.value)}
              placeholder="Emergency contact phone number"
              required
              className="min-h-[48px]"
            />
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              Emergency contact should be someone other than yourself who can be reached 
              if there's an issue during the lesson.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={nextStep}
        disabled={!isValid}
        className="w-full min-h-[48px]"
      >
        Next Step
      </Button>
    </div>
  );
}