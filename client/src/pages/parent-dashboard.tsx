import { GenderSelect } from '@/components/GenderSelect';
import { ParentWaiverManagement } from '@/components/parent-waiver-management';
import { ParentAthleteDetailDialog } from '@/components/ParentAthleteDetailDialog';
import { SafetyInformationDialog } from '@/components/safety-information-dialog';
import { TwoStepFocusAreas } from '@/components/two-step-focus-areas-edit';
import { AddAthleteModal } from '@/components/AddAthleteModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UnifiedBookingModal } from '@/components/UnifiedBookingModal';
import { UpdatedWaiverModal } from '@/components/updated-waiver-modal';
import { toast } from '@/hooks/use-toast';
import { useAthleteWaiverStatus } from '@/hooks/use-waiver-status';
import { useAvailableTimes } from '@/hooks/useAvailableTimes';
import { formatDate } from '@/lib/dateUtils';
import { apiRequest } from '@/lib/queryClient';
import type { Athlete, Booking, Parent, FocusArea } from '@shared/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Activity, AlertCircle, Award, BookMarked, Calendar, CheckCircle, CheckCircle2, Clock, Download, Edit, Eye, FileCheck, FileText, FileX, HelpCircle, Lightbulb, Mail, MapPin, Medal, PlusCircle, Settings, Shield, Star, Target, TrendingUp, Trophy, User, UserCircle, Users, X, XCircle, Zap } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';

// Import new parent UI components
import {
  ParentStatsGrid,
  ParentStatCard,
  ParentTabs,
  ParentTabsList,
  ParentTabsTrigger,
  ParentTabsContent,
  ParentCard,
  ParentCardHeader,
  ParentCardTitle,
  ParentCardContent,
  ParentButton
} from '@/components/parent-ui';

// Import modal components
import {
  ParentModal,
  ParentModalSection,
  ParentModalGrid
} from '@/components/parent-ui/ParentModal';

// Import layout components directly
import {
  ParentMainContainer,
  ParentContentContainer,
  ParentPageHeader,
  ParentPageTitle,
  ParentPageSubtitle
} from '@/components/parent-ui/ParentLayout';
import { ParentMainContentContainer } from '@/components/parent-ui/ParentMainContentContainer';

// Helper function to format focus areas for display
type FocusAreaDisplay = FocusArea | { name: string; apparatusName?: string } | string;
const formatFocusAreas = (focusAreas: FocusAreaDisplay[]): string => {
  if (!focusAreas || focusAreas.length === 0) return 'No specific focus areas';
  
  return focusAreas.map(area => {
    if (typeof area === 'string') {
      return area; // Legacy string format
    } else if (area && typeof area === 'object' && 'name' in area && typeof area.name === 'string') {
      // New object format with apparatus info
      const withApparatus = area as { name: string; apparatusName?: string };
      return withApparatus.apparatusName ? `${withApparatus.apparatusName}: ${withApparatus.name}` : withApparatus.name;
    }
    return 'Unknown'; // Fallback
  }).join(', ');
};

// RescheduleForm component
function RescheduleForm({ booking, onSubmit, onCancel }: { 
  booking: Booking; 
  onSubmit: (date: string, time: string) => void; 
  onCancel: () => void 
}) {
  const [selectedDate, setSelectedDate] = useState('');
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <ParentModalSection title="Current Session Details">
        <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
          <p>
            <span className="font-medium">Athletes:</span> {booking.athlete1Name}
            {booking.athlete2Name && ` & ${booking.athlete2Name}`}
          </p>
          <p>
            <span className="font-medium">Current Date:</span> {booking.preferredDate} at {booking.preferredTime}
          </p>
        </div>
      </ParentModalSection>

      <ParentModalSection title="New Session Details">
        <ParentModalGrid>
          <div>
            <Label htmlFor="reschedule-date" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Date</Label>
            <Input
              id="reschedule-date"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime(''); // Reset time when date changes
              }}
              min={new Date().toISOString().split('T')[0]}
              required
              className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
            />
          </div>

          <div>
            <Label htmlFor="reschedule-time" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Time</Label>
            <Select
              value={selectedTime}
              onValueChange={setSelectedTime}
              disabled={!selectedDate || slotsLoading}
            >
              <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400">
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
        </ParentModalGrid>
      </ParentModalSection>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <ParentButton variant="secondary" onClick={onCancel}>
          Cancel
        </ParentButton>
        <ParentButton type="submit" disabled={!selectedDate || !selectedTime}>
          Reschedule
        </ParentButton>
      </div>
    </form>
  );
}

// EditBookingForm component
function EditBookingForm({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  // Initialize focus areas - handle both legacy (strings) and new (objects) formats
  const initializeFocusAreas = () => {
    if (!booking.focusAreas || booking.focusAreas.length === 0) return [];
    
    // If the first item is an object, it's the new format
    if (typeof booking.focusAreas[0] === 'object' && booking.focusAreas[0] !== null) {
      return booking.focusAreas as any[];
    }
    
    // Legacy format - convert strings to objects for consistency
    return (booking.focusAreas as string[]).map((name, index) => ({
      id: `legacy-${index}`,
      name,
      apparatus_id: 0,
      apparatusName: 'Legacy'
    }));
  };
  
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<any[]>(initializeFocusAreas());
  const [specialNotes, setSpecialNotes] = useState(booking.adminNotes || '');
  
  // Safety Information
  const [dropoffPersonName, setDropoffPersonName] = useState(booking.dropoffPersonName || '');
  const [dropoffPersonRelationship, setDropoffPersonRelationship] = useState(booking.dropoffPersonRelationship || '');
  const [dropoffPersonPhone, setDropoffPersonPhone] = useState(booking.dropoffPersonPhone || '');
  const [pickupPersonName, setPickupPersonName] = useState(booking.pickupPersonName || '');
  const [pickupPersonRelationship, setPickupPersonRelationship] = useState(booking.pickupPersonRelationship || '');
  const [pickupPersonPhone, setPickupPersonPhone] = useState(booking.pickupPersonPhone || '');
  const [altPickupPersonName, setAltPickupPersonName] = useState(booking.altPickupPersonName || '');
  const [altPickupPersonRelationship, setAltPickupPersonRelationship] = useState(booking.altPickupPersonRelationship || '');
  const [altPickupPersonPhone, setAltPickupPersonPhone] = useState(booking.altPickupPersonPhone || '');
  
  const queryClient = useQueryClient();

  // Determine lesson duration and focus area limits
  const getLessonConfig = () => {
    const lessonType = booking.lessonType?.toLowerCase() || '';
    if (lessonType.includes('deep-dive') || lessonType.includes('partner-progression') || lessonType.includes('1-hour')) {
      return { maxFocusAreas: 4, duration: '60 minutes' };
    }
    return { maxFocusAreas: 2, duration: '30 minutes' };
  };
  
  const lessonConfig = getLessonConfig();

  // Check auth status before making the request
  const { data: authStatus } = useQuery<{ loggedIn: boolean; parentId?: string; email?: string }>({
    queryKey: ['/api/parent-auth/status'],
    retry: false,
  });

  useEffect(() => {
    console.log('🔑 Parent Authentication Status:', authStatus);
  }, [authStatus]);

  const updateBookingMutation = useMutation({
    mutationFn: async (data: { 
      focusAreas: any[]; 
      specialNotes: string;
      dropoffPersonName: string;
      dropoffPersonRelationship: string;
      dropoffPersonPhone: string;
      pickupPersonName: string;
      pickupPersonRelationship: string;
      pickupPersonPhone: string;
      altPickupPersonName?: string;
      altPickupPersonRelationship?: string;
      altPickupPersonPhone?: string;
    }) => {
      console.log('� Auth Status before request:', authStatus);
      console.log('�🔄 Sending booking update request for ID:', booking.id, 'with data:', data);
      try {
        // First, verify that we have an authentication cookie
        console.log('🍪 Current cookies:', document.cookie || 'No cookies found');
        
        // Use the correct safety information endpoint with PUT method
        const response = await apiRequest('PUT', `/api/parent/bookings/${booking.id}/safety`, data);
        console.log('✅ Booking update response:', response.status, response.statusText);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ Booking update failed:', response.status, errorText);
          throw new Error(`Failed to update booking: ${response.status} ${errorText}`);
        }
        return response.json();
      } catch (error) {
        console.error('❌ Booking update error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/bookings'] });
      toast({
        title: "Booking Updated",
        description: "Booking information has been updated successfully."
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not update booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required safety fields
    if (!dropoffPersonName || !dropoffPersonRelationship || !dropoffPersonPhone || 
        !pickupPersonName || !pickupPersonRelationship || !pickupPersonPhone) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required pickup and drop-off information.",
        variant: "destructive"
      });
      return;
    }
    
    updateBookingMutation.mutate({
      focusAreas: selectedFocusAreas,
      specialNotes: specialNotes,
      dropoffPersonName,
      dropoffPersonRelationship,
      dropoffPersonPhone,
      pickupPersonName,
      pickupPersonRelationship,
      pickupPersonPhone,
      altPickupPersonName,
      altPickupPersonRelationship,
      altPickupPersonPhone
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Focus Areas Section */}
      <ParentModalSection title="Focus Areas">
        <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <TwoStepFocusAreas
            selectedFocusAreas={selectedFocusAreas}
            onFocusAreasChange={setSelectedFocusAreas}
            maxFocusAreas={lessonConfig.maxFocusAreas}
            lessonDuration={lessonConfig.duration}
          />
        </div>
      </ParentModalSection>

      {/* Safety Information Section */}
      <ParentModalSection title="Safety Information">
        <div className="space-y-6">
          {/* Drop-off Person Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Drop-off Person Information</h4>
            <ParentModalGrid>
              <div>
                <Label htmlFor="dropoff-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name*</Label>
                <Input
                  id="dropoff-name"
                  value={dropoffPersonName}
                  onChange={(e) => setDropoffPersonName(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="dropoff-relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">Relationship to Athlete*</Label>
                <Input
                  id="dropoff-relationship"
                  value={dropoffPersonRelationship}
                  onChange={(e) => setDropoffPersonRelationship(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="Parent, Guardian, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="dropoff-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number*</Label>
                <Input
                  id="dropoff-phone"
                  value={dropoffPersonPhone}
                  onChange={(e) => setDropoffPersonPhone(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </ParentModalGrid>
          </div>
          
          {/* Pick-up Person Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Pick-up Person Information</h4>
            <ParentModalGrid>
              <div>
                <Label htmlFor="pickup-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name*</Label>
                <Input
                  id="pickup-name"
                  value={pickupPersonName}
                  onChange={(e) => setPickupPersonName(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="Full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="pickup-relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">Relationship to Athlete*</Label>
                <Input
                  id="pickup-relationship"
                  value={pickupPersonRelationship}
                  onChange={(e) => setPickupPersonRelationship(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="Parent, Guardian, etc."
                  required
                />
              </div>
              <div>
                <Label htmlFor="pickup-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number*</Label>
                <Input
                  id="pickup-phone"
                  value={pickupPersonPhone}
                  onChange={(e) => setPickupPersonPhone(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="(555) 123-4567"
                  required
                />
              </div>
            </ParentModalGrid>
          </div>
          
          {/* Alternative Pick-up Person Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Alternative Pick-up Person (Optional)</h4>
            <ParentModalGrid>
              <div>
                <Label htmlFor="alt-pickup-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</Label>
                <Input
                  id="alt-pickup-name"
                  value={altPickupPersonName}
                  onChange={(e) => setAltPickupPersonName(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="Full name"
                />
              </div>
              <div>
                <Label htmlFor="alt-pickup-relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">Relationship to Athlete</Label>
                <Input
                  id="alt-pickup-relationship"
                  value={altPickupPersonRelationship}
                  onChange={(e) => setAltPickupPersonRelationship(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="Relative, Friend, etc."
                />
              </div>
              <div>
                <Label htmlFor="alt-pickup-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                <Input
                  id="alt-pickup-phone"
                  value={altPickupPersonPhone}
                  onChange={(e) => setAltPickupPersonPhone(e.target.value)}
                  className="mt-1 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700 focus:border-yellow-500 dark:focus:border-yellow-400 text-blue-900 dark:text-yellow-100"
                  placeholder="(555) 123-4567"
                />
              </div>
            </ParentModalGrid>
          </div>
        </div>
      </ParentModalSection>
      
      <ParentModalSection title="Special Notes">
        <div>
          <Label htmlFor="special-notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">Additional Information</Label>
          <textarea
            id="special-notes"
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            className="mt-1 w-full min-h-[100px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:border-[#0F0276] dark:focus:border-blue-400 focus:ring-1 focus:ring-[#0F0276] dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Add any special notes about this booking..."
          />
        </div>
      </ParentModalSection>

      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <ParentButton variant="secondary" onClick={onClose}>
          Cancel
        </ParentButton>
        <ParentButton type="submit" disabled={updateBookingMutation.isPending}>
          {updateBookingMutation.isPending ? 'Updating...' : 'Update Booking'}
        </ParentButton>
      </div>
    </form>
  );
}

function ParentDashboard() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null);
  const [editingBookingId, setEditingBookingId] = useState<number | null>(null);
  const [reschedulingBookingId, setReschedulingBookingId] = useState<number | null>(null);
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [editingAthleteId, setEditingAthleteId] = useState<number | null>(null);
  const [editingAthleteInfo, setEditingAthleteInfo] = useState<any>(null);
  const [editingAthleteGender, setEditingAthleteGender] = useState<string>('');
  const [editingAthleteIsGymMember, setEditingAthleteIsGymMember] = useState<boolean>(false);
  const [showAddAthleteModal, setShowAddAthleteModal] = useState<boolean>(false);
  const [selectedAthleteForBooking, setSelectedAthleteForBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showSafetyInfo, setShowSafetyInfo] = useState(false);
  const [showUpdateEmergencyContact, setShowUpdateEmergencyContact] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [selectedAthleteForWaiver, setSelectedAthleteForWaiver] = useState<any>(null);

  // Hook for waiver status - moved to top level to fix Rules of Hooks violation
  const { data: waiverStatus, isLoading: waiverLoading, error: waiverError } = useAthleteWaiverStatus(
    editingAthleteId ?? ''
  );

  // Initialize the edit-toggle state when an athlete is selected for editing
  useEffect(() => {
    if (editingAthleteInfo && typeof editingAthleteInfo.isGymMember === 'boolean') {
      setEditingAthleteIsGymMember(!!editingAthleteInfo.isGymMember);
    }
  }, [editingAthleteInfo]);

  // Check if parent is authenticated
  const { data: authStatus } = useQuery<{ loggedIn: boolean; parentId?: number; email?: string }>({
    queryKey: ['/api/parent-auth/status'],
  });

  useEffect(() => {
    if (authStatus && !authStatus.loggedIn) {
      setLocation('/parent/login');
    }
  }, [authStatus, setLocation]);

  // Get parent's bookings
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/parent/bookings'],
    enabled: authStatus?.loggedIn,
  });

  // Get complete parent information
  const { data: parentInfo } = useQuery<Parent>({
    queryKey: ['/api/parent/info'],
    enabled: authStatus?.loggedIn,
  });

  // Get parent's athletes
  const { data: athletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/parent/athletes'],
    enabled: authStatus?.loggedIn,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/parent-auth/logout');
    },
    onSuccess: () => {
      queryClient.clear();
      setLocation('/');
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      return apiRequest('PATCH', `/api/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/bookings'] });
      toast({ title: 'Booking cancelled successfully' });
      setCancelBookingId(null);
    },
    onError: () => {
      toast({ 
        title: 'Failed to cancel booking', 
        variant: 'destructive' 
      });
    },
  });

  const upcomingBookings = bookings.filter(b => {
    if (!b.preferredDate) return false;
    
    // Parse the date as a local date to avoid timezone issues
    const [year, month, day] = b.preferredDate.split('-').map(Number);
    const bookingDate = new Date(year, month - 1, day); // month is 0-indexed
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start from beginning of today
    
    const isUpcoming = bookingDate >= today && 
           b.status !== 'cancelled' &&
           b.status !== 'completed';
    
    return isUpcoming;
  });

  const pastBookings = bookings.filter(b => {
    // Adventure Log should only show completed sessions
    return b.attendanceStatus === 'completed';
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
        description: "Your booking has been rescheduled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parent/bookings"] });
      setReschedulingBookingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reschedule booking.",
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleReschedule = (bookingId: number) => {
    setReschedulingBookingId(bookingId);
  };

  const handleEditBooking = (bookingId: number) => {
    setEditingBookingId(bookingId);
  };

  // Loading state while checking authentication
  if (!authStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // If not logged in, the useEffect will redirect - show loading state instead of null
  if (!authStatus.loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <>
      <ParentMainContainer>
        <ParentContentContainer>
          <ParentPageHeader>
            <ParentPageTitle>Parent Portal</ParentPageTitle>
            <ParentPageSubtitle>Manage your athletes, sessions and waivers</ParentPageSubtitle>
          </ParentPageHeader>

          {/* Statistics Overview Section */}
          <section className="mb-8">
            <ParentStatsGrid>
              <ParentStatCard
                icon={<Users className="h-6 w-6" />}
                label="Total Athletes"
                value={athletes.length}
                color="blue"
              />
              <ParentStatCard
                icon={<Calendar className="h-6 w-6" />}
                label="Upcoming Sessions"
                value={upcomingBookings.length}
                color="green"
              />
              <ParentStatCard
                icon={<BookMarked className="h-6 w-6" />}
                label="Total Bookings"
                value={bookings.length}
                color="purple"
              />
            </ParentStatsGrid>
          </section>

          {/* Main Content Section */}
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
              <div>
                <h2 className="text-2xl font-bold text-[#0F0276] dark:text-white">Booking Management</h2>
                <p className="text-[#0F0276]/80 dark:text-white/70 text-sm">Schedule and manage your coaching sessions</p>
              </div>
              <div className="flex gap-2">
                <ParentButton 
                  onClick={() => {
                    console.log('🎯 PARENT DASHBOARD: Book New Session clicked!', {
                  hasParentInfo: !!parentInfo,
                  parentInfo: parentInfo ? { id: parentInfo.id, email: parentInfo.email } : null
                });
                // Open booking modal directly (wizard will handle athlete selection)
                setSelectedAthleteForBooking(null); // Clear any pre-selection
                setShowBookingModal(true);
              }}
              variant="primary"
              size="md"
            >
              <PlusCircle className="h-4 w-4" />
              Book New Session
            </ParentButton>
          </div>
        </div>

          <ParentTabs defaultValue="upcoming">
          <ParentTabsList className="w-full grid grid-cols-2 xs:grid-cols-3 lg:grid-cols-6 gap-1 sm:gap-2 p-1 sm:p-2 h-auto mb-4 sm:mb-6 overflow-x-auto">
            <ParentTabsTrigger value="upcoming" className="min-h-[40px] sm:min-h-[48px] text-xs sm:text-sm">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Upcoming</span>
              <span className="xs:hidden">Next</span>
            </ParentTabsTrigger>
            <ParentTabsTrigger value="past" className="min-h-[40px] sm:min-h-[48px] text-xs sm:text-sm">
              <BookMarked className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span className="hidden xs:inline">Adventure Log</span>
              <span className="xs:hidden">Past</span>
            </ParentTabsTrigger>
            <ParentTabsTrigger value="athletes" className="min-h-[40px] sm:min-h-[48px] text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span>Athletes</span>
            </ParentTabsTrigger>
            <ParentTabsTrigger value="waivers" className="min-h-[40px] sm:min-h-[48px] text-xs sm:text-sm">
              <FileCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span>Waivers</span>
            </ParentTabsTrigger>
            <ParentTabsTrigger value="profile" className="min-h-[40px] sm:min-h-[48px] text-xs sm:text-sm">
              <UserCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span>Profile</span>
            </ParentTabsTrigger>
            <ParentTabsTrigger value="settings" className="min-h-[40px] sm:min-h-[48px] text-xs sm:text-sm">
              <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
              <span>Settings</span>
            </ParentTabsTrigger>
          </ParentTabsList>

          <ParentTabsContent value="upcoming">
            <ParentMainContentContainer
              heading={
                <span className="inline-flex items-center gap-2 sm:gap-3">
                  <Calendar className="h-8 w-8 text-[#D8BD2A]" />
                  Upcoming Sessions
                </span>
              }
            >
                {upcomingBookings.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-4">🗓️</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">No upcoming sessions</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Book a new session to see it here!</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {upcomingBookings.map((booking) => (
                      <ParentCard 
                        key={booking.id}
                        className="group hover:shadow-xl transition-all duration-300 overflow-hidden"
                      >
                        <ParentCardContent className="p-6">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0 space-y-3">
                              {/* Athlete Info */}
                              <div className="flex items-center gap-3">
                                <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                {booking.athletes && booking.athletes.length > 0 ? (
                                  <h3 className="text-lg font-bold text-[#0F0276] dark:text-white group-hover:text-[#0F0276]/80 dark:group-hover:text-white/90 transition-colors">
                                    {booking.athletes.map((athlete: any) => 
                                      athlete.name || 
                                      `${athlete.first_name || ''} ${athlete.last_name || ''}`.trim() || 
                                      'Athlete'
                                    ).join(' & ')}
                                  </h3>
                                ) : (
                                  <h3 className="text-lg font-bold text-[#0F0276] dark:text-white group-hover:text-[#0F0276]/80 dark:group-hover:text-white/90 transition-colors">
                                    {booking.athlete1Name || 'Your Athlete'}
                                    {booking.athlete2Name && ` & ${booking.athlete2Name}`}
                                  </h3>
                                )}
                              </div>

                              {/* Session Details */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-full">
                                    <Calendar className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Session Date</p>
                                    <p className="font-semibold text-[#0F0276] dark:text-white">
                                      {booking.preferredDate ? formatDate(booking.preferredDate) : 'Date TBD'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-3">
                                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                                    <Clock className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">Session Time</p>
                                    <p className="font-semibold text-[#0F0276] dark:text-white">
                                      {booking.preferredTime}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Lesson Type */}
                              <div className="flex items-center gap-3">
                                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full">
                                  <Activity className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                  <p className="text-sm text-slate-600 dark:text-slate-300">Lesson Type</p>
                                  <p className="font-semibold text-[#0F0276] dark:text-white">
                                    {booking.lessonType?.replace('-', ' ').replace('min', 'minute') || 'Unknown Lesson Type'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Status & Action Column */}
                            <div className="flex-shrink-0 flex flex-col gap-3 min-w-[140px]">
                              {/* Status Badges */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  {booking.paymentStatus === 'reservation-pending' && <Clock className="w-4 h-4 text-yellow-600" />}
                                  {(booking.paymentStatus === 'reservation-paid' || booking.paymentStatus === 'session-paid') && <CheckCircle className="w-4 h-4 text-green-600" />}
                                  {(booking.paymentStatus === 'reservation-failed' || booking.paymentStatus === 'failed') && <XCircle className="w-4 h-4 text-red-600" />}
                                  {booking.paymentStatus === 'unpaid' && <AlertCircle className="w-4 h-4 text-orange-600" />}
                                  
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs px-2 py-1 ${
                                      booking.paymentStatus === 'session-paid' ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' :
                                      booking.paymentStatus === 'reservation-paid' ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' :
                                      booking.paymentStatus === 'reservation-pending' ? 'border-yellow-300 text-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400' :
                                      booking.paymentStatus === 'reservation-failed' ? 'border-red-300 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400' :
                                      booking.paymentStatus === 'unpaid' ? 'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400' :
                                      'border-gray-300 text-gray-700 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
                                    }`}
                                  >
                                    {booking.paymentStatus === 'session-paid' ? 'Full Payment ✓' : 
                                    booking.paymentStatus === 'reservation-paid' ? 'Paid ✓' :
                                    booking.paymentStatus === 'reservation-pending' ? 'Payment Pending' :
                                    booking.paymentStatus === 'reservation-failed' ? 'Payment Failed' :
                                    booking.paymentStatus === 'unpaid' ? 'Unpaid' :
                                    booking.paymentStatus || 'Unknown'}
                                  </Badge>
                                </div>

                                <div className="flex items-center gap-2">
                                  {booking.waiverSigned ? (
                                    <FileCheck className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <FileX className="w-4 h-4 text-orange-600" />
                                  )}
                                  <Badge 
                                    variant="outline"
                                    className={`text-xs px-2 py-1 ${
                                      booking.waiverSigned ? 'border-green-300 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400' : 
                                      'border-orange-300 text-orange-700 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400'
                                    }`}
                                  >
                                    {booking.waiverSigned ? 'Waiver Signed ✓' : 'Waiver Required'}
                                  </Badge>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              {booking.status !== 'cancelled' && (
                                <div className="flex flex-col gap-2">
                                  <ParentButton
                                    size="sm"
                                    variant="secondary"
                                    className="w-full text-xs"
                                    onClick={() => handleReschedule(booking.id)}
                                  >
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Reschedule
                                  </ParentButton>
                                  <ParentButton
                                    size="sm"
                                    variant="primary"
                                    className="w-full text-xs"
                                    onClick={() => handleEditBooking(booking.id)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </ParentButton>
                                  <ParentButton
                                    size="sm"
                                    variant="destructive"
                                    className="w-full text-xs"
                                    onClick={() => setCancelBookingId(booking.id)}
                                  >
                                    <X className="h-3 w-3 mr-1" />
                                    Cancel
                                  </ParentButton>
                                </div>
                              )}
                            </div>
                          </div>
                        </ParentCardContent>
                      </ParentCard>
                    ))}
                  </div>
                )}
            </ParentMainContentContainer>
          </ParentTabsContent>

          <ParentTabsContent value="past">
            <ParentMainContentContainer
              heading={
                <span className="inline-flex items-center gap-2 sm:gap-3">
                  <BookMarked className="h-8 w-8 text-[#D8BD2A]" />
                  Adventure Log
                </span>
              }
            >
                {pastBookings.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-4">🎯</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">No adventures completed yet!</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Complete your first session to start tracking progress</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Modern Adventure Log Metrics */}
                    <div className="space-y-3 sm:space-y-4">
                      <h3 className="text-base sm:text-lg font-semibold text-[#0F0276] dark:text-white flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
                        Progress Summary
                      </h3>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                        <ParentStatCard
                          label="Sessions Completed"
                          value={pastBookings.length}
                          icon={<Trophy />}
                          color="blue"
                          className="[&_p:first-child]:sm:text-sm [&_p:first-child]:text-xs"
                        />
                        
                        <ParentStatCard
                          label="Skills Practiced"
                          value={pastBookings.reduce((total, booking) => {
                            return total + (booking.focusAreas?.length || 0);
                          }, 0)}
                          icon={<Target />}
                          color="purple"
                          className="[&_p:first-child]:sm:text-sm [&_p:first-child]:text-xs"
                        />
                        
                        <ParentStatCard
                          label="Adventure Level"
                          value={`Level ${Math.floor(pastBookings.length / 3) + 1}`}
                          icon={<Award />}
                          color="orange"
                        />
                        
                        <ParentStatCard
                          label="Consistency"
                          value={(() => {
                            const sessionsPerMonth = pastBookings.length / Math.max(1, 
                              Math.ceil((new Date().getTime() - new Date(Math.min(...pastBookings.map(b => b.createdAt ? new Date(b.createdAt).getTime() : Date.now()))).getTime()) / (1000 * 60 * 60 * 24 * 30))
                            );
                            if (sessionsPerMonth >= 4) return "Excellent 🔥";
                            if (sessionsPerMonth >= 2) return "Good ⚡";
                            return "Building 💪";
                          })()}
                          icon={<TrendingUp />}
                          color="green"
                        />
                      </div>
                      
                      {/* Progress Bar */}
                      <ParentCard className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-300 dark:border-yellow-700">
                        <ParentCardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Progress to Next Level
                            </span>
                            <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">
                              Level {Math.floor(pastBookings.length / 3) + 1}
                            </span>
                          </div>
                          <div className="w-full bg-yellow-200 dark:bg-yellow-800/30 rounded-full h-3 relative overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-yellow-400 to-orange-400 dark:from-yellow-500 dark:to-orange-500 h-3 rounded-full transition-all duration-500 relative"
                              style={{ width: `${Math.min(((pastBookings.length % 3) / 3) * 100, 100)}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-xs text-yellow-700 dark:text-yellow-400 mt-2 text-center">
                            {pastBookings.length % 3 === 0 && pastBookings.length > 0 
                              ? "🎉 Level Complete! Ready for the next challenge!"
                              : `${3 - (pastBookings.length % 3)} more sessions to level up! 🎯`
                            }
                          </div>
                        </ParentCardContent>
                      </ParentCard>
                    </div>

                    {/* Adventure Log Entries */}
                    <div className="space-y-4">
                      <h3 className="text-base xs:text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        Adventure History
                        <span className="text-xs font-normal text-gray-500">({pastBookings.length} completed)</span>
                      </h3>
                      
                      {pastBookings.map((booking) => (
                        <div key={booking.id} className="border rounded-xl p-3 xs:p-4 sm:p-6 bg-gradient-to-r from-white to-blue-50 hover:shadow-md transition-all duration-200">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                            {/* Left Column - Session Info */}
                            <div className="space-y-3 sm:space-y-4">
                              {/* Athlete and Date */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2 mb-1 xs:mb-2">
                                    <div className="bg-blue-100 p-1 rounded-full">
                                      <User className="w-3 h-3 xs:w-4 xs:h-4 text-blue-600" />
                                    </div>
                                    <span className="font-medium text-sm xs:text-base sm:text-lg text-gray-800">
                                      {booking.athletes && booking.athletes.length > 0 ? (
                                        booking.athletes.map((athlete: any) => athlete.name).join(' & ')
                                      ) : (
                                        <>
                                          {booking.athlete1Name}
                                          {booking.athlete2Name && ` & ${booking.athlete2Name}`}
                                        </>
                                      )}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs sm:text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                                      {booking.preferredDate ? format(new Date(`${booking.preferredDate}T12:00:00Z`), 'MMM d, yyyy') : 'Date TBD'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                                      {booking.preferredTime || 'Time TBD'}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <User className="w-3 h-3 xs:w-3.5 xs:h-3.5" />
                                      {booking.coachName || 'Coach Will'}
                                    </div>
                                  </div>
                                </div>
                                <Badge 
                                  variant="outline"
                                  className="bg-green-50 text-green-700 border-green-200 text-[10px] xs:text-xs h-auto py-0.5"
                                >
                                  ✅ Completed
                                </Badge>
                              </div>

                              {/* Focus Areas */}
                              {booking.focusAreas && booking.focusAreas.length > 0 && (
                                <div>
                                  <h4 className="font-medium text-xs xs:text-sm text-gray-700 mb-1 xs:mb-2 flex items-center gap-1 xs:gap-2">
                                    <Target className="w-3 h-3 xs:w-4 xs:h-4 text-blue-600" />
                                    Skills Practiced
                                  </h4>
                                  <div className="flex flex-wrap gap-1 xs:gap-2">
                  {booking.focusAreas.map((area: FocusAreaDisplay, index: number) => (
                                      <Badge 
                                        key={index}
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] xs:text-xs h-auto py-0.5"
                                      >
                    {typeof area === 'string' ? area : ('name' in area ? area.name : 'Unknown')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Right Column - Progress & Notes */}
                            <div className="space-y-3 sm:space-y-4">
                              {/* Progress Note */}
                              <div>
                                <h4 className="font-medium text-xs xs:text-sm text-gray-700 mb-1 xs:mb-2 flex items-center gap-1 xs:gap-2">
                                  <TrendingUp className="w-3 h-3 xs:w-4 xs:h-4 text-green-600" />
                                  Progress Note
                                </h4>
                                <div className="bg-white rounded-lg p-2 xs:p-3 sm:p-4 border border-gray-200">
                                  <p className="text-xs xs:text-sm text-gray-700 leading-relaxed">
                                    {booking.progressNote || 
                                     booking.adminNotes || 
                                     "Great session! The athlete showed excellent focus and made steady progress in their skills. Keep up the fantastic work! 🌟"}
                                  </p>
                                </div>
                              </div>

                              {/* Coach Recommendation (placeholder) */}
                              <div>
                                <h4 className="font-medium text-xs xs:text-sm text-gray-700 mb-1 xs:mb-2 flex items-center gap-1 xs:gap-2">
                                  <Lightbulb className="w-3 h-3 xs:w-4 xs:h-4 text-amber-600" />
                                  Coach Recommendation
                                </h4>
                                <div className="bg-amber-50 rounded-lg p-2 xs:p-3 border border-amber-200">
                                  <p className="text-[10px] xs:text-xs sm:text-sm text-amber-800">
                                    {(() => {
                                      if (booking.focusAreas?.some((area: any) => typeof area === 'object' && typeof area.name === 'string' && area.name.includes('Tumbling'))) {
                                        return "Continue working on tumbling fundamentals. Practice at home with forward rolls on soft surfaces!";
                                      }
                                      if (booking.focusAreas?.some((area: any) => typeof area === 'object' && typeof area.name === 'string' && area.name.includes('Beam'))) {
                                        return "Great balance work! Practice walking on lines at home to improve beam skills.";
                                      }
                                      if (booking.focusAreas?.some((area: any) => typeof area === 'object' && typeof area.name === 'string' && area.name.includes('Flexibility'))) {
                                        return "Keep up the daily stretching routine. Consistency is key for flexibility gains!";
                                      }
                                      return "Excellent progress! Continue practicing basic movements and building strength at home.";
                                    })()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Export Option */}
                    <div className="border-t pt-4 xs:pt-6">
                      <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-3">
                        <div>
                          <h4 className="font-medium text-sm xs:text-base text-gray-700 flex items-center gap-1 xs:gap-2">
                            <FileText className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-gray-700" />
                            Export Progress Report
                          </h4>
                          <p className="text-[10px] xs:text-xs text-gray-500">Download a complete progress report for your records</p>
                        </div>
                        <ParentButton 
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement PDF export
                            toast({
                              title: "Feature Coming Soon! 🚀",
                              description: "PDF export will be available in the next update.",
                            });
                          }}
                        className="flex items-center gap-2 text-xs h-8 xs:h-9"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Export PDF
                      </ParentButton>
                    </div>
                  </div>
                </div>
                )}
            </ParentMainContentContainer>
          </ParentTabsContent>

          <ParentTabsContent value="athletes">
            <ParentMainContentContainer
              heading={
                <span className="inline-flex items-center gap-2 sm:gap-3">
                  <Users className="h-8 w-8 text-[#D8BD2A]" />
                  Your Athletes
                </span>
              }
            >
                {athletes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="text-5xl mb-4">👤</div>
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-1">No athletes registered</p>
                    <p className="text-gray-400 dark:text-gray-500 text-sm">Add athletes to get started with bookings</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                    {athletes.map((athlete) => (
                      <div key={athlete.id} className="border border-slate-200/60 rounded-xl p-3 xs:p-4 bg-gradient-to-r from-white to-blue-50/50 hover:shadow-md transition-all duration-200 dark:border-purple-400/20 dark:from-purple-900/20 dark:to-blue-900/20">
                        <div className="flex justify-between items-start mb-2 xs:mb-3">
                          <div className="flex items-center gap-2">
                            <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full">
                              <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="font-semibold text-sm xs:text-base sm:text-lg text-blue-900 dark:text-white">{athlete.name}</h3>
                          </div>
                          <ParentButton
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs px-2"
                            onClick={() => setEditingAthleteId(athlete.id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            <span className="hidden xs:inline">View Details</span>
                            <span className="xs:hidden">View</span>
                          </ParentButton>
                        </div>
                        
                        <div className="space-y-2 mt-3">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs xs:text-sm text-gray-600">
                              Born: {athlete.dateOfBirth ? format(new Date(`${athlete.dateOfBirth}T12:00:00Z`), 'MMM d, yyyy') : 'Unknown'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <Medal className="w-3.5 h-3.5 text-gray-500" />
                            <p className="text-xs xs:text-sm text-gray-600">
                              Experience: {athlete.experience}
                            </p>
                          </div>
                          
                          {athlete.allergies && (
                            <div className="flex items-start gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-orange-500 mt-0.5" />
                              <div>
                                <p className="text-xs xs:text-sm font-medium text-orange-700">
                                  Allergies:
                                </p>
                                <p className="text-[10px] xs:text-xs text-gray-600">{athlete.allergies}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="mt-6 flex justify-center">
                  <ParentButton 
                    variant="success"
                    onClick={() => setShowAddAthleteModal(true)}
                  >
                    <PlusCircle className="h-4 w-4" />
                    Add New Athlete
                  </ParentButton>
                </div>
            </ParentMainContentContainer>
          </ParentTabsContent>

          <ParentTabsContent value="profile">
            <ParentMainContentContainer
              heading={
                <span className="inline-flex items-center gap-2 sm:gap-3">
                  <UserCircle className="h-8 w-8 text-[#D8BD2A]" />
                  My Information
                </span>
              }
            >
                {/* Game-Style Statistics Dashboard - Moved to Top */}
                {authStatus?.email && (
                  <div className="mb-6">
                    <h4 className="font-medium text-base sm:text-lg text-gray-900 dark:text-gray-100 mb-3 sm:mb-4 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      Adventure Progress
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">🎮</span>
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                      <ParentStatCard
                        label="Total Quests"
                        value={bookings.length}
                        icon={<Star />}
                        color="blue"
                      />
                      <ParentStatCard
                        label="Active Heroes"
                        value={athletes.length}
                        icon={<Users />}
                        color="green"
                      />
                      <ParentStatCard
                        label="Next Adventures"
                        value={upcomingBookings.length}
                        icon={<Calendar />}
                        color="orange"
                      />
                      <ParentStatCard
                        label="Victories"
                        value={bookings.filter(b => b.status === 'completed').length}
                        icon={<Trophy />}
                        color="purple"
                      />
                    </div>

                    {/* Experience Bar */}
                    <ParentCard className="mt-4 sm:mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-700">
                      <ParentCardContent className="p-3 sm:p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm font-bold text-yellow-800 dark:text-yellow-300 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-yellow-600 dark:text-yellow-400" />
                            Adventure Level
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-yellow-700 dark:text-yellow-400">Level {Math.floor(bookings.filter(b => b.status === 'completed').length / 3) + 1}</span>
                        </div>
                        <div className="w-full bg-yellow-200 dark:bg-yellow-800/30 rounded-full h-2 sm:h-3 relative overflow-hidden">
                          <div 
                            className="bg-yellow-400 dark:bg-yellow-500 h-2 sm:h-3 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(((bookings.filter(b => b.status === 'completed').length % 3) / 3) * 100, 100)}%` }}
                          >
                          </div>
                        </div>
                        <div className="text-[10px] sm:text-xs text-yellow-700 dark:text-yellow-400 mt-1 text-center">
                          {3 - (bookings.filter(b => b.status === 'completed').length % 3)} more sessions to level up! 🎯
                        </div>
                      </ParentCardContent>
                    </ParentCard>
                  </div>
                )}

                {authStatus?.email && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {/* Personal Information */}
                    <div className="bg-gradient-to-r from-white to-purple-50/50 p-3 sm:p-4 rounded-xl border border-purple-100/60 shadow-sm hover:shadow-md transition-all dark:from-purple-900/20 dark:to-purple-800/20 dark:border-purple-400/20">
                      <h4 className="font-medium text-base sm:text-lg text-purple-800 dark:text-purple-300 flex items-center gap-2 mb-3 sm:mb-4">
                        <User className="w-4 h-4" />
                        Personal Information
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="bg-white/70 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">First Name</label>
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{parentInfo?.firstName || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/70 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</label>
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{parentInfo?.lastName || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/70 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{parentInfo?.email || authStatus.email}</p>
                        </div>
                        <div className="bg-white/70 dark:bg-purple-900/30 p-2 sm:p-3 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{parentInfo?.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-gradient-to-r from-white to-red-50/50 p-3 sm:p-4 rounded-xl border border-red-100/60 shadow-sm hover:shadow-md transition-all dark:from-red-900/20 dark:to-red-800/20 dark:border-red-400/20">
                      <h4 className="font-medium text-base sm:text-lg text-red-800 dark:text-red-300 flex items-center gap-2 mb-3 sm:mb-4">
                        <AlertCircle className="w-4 h-4" />
                        Emergency Contact
                      </h4>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="bg-white/70 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Name</label>
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{parentInfo?.emergencyContactName || 'Not provided'}</p>
                        </div>
                        <div className="bg-white/70 dark:bg-red-900/30 p-2 sm:p-3 rounded-lg">
                          <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Emergency Contact Phone</label>
                          <p className="text-sm sm:text-base text-gray-900 dark:text-white">{parentInfo?.emergencyContactPhone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {authStatus?.email && (
                  <div>
                    {/* Account Actions */}
                    <div className="border-t border-slate-200/60 dark:border-purple-400/20 pt-4 sm:pt-6">
                      <h4 className="font-medium text-base sm:text-lg text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                        <Settings className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                        Account Actions
                      </h4>
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                        <ParentButton 
                          size="sm"
                          variant="secondary"
                          onClick={() => setShowUpdateProfile(true)}
                          className="h-9 text-xs sm:text-sm"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                          Update Profile
                        </ParentButton>
                        <ParentButton 
                          size="sm"
                          variant="secondary"
                          onClick={() => setShowSafetyInfo(true)}
                          className="h-9 text-xs sm:text-sm bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-400/20 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                        >
                          <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                          Safety Info
                        </ParentButton>
                        <ParentButton 
                          size="sm"
                          variant="secondary"
                          onClick={() => setShowUpdateEmergencyContact(true)}
                          className="h-9 text-xs sm:text-sm"
                        >
                          <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                          Update Emergency Contact
                        </ParentButton>
                      </div>
                    </div>
                  </div>
                )}
            </ParentMainContentContainer>
          </ParentTabsContent>

          <ParentTabsContent value="waivers">
            <ParentMainContentContainer
              heading={
                <span className="inline-flex items-center gap-2 sm:gap-3">
                  <FileText className="h-8 w-8 text-[#D8BD2A]" />
                  Waivers & Documents
                </span>
              }
            >
              <ParentWaiverManagement />
            </ParentMainContentContainer>
          </ParentTabsContent>

          <ParentTabsContent value="settings">
            <ParentMainContentContainer
              heading={
                <span className="inline-flex items-center gap-2 sm:gap-3">
                  <Settings className="h-8 w-8 text-[#D8BD2A]" />
                  Settings & Preferences
                </span>
              }
            >
              <div className="space-y-6">
                {/* Notification Settings */}
                <ParentCard>
                  <ParentCardHeader>
                    <ParentCardTitle className="flex items-center gap-2">
                      <Mail className="h-5 w-5" />
                      Notification Preferences
                    </ParentCardTitle>
                  </ParentCardHeader>
                  <ParentCardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Email Notifications</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Receive booking confirmations and updates via email
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">SMS Notifications</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Get text reminders for upcoming sessions
                        </div>
                      </div>
                      <Switch />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Session Reminders</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          24-hour reminders for upcoming sessions
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </ParentCardContent>
                </ParentCard>

                {/* Privacy & Security */}
                <ParentCard>
                  <ParentCardHeader>
                    <ParentCardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy & Security
                    </ParentCardTitle>
                  </ParentCardHeader>
                  <ParentCardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Share Progress Photos</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Allow coaches to share photos of your athlete's progress
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">Marketing Communications</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Receive updates about new programs and events
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </ParentCardContent>
                </ParentCard>

                {/* Account Actions */}
                <ParentCard>
                  <ParentCardHeader>
                    <ParentCardTitle className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5" />
                      Account Actions
                    </ParentCardTitle>
                  </ParentCardHeader>
                  <ParentCardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ParentButton variant="secondary" className="justify-start">
                        <Download className="h-4 w-4 mr-2" />
                        Export My Data
                      </ParentButton>
                      
                      <ParentButton variant="secondary" className="justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Contact Support
                      </ParentButton>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        Need help or have questions? Our support team is here to assist you.
                      </p>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>📧 Email: support@coachwilltumbles.com</p>
                        <p>📞 Phone: (555) 123-4567</p>
                      </div>
                    </div>
                  </ParentCardContent>
                </ParentCard>
              </div>
            </ParentMainContentContainer>
          </ParentTabsContent>
        </ParentTabs>
        </section>
      </ParentContentContainer>
    </ParentMainContainer>

    {/* Modals */}
    {/* Athlete Detail Modal */}
    <ParentAthleteDetailDialog
          open={editingAthleteId !== null}
          onOpenChange={(open) => setEditingAthleteId(open ? editingAthleteId : null)}
          athlete={editingAthleteId ? athletes.find(a => a.id === editingAthleteId) || null : null}
          onBookSession={() => {
            const athlete = athletes.find(a => a.id === editingAthleteId);
            if (athlete) {
              setEditingAthleteId(null); // Close this modal
              setSelectedAthleteForBooking(athlete);
              setShowBookingModal(true);
            }
          }}
          onEditAthlete={() => {
            const athlete = athletes.find(a => a.id === editingAthleteId);
            if (athlete) {
              setEditingAthleteInfo(athlete);
              setEditingAthleteGender(athlete.gender || '');
              setEditingAthleteId(null); // Close this modal
            }
          }}
          showActionButtons={true}
        />

        {/* Direct Booking Modal for Logged-in Parents */}
        <UnifiedBookingModal 
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedAthleteForBooking(null);
          }}
          parentData={parentInfo || undefined}
          selectedAthletes={selectedAthleteForBooking ? [{
            id: selectedAthleteForBooking.id,
            parentId: selectedAthleteForBooking.parentId,
            name: selectedAthleteForBooking.name,
            firstName: selectedAthleteForBooking.firstName,
            lastName: selectedAthleteForBooking.lastName,
            dateOfBirth: selectedAthleteForBooking.dateOfBirth,
            gender: selectedAthleteForBooking.gender,
            allergies: selectedAthleteForBooking.allergies || '',
            experience: selectedAthleteForBooking.experience,
            photo: selectedAthleteForBooking.photo,
            isGymMember: selectedAthleteForBooking.isGymMember ?? false,
            createdAt: new Date(),
            updatedAt: new Date(),
            latestWaiverId: selectedAthleteForBooking.latestWaiverId,
            waiverStatus: selectedAthleteForBooking.waiverStatus,
            waiverSigned: selectedAthleteForBooking.waiverSigned || false
          }] : Array.isArray(athletes) ? athletes.map(athlete => ({
            ...athlete,
            isGymMember: athlete.isGymMember ?? false,
            waiverSigned: athlete.waiverSigned || false
          })) : []}
          isNewParent={false}
        />

        {/* Reschedule Booking Modal */}
        <ParentModal 
          isOpen={reschedulingBookingId !== null} 
          onClose={() => setReschedulingBookingId(null)}
          title="Reschedule Booking"
          description="Choose a new date and time for your lesson"
          size="lg"
        >
          <div className="max-h-[60vh] sm:max-h-none overflow-y-auto px-1">
            {reschedulingBookingId && (() => {
              const booking = bookings.find(b => b.id === reschedulingBookingId);
              if (!booking) return null;

              return <RescheduleForm booking={booking} onSubmit={(date, time) => {
                rescheduleBookingMutation.mutate({
                  id: booking.id,
                  date,
                  time
                });
              }} onCancel={() => setReschedulingBookingId(null)} />;
            })()}
          </div>
        </ParentModal>

        {/* Edit Booking Modal */}
        <ParentModal 
          isOpen={editingBookingId !== null} 
          onClose={() => setEditingBookingId(null)}
          title="Edit Booking Details"
          description="Update lesson focus areas, safety information, and special notes"
          size="xl"
        >
          <div className="max-h-[60vh] sm:max-h-none overflow-y-auto px-1">
            {editingBookingId && (() => {
              const booking = bookings.find(b => b.id === editingBookingId);
              if (!booking) return null;

              return (
                <div className="space-y-6">
                  <ParentModalSection title="Current Booking Information">
                    <div className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <div>
                        <span className="font-medium">Current Focus Areas:</span>
                        <p className="mt-1">{formatFocusAreas((booking.focusAreas || []) as unknown as FocusAreaDisplay[])}</p>
                      </div>
                      <div>
                        <span className="font-medium">Lesson Details:</span>
                        <p className="mt-1">
                          {booking.athlete1Name}
                          {booking.athlete2Name && ` & ${booking.athlete2Name}`} - 
                          {booking.lessonType?.replace('-', ' ') || 'Unknown Lesson Type'} on {booking.preferredDate} at {booking.preferredTime}
                        </p>
                      </div>
                    </div>
                  </ParentModalSection>

                  <EditBookingForm booking={booking} onClose={() => setEditingBookingId(null)} />
                </div>
              );
            })()}
          </div>
        </ParentModal>

        {/* Cancel Booking Dialog */}
        <AlertDialog open={cancelBookingId !== null} onOpenChange={() => setCancelBookingId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to cancel this booking? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => cancelBookingId && cancelBookingMutation.mutate(cancelBookingId)}
                className="bg-red-600 hover:bg-red-700"
              >
                Cancel Booking
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Edit Athlete Modal */}
        <Dialog open={editingAthleteInfo !== null} onOpenChange={() => {
          setEditingAthleteInfo(null);
          setEditingAthleteGender('');
          setEditingAthleteIsGymMember(false);
        }}>
          <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-md md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
            <DialogHeader className="px-0 pt-0">
              <DialogTitle className="text-xl md:text-2xl text-blue-900">Edit Athlete Information</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-700">
                Update athlete details and preferences
              </DialogDescription>
            </DialogHeader>

  {editingAthleteInfo && (
              <div className="space-y-4 px-0 pb-0">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="athlete-firstName">First Name</Label>
                    <Input
                      id="athlete-firstName"
                      defaultValue={editingAthleteInfo.firstName || editingAthleteInfo.name.split(' ')[0]}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="athlete-lastName">Last Name</Label>
                    <Input
                      id="athlete-lastName"
                      defaultValue={editingAthleteInfo.lastName || editingAthleteInfo.name.split(' ').slice(1).join(' ')}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="athlete-gymmember">Already in Gym Classes?</Label>
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <div>
                      <p className="font-medium">Gym Member</p>
                      <p className="text-sm text-muted-foreground">Toggle on if this athlete is already enrolled in gym classes.</p>
                    </div>
                    <Switch
                      id="athlete-gymmember"
                      checked={editingAthleteIsGymMember}
                      onCheckedChange={setEditingAthleteIsGymMember}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="athlete-dob">Date of Birth</Label>
                  <Input
                    id="athlete-dob"
                    type="date"
                    defaultValue={editingAthleteInfo.dateOfBirth}
                    className="mt-1"
                  />
                </div>

                <div>
                  <GenderSelect
                    value={editingAthleteGender}
                    onValueChange={setEditingAthleteGender}
                    id="athlete-gender"
                    name="gender"
                  />
                </div>

                <div>
                  <Label htmlFor="athlete-allergies">Allergies & Medical Notes</Label>
                  <Input
                    id="athlete-allergies"
                    defaultValue={editingAthleteInfo.allergies || ''}
                    placeholder="Enter any allergies or medical notes..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="athlete-experience">Experience Level</Label>
                  <Select defaultValue={editingAthleteInfo.experience}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="elite">Elite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <ParentButton variant="secondary" onClick={() => {
                    setEditingAthleteInfo(null);
                    setEditingAthleteGender('');
                  }}>
                    Cancel
                  </ParentButton>
                  <ParentButton onClick={async () => {
                    try {
                      const firstName = (document.getElementById('athlete-firstName') as HTMLInputElement)?.value;
                      const lastName = (document.getElementById('athlete-lastName') as HTMLInputElement)?.value;
                      const dateOfBirth = (document.getElementById('athlete-dob') as HTMLInputElement)?.value;
                      const allergies = (document.getElementById('athlete-allergies') as HTMLInputElement)?.value;
                      const gender = editingAthleteGender;
                      const experienceSelect = document.querySelector('[name="experience"]') as HTMLSelectElement;
                      const experience = experienceSelect?.value;

                      const updateData = {
                        firstName,
                        lastName,
                        name: `${firstName} ${lastName}`,
                        dateOfBirth,
                        gender,
                        allergies: allergies || null,
                        experience,
                        isGymMember: editingAthleteIsGymMember
                      };

                      await apiRequest('PUT', `/api/parent/athletes/${editingAthleteInfo.id}`, updateData);

                      // Invalidate queries to refresh data
                      queryClient.invalidateQueries({ queryKey: ['/api/parent/athletes'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/parent/bookings'] });

                      toast({
                        title: "Athlete Updated",
                        description: "Athlete information has been updated successfully.",
                      });
                      setEditingAthleteInfo(null);
                      setEditingAthleteGender('');
                    } catch (error) {
                      toast({
                        title: "Update Failed",
                        description: "Failed to update athlete information. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}>
                    Save Changes
                  </ParentButton>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Profile Modal */}
        <ParentModal 
          isOpen={showUpdateProfile} 
          onClose={() => setShowUpdateProfile(false)}
          title="Update Profile"
          description="Update your personal information and contact details"
          size="lg"
        >
          <ParentModalSection>
            <ParentModalGrid>
              <div>
                <Label htmlFor="profile-first-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name
                </Label>
                <Input
                  id="profile-first-name"
                  defaultValue={parentInfo?.firstName || ''}
                  placeholder="Enter your first name"
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                />
              </div>
              <div>
                <Label htmlFor="profile-last-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name
                </Label>
                <Input
                  id="profile-last-name"
                  defaultValue={parentInfo?.lastName || ''}
                  placeholder="Enter your last name"
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                />
              </div>
            </ParentModalGrid>

            <div className="space-y-4">
              <div>
                <Label htmlFor="profile-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email Address
                </Label>
                <Input
                  id="profile-email"
                  type="email"
                  defaultValue={parentInfo?.email || authStatus?.email || ''}
                  placeholder="your.email@example.com"
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                />
              </div>

              <div>
                <Label htmlFor="profile-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Phone Number
                </Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  defaultValue={parentInfo?.phone || ''}
                  placeholder="(555) 123-4567"
                  className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <ParentButton variant="secondary" onClick={() => setShowUpdateProfile(false)}>
                Cancel
              </ParentButton>
              <ParentButton onClick={() => {
                toast({
                  title: "Profile Updated",
                  description: "Your profile information has been updated successfully.",
                });
                setShowUpdateProfile(false);
              }}>
                Save Changes
              </ParentButton>
            </div>
          </ParentModalSection>
        </ParentModal>

        {/* Update Emergency Contact Modal */}
        <ParentModal 
          isOpen={showUpdateEmergencyContact} 
          onClose={() => setShowUpdateEmergencyContact(false)}
          title="Update Emergency Contacts"
          description="Manage your emergency contact information for athlete safety"
          size="xl"
        >
          <div className="max-h-[60vh] sm:max-h-none overflow-y-auto px-1">
            <ParentModalSection title="Primary Emergency Contact">
              <ParentModalGrid>
                <div>
                  <Label htmlFor="emergency-1-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Name
                  </Label>
                  <Input
                    id="emergency-1-name"
                    defaultValue={parentInfo?.emergencyContactName || ''}
                    placeholder="Full name"
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency-1-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <Input
                    id="emergency-1-phone"
                    type="tel"
                    defaultValue={parentInfo?.emergencyContactPhone || ''}
                    placeholder="(555) 123-4567"
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="emergency-1-relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship
                  </Label>
                  <Select defaultValue="parent">
                    <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="aunt-uncle">Aunt/Uncle</SelectItem>
                      <SelectItem value="family-friend">Family Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ParentModalGrid>
            </ParentModalSection>

            <ParentModalSection title="Secondary Emergency Contact">
              <ParentModalGrid>
                <div>
                  <Label htmlFor="emergency-2-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Name
                  </Label>
                  <Input
                    id="emergency-2-name"
                    placeholder="Full name"
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency-2-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <Input
                    id="emergency-2-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="emergency-2-relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="aunt-uncle">Aunt/Uncle</SelectItem>
                      <SelectItem value="family-friend">Family Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ParentModalGrid>
            </ParentModalSection>

            <ParentModalSection title="Additional Emergency Contact (Optional)">
              <ParentModalGrid>
                <div>
                  <Label htmlFor="emergency-3-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Contact Name
                  </Label>
                  <Input
                    id="emergency-3-name"
                    placeholder="Full name"
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="emergency-3-phone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Phone Number
                  </Label>
                  <Input
                    id="emergency-3-phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="emergency-3-relationship" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Relationship
                  </Label>
                  <Select>
                    <SelectTrigger className="mt-1 border-gray-300 dark:border-gray-600 focus:border-[#0F0276] dark:focus:border-blue-400">
                      <SelectValue placeholder="Select relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="guardian">Guardian</SelectItem>
                      <SelectItem value="grandparent">Grandparent</SelectItem>
                      <SelectItem value="sibling">Sibling</SelectItem>
                      <SelectItem value="aunt-uncle">Aunt/Uncle</SelectItem>
                      <SelectItem value="family-friend">Family Friend</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ParentModalGrid>
            </ParentModalSection>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
            <ParentButton variant="secondary" onClick={() => setShowUpdateEmergencyContact(false)}>
              Cancel
            </ParentButton>
            <ParentButton onClick={() => {
              toast({
                title: "Emergency Contacts Updated",
                description: "Your emergency contact information has been updated successfully.",
              });
              setShowUpdateEmergencyContact(false);
            }}>
              Save Contacts
            </ParentButton>
          </div>
        </ParentModal>

        {/* Waiver Modal */}
        {selectedAthleteForWaiver && (
          <UpdatedWaiverModal
            isOpen={showWaiverModal}
            onClose={() => {
              setShowWaiverModal(false);
              setSelectedAthleteForWaiver(null);
            }}
            onWaiverSigned={(waiverData) => {
              toast({
                title: "Waiver Signed Successfully",
                description: `Digital waiver completed for ${selectedAthleteForWaiver.name}`,
              });
              setShowWaiverModal(false);
              setSelectedAthleteForWaiver(null);
              queryClient.invalidateQueries({ queryKey: ['/api/parent/bookings'] });
              queryClient.invalidateQueries({ queryKey: ['/api/parent/athletes'] });
            }}
            bookingData={{
              athleteName: selectedAthleteForWaiver.name,
              parentName: `${parentInfo?.firstName || ''} ${parentInfo?.lastName || ''}`.trim(),
              relationshipToAthlete: "Parent/Guardian",
              emergencyContactNumber: parentInfo?.phone || "",
            }}
            athleteId={selectedAthleteForWaiver.id}
            parentId={parentInfo?.id || 0}
          />
        )}

        {/* Add Athlete Modal */}
        <AddAthleteModal
          isOpen={showAddAthleteModal}
          onClose={() => setShowAddAthleteModal(false)}
        />

    {/* Safety Information Dialog */}
    <SafetyInformationDialog
      open={showSafetyInfo}
      onOpenChange={setShowSafetyInfo}
      parentInfo={parentInfo || undefined}
      hasCurrentBookings={upcomingBookings.length > 0}
    />
    </>
  );
}

export default ParentDashboard;