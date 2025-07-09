import { useState } from "react";
import { Customer, Athlete } from "@shared/schema";
import { BookingLoginModal } from "./booking-login-modal";
import { EnhancedBookingModal } from "./enhanced-booking-modal";

interface ParentIdentificationEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onParentConfirmed: (data: {
    customer: Customer;
    selectedAthletes: Athlete[];
    isNewCustomer: boolean;
  }) => void;
}

export function CustomerIdentificationEnhanced({ 
  isOpen, 
  onClose, 
  onParentConfirmed 
}: ParentIdentificationEnhancedProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [parentData, setParentData] = useState<Customer | null>(null);
  const [isNewParent, setIsNewParent] = useState(false);

  console.log("CustomerIdentificationEnhanced - isOpen:", isOpen, "step:", showBookingModal ? "booking" : "login");

  const handleLoginSuccess = (parent: Customer | null) => {
    if (parent) {
      // Existing parent logged in
      setParentData(parent);
      setIsNewParent(false);
    } else {
      // New parent flow
      setParentData(null);
      setIsNewParent(true);
    }
    
    // Close login modal and open booking modal
    onClose();
    setShowBookingModal(true);
  };

  const handleBookingClose = () => {
    setShowBookingModal(false);
    setParentData(null);
    setIsNewParent(false);
  };

  return (
    <>
      <BookingLoginModal
        isOpen={isOpen}
        onClose={onClose}
        onLoginSuccess={handleLoginSuccess}
      />
      
      {showBookingModal && (
        <EnhancedBookingModal
          isOpen={showBookingModal}
          onClose={handleBookingClose}
          customerData={parentData || undefined}
          selectedAthletes={[]}
          isNewCustomer={isNewParent}
        />
      )}
    </>
  );
}