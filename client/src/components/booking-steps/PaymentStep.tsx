import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { useToast } from "@/hooks/use-toast";
import { BOOKING_FLOWS, BookingFlowType } from "@/contexts/BookingFlowContext";
import { useStripePricing } from "@/hooks/useStripePricing";
import { useFocusAreas } from "@/hooks/useFocusAreas";
import { LESSON_TYPES, LESSON_TYPE_IDS } from "@/lib/constants";
import { formatBookingDate } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, CreditCard, Info, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export function PaymentStep() {
  const { state, updateState } = useBookingFlow();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [athleteNames, setAthleteNames] = useState<string[]>([]);
  const { getReservationFee, isLoading: isPricingLoading } = useStripePricing();
  const { mapFocusAreaNamesToIds, isLoading: areFocusAreasLoading } = useFocusAreas();
  
  // Check if athlete is selected and redirect if needed
  useEffect(() => {
    // Skip check for admin flows and 'new-user' flow (which creates athlete later)
    if (state.flowType.startsWith('admin-') || state.flowType === 'new-user') {
      return;
    }
    
    // Check if athlete is selected for parent-portal and athlete-modal flows
    if (state.selectedAthletes.length === 0) {
      // Determine which step we should navigate to
      const targetStep = state.flowType === 'parent-portal' ? 'athleteSelect' : 'athleteInfoForm';
      const targetStepIndex = BOOKING_FLOWS[state.flowType as BookingFlowType].indexOf(targetStep);
      
      if (targetStepIndex >= 0) {
        console.log('⚠️ No athlete selected in PaymentStep! Redirecting to', targetStep);
        
        toast({
          title: "Athlete Selection Required",
          description: "Please select or create an athlete before proceeding to payment.",
          variant: "destructive",
        });
        
        // Update step in next render cycle to avoid state update during render
        setTimeout(() => {
          updateState({ currentStep: targetStepIndex });
        }, 0);
      }
    }
  }, [state.flowType, state.selectedAthletes, updateState, toast]);

  // Fetch existing athlete names if needed
  const { data: existingAthletes } = useQuery({
    queryKey: ['/api/athletes', state.selectedAthletes],
    queryFn: async () => {
      if (!state.selectedAthletes || state.selectedAthletes.length === 0) return [];

      const athletePromises = state.selectedAthletes.map(async athleteId => {
        const response = await apiRequest('GET', `/api/athletes/${athleteId}`);
        return response.json();
      });

      return Promise.all(athletePromises);
    },
    enabled: state.flowType !== 'new-user' && state.selectedAthletes.length > 0,
    retry: false,
  });

  // Set athlete names based on flow type
  useEffect(() => {
    if (state.flowType === 'new-user') {
      // For new users, use the athlete info from the form
      setAthleteNames(state.athleteInfo.map(a => `${a.firstName} ${a.lastName}`));
    } else if (existingAthletes && existingAthletes.length > 0) {
      // For existing users, use fetched athlete data
      setAthleteNames(existingAthletes.map(a => a.name || `${a.firstName} ${a.lastName}`));
    }
  }, [state.flowType, state.athleteInfo, existingAthletes]);

  const createBooking = useMutation({
    mutationFn: async () => {
      const lessonEntry = Object.entries(LESSON_TYPES).find(
        ([key]) => key === state.lessonType
      );

      if (!lessonEntry) {
        throw new Error('Invalid lesson type');
      }

      const [lessonKey, lessonData] = lessonEntry;
      
      // Validate lessonTypeId exists for the selected lesson type
      if (!LESSON_TYPE_IDS[state.lessonType]) {
        console.error(`No lesson type ID mapping found for "${state.lessonType}"`);
        throw new Error(`Unknown lesson type: ${state.lessonType}`);
      }
      
      // Check if we have an "Other" focus area and handle separately
      const focusAreasList = state.focusAreas.length > 0 ? state.focusAreas : ['General Skills'];
      const hasOtherFocusArea = focusAreasList.includes('Other');
      const focusAreaOther = hasOtherFocusArea ? state.focusAreaOther : undefined;
      
      // Map focus areas to focus area IDs
      const focusAreaIds = mapFocusAreaNamesToIds(focusAreasList);
      
      // Prepare booking data based on flow type - aligned with insertBookingSchema
      let bookingData: any = {
        parentId: state.parentId, // Add parentId as required by schema
        lessonTypeId: LESSON_TYPE_IDS[state.lessonType], // Use shared constant mapping
        lessonType: state.lessonType, // Keep for backward compatibility
        preferredDate: state.selectedTimeSlot?.date,
        preferredTime: state.selectedTimeSlot?.time,
        focusAreaIds: focusAreaIds, // Use mapped IDs instead of names
        focusAreaOther: focusAreaOther, // Include other focus area text if applicable
        parentFirstName: state.parentInfo?.firstName,
        parentLastName: state.parentInfo?.lastName,
        parentEmail: state.parentInfo?.email,
        parentPhone: state.parentInfo?.phone,
        emergencyContactName: state.parentInfo?.emergencyContactName,
        emergencyContactPhone: state.parentInfo?.emergencyContactPhone,
        dropoffPersonName: state.safetyContact?.dropoffPersonName || null,
        dropoffPersonRelationship: state.safetyContact?.dropoffPersonRelationship === '' ? null : state.safetyContact?.dropoffPersonRelationship || null,
        dropoffPersonPhone: state.safetyContact?.dropoffPersonPhone || null,
        pickupPersonName: state.safetyContact?.pickupPersonName || null,
        pickupPersonRelationship: state.safetyContact?.pickupPersonRelationship === '' ? null : state.safetyContact?.pickupPersonRelationship || null,
        pickupPersonPhone: state.safetyContact?.pickupPersonPhone || null,
        // Removed unsupported fields:
        // - waiverSigned
        // - waiverSignedAt  
        // - waiverSignatureName
        // - reservationFeePaid
        // - amount
      };

      // Handle athlete data based on flow
      let athletes: any[] = [];
      if (state.flowType === 'new-user' && state.athleteInfo.length > 0) {
        // New athletes
        athletes = state.athleteInfo.map((athlete, index) => ({
          athleteId: null, // Assuming athleteId is generated by the backend
          slotOrder: index + 1,
          name: `${athlete.firstName} ${athlete.lastName}`,
          dateOfBirth: athlete.dateOfBirth,
          allergies: athlete.allergies || '',
          experience: athlete.experience,
          gender: (athlete as any).gender || '',
        }));
      } else if (state.selectedAthletes.length > 0 && existingAthletes) {
        // Existing athletes - use fetched data
        athletes = existingAthletes.map((athlete, index) => ({
          athleteId: athlete.id, // Assuming 'id' is the athleteId
          slotOrder: index + 1,
          name: athlete.name || `${athlete.firstName} ${athlete.lastName}`,
          dateOfBirth: athlete.dateOfBirth,
          allergies: athlete.allergies || '',
          experience: athlete.experience || 'intermediate',
          gender: athlete.gender || '',
        }));
      }

      // Add athletes array to booking data
      bookingData.athletes = athletes;

      // Check if we need to fetch parentId for auth status
      if (!bookingData.parentId) {
        // Try to get parentId from parent auth status
        const { data: parentAuthData } = await apiRequest('GET', '/api/parent-auth/status');
        if (parentAuthData && parentAuthData.parentId) {
          bookingData.parentId = parentAuthData.parentId;
          console.log(`Detected parentId ${parentAuthData.parentId} from auth status`);
        }
      }

      console.log("Final booking data being sent:", JSON.stringify(bookingData, null, 2));
      console.log("Focus areas transformation:", {
        original: state.focusAreas,
        mapped: bookingData.focusAreaIds,
        hasOther: bookingData.focusAreaOther ? true : false,
        otherText: bookingData.focusAreaOther
      });
      console.log("Lesson type mapping:", {
        original: state.lessonType,
        mappedId: bookingData.lessonTypeId,
        mappingUsed: 'LESSON_TYPE_IDS constant'
      });
      
      // Determine API endpoint based on flow
      const endpoint = state.flowType === 'new-user' 
        ? '/api/booking/new-user-flow' 
        : '/api/bookings';

      const response = await apiRequest('POST', endpoint, bookingData);
      const booking = await response.json();
      return booking;
    },
    onSuccess: async (booking) => {
      try {
        setIsProcessing(true);

        // Pass full lesson price to backend - let backend determine actual Stripe charge
        const fullPrice = lessonInfo?.price || 0;

        // Create Stripe checkout session (backend will determine actual charge amount from Stripe products)
        const response = await apiRequest('POST', '/api/create-checkout-session', {
          amount: fullPrice, // Pass full price, backend will use actual Stripe product price
          bookingId: booking.id,
          isReservationFee: true,
          fullLessonPrice: fullPrice,
          lessonType: state.lessonType,
        });
        const checkoutData = await response.json();

        if (checkoutData.url) {
          // Redirect to Stripe checkout
          window.location.href = checkoutData.url;
        } else {
          throw new Error('No checkout URL received');
        }
      } catch (error) {
        console.error('Payment error:', error);
        toast({
          title: "Payment Error",
          description: "There was a problem setting up the payment. Please try again.",
          variant: "destructive",
        });
        setIsProcessing(false);
      }
    },
    onError: (error) => {
      console.error('Booking creation error:', error);
      toast({
        title: "Booking Error",
        description: "There was a problem creating your booking. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  });

  const lessonInfo = LESSON_TYPES[state.lessonType as keyof typeof LESSON_TYPES];
  const lessonPrice = lessonInfo?.price || 0;
  const reservationFee = getReservationFee(state.lessonType);
  const remainingBalance = lessonPrice - reservationFee;

  const handlePayment = () => {
    // Check if focus areas are still loading
    if (areFocusAreasLoading) {
      toast({
        title: "Loading Focus Areas",
        description: "Please wait while we prepare your booking data.",
        variant: "default",
      });
      return;
    }
    
    createBooking.mutate();
  };

  // Format date for display using our utility function
  const formattedDate = formatBookingDate(state.selectedTimeSlot?.date);

  return (
    <div className="space-y-6 py-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Complete Your Booking</h3>
        <p className="text-muted-foreground">
          Review your booking details and secure your spot with a reservation fee
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Booking Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Lesson Type:</span>
              <span className="font-medium">{lessonInfo?.name || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-medium">{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-medium">{state.selectedTimeSlot?.time || 'Not selected'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Athletes:</span>
              <span className="font-medium">
                {athleteNames.length > 0 ? athleteNames.join(', ') : 'Not selected'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Focus Areas:</span>
              <span className="font-medium text-right max-w-[200px]">
                {state.focusAreas.length > 0 ? state.focusAreas.join(', ') : 'General Skills'}
              </span>
            </div>
          </div>

          <div className="border-t pt-4 space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">Payment Breakdown</h4>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{lessonInfo?.name || 'Lesson'} Total:</span>
                <span className="font-medium">${lessonPrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reservation Fee (Due Now):</span>
                <span className="font-medium text-green-600">${reservationFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Remaining Balance:</span>
                <span className="font-medium">${remainingBalance}</span>
              </div>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Due Today:</span>
                <span className="text-2xl font-bold text-orange-600">
                  ${reservationFee.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Remaining ${remainingBalance} due at the time of the lesson
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-900">
              <p className="font-semibold mb-1">Reservation Fee Policy</p>
              <p>The ${reservationFee.toFixed(2)} reservation fee secures your lesson slot and will be applied toward your total lesson cost. 
                 The remaining balance of ${remainingBalance.toFixed(2)} is due at the time of your lesson.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Secure Payment</p>
              <p>You'll be redirected to our secure payment processor to complete your ${reservationFee.toFixed(2)} reservation fee. 
                 All payment information is encrypted and secure.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handlePayment}
        disabled={createBooking.isPending || isProcessing || areFocusAreasLoading}
        className="w-full min-h-[48px] text-lg"
        size="lg"
      >
        {createBooking.isPending || isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : areFocusAreasLoading ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Loading Focus Areas...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ${reservationFee.toFixed(2)} Reservation Fee
          </>
        )}
      </Button>

      {createBooking.isError && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-900">
            <strong>Error:</strong> {createBooking.error?.message || 'Failed to create booking. Please try again.'}
          </p>
        </div>
      )}
    </div>
  );
}