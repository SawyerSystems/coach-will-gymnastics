import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Clock, User } from "lucide-react";

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
  paymentStatus: string;
  attendanceStatus: string;
}

export function UpcomingSessions() {
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
              <div className="animate-spin w-8 h-8 border-4 border-[#D8BD2A] border-t-transparent rounded-full"></div>
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
        <div className="bg-gradient-to-r from-red-50/50 to-red-100/30 rounded-xl border border-red-200/50 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-red-800 tracking-tight">Upcoming Sessions</h3>
          </div>
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

  return (
    <div className="space-y-6">
      {/* Modern Header Section */}
      <div className="bg-gradient-to-r from-[#0F0276]/5 to-[#D8BD2A]/5 rounded-xl border border-slate-200/50 p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
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
      </div>

      <Card className="rounded-xl border-0 shadow-lg">
        <CardContent className="p-6">
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-slate-400" />
              </div>
              <h4 className="text-lg font-semibold text-slate-700 mb-2">No Upcoming Sessions</h4>
              <p className="text-slate-500">There are no sessions scheduled at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session) => {
                // Format the date nicely with timezone correction
                const formattedDate = session.sessionDate 
                  ? formatDateWithoutTimezoneIssues(session.sessionDate) 
                  : 'TBD';
                
                return (
                  <div 
                    key={session.id} 
                    className="border border-slate-200 rounded-xl p-6 hover:bg-slate-50/50 hover:border-[#D8BD2A]/20 transition-all duration-200 hover:shadow-md"
                  >
                    <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                      <div className="space-y-3 flex-1">
                        {/* Date and Time with lesson type badge */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#0F0276]/5 rounded-lg">
                              <Clock className="h-4 w-4 text-[#0F0276]" />
                            </div>
                            <div className="font-bold text-slate-900 text-lg">
                              {formattedDate} at {session.sessionTime || 'TBD'}
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
    </div>
  );
}
