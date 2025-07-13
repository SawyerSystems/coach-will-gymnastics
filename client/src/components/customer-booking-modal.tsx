import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerIdentification } from './customer-identification';

interface CustomerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLessonType?: string;
  onOpenBookingModal?: (customerData: CustomerData | null, athleteData: AthleteData[], focusAreas: string[], isReturning: boolean) => void;
}

interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  waiverSigned: boolean;
  waiverSignedAt: string | null;
  waiverSignatureName: string | null;
}

interface AthleteData {
  id: string;
  name: string;
  dateOfBirth: string;
  allergies?: string;
  experience: 'beginner' | 'intermediate' | 'advanced';
}

export function CustomerBookingModal({ isOpen, onClose, initialLessonType, onOpenBookingModal }: CustomerBookingModalProps) {
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [athleteData, setAthleteData] = useState<AthleteData[]>([]);
  const [lastFocusAreas, setLastFocusAreas] = useState<string[]>([]);

  const handleCustomerIdentified = (customer: any, athletes: any[], lastAreas: string[] = []) => {
    setCustomerData(customer);
    setAthleteData(athletes);
    setLastFocusAreas(lastAreas);
    // Close this modal and open booking modal with data
    onClose();
    onOpenBookingModal?.(customer, athletes, lastAreas, true);
  };

  const handleNewCustomer = () => {
    // Close this modal and open booking modal without data
    onClose();
    onOpenBookingModal?.(null, [], [], false);
  };



  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book a Lesson</DialogTitle>
        </DialogHeader>
        
        <CustomerIdentification
          onCustomerIdentified={handleCustomerIdentified}
          onNewCustomer={handleNewCustomer}
        />
      </DialogContent>
    </Dialog>
  );
}