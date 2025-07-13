import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { BookingFlowProvider } from "@/contexts/BookingFlowContext";
import { BookingWizard } from "./BookingWizard";
import type { Customer, Athlete } from "@shared/schema";

interface EnhancedBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerData?: Customer;
  selectedAthletes?: Athlete[];
  isNewCustomer?: boolean;
}

export function EnhancedBookingModal({ 
  isOpen, 
  onClose, 
  customerData, 
  selectedAthletes = [], 
  isNewCustomer = false 
}: EnhancedBookingModalProps) {
  // Determine flow type based on provided data
  const flowType: 'new-user' | 'athlete-modal' | 'parent-portal' = isNewCustomer ? 'new-user' : 
                   selectedAthletes.length > 0 ? 'athlete-modal' : 
                   'parent-portal';

  console.log("EnhancedBookingModal rendered with:", {
    isOpen,
    customerData: customerData ? {
      id: customerData.id,
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      emergencyContactName: customerData.emergencyContactName || '',
      emergencyContactPhone: customerData.emergencyContactPhone || ''
    } : null,
    selectedAthletes: selectedAthletes.length,
    isNewCustomer,
    flowType
  });

  const initialState = {
    parentId: customerData?.id,
    selectedAthletes: selectedAthletes.map(athlete => athlete.id),
    parentInfo: customerData ? {
      firstName: customerData.firstName || '',
      lastName: customerData.lastName || '',
      email: customerData.email || '',
      phone: customerData.phone || '',
      emergencyContactName: customerData.emergencyContactName || '',
      emergencyContactPhone: customerData.emergencyContactPhone || ''
    } : undefined
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Only allow closing via the X button - prevent click outside
      if (!open) return;
    }}>
      <DialogContent className="w-full h-full max-w-full max-h-full sm:max-w-4xl sm:max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        <VisuallyHidden>
          <DialogTitle>Book a Gymnastics Session</DialogTitle>
        </VisuallyHidden>
        <BookingFlowProvider flowType={flowType} initialState={initialState}>
          <BookingWizard onClose={onClose} />
        </BookingFlowProvider>
      </DialogContent>
    </Dialog>
  );
}