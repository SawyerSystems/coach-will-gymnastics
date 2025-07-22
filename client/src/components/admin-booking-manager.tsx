// Always get lesson price from booking.lessonType.price (from Supabase). Only fallback to booking.amount if price is missing (legacy/edge case).
// Always get lesson price from booking.lessonType.total_price (from Supabase). Only fallback to price, then booking.amount if missing (legacy/edge case).
const getLessonPrice = (booking: any): number => {
  if (booking.lessonType && typeof booking.lessonType === 'object') {
    if ('total_price' in booking.lessonType && booking.lessonType.total_price != null) {
      return typeof booking.lessonType.total_price === 'number'
        ? booking.lessonType.total_price
        : parseFloat(booking.lessonType.total_price);
    }
    if ('price' in booking.lessonType && booking.lessonType.price != null) {
      return typeof booking.lessonType.price === 'number'
        ? booking.lessonType.price
        : parseFloat(booking.lessonType.price);
    }
  }
  // Fallback for legacy/edge cases only
  if (booking.amount && !isNaN(parseFloat(booking.amount))) return parseFloat(booking.amount);
  return 0;
};
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { UnifiedBookingModal } from "@/components/UnifiedBookingModal";
import { useToast } from "@/hooks/use-toast";
import { useAvailableTimes } from "@/hooks/useAvailableTimes";
import { useGenders } from "@/hooks/useGenders";
import { GYMNASTICS_EVENTS, LESSON_TYPES } from "@/lib/constants";
import { calculateAge } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Booking } from "@shared/schema";
import { AttendanceStatusEnum, BookingStatusEnum, PaymentStatusEnum } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Calendar, CheckCircle, CheckCircle2, Clock, Eye, FileCheck, FileText, FileX, Filter, HelpCircle, Plus, Trash2, User, X, XCircle } from "lucide-react";
import { useState } from "react";

// Helper function to get status badge variant and color
export const getStatusBadgeProps = (status: string): { variant: "default" | "secondary" | "destructive" | "outline"; className?: string } => {
  switch (status) {
    case "pending":
      return { variant: "secondary", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" };
    case "paid":
      return { variant: "default", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" };
    case "confirmed":
      return { variant: "default", className: "bg-green-100 text-green-800 hover:bg-green-200" };
    case "manual":
      return { variant: "outline", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" };
    case "manual-paid":
      return { variant: "default", className: "bg-lime-100 text-lime-800 hover:bg-lime-200" };
    case "completed":
      return { variant: "default", className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200" };
    case "no-show":
      return { variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-200" };
    case "failed":
      return { variant: "destructive", className: "bg-red-200 text-red-900 hover:bg-red-300" };
    case "cancelled":
      return { variant: "outline", className: "bg-gray-50 text-gray-500 hover:bg-gray-100 line-through" };
    default:
      return { variant: "outline" };
  }
};

// Enhanced helper function for payment status with automatic status support
export const getPaymentStatusBadgeProps = (status: string): { 
  variant: "default" | "secondary" | "destructive" | "outline"; 
  className?: string; 
  icon?: React.ReactNode;
  text?: string;
} => {
  switch (status) {
    case "reservation-pending":
      return { 
        variant: "outline", 
        className: "border-yellow-300 text-yellow-700 bg-yellow-50",
        icon: <Clock className="h-3 w-3" />,
        text: "Payment Pending"
      };
    case "reservation-paid":
      return { 
        variant: "outline", 
        className: "border-green-300 text-green-700 bg-green-50",
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Paid ✓"
      };
    case "session-paid":
      return { 
        variant: "outline", 
        className: "border-green-300 text-green-700 bg-green-50",
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Full Payment ✓"
      };
    case "reservation-failed":
      return { 
        variant: "outline", 
        className: "border-red-300 text-red-700 bg-red-50",
        icon: <XCircle className="h-3 w-3" />,
        text: "Payment Failed"
      };
    case "reservation-expired":
      return { 
        variant: "outline", 
        className: "border-gray-300 text-gray-700 bg-gray-50",
        icon: <Clock className="h-3 w-3" />,
        text: "Expired"
      };
    case "unpaid":
      return { 
        variant: "outline", 
        className: "border-orange-300 text-orange-700 bg-orange-50",
        icon: <AlertCircle className="h-3 w-3" />,
        text: "Unpaid"
      };
    case "paid": // Legacy status
      return { 
        variant: "outline", 
        className: "border-green-300 text-green-700 bg-green-50",
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Paid ✓"
      };
    case "failed": // Legacy status
      return { 
        variant: "outline", 
        className: "border-red-300 text-red-700 bg-red-50",
        icon: <XCircle className="h-3 w-3" />,
        text: "Failed"
      };
    case "refunded":
      return { 
        variant: "outline", 
        className: "border-gray-300 text-gray-700 bg-gray-50",
        icon: <X className="h-3 w-3" />,
        text: "Refunded"
      };
    default:
      return { 
        variant: "outline", 
        className: "border-gray-300 text-gray-700 bg-gray-50",
        icon: <HelpCircle className="h-3 w-3" />,
        text: status || "Unknown"
      };
  }
};

// Enhanced helper function for attendance status with automatic status support
export const getAttendanceStatusBadgeProps = (status: string): { 
  variant: "default" | "secondary" | "destructive" | "outline"; 
  className?: string; 
  icon?: React.ReactNode;
  text?: string;
} => {
  switch (status) {
    case "pending":
      return { 
        variant: "outline", 
        className: "border-blue-300 text-blue-700 bg-blue-50",
        icon: <Clock className="h-3 w-3" />,
        text: "Scheduled"
      };
    case "confirmed":
      return { 
        variant: "outline", 
        className: "border-green-300 text-green-700 bg-green-50",
        icon: <CheckCircle className="h-3 w-3" />,
        text: "Confirmed ✓"
      };
    case "completed":
      return { 
        variant: "outline", 
        className: "border-green-300 text-green-700 bg-green-50",
        icon: <CheckCircle2 className="h-3 w-3" />,
        text: "Completed ✓"
      };
    case "no-show":
      return { 
        variant: "outline", 
        className: "border-red-300 text-red-700 bg-red-50",
        icon: <XCircle className="h-3 w-3" />,
        text: "No Show"
      };
    case "cancelled":
      return { 
        variant: "outline", 
        className: "border-gray-300 text-gray-700 bg-gray-50",
        icon: <X className="h-3 w-3" />,
        text: "Cancelled"
      };
    case "manual":
      return { 
        variant: "outline", 
        className: "border-blue-300 text-blue-700 bg-blue-50",
        icon: <User className="h-3 w-3" />,
        text: "Manual Entry"
      };
    default:
      return { 
        variant: "outline", 
        className: "border-gray-300 text-gray-700 bg-gray-50",
        icon: <HelpCircle className="h-3 w-3" />,
        text: status || "Pending"
      };
  }
};

// Enhanced helper function for waiver status
export const getWaiverStatusBadgeProps = (waiverSigned: boolean): { 
  variant: "default" | "secondary" | "destructive" | "outline"; 
  className?: string; 
  icon?: React.ReactNode;
  text?: string;
} => {
  if (waiverSigned) {
    return { 
      variant: "outline", 
      className: "border-green-300 text-green-700 bg-green-50",
      icon: <FileCheck className="h-3 w-3" />,
      text: "Waiver Signed ✓"
    };
  } else {
    return { 
      variant: "outline", 
      className: "border-orange-300 text-orange-700 bg-orange-50",
      icon: <FileX className="h-3 w-3" />,
      text: "Waiver Required"
    };
  }
};



// AdminRescheduleForm component
function AdminRescheduleForm({ booking, onSubmit, onCancel }: { 
  booking: Booking; 
  onSubmit: (date: string, time: string) => void; 
  onCancel: () => void 
}) {
  const [selectedDate, setSelectedDate] = useState(booking.preferredDate);
  const [selectedTime, setSelectedTime] = useState('');

  const { data: availableSlots = [], isLoading: slotsLoading } = useAvailableTimes(
    selectedDate || '',
    booking.lessonType || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDate && selectedTime) {
      onSubmit(selectedDate, selectedTime);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm text-gray-600">
          Reschedule lesson for {booking.athlete1Name}
          {booking.athlete2Name && ` & ${booking.athlete2Name}`}
        </p>
        <p className="text-sm text-gray-600">
          Current: {booking.preferredDate} at {booking.preferredTime}
        </p>
      </div>

      <div>
        <Label htmlFor="reschedule-date">New Date</Label>
        <Input
          id="reschedule-date"
          type="date"
          value={selectedDate || ''}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime(''); // Reset time when date changes
          }}
          min={new Date().toISOString().split('T')[0]}
          required
        />
      </div>

      <div>
        <Label htmlFor="reschedule-time">New Time</Label>
        <Select
          value={selectedTime}
          onValueChange={setSelectedTime}
          disabled={!selectedDate || slotsLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={slotsLoading ? "Loading times..." : "Select a time"} />
          </SelectTrigger>
          <SelectContent>
            {availableSlots.length > 0 ? (
              availableSlots.map((slot) => (
                <SelectItem key={slot} value={slot}>
                  {slot}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-slots" disabled>
                No available times for this date
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!selectedDate || !selectedTime}>
          Reschedule
        </Button>
      </div>
    </form>
  );
}

interface ManualBookingFormData {
  lessonType: string;
  athlete1Name: string;
  athlete1Age: number;
  athlete1Experience: string;
  athlete1Gender?: string;
  athlete2Name?: string;
  athlete2Age?: number;
  athlete2Experience?: string;
  athlete2Gender?: string;
  preferredDate: string;
  preferredTime: string;
  focusAreas: string[];
  parentFirstName: string;
  parentLastName: string;
  parentEmail: string;
  parentPhone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  allergies1?: string;
  allergies2?: string;
  amount: string;
  bookingMethod: string;
  adminNotes?: string;
  isNewAthlete?: boolean;
}



interface AdminBookingManagerProps {
  prefilledData?: {
    athlete1Name?: string;
    athlete1DateOfBirth?: string;
    athlete1Experience?: string;
    athlete1Allergies?: string;
    parentInfo?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    } | null;
  };
  onClose?: () => void;
  openAthleteModal?: (athleteId: string | number) => void;
}

export function AdminBookingManager({ prefilledData, onClose, openAthleteModal }: AdminBookingManagerProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { genderOptions } = useGenders();

  // Helper function to find athlete ID by name
  const findAthleteIdByName = (athleteName: string): string | null => {
    if (!athletes || !athleteName) return null;
    
    const athlete = athletes.find(a => {
      const fullName = a.firstName && a.lastName ? `${a.firstName} ${a.lastName}` : a.name;
      return fullName === athleteName;
    });
    
    return athlete?.id || null;
  };

  // Fetch all athletes for selection
  const { data: athletes = [] } = useQuery<any[]>({
    queryKey: ["/api/athletes"],
  });

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showManualForm, setShowManualForm] = useState(!!prefilledData);
  const [showUnifiedBooking, setShowUnifiedBooking] = useState(false);
  const [adminBookingContext, setAdminBookingContext] = useState<'new-athlete' | 'existing-athlete' | 'from-athlete'>('new-athlete');
  const [preSelectedAthleteId, setPreSelectedAthleteId] = useState<number | undefined>();
  const [bookingFilter, setBookingFilter] = useState<string>("all");
  const [sortOption, setSortOption] = useState<string>("recent");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null);
  const [dateFilter, setDateFilter] = useState<string>("");

  // Fetch all bookings
  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings"],
    queryFn: () => apiRequest('GET', '/api/bookings').then(res => res.json()),
  });

  // Create manual booking mutation
  const createManualBooking = useMutation({
    mutationFn: async (bookingData: ManualBookingFormData & { isNewAthlete?: boolean }) => {
      // Calculate date of birth from age for compatibility
      const today = new Date();
      const athlete1DOB = new Date(today.getFullYear() - bookingData.athlete1Age, today.getMonth(), today.getDate());
      const athlete2DOB = bookingData.athlete2Age ? 
        new Date(today.getFullYear() - bookingData.athlete2Age, today.getMonth(), today.getDate()) : null;

      const formattedData: any = {
        lessonType: bookingData.lessonType as any,
        preferredDate: new Date(bookingData.preferredDate),
        preferredTime: bookingData.preferredTime,
        focusAreaIds: bookingData.focusAreas.map(() => 1), // Map to focus area IDs (placeholder)
        apparatusIds: [],
        sideQuestIds: [],
        parentFirstName: bookingData.parentFirstName,
        parentLastName: bookingData.parentLastName,
        parentEmail: bookingData.parentEmail,
        parentPhone: bookingData.parentPhone,
        emergencyContactName: bookingData.emergencyContactName,
        emergencyContactPhone: bookingData.emergencyContactPhone,
        amount: bookingData.amount,
        status: BookingStatusEnum.CONFIRMED,
        attendanceStatus: AttendanceStatusEnum.PENDING,
        bookingMethod: bookingData.bookingMethod as any,
        waiverSigned: false,
        paymentStatus: PaymentStatusEnum.RESERVATION_PENDING,
        reservationFeePaid: false,
        paidAmount: "0.00",
        specialRequests: "",
        adminNotes: bookingData.adminNotes || "",
        // Safety verification fields (defaults for admin-created bookings)
        dropoffPersonName: bookingData.parentFirstName + " " + bookingData.parentLastName,
        dropoffPersonRelationship: "Parent",
        dropoffPersonPhone: bookingData.parentPhone,
        pickupPersonName: bookingData.parentFirstName + " " + bookingData.parentLastName,
        pickupPersonRelationship: "Parent",
        pickupPersonPhone: bookingData.parentPhone,
        safetyVerificationSigned: false,
        // Include gender info in athletes array for proper athlete creation
        athletes: [
          {
            athleteId: null,
            slotOrder: 1,
            name: bookingData.athlete1Name,
            dateOfBirth: athlete1DOB.toISOString().split('T')[0],
            allergies: bookingData.allergies1 || "",
            experience: bookingData.athlete1Experience,
            gender: bookingData.athlete1Gender || undefined,
          },
          ...(bookingData.athlete2Name ? [{
            athleteId: null,
            slotOrder: 2,
            name: bookingData.athlete2Name,
            dateOfBirth: athlete2DOB ? athlete2DOB.toISOString().split('T')[0] : "",
            allergies: bookingData.allergies2 || "",
            experience: bookingData.athlete2Experience || "beginner",
            gender: bookingData.athlete2Gender || undefined,
          }] : [])
        ]
      };

      const response = await apiRequest("POST", "/api/bookings", formattedData);
      const result = await response.json();

      // If this is a new athlete, trigger automated email workflows
      if (bookingData.isNewAthlete) {
        try {
          await apiRequest("POST", `/api/bookings/${result.id}/send-new-athlete-emails`);
        } catch (emailError) {
          console.warn("Failed to send automated emails:", emailError);
          // Don't fail the booking creation if emails fail
        }
      }

      return result;
    },
    onSuccess: () => {
      toast({
        title: "Booking Created",
        description: "Manual booking has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowManualForm(false);
      if (onClose) {
        onClose();
      }
    },
    onError: (error: any) => {
      console.error("Manual booking error:", error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please check all required fields.",
        variant: "destructive",
      });
    },
  });

  // Update booking status mutation
  const updateBookingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Booking status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  // Update payment status mutation
  const updatePaymentStatusMutation = useMutation({
    mutationFn: async ({ id, paymentStatus }: { id: number; paymentStatus: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}/payment-status`, { paymentStatus });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment Status Updated",
        description: "Payment status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      });
    },
  });

  // Update attendance status mutation
  const updateAttendanceStatusMutation = useMutation({
    mutationFn: async ({ id, attendanceStatus }: { id: number; attendanceStatus: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}/attendance-status`, { attendanceStatus });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Attendance Status Updated",
        description: "Attendance status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update attendance status.",
        variant: "destructive",
      });
    },
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/bookings/${id}`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Deleted",
        description: "Booking has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete booking.",
        variant: "destructive",
      });
    },
  });

  // Reschedule booking mutation
  const rescheduleBookingMutation = useMutation({
    mutationFn: async ({ id, date, time }: { id: number; date: string; time: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${id}`, {
        preferredDate: date,
        preferredTime: time,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Rescheduled",
        description: "The booking has been rescheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setShowRescheduleModal(false);
      setRescheduleBooking(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reschedule booking.",
        variant: "destructive",
      });
    },
  });

  // Send waiver email mutation
  const sendWaiverEmailMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("POST", `/api/bookings/${bookingId}/send-waiver-email`);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Waiver Email Sent",
        description: "Waiver email has been sent to the parent.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send waiver email.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedBookings = bookings
    .filter((booking: Booking) => {
      // Filter by status
      if (bookingFilter !== "all" && booking.status !== bookingFilter) {
        return false;
      }
      // Filter by date if specified
      if (dateFilter && booking.preferredDate !== dateFilter) {
        return false;
      }
      return true;
    })
    .sort((a: Booking, b: Booking) => {
      switch (sortOption) {
        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "date-asc":
          return new Date(a.preferredDate + " " + a.preferredTime).getTime() - 
                 new Date(b.preferredDate + " " + b.preferredTime).getTime();
        case "date-desc":
          return new Date(b.preferredDate + " " + b.preferredTime).getTime() - 
                 new Date(a.preferredDate + " " + a.preferredTime).getTime();
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions - Mobile Responsive */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h2 className="text-2xl font-bold">Booking Management</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:flex lg:items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <Input
              type="date"
              className="w-full min-w-0"
              onChange={(e) => setDateFilter(e.target.value)}
              placeholder="Filter by date"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select value={bookingFilter} onValueChange={setBookingFilter}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="manual-paid">Manual Paid</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="no-show">No Show</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="date-asc">Session Date ↑</SelectItem>
                <SelectItem value="date-desc">Session Date ↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              setAdminBookingContext('new-athlete');
              setPreSelectedAthleteId(undefined);
              setShowUnifiedBooking(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Athlete Booking
          </Button>
          
          <Button
            variant="outline"
            onClick={() => {
              setAdminBookingContext('existing-athlete');
              setPreSelectedAthleteId(undefined);
              setShowUnifiedBooking(true);
            }}
          >
            <User className="h-4 w-4 mr-2" />
            Existing Athlete Booking
          </Button>
        </div>
      </div>

      {/* Bookings table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Athletes</TableHead>
                <TableHead>Lesson Type</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedBookings.map((booking: Booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <div>
                        <div className="font-medium">{booking.preferredDate}</div>
                        <div className="text-sm text-gray-500">{booking.preferredTime}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {booking.athletes?.map((athlete: any, index: number) => {
                        const athleteId = findAthleteIdByName(athlete.name);
                        return (
                          <div key={index} className={index === 0 ? "font-medium" : "text-sm text-muted-foreground"}>
                            {athleteId && openAthleteModal ? (
                              <button
                                type="button"
                                onClick={() => {
                                  console.log('🔍 BOOKING TABLE CLICK DEBUG:', {
                                    athleteId,
                                    athleteName: athlete.name,
                                    openAthleteModalExists: !!openAthleteModal,
                                    fullAthleteData: athlete
                                  });
                                  openAthleteModal(athleteId);
                                }}
                                className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                              >
                                {athlete.name}
                              </button>
                            ) : (
                              athlete.name
                            )}
                          </div>
                        );
                      }) || (
                        // Fallback to legacy athlete data
                        <div className="space-y-1">
                          {booking.athlete1Name && (
                            <div className="font-medium">
                              {(() => {
                                const athleteId = findAthleteIdByName(booking.athlete1Name);
                                return athleteId && openAthleteModal ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      console.log('🔍 LEGACY ATHLETE1 CLICK DEBUG:', {
                                        athleteId,
                                        athleteName: booking.athlete1Name,
                                        openAthleteModalExists: !!openAthleteModal
                                      });
                                      openAthleteModal(athleteId);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit"
                                  >
                                    {booking.athlete1Name}
                                  </button>
                                ) : (
                                  booking.athlete1Name
                                );
                              })()}
                            </div>
                          )}
                          {booking.athlete2Name && (
                            <div className="text-sm text-muted-foreground">
                              {(() => {
                                const athleteId = findAthleteIdByName(booking.athlete2Name);
                                return athleteId && openAthleteModal ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      console.log('🔍 LEGACY ATHLETE2 CLICK DEBUG:', {
                                        athleteId,
                                        athleteName: booking.athlete2Name,
                                        openAthleteModalExists: !!openAthleteModal
                                      });
                                      openAthleteModal(athleteId);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-transparent border-none p-0 font-inherit text-sm"
                                  >
                                    {booking.athlete2Name}
                                  </button>
                                ) : (
                                  booking.athlete2Name
                                );
                              })()}
                            </div>
                          )}
                          {!booking.athlete1Name && !booking.athlete2Name && (
                            <div className="text-muted-foreground">No athletes</div>
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {(() => {
                        const lessonType = booking.lessonType;
                        if (typeof lessonType === 'object' && lessonType && 'name' in lessonType) {
                          return (lessonType as any).name;
                        }
                        return lessonType || booking.lessonTypeName || 'Unknown Lesson Type';
                      })()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge {...getPaymentStatusBadgeProps(booking.paymentStatus || 'unpaid')}>
                      {(booking.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (booking.paymentStatus || 'unpaid').slice(1).replace(/-/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge {...getAttendanceStatusBadgeProps(booking.attendanceStatus || 'pending')}>
                      {(booking.attendanceStatus || 'pending').charAt(0).toUpperCase() + (booking.attendanceStatus || 'pending').slice(1).replace(/-/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        ${(() => {
                          // Always use lessonType.price as source of truth
                          const price = getLessonPrice(booking);
                          return price > 0 ? price.toFixed(2) : '0.00';
                        })()}
                      </div>
                      {booking.paymentStatus === 'paid' && booking.reservationFeePaid && (
                        <div className="text-xs text-gray-500">
                          (Res. fee: $10)
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                          </DialogHeader>
                          <BookingDetailsView booking={booking} />
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRescheduleBooking(booking);
                          setShowRescheduleModal(true);
                        }}
                        title="Quick Reschedule"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      {/* Send Waiver Email button for manual bookings without signed waivers */}
                      {booking.bookingMethod === 'manual' && !booking.waiverSigned && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => sendWaiverEmailMutation.mutate(booking.id)}
                          disabled={sendWaiverEmailMutation.isPending}
                          title="Send Waiver Email"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <div className="flex flex-col gap-2">
                        <div className="space-y-1">
                          <Select
                            value={booking.paymentStatus || 'unpaid'}
                            onValueChange={(paymentStatus) => 
                              updatePaymentStatusMutation.mutate({ id: booking.id, paymentStatus })
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                              <SelectItem value="reservation-pending">Reservation: Pending</SelectItem>
                              <SelectItem value="reservation-paid">Reservation: Paid</SelectItem>
                              <SelectItem value="reservation-failed">Reservation: Failed</SelectItem>
                              <SelectItem value="session-paid">Session Paid</SelectItem>
                              <SelectItem value="reservation-refunded">Reservation: Refunded</SelectItem>
                              <SelectItem value="session-refunded">Session: Refunded</SelectItem>
                            </SelectContent>
                          </Select>
                          {booking.reservationFeePaid && booking.paymentStatus !== 'reservation-failed' && booking.paymentStatus !== 'failed' && (
                            <div className="text-xs text-green-600 font-medium">
                              Reservation: ${parseFloat(booking.paidAmount || "10").toFixed(2)} ✓
                            </div>
                          )}
                        </div>
                        <Select
                          value={booking.attendanceStatus || 'pending'}
                          onValueChange={(attendanceStatus) => 
                            updateAttendanceStatusMutation.mutate({ id: booking.id, attendanceStatus })
                          }
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="no-show">No Show</SelectItem>
                            <SelectItem value="manual">Manual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => deleteBookingMutation.mutate(booking.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Reschedule Modal */}
      <Dialog open={showRescheduleModal} onOpenChange={setShowRescheduleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quick Reschedule</DialogTitle>
          </DialogHeader>
          {rescheduleBooking && (
            <AdminRescheduleForm 
              booking={rescheduleBooking} 
              onSubmit={(date, time) => {
                rescheduleBookingMutation.mutate({
                  id: rescheduleBooking.id,
                  date,
                  time
                });
              }} 
              onCancel={() => setShowRescheduleModal(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Unified Booking Modal for Admin Flows */}
      <UnifiedBookingModal
        isOpen={showUnifiedBooking}
        onClose={() => setShowUnifiedBooking(false)}
        isAdminFlow={true}
        adminContext={adminBookingContext}
        preSelectedAthleteId={preSelectedAthleteId}
      />
    </div>
  );
}

// Manual Booking Form Component
function ManualBookingForm({ 
  onSubmit, 
  isLoading,
  prefilledData
}: { 
  onSubmit: (data: ManualBookingFormData & { isNewAthlete?: boolean }) => void;
  isLoading: boolean;
  prefilledData?: {
    athlete1Name?: string;
    athlete1DateOfBirth?: string;
    athlete1Experience?: string;
    athlete1Allergies?: string;
    parentInfo?: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      emergencyContactName?: string;
      emergencyContactPhone?: string;
    } | null;
  };
}) {
  const { toast } = useToast();
  const { genderOptions } = useGenders();
  const [athleteSelectionMode, setAthleteSelectionMode] = useState<'existing' | 'new'>('new');
  const [selectedExistingAthlete, setSelectedExistingAthlete] = useState<any>(null);
  const [formData, setFormData] = useState<ManualBookingFormData>({
    lessonType: "30-min-private",
    athlete1Name: prefilledData?.athlete1Name || "",
    athlete1Age: prefilledData?.athlete1DateOfBirth ? calculateAge(prefilledData.athlete1DateOfBirth) : 6,
    athlete1Experience: prefilledData?.athlete1Experience || "beginner",
    athlete1Gender: "",
    athlete2Name: "",
    athlete2Age: 6,
    athlete2Experience: "beginner",
    athlete2Gender: "",
    preferredDate: "",
    preferredTime: "",
    focusAreas: [],
    parentFirstName: prefilledData?.parentInfo?.firstName || "",
    parentLastName: prefilledData?.parentInfo?.lastName || "",
    parentEmail: prefilledData?.parentInfo?.email || "",
    parentPhone: prefilledData?.parentInfo?.phone || "",
    emergencyContactName: prefilledData?.parentInfo?.emergencyContactName || "",
    emergencyContactPhone: prefilledData?.parentInfo?.emergencyContactPhone || "",
    allergies1: prefilledData?.athlete1Allergies || "",
    allergies2: "",
    amount: "40",
    bookingMethod: "phone",
    adminNotes: "",
  });

  const [selectedApparatus, setSelectedApparatus] = useState<string>("");

  // Fetch all parents for mapping
  const { data: parents = [] } = useQuery<any[]>({
    queryKey: ["/api/parents"],
  });

  // Fetch all athletes for existing athlete selection
  const { data: athletes = [] } = useQuery<any[]>({
    queryKey: ["/api/athletes"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'lessonType',
      'athlete1Name', 
      'preferredDate',
      'preferredTime',
      'parentFirstName',
      'parentLastName', 
      'parentEmail',
      'parentPhone',
      'emergencyContactName',
      'emergencyContactPhone'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof ManualBookingFormData] || 
      (typeof formData[field as keyof ManualBookingFormData] === 'string' && 
       (formData[field as keyof ManualBookingFormData] as string).trim() === ''));

    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      alert(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    // Additional validation for semi-private lessons
    if ((formData.lessonType === "30-min-semi-private" || formData.lessonType === "1-hour-semi-private") && 
        !formData.athlete2Name?.trim()) {
      console.error('Semi-private lesson requires second athlete');
      alert('Semi-private lessons require a second athlete. Please add the second athlete\'s information.');
      return;
    }

    onSubmit({ ...formData, isNewAthlete: athleteSelectionMode === 'new' });
  };

  // Fetch available time slots for the selected date and lesson type
  const { data: availableSlots = [], isLoading: slotsLoading } = useAvailableTimes(
    formData.preferredDate || '',
    formData.lessonType || ''
  );

  const toggleFocusArea = (area: string) => {
    const lessonConfig = LESSON_TYPES[formData.lessonType as keyof typeof LESSON_TYPES] || { maxFocusAreas: 2 };
    const maxFocusAreas = lessonConfig.maxFocusAreas;

    if (formData.focusAreas.includes(area)) {
      // Remove area
      setFormData(prev => ({
        ...prev,
        focusAreas: prev.focusAreas.filter(a => a !== area)
      }));
    } else {
      // Add area with dynamic limit check
      if (formData.focusAreas.length >= maxFocusAreas) {
        const lessonDuration = lessonConfig.duration || '30 minutes';
        const limitMessage = lessonDuration.includes('30') 
          ? "Limit reached: You can only choose up to 2 focus areas for 30-minute lessons."
          : "Limit reached: You can only select up to 4 focus areas for a 1-hour session.";

        toast({
          title: "Focus Area Limit Reached",
          description: limitMessage,
          variant: "destructive",
        });

        return; // Don't add the area
      }

      setFormData(prev => ({
        ...prev,
        focusAreas: [...prev.focusAreas, area]
      }));
    }
  };

  // Handle existing athlete selection
  const handleExistingAthleteSelect = (athlete: any) => {
    setSelectedExistingAthlete(athlete);
    const parent = parents.find(p => p.id === athlete.parentId);

    setFormData(prev => ({
      ...prev,
      athlete1Name: athlete.name || `${athlete.firstName} ${athlete.lastName}`,
      athlete1Age: calculateAge(athlete.dateOfBirth),
      athlete1Experience: athlete.experience || 'beginner',
      athlete1Gender: athlete.gender || '',
      allergies1: athlete.allergies || '',
      parentFirstName: parent?.firstName || '',
      parentLastName: parent?.lastName || '',
      parentEmail: parent?.email || '',
      parentPhone: parent?.phone || '',
      emergencyContactName: parent?.emergencyContactName || '',
      emergencyContactPhone: parent?.emergencyContactPhone || ''
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="selection" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="selection">Selection</TabsTrigger>
          <TabsTrigger value="lesson">Lesson</TabsTrigger>
          <TabsTrigger value="athletes">Athletes</TabsTrigger>
          <TabsTrigger value="parent">Parent</TabsTrigger>
          <TabsTrigger value="focus">Focus Areas</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Athlete Selection Tab */}
        <TabsContent value="selection" className="space-y-4">
          <div className="space-y-4">
            <h4 className="font-semibold">Select Athlete Option</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-colors ${
                  athleteSelectionMode === 'existing' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setAthleteSelectionMode('existing');
                  // Clear selection when switching to existing athlete mode
                  setSelectedExistingAthlete(null);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      athleteSelectionMode === 'existing' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`} />
                    <div>
                      <h5 className="font-medium">Existing Athlete</h5>
                      <p className="text-sm text-gray-600">Select from registered athletes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-colors ${
                  athleteSelectionMode === 'new' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  setAthleteSelectionMode('new');
                  // Clear form when switching to new athlete
                  setSelectedExistingAthlete(null);
                  setFormData(prev => ({
                    ...prev,
                    athlete1Name: '',
                    athlete1Age: 6,
                    athlete1Experience: 'beginner',
                    athlete1Gender: '',
                    allergies1: '',
                    parentFirstName: '',
                    parentLastName: '',
                    parentEmail: '',
                    parentPhone: '',
                    emergencyContactName: '',
                    emergencyContactPhone: ''
                  }));
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      athleteSelectionMode === 'new' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'
                    }`} />
                    <div>
                      <h5 className="font-medium">New Athlete</h5>
                      <p className="text-sm text-gray-600">Add new athlete and parent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Existing Athlete Selection */}
            {athleteSelectionMode === 'existing' && (
              <div className="space-y-4">
                <h5 className="font-medium">Select Athlete</h5>
                {athletes.length > 0 ? (
                  <div className="grid gap-3 max-h-64 overflow-y-auto">
                    {athletes.map((athlete: any) => {
                      const parent = parents.find(p => p.id === athlete.parentId);
                      return (
                        <Card 
                          key={athlete.id}
                          className={`cursor-pointer transition-colors ${
                            selectedExistingAthlete?.id === athlete.id ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleExistingAthleteSelect(athlete)}
                        >
                          <CardContent className="p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <h6 className="font-medium">
                                  {athlete.name || `${athlete.firstName} ${athlete.lastName}`}
                                </h6>
                                <p className="text-sm text-gray-600">
                                  {calculateAge(athlete.dateOfBirth)} years old • {athlete.experience}
                                </p>
                                {parent && (
                                  <p className="text-xs text-gray-500">
                                    Parent: {parent.firstName} {parent.lastName} ({parent.email})
                                  </p>
                                )}
                              </div>
                              {selectedExistingAthlete?.id === athlete.id && (
                                <CheckCircle className="h-5 w-5 text-blue-500" />
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No athletes found. Please add a new athlete.</p>
                )}
              </div>
            )}

            {/* New Athlete Notice */}
            {athleteSelectionMode === 'new' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">New Athlete Booking</h5>
                <p className="text-sm text-blue-700 mb-3">
                  When you create this booking for a new athlete, the system will automatically:
                </p>
                <ul className="text-sm text-blue-700 space-y-1 ml-4">
                  <li>• Send a reservation payment email with secure payment portal link</li>
                  <li>• Send a waiver completion email with direct login link</li>
                  <li>• Send safety information email for pickup/drop-off authorization</li>
                  <li>• Create parent and athlete profiles in the system</li>
                </ul>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Lesson Details Tab */}
        <TabsContent value="lesson" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lessonType">Lesson Type</Label>
              <Select 
                value={formData.lessonType} 
                onValueChange={(value) => setFormData({ ...formData, lessonType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30-min-private">30 Min Private ($40)</SelectItem>
                  <SelectItem value="30-min-semi-private">30 Min Semi-Private ($50)</SelectItem>
                  <SelectItem value="1-hour-private">1 Hour Private ($65)</SelectItem>
                  <SelectItem value="1-hour-semi-private">1 Hour Semi-Private ($80)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="preferredDate">Date</Label>
              <Input
                id="preferredDate"
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value, preferredTime: '' })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div>
              <Label htmlFor="preferredTime">Time</Label>
              <Select 
                value={formData.preferredTime} 
                onValueChange={(value) => {
                  // Only set valid time slots, ignore placeholder values
                  if (value && !value.startsWith('__')) {
                    setFormData({ ...formData, preferredTime: value });
                  }
                }}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {!formData.preferredDate ? (
                    <SelectItem value="__no_date" disabled>
                      Please select a date first
                    </SelectItem>
                  ) : slotsLoading ? (
                    <SelectItem value="__loading" disabled>
                      Loading available times...
                    </SelectItem>
                  ) : availableSlots.length === 0 ? (
                    <SelectItem value="__no_slots" disabled>
                      No available times for this date
                    </SelectItem>
                  ) : (
                    availableSlots.map((time: string) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Athletes Tab */}
        <TabsContent value="athletes" className="space-y-4">
          {athleteSelectionMode === 'existing' && selectedExistingAthlete ? (
            // Show existing athlete information
            <div className="space-y-4">
              <h4 className="font-semibold text-blue-600">Selected Existing Athlete</h4>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Athlete Name</Label>
                      <p className="text-blue-900 font-medium">
                        {selectedExistingAthlete.name || `${selectedExistingAthlete.firstName} ${selectedExistingAthlete.lastName}`}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Age</Label>
                      <p className="text-blue-900">{calculateAge(selectedExistingAthlete.dateOfBirth)} years old</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Experience Level</Label>
                      <p className="text-blue-900 capitalize">{selectedExistingAthlete.experience}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Gender</Label>
                      <p className="text-blue-900">{selectedExistingAthlete.gender || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-blue-800">Allergies/Medical Notes</Label>
                      <p className="text-blue-900">{selectedExistingAthlete.allergies || 'None specified'}</p>
                    </div>
                  </div>
                  {(() => {
                    const parent = parents.find(p => p.id === selectedExistingAthlete.parentId);
                    if (parent) {
                      return (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <Label className="text-sm font-medium text-blue-800">Parent Information</Label>
                          <div className="grid md:grid-cols-2 gap-4 mt-2">
                            <p className="text-blue-900">{parent.firstName} {parent.lastName}</p>
                            <p className="text-blue-900">{parent.email}</p>
                            <p className="text-blue-900">{parent.phone}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-700">
                  ✓ This athlete's information will be automatically used for the booking. 
                  No additional data entry is required.
                </p>
              </div>
            </div>
          ) : athleteSelectionMode === 'existing' && !selectedExistingAthlete ? (
            // Prompt to select an athlete
            <div className="text-center py-8 space-y-4">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto" />
              <h4 className="font-semibold text-gray-600">No Athlete Selected</h4>
              <p className="text-gray-500">Please go back to the Selection tab and choose an existing athlete.</p>
            </div>
          ) : (
            // Show form for new athlete
            <div className="grid md:grid-cols-2 gap-6">
              {/* Athlete 1 */}
              <div className="space-y-4">
                <h4 className="font-semibold">Primary Athlete</h4>
                <div>
                  <Label htmlFor="athlete1Name">Name</Label>
                  <Input
                    id="athlete1Name"
                    value={formData.athlete1Name}
                    onChange={(e) => setFormData({ ...formData, athlete1Name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="athlete1Age">Age</Label>
                  <Select 
                    value={formData.athlete1Age.toString()} 
                    onValueChange={(value) => setFormData({ ...formData, athlete1Age: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 13 }, (_, i) => i + 3).map((age) => (
                        <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="athlete1Experience">Experience Level</Label>
                  <Select 
                    value={formData.athlete1Experience} 
                    onValueChange={(value) => setFormData({ ...formData, athlete1Experience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="athlete1Gender">Gender</Label>
                  <Select 
                    value={formData.athlete1Gender || ""} 
                    onValueChange={(value) => setFormData({ ...formData, athlete1Gender: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genderOptions.map((gender: string) => (
                        <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="allergies1">Allergies/Medical Notes</Label>
                  <Textarea
                    id="allergies1"
                    value={formData.allergies1}
                    onChange={(e) => setFormData({ ...formData, allergies1: e.target.value })}
                    placeholder="Any allergies or medical conditions..."
                  />
                </div>
              </div>

              {/* Athlete 2 (Semi-Private Only) */}
              {(formData.lessonType === "30-min-semi-private" || formData.lessonType === "1-hour-semi-private") && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Secondary Athlete</h4>
                  <div>
                    <Label htmlFor="athlete2Name">Name</Label>
                    <Input
                      id="athlete2Name"
                      value={formData.athlete2Name}
                      onChange={(e) => setFormData({ ...formData, athlete2Name: e.target.value })}
                    />
                  </div>
                  {formData.athlete2Name && (
                    <>
                      <div>
                        <Label htmlFor="athlete2Age">Age</Label>
                        <Select 
                          value={formData.athlete2Age?.toString() || ""} 
                          onValueChange={(value) => setFormData({ ...formData, athlete2Age: parseInt(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 13 }, (_, i) => i + 3).map((age) => (
                              <SelectItem key={age} value={age.toString()}>{age}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="athlete2Experience">Experience Level</Label>
                        <Select 
                          value={formData.athlete2Experience} 
                          onValueChange={(value) => setFormData({ ...formData, athlete2Experience: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="intermediate">Intermediate</SelectItem>
                            <SelectItem value="advanced">Advanced</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="athlete2Gender">Gender</Label>
                        <Select 
                          value={formData.athlete2Gender || ""} 
                          onValueChange={(value) => setFormData({ ...formData, athlete2Gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            {genderOptions.map((gender: string) => (
                              <SelectItem key={gender} value={gender}>{gender}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="allergies2">Allergies/Medical Notes</Label>
                        <Textarea
                          id="allergies2"
                          value={formData.allergies2}
                          onChange={(e) => setFormData({ ...formData, allergies2: e.target.value })}
                          placeholder="Any allergies or medical conditions..."
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* Parent Information Tab */}
        <TabsContent value="parent" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="parentFirstName">Parent First Name</Label>
              <Input
                id="parentFirstName"
                value={formData.parentFirstName}
                onChange={(e) => setFormData({ ...formData, parentFirstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="parentLastName">Parent Last Name</Label>
              <Input
                id="parentLastName"
                value={formData.parentLastName}
                onChange={(e) => setFormData({ ...formData, parentLastName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="parentEmail">Email</Label>
              <Input
                id="parentEmail"
                type="email"
                value={formData.parentEmail}
                onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="parentPhone">Phone</Label>
              <Input
                id="parentPhone"
                type="tel"
                value={formData.parentPhone}
                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={formData.emergencyContactName}
                onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                required
              />
            </div>
          </div>
        </TabsContent>

        {/* Focus Areas Tab */}
        <TabsContent value="focus" className="space-y-4">
          <div>
            <Label>Focus Areas (Select up to 4)</Label>

            {/* Step 1: Select Apparatus */}
            <div className="mt-4">
              <Label htmlFor="apparatus">Step 1: Select Apparatus</Label>
              <Select 
                value={selectedApparatus} 
                onValueChange={setSelectedApparatus}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Choose an apparatus..." />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(GYMNASTICS_EVENTS).map(([key, event]) => (
                    <SelectItem key={key} value={key}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Select Skills */}
            {selectedApparatus && (
              <div className="mt-4">
                <Label>Step 2: Select Skills from {GYMNASTICS_EVENTS[selectedApparatus as keyof typeof GYMNASTICS_EVENTS].name}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                  {GYMNASTICS_EVENTS[selectedApparatus as keyof typeof GYMNASTICS_EVENTS].skills.map((skill) => {
                    const skillId = `${GYMNASTICS_EVENTS[selectedApparatus as keyof typeof GYMNASTICS_EVENTS].name}: ${skill}`;
                    return (
                      <div key={skillId} className="flex items-center space-x-2">
                        <Checkbox
                          id={skillId}
                          checked={formData.focusAreas.includes(skillId)}
                          onCheckedChange={() => toggleFocusArea(skillId)}
                          disabled={(() => {
                            const lessonConfig = LESSON_TYPES[formData.lessonType as keyof typeof LESSON_TYPES] || { maxFocusAreas: 2 };
                            return !formData.focusAreas.includes(skillId) && formData.focusAreas.length >= lessonConfig.maxFocusAreas;
                          })()}
                        />
                        <Label 
                          htmlFor={skillId} 
                          className="text-sm font-normal cursor-pointer"
                        >
                          {skill}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-4">
              <p className="text-sm text-gray-500">
                Selected: {formData.focusAreas.length}/{(() => {
                  const lessonConfig = LESSON_TYPES[formData.lessonType as keyof typeof LESSON_TYPES] || { maxFocusAreas: 2 };
                  return lessonConfig.maxFocusAreas;
                })()}
              </p>
              {formData.focusAreas.length > 0 && (
                <div className="mt-2">
                  <Label className="text-xs">Selected Skills:</Label>
                  <ul className="text-xs text-gray-600 mt-1">
                    {formData.focusAreas.map((area) => (
                      <li key={area}>• {area}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <div>
            <Label htmlFor="bookingMethod">Booking Method</Label>
            <Select 
              value={formData.bookingMethod} 
              onValueChange={(value) => setFormData({ ...formData, bookingMethod: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="in-person">In Person</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              value={formData.adminNotes}
              onChange={(e) => setFormData({ ...formData, adminNotes: e.target.value })}
              placeholder="Internal notes about this booking..."
              rows={4}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={() => setFormData({ 
          ...formData, 
          athlete1Name: "", 
          athlete1Gender: "",
          athlete2Name: "", 
          athlete2Gender: "",
          parentFirstName: "", 
          parentLastName: "", 
          parentEmail: "", 
          parentPhone: "",
          emergencyContactName: "",
          emergencyContactPhone: "",
          preferredDate: "",
          preferredTime: "",
          adminNotes: ""
        })}>
          Clear Form
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Booking"}
        </Button>
      </div>
    </form>
  );
}

// Booking Details View Component
function BookingDetailsView({ booking }: { booking: Booking }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-semibold mb-3">Lesson Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Type:</span>
              <span>{(() => {
                const lessonType = booking.lessonType;
                if (typeof lessonType === 'object' && lessonType && 'name' in lessonType) {
                  return (lessonType as any).name;
                }
                return lessonType || booking.lessonTypeName || 'Unknown Lesson Type';
              })()}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{booking.preferredDate}</span>
            </div>
            <div className="flex justify-between">
              <span>Time:</span>
              <span>{booking.preferredTime}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment Status:</span>
              <Badge {...getPaymentStatusBadgeProps(booking.paymentStatus || 'unpaid')}>
                {booking.displayPaymentStatus || (booking.paymentStatus || 'unpaid').charAt(0).toUpperCase() + (booking.paymentStatus || 'unpaid').slice(1)}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Attendance Status:</span>
              <Badge {...getAttendanceStatusBadgeProps(booking.attendanceStatus || 'pending')}>
                {(booking.attendanceStatus || 'pending').charAt(0).toUpperCase() + (booking.attendanceStatus || 'pending').slice(1).replace(/-/g, ' ')}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Amount:</span>
              <span>{(() => {
                const price = getLessonPrice(booking.lessonType);
                if (price && price > 0) return `$${price.toFixed(2)}`;
                const amt = parseFloat(booking.amount || '0');
                return `$${amt > 0 ? amt.toFixed(2) : '0.00'}`;
              })()}</span>
            </div>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Parent Information</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Name:</span>
              <span>{booking.parent?.firstName || booking.parentFirstName} {booking.parent?.lastName || booking.parentLastName}</span>
            </div>
            <div className="flex justify-between">
              <span>Email:</span>
              <span>{booking.parent?.email || booking.parentEmail}</span>
            </div>
            <div className="flex justify-between">
              <span>Phone:</span>
              <span>{booking.parent?.phone || booking.parentPhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Emergency:</span>
              <span>{booking.parent?.emergencyContactName || booking.emergencyContactName}</span>
            </div>
            <div className="flex justify-between">
              <span>Emergency Phone:</span>
              <span>{booking.parent?.emergencyContactPhone || booking.emergencyContactPhone}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-3">Athletes</h4>
        <div className="space-y-3">
          {booking.athletes && booking.athletes.length > 0 ? (
            booking.athletes.map((athlete: any, index: number) => (
              <div key={athlete.id || index} className="p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{athlete.firstName} {athlete.lastName}</div>
                <div className="text-sm text-gray-600">
                  Age: {calculateAge(athlete.dateOfBirth || '')} | Experience: {athlete.experience}
                </div>
                {athlete.allergies && (
                  <div className="text-sm text-red-600 mt-1">
                    Allergies: {athlete.allergies}
                  </div>
                )}
              </div>
            ))
          ) : (
            // Fallback to legacy fields
            <>
              {booking.athlete1Name && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{booking.athlete1Name}</div>
                  <div className="text-sm text-gray-600">
                    Age: {calculateAge(booking.athlete1DateOfBirth || '')} | Experience: {booking.athlete1Experience}
                  </div>
                  {booking.athlete1Allergies && (
                    <div className="text-sm text-red-600 mt-1">
                      Allergies: {booking.athlete1Allergies}
                    </div>
                  )}
                </div>
              )}
              {booking.athlete2Name && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium">{booking.athlete2Name}</div>
                  <div className="text-sm text-gray-600">
                    Age: {booking.athlete2DateOfBirth ? calculateAge(booking.athlete2DateOfBirth) : "N/A"} | Experience: {booking.athlete2Experience}
                  </div>
                  {booking.athlete2Allergies && (
                    <div className="text-sm text-red-600 mt-1">
                      Allergies: {booking.athlete2Allergies}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
          {(!booking.athletes || booking.athletes.length === 0) && !booking.athlete1Name && (
            <div className="text-muted-foreground">No athletes assigned</div>
          )}
        </div>
      </div>

      {booking.focusAreas && booking.focusAreas.length > 0 && (
        <div>
          <h4 className="font-semibold mb-3">Focus Areas</h4>
          <div className="flex flex-wrap gap-2">
            {booking.focusAreas.map((area: any, index: number) => (
              <Badge key={index} variant="secondary">{area}</Badge>
            ))}
          </div>
        </div>
      )}

      {booking.adminNotes && (
        <div>
          <h4 className="font-semibold mb-3">Admin Notes</h4>
          <p className="text-sm bg-gray-50 p-3 rounded-lg">{booking.adminNotes}</p>
        </div>
      )}
    </div>
  );
}