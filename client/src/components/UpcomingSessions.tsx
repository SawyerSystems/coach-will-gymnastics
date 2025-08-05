import { Badge } from "@/components/ui/badge";
import { BookingCalendar } from "@/components/BookingCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, List, User } from "lucide-react";
import { useState } from "react";

// Helper function to format date without timezone issues
function formatDateWithoutTimezoneIssues(dateString: string): string {
  // Split the date string into components
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Use the Date constructor with explicit year, month (0-based), and day parameters
  // This avoids timezone issues
  const date = new Date(year, month - 1, day);
  
  // Format the date as desired
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
}

interface UpcomingSession {
  id: number;
  sessionDate: string;
  sessionTime: string;
  lessonType: string;
  parentName: string;
  athleteNames: string[];
  focusAreas: string[];
  paymentStatus: string;
  attendanceStatus: string;
}

interface UpcomingSessionsProps {
  onBookingSelect?: (bookingId: number) => void;
}

export function UpcomingSessions({ onBookingSelect }: UpcomingSessionsProps = {}) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const { data: sessions = [], isLoading, error } = useQuery<UpcomingSession[]>({
    queryKey: ['/api/upcoming-sessions'],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/upcoming-sessions");
      return response.json();
    },
  });

  // Helper to format date and time
  const formatSessionDateTime = (sessionDate: string): 'TBD' | { date: string; time: string } => {
    if (!sessionDate) return 'TBD';
    
    try {
      const date = new Date(sessionDate);
      return {
        date: date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }),
        time: date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        })
      };
    } catch {
      return { date: 'Invalid Date', time: 'Invalid Time' };
    }
  };

  // Helper to get badge props for payment status
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'reservation-paid':
        return { variant: 'default' as const, className: 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0' };
      case 'session-paid':
        return { variant: 'default' as const, className: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0' };
      case 'reservation-pending':
        return { variant: 'secondary' as const, className: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300' };
      default:
        return { variant: 'outline' as const, className: 'border-slate-300 text-slate-700' };
    }
  };

  // Helper to get badge props for attendance status
  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { variant: 'default' as const, className: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0' };
      case 'pending':
        return { variant: 'secondary' as const, className: 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300' };
      case 'completed':
        return { variant: 'default' as const, className: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0' };
      default:
        return { variant: 'outline' as const, className: 'border-slate-300 text-slate-700' };
    }
  };

  // Handle booking selection for the calendar view
  const handleBookingSelect = (bookingId: number) => {
    if (onBookingSelect) {
      onBookingSelect(bookingId);
    } else {
      // Fallback behavior when no callback is provided
      console.log(`Selected booking ID: ${bookingId}`);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Modern Loading State */}
        <div className="bg-gradient-to-r from-[#0F0276]/5 to-[#D8BD2A]/5 rounded-xl border border-slate-200/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#D8BD2A]/10 rounded-lg">
              <Clock className="h-6 w-6 text-[#D8BD2A]" />
            </div>
            <h3 className="text-2xl font-black text-[#0F0276] tracking-tight">Upcoming Sessions</h3>
          </div>
          <p className="text-slate-600">Loading session information...</p>
        </div>
        <Card className="rounded-xl border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0F0276]"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        {/* Modern Error State */}
        <div className="bg-gradient-to-r from-red-100 to-red-50 rounded-xl border border-red-200 p-6">
          <h3 className="text-2xl font-black text-red-800 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            Upcoming Sessions
          </h3>
          <p className="text-red-600">Error loading session information</p>
        </div>
        <Card className="rounded-xl border-0 shadow-lg">
          <CardContent className="p-8">
            <div className="text-red-500 text-center">
              Error loading upcoming sessions. Please try again.
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert sessions to calendar events format
  const calendarBookings = sessions.map(session => {
    // Format for calendar
    const dateTime = `${session.sessionDate}T${session.sessionTime}`;
    
    return {
      id: session.id,
      preferred_date: session.sessionDate,
      preferred_time: session.sessionTime,
      lesson_type: session.lessonType,
      athlete_names: session.athleteNames.join(', '),
      focusAreas: session.focusAreas,
      payment_status: session.paymentStatus,
      attendance_status: session.attendanceStatus
    };
  });

  return (
    <div className="space-y-6">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-[#0F0276]/5 to-[#D8BD2A]/5 rounded-xl border border-slate-200/50 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0F0276] tracking-tight flex items-center gap-3 mb-2">
              <div className="p-2 bg-[#D8BD2A]/10 rounded-lg">
                <Clock className="h-6 w-6 text-[#D8BD2A]" />
              </div>
              Upcoming Sessions
            </h3>
            <p className="text-slate-600">View and manage scheduled sessions</p>
          </div>
          <Badge 
            variant="secondary" 
            className="bg-[#D8BD2A]/10 text-[#0F0276] border-[#D8BD2A]/20 font-bold text-lg px-4 py-2 w-fit"
          >
            {sessions.length} sessions
          </Badge>
        </div>
        
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
          <TabsList className="bg-white/50 p-1 rounded-lg w-fit">
            <TabsTrigger value="list" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <List className="h-4 w-4 mr-2" />
              List View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Tabs value={viewMode} className="mt-0 hidden">
        <TabsContent value="list">
          <Card className="rounded-xl border-0 shadow-lg">
            <CardContent className="p-6">
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">No upcoming sessions scheduled</p>
                  <p className="text-slate-500 text-sm mt-2">When you book sessions, they will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => {
                    // Format the session date and time
                    const formattedDateTime = formatSessionDateTime(session.sessionDate);
                    
                    return (
                      <div 
                        key={session.id}
                        className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-all duration-300"
                      >
                        <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4">
                          <div className="space-y-4">
                            {/* Date and time */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 rounded-lg">
                                  <Clock className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-indigo-900">
                                    {formattedDateTime !== 'TBD' ? formattedDateTime.date : 'Date TBD'}
                                  </p>
                                  <p className="text-sm text-slate-600">
                                    {formattedDateTime !== 'TBD' ? formattedDateTime.time : 'Time TBD'}
                                  </p>
                                </div>
                              </div>
                              <Badge 
                                variant="outline" 
                                className="border-slate-300 text-slate-700 bg-slate-50 font-semibold"
                              >
                                {session.lessonType.replace('-', ' ').replace('min', 'minute')}
                              </Badge>
                            </div>
                            
                            {/* Athletes */}
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-blue-50 rounded-lg">
                                <User className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="font-semibold text-slate-800">
                                {session.athleteNames.join(', ') || 'No athletes listed'}
                              </span>
                            </div>
                            
                            {/* Focus Areas */}
                            {session.focusAreas && session.focusAreas.length > 0 && (
                              <div className="text-slate-600 ml-11">
                                <span className="font-medium">Focus Areas:</span> {session.focusAreas.join(', ')}
                              </div>
                            )}
                            
                            {/* Parent */}
                            <div className="text-slate-600 ml-11">
                              <span className="font-medium">Parent:</span> {session.parentName}
                            </div>
                          </div>
                          
                          {/* Status badges */}
                          <div className="flex flex-row lg:flex-col gap-3 lg:items-end">
                            <Badge {...getPaymentStatusBadge(session.paymentStatus)} className="font-semibold">
                              {session.paymentStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Badge>
                            <Badge {...getAttendanceStatusBadge(session.attendanceStatus)} className="font-semibold">
                              {session.attendanceStatus.charAt(0).toUpperCase() + session.attendanceStatus.slice(1)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="calendar">
          <Card className="rounded-xl border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="h-[600px]">
                <BookingCalendar 
                  bookings={calendarBookings} 
                  onBookingSelect={handleBookingSelect}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {viewMode === 'list' && (
        <Card className="rounded-xl border-0 shadow-lg">
          <CardContent className="p-6">
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Calendar className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">No upcoming sessions scheduled</p>
                <p className="text-slate-500 text-sm mt-2">When you book sessions, they will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => {
                  // Format the session date and time
                  const formattedDateTime = formatSessionDateTime(session.sessionDate);
                  
                  return (
                    <div 
                      key={session.id}
                      className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white hover:shadow-md transition-all duration-300"
                    >
                      <div className="p-4 md:p-5 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-4">
                          {/* Date and time */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-indigo-50 rounded-lg">
                                <Clock className="h-4 w-4 text-indigo-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-indigo-900">
                                  {formattedDateTime !== 'TBD' ? formattedDateTime.date : 'Date TBD'}
                                </p>
                                <p className="text-sm text-slate-600">
                                  {formattedDateTime !== 'TBD' ? formattedDateTime.time : 'Time TBD'}
                                </p>
                              </div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className="border-slate-300 text-slate-700 bg-slate-50 font-semibold"
                            >
                              {session.lessonType.replace('-', ' ').replace('min', 'minute')}
                            </Badge>
                          </div>
                          
                          {/* Athletes */}
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <span className="font-semibold text-slate-800">
                              {session.athleteNames.join(', ') || 'No athletes listed'}
                            </span>
                          </div>
                          
                          {/* Parent */}
                          <div className="text-slate-600 ml-11">
                            <span className="font-medium">Parent:</span> {session.parentName}
                          </div>
                        </div>
                        
                        {/* Status badges */}
                        <div className="flex flex-row lg:flex-col gap-3 lg:items-end">
                          <Badge {...getPaymentStatusBadge(session.paymentStatus)} className="font-semibold">
                            {session.paymentStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Badge>
                          <Badge {...getAttendanceStatusBadge(session.attendanceStatus)} className="font-semibold">
                            {session.attendanceStatus.charAt(0).toUpperCase() + session.attendanceStatus.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {viewMode === 'calendar' && (
        <Card className="rounded-xl border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="h-[600px]">
              <BookingCalendar 
                bookings={calendarBookings} 
                onBookingSelect={handleBookingSelect}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
