import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Calendar,
  User,
  Clock,
  DollarSign,
  Mail,
  Loader2,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { LESSON_TYPES } from "@/lib/constants";

export default function BookingSuccess() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionId = urlParams.get("session_id");

  // Fetch booking details using session ID
  const { data: booking, isLoading, error } = useQuery({
    queryKey: ["/api/booking-by-session", sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await fetch(`/api/booking-by-session/${sessionId}`);
      if (!response.ok) {
        console.error(`Failed to fetch booking: ${response.status} ${response.statusText}`);
        throw new Error("Failed to fetch booking");
      }
      return response.json();
    },
    enabled: !!sessionId,
    retry: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    // Reset any booking state when user reaches success page
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 mb-4">
            <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Booking Details Unavailable</h1>
          <p className="text-gray-600 mb-4">
            We're having trouble loading your booking details, but your payment was successful!
          </p>
          <p className="text-sm text-gray-500 mb-4">
            You should receive a confirmation email shortly. If you have any questions, please contact us.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid Booking Session</h1>
          <p className="text-gray-600 mb-4">
            No booking session was found. Please contact us if you need assistance.
          </p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const lessonInfo = booking
    ? LESSON_TYPES[booking.lessonType as keyof typeof LESSON_TYPES]
    : null;
  const athleteNames = [];
  if (booking?.athlete1Name) athleteNames.push(booking.athlete1Name);
  if (booking?.athlete2Name) athleteNames.push(booking.athlete2Name);

  const formattedDate = booking?.preferredDate
    ? format(
        new Date(booking.preferredDate + "T00:00:00"),
        "EEEE, MMMM d, yyyy",
      )
    : "";

  const lessonPrice = lessonInfo?.price || 0;
  const reservationFee = 10;
  const remainingBalance = lessonPrice - reservationFee;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Your reservation fee has been processed and your lesson is confirmed
          </p>
        </div>

        {/* Booking Details Card */}
        {booking && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Athletes</p>
                    <p className="font-semibold">{athleteNames.join(", ")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-semibold">{formattedDate}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-semibold">{booking.preferredTime}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Lesson Type</p>
                    <p className="font-semibold">{lessonInfo?.name}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Summary Card */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <DollarSign className="h-5 w-5" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Lesson Total:</span>
                <span className="font-medium">${lessonPrice}</span>
              </div>
              <div className="flex justify-between text-sm text-green-700">
                <span>Reservation Fee Paid:</span>
                <span className="font-medium">-${reservationFee}</span>
              </div>
              <div className="border-t pt-2 flex justify-between">
                <span className="font-semibold">Remaining Balance:</span>
                <span className="font-bold text-lg">${remainingBalance}</span>
              </div>
            </div>
            <p className="text-sm text-green-700 bg-green-100 p-3 rounded">
              The remaining balance of ${remainingBalance} is due at the time of
              your lesson. Please bring cash or check for payment.
            </p>
          </CardContent>
        </Card>

        {/* What's Next Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-800">
                  Confirmation Email
                </h3>
                <p className="text-sm text-blue-700">
                  Check your email for a detailed confirmation with all lesson
                  information.
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">
                Important Reminders:
              </h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>Arrive on time for check-in</li>
                <li>Bring comfortable athletic clothing</li>
                <li>Water bottle recommended</li>
                <li>Remaining payment of ${remainingBalance} due at lesson</li>
                <li>Questions? Contact us at (585) 755-8122</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>

        {/* Contact Info */}
        <div className="text-center mt-8 p-4 bg-white rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-2">
            Coach Will Tumbles
          </h3>
          <p className="text-sm text-gray-600">
            Phone: (585) 755-8122 | Email: will@coachwilltumbles.com
          </p>
        </div>
      </div>
    </div>
  );
}
