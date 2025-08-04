import { Button } from "@/components/ui/button";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { useToast } from "@/hooks/use-toast";
import { useWaiverStatus } from "@/hooks/use-waiver-status";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { UpdatedWaiverModal } from "../updated-waiver-modal";

export function WaiverStep() {
  const { state, updateState, nextStep } = useBookingFlow();
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [waiverData, setWaiverData] = useState<any>(null);
  const { toast } = useToast();

  // Get athlete info from booking flow state
  const athleteInfo = state.athleteInfo?.[0] || {};
  const athleteName = `${athleteInfo.firstName || ''} ${athleteInfo.lastName || ''}`.trim();

  // Get the selected athlete ID (if any)
  const selectedAthleteId = state.selectedAthletes[0];

  // Check if waiver already signed for this athlete
  const { data: waiverStatus, isLoading: waiverLoading } = useWaiverStatus(
    athleteName,
    athleteInfo.dateOfBirth
  );

  // Check parent authentication status to get the parentId
  const { data: parentAuthData } = useQuery({
    queryKey: ['/api/parent-auth/status'],
  }) as { data: { parentId?: number } };

  // Auto-skip if waiver already signed
  useEffect(() => {
    if (waiverStatus?.hasWaiver || state.waiverStatus.signed) {
      updateState({ 
        waiverStatus: { 
          signed: true, 
          signedAt: waiverStatus?.waiverSignedAt ? new Date(waiverStatus.waiverSignedAt) : new Date()
        } 
      });
      // Add a small delay to allow user to see the confirmation
      setTimeout(() => nextStep(), 1500);
    }
  }, [waiverStatus?.hasWaiver, state.waiverStatus.signed, updateState, nextStep]);

  // Show loading state while checking waiver status
  if (waiverLoading && athleteName) {
    return (
      <div className="space-y-6 py-4">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
          <h3 className="text-lg font-semibold text-blue-900">Checking Waiver Status</h3>
          <p className="text-sm text-blue-700 mt-2">
            Verifying if {athleteName} has a signed waiver on file...
          </p>
        </div>
      </div>
    );
  }

  if (state.waiverStatus.signed) {
    return (
      <div className="space-y-6 py-4">
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-900">Waiver Already Signed</h3>
          <p className="text-sm text-green-700 mt-2">
            You've already signed the waiver. Proceeding to payment...
          </p>
        </div>
      </div>
    );
  }

  const handleOpenWaiver = () => {
    setShowWaiverModal(true);
  };

  const handleWaiverSigned = (data: any) => {
    setWaiverData(data);
    updateState({ 
      waiverStatus: { 
        signed: true, 
        signedAt: new Date()
      } 
    });
    setShowWaiverModal(false);
    toast({
      title: "Waiver Signed Successfully",
      description: "Thank you for completing the waiver. You can now proceed to payment.",
    });
    nextStep();
  };

  // Get parent info from booking flow state
  const parentInfo = state.parentInfo || {};
  const bookingAthleteInfo = state.athleteInfo?.[0] || {};

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Waiver & Adventure Agreement</h3>
        <p className="text-muted-foreground">
          Welcome to the journey! Every hero needs a guide, and every quest begins with a few ground rules.
        </p>
      </div>

      <div className="bg-amber-50 p-6 rounded-lg text-center">
        <FileText className="h-12 w-12 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-semibold text-amber-900 mb-2">
          CoachWillTumbles.com Waiver Adventure Agreement
        </h3>
        <p className="text-amber-700 text-sm mb-4">
          Before we can proceed with your booking, we need you to review and sign our comprehensive waiver and adventure agreement.
        </p>
        <Button
          onClick={handleOpenWaiver}
          className="bg-amber-500 hover:bg-amber-600 text-white"
        >
          <FileText className="h-4 w-4 mr-2" />
          Sign Waiver & Adventure Agreement
        </Button>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-sm text-yellow-900">
          <strong>Important:</strong> This waiver must be signed by a parent or legal guardian. 
          By accepting, you confirm you have the legal authority to sign on behalf of the athlete.
        </p>
      </div>

      {/* Updated Waiver Modal */}
      <UpdatedWaiverModal
        isOpen={showWaiverModal}
        onClose={() => setShowWaiverModal(false)}
        onWaiverSigned={handleWaiverSigned}
        bookingData={{
          athleteName: athleteName || "",
          parentName: `${(parentInfo as any)?.firstName || ''} ${(parentInfo as any)?.lastName || ''}`.trim() || "",
          emergencyContactNumber: (parentInfo as any)?.emergencyContactPhone || "",
          relationshipToAthlete: "Parent/Guardian",
        }}
        parentId={state.parentId || parentAuthData?.parentId}
        athleteId={selectedAthleteId}
        athleteData={selectedAthleteId ? undefined : {
          name: athleteName,
          dateOfBirth: athleteInfo.dateOfBirth,
          gender: (athleteInfo as any).gender,
          allergies: athleteInfo.allergies,
          experience: athleteInfo.experience
        }}
      />
    </div>
  );
}