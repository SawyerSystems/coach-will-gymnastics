import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useQuery } from "@tanstack/react-query";
import { Clock, User } from "lucide-react";

interface UpcomingSession {
  id: number;
  sessionDate: string;
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
        return { variant: 'default' as const, className: 'bg-green-500' };
      case 'session-paid':
        return { variant: 'default' as const, className: 'bg-blue-500' };
      case 'reservation-pending':
        return { variant: 'secondary' as const, className: 'bg-yellow-500' };
      default:
        return { variant: 'outline' as const };
    }
  };

  // Helper to get badge props for attendance status
  const getAttendanceStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return { variant: 'default' as const, className: 'bg-green-600' };
      case 'pending':
        return { variant: 'secondary' as const, className: 'bg-yellow-600' };
      case 'completed':
        return { variant: 'default' as const, className: 'bg-emerald-600' };
      default:
        return { variant: 'outline' as const };
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-500">Loading upcoming sessions...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500 text-center py-8">
            Error loading upcoming sessions. Please try again.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Upcoming Sessions
          <Badge variant="secondary">{sessions.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            No upcoming sessions scheduled.
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const dateTimeResult = formatSessionDateTime(session.sessionDate);
              const date = typeof dateTimeResult === 'string' ? dateTimeResult : dateTimeResult.date;
              const time = typeof dateTimeResult === 'string' ? '' : dateTimeResult.time;
              
              return (
                <div key={session.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      {/* Date and Time with lesson type badge */}
                      <div className="flex items-center gap-3">
                        <div className="font-semibold text-gray-900">
                          {date}{time && ` at ${time}`}
                        </div>
                        <Badge variant="outline">
                          {session.lessonType.replace('-', ' ').replace('min', 'minute')}
                        </Badge>
                      </div>
                      
                      {/* Athletes */}
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-700">
                          {session.athleteNames.join(', ') || 'No athletes listed'}
                        </span>
                      </div>
                      
                      {/* Parent */}
                      <div className="text-sm text-gray-600">
                        Parent: {session.parentName}
                      </div>
                    </div>
                    
                    {/* Status badges */}
                    <div className="flex flex-col gap-2 items-end">
                      <Badge {...getPaymentStatusBadge(session.paymentStatus)}>
                        {session.paymentStatus.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                      <Badge {...getAttendanceStatusBadge(session.attendanceStatus)}>
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
  );
}
