import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { LessonTypeStep } from "./booking-steps/LessonTypeStep";
import { AthleteSelectStep } from "./booking-steps/AthleteSelectStep";
import { AthleteInfoFormStep } from "./booking-steps/AthleteInfoFormStep";
import { FocusAreasStep } from "./booking-steps/FocusAreasStep";
import { ScheduleStep } from "./booking-steps/ScheduleStep";
import { ParentInfoStep } from "./booking-steps/ParentInfoStep";
import { SafetyStep } from "./booking-steps/SafetyStep";
import { WaiverStep } from "./booking-steps/WaiverStep";
import { PaymentStep } from "./booking-steps/PaymentStep";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface BookingWizardProps {
  onClose: () => void;
}

export function BookingWizard({ onClose }: BookingWizardProps) {
  const { state, nextStep, prevStep, getCurrentStepName, isLastStep, resetFlow } = useBookingFlow();

  // Step validation logic
  const isCurrentStepComplete = () => {
    const stepName = getCurrentStepName();
    
    switch (stepName) {
      case 'lessonType':
        return !!state.lessonType;
      case 'athleteSelect':
      case 'athleteSelectIfSemi':
        return state.selectedAthletes.length > 0;
      case 'athleteInfoForm':
        return state.athleteInfo.length > 0 && 
               state.athleteInfo.every(athlete => 
                 athlete.firstName && athlete.lastName && athlete.dateOfBirth && athlete.experience
               );
      case 'focusAreas':
        return state.focusAreas.length > 0;
      case 'schedule':
        return !!state.selectedTimeSlot?.date && !!state.selectedTimeSlot?.time;
      case 'parentConfirm':
      case 'parentInfoForm':
        return !!state.parentInfo?.firstName && 
               !!state.parentInfo?.lastName && 
               !!state.parentInfo?.email && 
               !!state.parentInfo?.phone &&
               !!state.parentInfo?.emergencyContactName &&
               !!state.parentInfo?.emergencyContactPhone;
      case 'safety':
        // Both questions must be answered first
        if (state.safetyContact?.willDropOff === undefined || state.safetyContact?.willPickUp === undefined) {
          return false;
        }
        
        // If both questions are answered "yes", step is complete
        if (state.safetyContact?.willDropOff === true && state.safetyContact?.willPickUp === true) {
          return true;
        }
        
        // If dropoff is "no", validate dropoff person fields
        const dropoffValid = state.safetyContact?.willDropOff === true || (
          state.safetyContact?.willDropOff === false &&
          !!state.safetyContact?.dropoffPersonName?.trim() && 
          !!state.safetyContact?.dropoffPersonRelationship?.trim() && 
          !!state.safetyContact?.dropoffPersonPhone?.trim()
        );
        
        // If pickup is "no", validate pickup person fields  
        const pickupValid = state.safetyContact?.willPickUp === true || (
          state.safetyContact?.willPickUp === false &&
          !!state.safetyContact?.pickupPersonName?.trim() && 
          !!state.safetyContact?.pickupPersonRelationship?.trim() && 
          !!state.safetyContact?.pickupPersonPhone?.trim()
        );
        
        return dropoffValid && pickupValid;
      case 'waiver':
        return state.waiverStatus.signed;
      case 'payment':
        return true; // Payment step handles its own completion
      default:
        return true;
    }
  };

  const renderStep = () => {
    const stepName = getCurrentStepName();
    
    switch (stepName) {
      case 'lessonType':
        return <LessonTypeStep />;
      case 'athleteSelect':
      case 'athleteSelectIfSemi':
        return <AthleteSelectStep skipIfNotSemi={stepName === 'athleteSelectIfSemi'} />;
      case 'athleteInfoForm':
        return <AthleteInfoFormStep />;
      case 'focusAreas':
        return <FocusAreasStep />;
      case 'schedule':
        return <ScheduleStep />;
      case 'parentConfirm':
      case 'parentInfoForm':
        return <ParentInfoStep isPrefilled={stepName === 'parentConfirm'} />;
      case 'safety':
        return <SafetyStep />;
      case 'waiver':
        return <WaiverStep />;
      case 'payment':
        return <PaymentStep />;
      default:
        return <div>Unknown step</div>;
    }
  };

  const handleClose = () => {
    resetFlow();
    onClose();
  };

  const getStepTitle = () => {
    const stepName = getCurrentStepName();
    const titles: Record<string, string> = {
      lessonType: 'Select Lesson Type',
      athleteSelect: 'Select Athletes',
      athleteSelectIfSemi: 'Select Athletes',
      athleteInfoForm: 'Athlete Information',
      focusAreas: 'Select Focus Areas',
      schedule: 'Choose Date & Time',
      parentConfirm: 'Confirm Your Information',
      parentInfoForm: 'Parent Information',
      safety: 'Safety & Pickup Information',
      waiver: 'Waiver Agreement',
      payment: 'Complete Payment',
    };
    return titles[stepName] || 'Booking';
  };

  const totalSteps = state.flowType === 'parent-portal' ? 7 : 
                    state.flowType === 'athlete-modal' ? 7 : 8;
  const progress = ((state.currentStep + 1) / totalSteps) * 100;

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 pb-4 relative">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 h-8 w-8 p-0"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-semibold pr-12">{getStepTitle()}</h2>
        <Progress value={progress} className="h-2 mt-4" />
      </div>
      
      <div className="flex-1 overflow-y-auto px-6">
        {renderStep()}
      </div>
      
      {getCurrentStepName() !== 'payment' && (
        <div className="flex justify-between items-center p-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={state.currentStep === 0}
            className="min-h-[48px]"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Step {state.currentStep + 1} of {totalSteps}
          </span>
          
          <Button
            onClick={nextStep}
            disabled={isLastStep() || !isCurrentStepComplete()}
            className="min-h-[48px]"
          >
            {isLastStep() ? 'Complete' : 'Next'}
            {!isLastStep() && <ChevronRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      )}
    </div>
  );
}