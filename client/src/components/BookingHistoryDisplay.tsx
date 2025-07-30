import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import {
    AlertCircle,
    Calendar,
    CheckCircle,
    ChevronDown,
    ChevronRight,
    Clock,
    DollarSign,
    FileText,
    MapPin,
    Target,
    User,
    Users,
    XCircle
} from "lucide-react";
import { useState } from "react";

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
  const [expandedBookings, setExpandedBookings] = useState<Set<number>>(new Set());

  const toggleBookingExpansion = (bookingId: number) => {
    const newExpanded = new Set(expandedBookings);
    if (newExpanded.has(bookingId)) {
      newExpanded.delete(bookingId);
    } else {
      newExpanded.add(bookingId);
    }
    setExpandedBookings(newExpanded);
  };
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
      <Card className="rounded-xl border shadow-sm mb-6" role="region" aria-labelledby="booking-history-heading">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-xl">
          <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-gray-600">Loading booking history...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && fallbackBookings.length === 0) {
    return (
      <Card className="rounded-xl border shadow-sm mb-6" role="region" aria-labelledby="booking-history-heading">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-xl">
          <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-center py-4 text-amber-600">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>Unable to load detailed booking history</span>
          </div>
        </CardContent>
      </Card>
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
    <Card className="rounded-xl border shadow-sm mb-6" role="region" aria-labelledby="booking-history-heading">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-green-50 rounded-t-xl">
        <CardTitle className="text-lg font-semibold text-blue-800 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          Booking History ({bookings.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
      
      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500" role="status">No bookings found for this athlete</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {bookings
            .sort((a, b) => {
              const dateA = new Date(a.preferredDate || a.createdAt).getTime();
              const dateB = new Date(b.preferredDate || b.createdAt).getTime();
              return dateB - dateA; // Most recent first
            })
            .map((booking) => {
              const isExpanded = expandedBookings.has(booking.id);
              
              return (
                <div 
                  key={booking.id} 
                  className="border rounded-lg bg-white hover:bg-gray-50 transition-colors"
                  role="article" 
                  aria-label={`Booking ${booking.id}`}
                >
                  {/* Condensed header - always visible */}
                  <div 
                    className="p-3 cursor-pointer flex items-center justify-between"
                    onClick={() => toggleBookingExpansion(booking.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleBookingExpansion(booking.id);
                      }
                    }}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      {/* Expand/collapse icon */}
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      )}
                      
                      {/* Date and time */}
                      <div className="flex items-center space-x-2 text-sm text-gray-600 flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                          {formatDate(booking.preferredDate)}
                        </span>
                        <Clock className="w-3 h-3" />
                        <span>
                          {formatTime(booking.preferredTime)}
                        </span>
                      </div>
                      
                      {/* Lesson type */}
                      <div className="flex items-center space-x-1 min-w-0 flex-1">
                        <Target className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate">
                          {booking.lessonTypeName || 'Gymnastics Session'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {/* Payment status */}
                      <div className="flex items-center space-x-1">
                        {getPaymentStatusIcon(booking.paymentStatus)}
                        {booking.paidAmount && booking.paidAmount !== '0.00' && (
                          <span className="text-xs text-gray-600">${booking.paidAmount}</span>
                        )}
                      </div>
                      
                      {/* Booking status */}
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(booking.attendanceStatus || booking.status)}
                        <span className="text-xs font-medium capitalize text-gray-700">
                          {booking.attendanceStatus || booking.status}
                        </span>
                      </div>
                      
                      {/* Multi-athlete indicator */}
                      {booking.athleteCount > 1 && (
                        <div className="flex items-center">
                          <Users className="w-4 h-4 text-blue-500" />
                          <span className="text-xs text-gray-600 ml-1">
                            {booking.athleteCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded details - only visible when expanded */}
                  {isExpanded && (
                    <div className="px-6 pb-4 border-t bg-gray-50">
                      <div className="pt-3 space-y-3">
                        {/* Basic details grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Coach info */}
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm">{booking.coachName || 'Coach Will'}</span>
                          </div>

                          {/* Booking method */}
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm capitalize">{booking.bookingMethod}</span>
                          </div>

                          {/* Payment details */}
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-500 mr-2" />
                            <span className="text-sm">
                              <span className="font-medium capitalize">{booking.paymentStatus}</span>
                              {booking.paidAmount && booking.paidAmount !== '0.00' && (
                                <span className="text-gray-600"> - ${booking.paidAmount}</span>
                              )}
                            </span>
                          </div>

                          {/* Attendance status */}
                          {booking.attendanceStatus && booking.attendanceStatus !== 'pending' && (
                            <div className="flex items-center">
                              {getStatusIcon(booking.attendanceStatus)}
                              <span className="ml-2 text-sm">
                                Attendance: <span className="font-medium capitalize">{booking.attendanceStatus}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Focus areas */}
                        {booking.focusAreas && booking.focusAreas.length > 0 && (
                          <div>
                            <div className="flex items-center mb-2">
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
                          <div>
                            <div className="flex items-center mb-2">
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
                          <div>
                            <div className="flex items-center mb-2">
                              <AlertCircle className="w-4 h-4 text-blue-500 mr-1" />
                              <span className="text-sm font-medium">Special Requests:</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                              {booking.specialRequests}
                            </p>
                          </div>
                        )}

                        {/* Admin notes */}
                        {booking.adminNotes && (
                          <div>
                            <div className="flex items-center mb-2">
                              <AlertCircle className="w-4 h-4 text-purple-500 mr-1" />
                              <span className="text-sm font-medium">Admin Notes:</span>
                            </div>
                            <p className="text-sm text-gray-700 bg-purple-50 p-2 rounded">
                              {booking.adminNotes}
                            </p>
                          </div>
                        )}

                        {/* Pickup/Dropoff info */}
                        {(booking.dropoffPersonName || booking.pickupPersonName) && (
                          <div>
                            <div className="text-sm font-medium mb-2">Transportation:</div>
                            <div className="text-sm text-gray-600 bg-gray-100 p-2 rounded space-y-1">
                              {booking.dropoffPersonName && (
                                <div>
                                  <span className="font-medium">Drop-off:</span> {booking.dropoffPersonName}
                                  {booking.dropoffPersonRelationship && ` (${booking.dropoffPersonRelationship})`}
                                </div>
                              )}
                              {booking.pickupPersonName && (
                                <div>
                                  <span className="font-medium">Pick-up:</span> {booking.pickupPersonName}
                                  {booking.pickupPersonRelationship && ` (${booking.pickupPersonRelationship})`}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer with safety and booking info */}
                        <div className="flex items-center justify-between text-xs text-gray-500 border-t pt-2 mt-3">
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
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </CardContent>
    </Card>
  );
}
