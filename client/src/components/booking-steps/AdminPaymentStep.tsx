import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { useToast } from "@/hooks/use-toast";
// import { LESSON_TYPES } from "@/lib/constants";
import { useLessonTypes } from "@/hooks/useLessonTypes";
import { formatBookingDate } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

import { AlertCircle, CheckCircle, CreditCard, DollarSign, FileText } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "wouter";

export function AdminPaymentStep() {
  const { state, updateState } = useBookingFlow();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { byKey } = useLessonTypes();
  const lessonData = byKey(state.lessonType);
  const lessonPrice = lessonData?.price || 0;

  // No useEffect defaulting; initial defaults are set in UnifiedBookingModal

  const createAdminBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      console.log("Submitting booking data:", JSON.stringify(bookingData, null, 2));
      
      try {
        // Use apiRequest utility 
        const fetchResponse = await apiRequest('POST', '/api/admin/bookings', bookingData);
        
        // Get the response as text first
        const responseText = await fetchResponse.text();
        
        // Try to parse as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          console.error('Failed to parse response as JSON:', responseText);
          throw new Error(`Server returned invalid JSON: ${responseText.substring(0, 100)}...`);
        }
        
        // Check if request was successful based on HTTP status
        if (!fetchResponse.ok) {
          console.error('Server returned error status:', fetchResponse.status, data);
          throw new Error(`Error ${fetchResponse.status}: ${data.message || 'Unknown server error'}`);
        }
        
        // Additional check for success field
        if (!data.success) {
          throw new Error(data.message || "Booking creation failed without specific error");
        }
        
        return data;
      } catch (error) {
        console.error('Error in booking creation:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Reset processing state immediately
      setIsProcessing(false);
      
      toast({
        title: "Booking Created Successfully",
        description: `Booking #${data.booking?.id || 'New'} has been created.`,
      });
      // For retro-completed entries, enforce statuses explicitly post-create
      if (state.retroCompletedLesson && data?.booking?.id) {
        const bookingId = data.booking.id as number;
        // Ensure payment is session-paid
        apiRequest('PATCH', `/api/bookings/${bookingId}/payment-status`, { paymentStatus: 'session-paid' }).catch(() => {});
        // Ensure attendance is completed
        apiRequest('PATCH', `/api/bookings/${bookingId}/attendance-status`, { attendanceStatus: 'completed' }).catch(() => {});
      }
      
      // Update global state to reflect booking creation
      updateState({
        currentStep: 0,
        // Store the booking ID for reference if needed by parent components
        parentId: state.parentId // Keep the existing parent ID
      });
      
      // Reset flow and close modal will be handled by parent
    },
    onError: (error) => {
      // Reset processing state immediately
      setIsProcessing(false);
      
      console.error('Admin booking creation failed:', error);
      let errorMessage = "There was an error creating the booking. Please try again.";
      
      if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }
      
      // Show detailed error message
      toast({
        title: "Booking Creation Failed",
        description: errorMessage,
        variant: "destructive",
        duration: 6000, // Show longer for error messages
      });
    }
  });

  // Use a ref to track if a submission is in progress
  const isSubmittingRef = React.useRef(false);
  
  const handleCreateBooking = async () => {
    // Prevent multiple submissions using both state and ref
    if (isProcessing || createAdminBooking.isPending || isSubmittingRef.current) {
      console.log("Submission already in progress, preventing duplicate submit");
      return;
    }
    
    // Set the ref to true to prevent any possible race conditions
    isSubmittingRef.current = true;
    
    // More detailed validation with logging
    if (!state.parentInfo) {
      console.error("Missing parent info in booking state:", state);
      toast({
        title: "Parent Required",
        description: "Parent information is missing. Please go back and select a parent.",
        variant: "destructive",
      });
      return;
    }
    
    if (!state.selectedParent?.id) {
      console.error("Missing parent ID in booking state:", { 
        parentInfo: state.parentInfo,
        selectedParent: state.selectedParent,
        parentId: state.parentId
      });
      toast({
        title: "Parent Required",
        description: "Parent ID is missing. Please go back and reselect the parent.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate required athlete information with more detailed checks
    const hasValidSelectedAthletes = state.selectedAthletes && 
                                  Array.isArray(state.selectedAthletes) && 
                                  state.selectedAthletes.length > 0;
                                  
    const hasValidAthleteInfo = state.athleteInfo && 
                              Array.isArray(state.athleteInfo) && 
                              state.athleteInfo.length > 0 && 
                              state.athleteInfo.every(athlete => 
                                athlete.firstName && 
                                athlete.lastName && 
                                athlete.dateOfBirth);
                                
    if (!hasValidSelectedAthletes && !hasValidAthleteInfo) {
      console.error("Missing or invalid athlete data:", { 
        selectedAthletes: state.selectedAthletes,
        athleteInfo: state.athleteInfo
      });
      
      toast({
        title: "Athletes Required",
        description: "At least one valid athlete must be selected or created for this booking.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate payment inputs based on parent paid choice
    if (state.adminParentPaid) {
      if (!state.adminPaymentMethod) {
        toast({
          title: "Payment Method Required",
          description: "Select how the parent paid.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setIsProcessing(true);
    try {
      const rawFocusAreas = Array.isArray(state.focusAreas)
        ? state.focusAreas.filter((area): area is string => typeof area === 'string' && area.trim().length > 0)
        : [];

      let focusAreaOtherText = (state.focusAreaOther || '').trim();
      if (!focusAreaOtherText) {
        const existingOther = rawFocusAreas.find((area) => area.toLowerCase().startsWith('other:'));
        if (existingOther) {
          focusAreaOtherText = existingOther.slice(6).trim();
        }
      }

      const normalizedFocusAreas = Array.from(
        new Set(
          rawFocusAreas
            .map((area) => area.trim())
            .filter((area) => !area.toLowerCase().startsWith('other:'))
        )
      );

      if (focusAreaOtherText) {
        normalizedFocusAreas.push(`Other: ${focusAreaOtherText}`);
      }

      // Create a clean copy of the data - this helps avoid any unexpected reference issues
      const bookingData = {
        lessonType: state.lessonType,
        // Ensure we have valid athlete data - default to empty arrays if missing
        selectedAthletes: Array.isArray(state.selectedAthletes) ? [...state.selectedAthletes] : [],
        athleteInfo: Array.isArray(state.athleteInfo) ? state.athleteInfo.map(athlete => ({
          firstName: athlete.firstName || '',
          lastName: athlete.lastName || '',
          dateOfBirth: athlete.dateOfBirth || '',
          allergies: athlete.allergies || '',
          experience: athlete.experience || 'intermediate'
          // Note: gender is not included in the BookingFlowState athleteInfo type
        })) : [],
        // Include parent info with explicit ID and new parent flag
        parentInfo: state.selectedParent ? {
          firstName: state.selectedParent.firstName,
          lastName: state.selectedParent.lastName,
          email: state.selectedParent.email,
          phone: state.selectedParent.phone,
          emergencyContactName: state.selectedParent.emergencyContactName,
          emergencyContactPhone: state.selectedParent.emergencyContactPhone,
          id: state.selectedParent.id,
          isNewParentCreated: state.isNewParentCreated || false
        } : state.parentInfo ? {
          ...state.parentInfo,
          id: state.parentId,
          isNewParentCreated: state.isNewParentCreated || false
        } : null,
        selectedTimeSlot: state.selectedTimeSlot ? { ...state.selectedTimeSlot } : null,
  focusAreas: normalizedFocusAreas,
  focusAreaOther: focusAreaOtherText || undefined,
        // Include safety information with defaults
        safetyContact: state.safetyContact ? {
          ...state.safetyContact
        } : {
          dropoffPersonName: '',
          dropoffPersonRelationship: '',
          dropoffPersonPhone: '',
          pickupPersonName: '',
          pickupPersonRelationship: '',
          pickupPersonPhone: ''
        },
        adminPaymentMethod: state.adminPaymentMethod || 'pending',
        adminNotes: state.adminNotes || '',
        amount: lessonPrice,
        status: 'confirmed',
        // Payment: if parent paid, mark as paid appropriately; retro always session-paid
        paymentStatus: state.retroCompletedLesson ? 'session-paid' : (
          state.adminParentPaid ? (
            state.adminPaymentMethod === 'stripe' ? 'reservation-paid' : 'session-paid'
          ) : 'unpaid'
        ),
        // Attendance: mark completed for retro-completed flow, else based on payment method
        attendanceStatus: state.retroCompletedLesson ? 'completed' : (
          state.adminParentPaid ? 'confirmed' : 'pending'
        ),
        bookingMethod: 'admin',
        // Retroactive entries should not trigger emails
        ...(state.retroCompletedLesson ? {
          suppressEmails: true,
          sendConfirmationEmail: false,
          skipEmailNotifications: true
        } : {}),
        // Flag to indicate if a new parent was created
        isNewParentCreated: state.isNewParentCreated || false
      };

      // Log the request data for debugging
      console.log('Submitting admin booking with data:', {
        lessonType: bookingData.lessonType,
        athleteCount: bookingData.selectedAthletes?.length || 0,
        newAthleteCount: bookingData.athleteInfo?.length || 0,
        parentId: bookingData.parentInfo?.id,
        paymentMethod: bookingData.adminPaymentMethod,
        isNewParentCreated: bookingData.isNewParentCreated
      });
      
      const result = await createAdminBooking.mutateAsync(bookingData);
      console.log('Booking created successfully:', result);
      
      // If this was a new parent, redirect to the parent setup success page instead of regular flow
      if (bookingData.isNewParentCreated && bookingData.parentInfo?.email) {
        const emailParam = encodeURIComponent(bookingData.parentInfo.email);
        setLocation(`/parent-setup-success?email=${emailParam}`);
        return true;
      }
      // Do not send any follow-up emails for retro-completed flow
      if (state.retroCompletedLesson) {
        return true;
      }
      
      // Return success from the function to allow the modal to close
      return true;
    } catch (error) {
      console.error('Admin booking error:', error);
      // Don't swallow the error - allow it to bubble up
      return false;
    } finally {
      setIsProcessing(false);
      isSubmittingRef.current = false;
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    updateState({ 
      adminPaymentMethod: method as 'stripe' | 'cash' | 'check' | 'pending'
    });
  };

  const handleParentPaidToggle = (paid: boolean) => {
    updateState({ adminParentPaid: paid, adminPaymentMethod: paid ? (state.adminPaymentMethod || 'cash') : undefined });
  };

  const handleNotesChange = (notes: string) => {
    updateState({ adminNotes: notes });
  };

  return (
    <div className="space-y-6 py-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Admin Booking Completion</h2>
        <p className="text-muted-foreground">
          Review booking details and set payment method
        </p>
      </div>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Booking Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="font-medium">Lesson Type</Label>
              <p>{lessonData?.name}</p>
            </div>
            <div>
              <Label className="font-medium">Price</Label>
              <p>${lessonPrice}</p>
            </div>
            <div>
              <Label className="font-medium">Date & Time</Label>
              <p>
                {state.selectedTimeSlot?.date && formatBookingDate(state.selectedTimeSlot.date, 'MMMM d, yyyy')}
                {' at '}
                {state.selectedTimeSlot?.time}
              </p>
            </div>
            <div>
              <Label className="font-medium">Athletes</Label>
              <p>
                {state.athleteInfo.length > 0 
                  ? state.athleteInfo.map(a => `${a.firstName} ${a.lastName}`).join(', ')
                  : `${state.selectedAthletes.length} selected`
                }
              </p>
            </div>
            <div className="col-span-2">
              <Label className="font-medium">Parent</Label>
              <p>
                {state.parentInfo?.firstName} {state.parentInfo?.lastName}
                <br />
                {state.parentInfo?.email} • {state.parentInfo?.phone}
              </p>
            </div>
            <div className="col-span-2">
              <Label className="font-medium">Safety Information</Label>
              <div className="grid grid-cols-2 gap-2 mt-1 text-xs">
                <div>
                  <span className="font-semibold">Drop-off:</span>{' '}
                  {state.safetyContact?.willDropOff 
                    ? `Parent (${state.parentInfo?.firstName} ${state.parentInfo?.lastName})` 
                    : state.safetyContact?.dropoffPersonName 
                      ? `${state.safetyContact.dropoffPersonName} (${state.safetyContact.dropoffPersonRelationship})` 
                      : 'Not provided'}
                </div>
                <div>
                  <span className="font-semibold">Pick-up:</span>{' '}
                  {state.safetyContact?.willPickUp 
                    ? `Parent (${state.parentInfo?.firstName} ${state.parentInfo?.lastName})` 
                    : state.safetyContact?.pickupPersonName 
                      ? `${state.safetyContact.pickupPersonName} (${state.safetyContact.pickupPersonRelationship})` 
                      : 'Not provided'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Confirmation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Confirmation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Did the parent already pay?</Label>
            <div className="flex items-center gap-3">
              <Switch checked={!!state.adminParentPaid} onCheckedChange={(v) => handleParentPaidToggle(!!v)} />
              <span>{state.adminParentPaid ? 'Yes' : 'No'}</span>
            </div>
          </div>

          {state.adminParentPaid && (
            <div className="space-y-2">
              <Label>How did they pay?</Label>
              <Select 
                value={state.adminPaymentMethod || 'cash'} 
                onValueChange={handlePaymentMethodChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {state.adminParentPaid && state.adminPaymentMethod === 'stripe' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">Credit Card Payment (Stripe)</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                The booking will be marked as <b>paid</b> and <b>confirmed</b> immediately.
              </p>
            </div>
          )}

          {state.adminParentPaid && (state.adminPaymentMethod === 'cash' || state.adminPaymentMethod === 'check') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">In-Person Payment ({state.adminPaymentMethod === 'cash' ? 'Cash' : 'Check'})</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                The booking will be marked as <b>session paid</b> and <b>confirmed</b>.
              </p>
            </div>
          )}
          
          {!state.adminParentPaid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Pending Payment</span>
              </div>
              <p className="text-yellow-700 text-sm mt-1">
                The booking will be marked as <b>unpaid</b>. You'll need to update the payment later.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Notes (Optional)</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add any special notes about this booking..."
            value={state.adminNotes || ''}
            onChange={(e) => handleNotesChange(e.target.value)}
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Create Booking Button */}
      <div className="flex justify-center pt-4">
        <Button
          onClick={isProcessing || createAdminBooking.isPending || isSubmittingRef.current ? undefined : handleCreateBooking}
          disabled={isProcessing || createAdminBooking.isPending || isSubmittingRef.current || !state.adminPaymentMethod}
          size="lg"
          className={`min-w-[200px] ${(!state.adminPaymentMethod) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isProcessing || createAdminBooking.isPending || isSubmittingRef.current ? (
            <>
              <img src="/CWT_Circle_LogoSPIN.png" alt="Loading" className="h-4 w-4 mr-2 animate-spin" />
              Creating Booking...
            </>
          ) : !state.adminPaymentMethod ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Select Payment Method
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Booking
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
