import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBookingFlow } from "@/contexts/BookingFlowContext";
import { useStripePricing } from "@/hooks/use-stripe-products";
import { useToast } from "@/hooks/use-toast";
import { LESSON_TYPES } from "@/lib/constants";
import { formatBookingDate } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";

import { CheckCircle, CreditCard, DollarSign, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

export function AdminPaymentStep() {
  const { state, updateState } = useBookingFlow();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const { getLessonPrice } = useStripePricing();

  const lessonData = LESSON_TYPES[state.lessonType as keyof typeof LESSON_TYPES];
  const lessonPrice = getLessonPrice(state.lessonType);

  const createAdminBooking = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest('POST', '/api/admin/bookings', bookingData);
      return await response.json();
    },
    onSuccess: (booking) => {
      toast({
        title: "Booking Created Successfully",
        description: `Booking #${booking.id} has been created.`,
      });
      // Reset flow and close modal (handled by parent)
    },
    onError: (error) => {
      console.error('Admin booking creation failed:', error);
      toast({
        title: "Booking Creation Failed",
        description: "There was an error creating the booking. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleCreateBooking = async () => {
    setIsProcessing(true);
    
    try {
      const bookingData = {
        lessonType: state.lessonType,
        selectedAthletes: state.selectedAthletes,
        athleteInfo: state.athleteInfo,
        parentInfo: state.parentInfo,
        selectedTimeSlot: state.selectedTimeSlot,
        focusAreas: state.focusAreas,
        adminPaymentMethod: state.adminPaymentMethod || 'pending',
        adminNotes: state.adminNotes || '',
        amount: lessonPrice,
        status: 'confirmed',
        paymentStatus: state.adminPaymentMethod === 'pending' ? 'unpaid' : 'paid',
        bookingMethod: 'admin'
      };

      await createAdminBooking.mutateAsync(bookingData);
    } catch (error) {
      console.error('Admin booking error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentMethodChange = (method: string) => {
    updateState({ 
      adminPaymentMethod: method as 'stripe' | 'cash' | 'check' | 'pending'
    });
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
          </div>
        </CardContent>
      </Card>

      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>How will this booking be paid?</Label>
            <Select 
              value={state.adminPaymentMethod || 'pending'} 
              onValueChange={handlePaymentMethodChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Payment</SelectItem>
                <SelectItem value="stripe">Credit Card (Stripe)</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {state.adminPaymentMethod === 'stripe' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <CreditCard className="h-4 w-4" />
                <span className="font-medium">Stripe Payment</span>
              </div>
              <p className="text-blue-700 text-sm mt-1">
                A payment link will be sent to the parent's email for online payment.
              </p>
            </div>
          )}

          {(state.adminPaymentMethod === 'cash' || state.adminPaymentMethod === 'check') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">In-Person Payment</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                Booking will be marked as paid. Collect {state.adminPaymentMethod} during the lesson.
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
          onClick={handleCreateBooking}
          disabled={isProcessing || createAdminBooking.isPending}
          size="lg"
          className="min-w-[200px]"
        >
          {isProcessing || createAdminBooking.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Booking...
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
