import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    Clock,
    DollarSign,
    FileText,
    MapPin,
    Target,
    User,
    Users,
    XCircle
} from "lucide-react";

interface BookingDetails {
  id: number;
  lessonTypeName: string;
  preferredDate: string;
  preferredTime: string;
  status: string;
  paymentStatus: string;
  attendanceStatus: string;
  paidAmount: string;
  focusAreas: string[];
  progressNote?: string;
  coachName: string;
  bookingMethod: string;
  specialRequests?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  athleteCount: number;
  otherAthleteNames?: string[];
  // Safety and waiver info
  safetyVerificationSigned: boolean;
  waiverStatus: 'signed' | 'pending' | 'not_required';
  // Pickup/dropoff info
  dropoffPersonName?: string;
  dropoffPersonRelationship?: string;
  pickupPersonName?: string;
  pickupPersonRelationship?: string;
}

interface BookingHistoryDisplayProps {
  athleteId: number;
  fallbackBookings?: any[]; // Fallback bookings from props
}

export function BookingHistoryDisplay({ athleteId, fallbackBookings = [] }: BookingHistoryDisplayProps) {
  const { data: bookingHistory, isLoading, error } = useQuery<BookingDetails[]>({
    queryKey: [`/api/athletes/${athleteId}/booking-history`],
    queryFn: async () => {
      const response = await fetch(`/api/athletes/${athleteId}/booking-history`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking history');
      }
      return response.json();
    },
    retry: 1,
  });

  const bookings = bookingHistory || fallbackBookings;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4" role="region" aria-labelledby="booking-history-heading">
        <h3 id="booking-history-heading" className="font-semibold mb-3">Booking History</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-gray-600">Loading booking history...</span>
        </div>
      </div>
    );
  }

  if (error && fallbackBookings.length === 0) {
    return (
      <div className="border rounded-lg p-4" role="region" aria-labelledby="booking-history-heading">
        <h3 id="booking-history-heading" className="font-semibold mb-3">Booking History</h3>
        <div className="flex items-center justify-center py-4 text-amber-600">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>Unable to load detailed booking history</span>
        </div>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'attended':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
      case 'no-show':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'confirmed':
      case 'scheduled':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
    }
  };

  const getPaymentStatusIcon = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    try {
      // Handle time format like "14:30:00" or "2:30 PM"
      if (timeString.includes(':')) {
        const [hours, minutes] = timeString.split(':');
        const hour24 = parseInt(hours);
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        return `${hour12}:${minutes} ${ampm}`;
      }
      return timeString;
    } catch {
      return timeString;
    }
  };

  return (
    <div className="border rounded-lg p-4" role="region" aria-labelledby="booking-history-heading">
      <h3 id="booking-history-heading" className="font-semibold mb-3 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        Booking History ({bookings.length})
      </h3>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500" role="status">No bookings found for this athlete</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {bookings
            .sort((a, b) => {
              const dateA = new Date(a.preferredDate || a.createdAt).getTime();
              const dateB = new Date(b.preferredDate || b.createdAt).getTime();
              return dateB - dateA; // Most recent first
            })
            .map((booking) => (
              <div 
                key={booking.id} 
                className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors"
                role="article" 
                aria-label={`Booking ${booking.id}`}
              >
                {/* Header with lesson type and status */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-lg flex items-center">
                      <Target className="w-4 h-4 mr-2 text-blue-500" />
                      {booking.lessonTypeName || 'Gymnastics Session'}
                    </h4>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      <time dateTime={booking.preferredDate}>
                        {formatDate(booking.preferredDate)}
                      </time>
                      <Clock className="w-4 h-4 ml-3 mr-1" />
                      {formatTime(booking.preferredTime)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center">
                      {getStatusIcon(booking.status)}
                      <span className="ml-1 text-sm font-medium capitalize">
                        {booking.status}
                      </span>
                    </div>
                    {booking.attendanceStatus && booking.attendanceStatus !== 'pending' && (
                      <div className="flex items-center">
                        {getStatusIcon(booking.attendanceStatus)}
                        <span className="ml-1 text-xs text-gray-600 capitalize">
                          {booking.attendanceStatus}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {/* Payment info */}
                  <div className="flex items-center">
                    {getPaymentStatusIcon(booking.paymentStatus)}
                    <span className="ml-2 text-sm">
                      <span className="font-medium capitalize">{booking.paymentStatus}</span>
                      {booking.paidAmount && booking.paidAmount !== '0.00' && (
                        <span className="text-gray-600"> - ${booking.paidAmount}</span>
                      )}
                    </span>
                  </div>

                  {/* Coach info */}
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm">{booking.coachName || 'Coach Will'}</span>
                  </div>

                  {/* Multi-athlete indicator */}
                  {booking.athleteCount > 1 && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm">
                        Group session ({booking.athleteCount} athletes)
                      </span>
                    </div>
                  )}

                  {/* Booking method */}
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm capitalize">{booking.bookingMethod}</span>
                  </div>
                </div>

                {/* Focus areas */}
                {booking.focusAreas && booking.focusAreas.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <Target className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-sm font-medium">Focus Areas:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {booking.focusAreas.map((area: string, index: number) => (
                        <span 
                          key={index}
                          className="inline-block bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Progress note */}
                {booking.progressNote && (
                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <FileText className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">Progress Note:</span>
                    </div>
                    <p className="text-sm text-gray-700 bg-green-50 p-2 rounded">
                      {booking.progressNote}
                    </p>
                  </div>
                )}

                {/* Special requests */}
                {booking.specialRequests && (
                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <AlertCircle className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm font-medium">Special Requests:</span>
                    </div>
                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}

                {/* Pickup/Dropoff info */}
                {(booking.dropoffPersonName || booking.pickupPersonName) && (
                  <div className="mb-3">
                    <div className="text-sm font-medium mb-1">Transportation:</div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {booking.dropoffPersonName && (
                        <div>
                          Drop-off: {booking.dropoffPersonName}
                          {booking.dropoffPersonRelationship && ` (${booking.dropoffPersonRelationship})`}
                        </div>
                      )}
                      {booking.pickupPersonName && (
                        <div>
                          Pick-up: {booking.pickupPersonName}
                          {booking.pickupPersonRelationship && ` (${booking.pickupPersonRelationship})`}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Safety and waiver status */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2">
                  <div className="flex items-center space-x-4">
                    {booking.safetyVerificationSigned && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Safety Verified
                      </div>
                    )}
                    {booking.waiverStatus === 'signed' && (
                      <div className="flex items-center text-green-600">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Waiver Signed
                      </div>
                    )}
                  </div>
                  <div>
                    Booked: {formatDate(booking.createdAt)}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
