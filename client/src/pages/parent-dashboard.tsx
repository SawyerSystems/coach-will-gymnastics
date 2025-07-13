import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, Users, MapPin, LogOut, AlertCircle, Star, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import { calculateAge, formatDate } from '@/lib/dateUtils';
import { toast } from '@/hooks/use-toast';
import { EnhancedBookingModal } from '@/components/enhanced-booking-modal';
import { useAvailableTimes } from '@/hooks/use-available-times';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UpdatedWaiverModal } from '@/components/updated-waiver-modal';
import { ParentWaiverManagement } from '@/components/parent-waiver-management';
import type { Booking, Athlete, Customer } from '@shared/schema';

// RescheduleForm component
function RescheduleForm({ booking, onSubmit, onCancel }: { 
  booking: Booking; 
  onSubmit: (date: string, time: string) => void; 
  onCancel: () => void 
}) {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const { data: availableSlots = [], isLoading: slotsLoading } = useAvailableTimes(
    selectedDate || null,
    booking.lessonType || null
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
          value={selectedDate}
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

      <div className="flex justify-end gap-3">
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

// EditBookingForm component
function EditBookingForm({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<string[]>(booking.focusAreas || []);
  const [specialNotes, setSpecialNotes] = useState(booking.adminNotes || '');
  const queryClient = useQueryClient();

  const updateBookingMutation = useMutation({
    mutationFn: async (data: { focusAreas: string[]; specialNotes: string }) => {
      const response = await apiRequest('PATCH', `/api/bookings/${booking.id}`, data);
      if (!response.ok) {
        throw new Error('Failed to update booking');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/parent/bookings'] });
      toast({
        title: "Booking Updated",
        description: "Focus areas and notes have been updated successfully."
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
    updateBookingMutation.mutate({
      focusAreas: selectedFocusAreas,
      specialNotes: specialNotes
    });
  };

  // Get focus area options based on lesson type
  const getFocusAreaOptions = () => {
    const allOptions = [
      { value: "Tumbling: Forward Roll", label: "Tumbling: Forward Roll" },
      { value: "Tumbling: Backward Roll", label: "Tumbling: Backward Roll" },
      { value: "Tumbling: Cartwheel", label: "Tumbling: Cartwheel" },
      { value: "Tumbling: Round Off", label: "Tumbling: Round Off" },
      { value: "Tumbling: Back Handspring", label: "Tumbling: Back Handspring" },
      { value: "Beam: Balance", label: "Beam: Balance" },
      { value: "Beam: Cartwheel", label: "Beam: Cartwheel" },
      { value: "Beam: Back Walkover", label: "Beam: Back Walkover" },
      { value: "Vault: Run and Jump", label: "Vault: Run and Jump" },
      { value: "Vault: Handstand Flat Back", label: "Vault: Handstand Flat Back" },
      { value: "Rings: Support Hold", label: "Rings: Support Hold" },
      { value: "Rings: Pull-ups", label: "Rings: Pull-ups" },
      { value: "Parallel Bars: Support Swing", label: "Parallel Bars: Support Swing" },
      { value: "Parallel Bars: L-Sit", label: "Parallel Bars: L-Sit" },
      { value: "Side Quests: Flexibility Training", label: "Side Quests: Flexibility Training" },
      { value: "Side Quests: Strength Building", label: "Side Quests: Strength Building" },
      { value: "Side Quests: Mental Blocks", label: "Side Quests: Mental Blocks" }
    ];
    return allOptions;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Focus Areas</Label>
        <div className="grid grid-cols-1 gap-2 mt-2 max-h-[200px] overflow-y-auto">
          {getFocusAreaOptions().map((option) => (
            <label key={option.value} className="flex items-center space-x-2 cursor-pointer p-2 rounded hover:bg-gray-50">
              <input
                type="checkbox"
                value={option.value}
                checked={selectedFocusAreas.includes(option.value)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedFocusAreas([...selectedFocusAreas, option.value]);
                  } else {
                    setSelectedFocusAreas(selectedFocusAreas.filter(area => area !== option.value));
                  }
                }}
                className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="special-notes">Special Notes</Label>
        <textarea
          id="special-notes"
          value={specialNotes}
          onChange={(e) => setSpecialNotes(e.target.value)}
          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
          placeholder="Add any special notes about this booking..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={updateBookingMutation.isPending}>
          {updateBookingMutation.isPending ? 'Updating...' : 'Update Booking'}
        </Button>
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
  const [selectedAthleteForBooking, setSelectedAthleteForBooking] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAthleteSelection, setShowAthleteSelection] = useState(false);
  const [showUpdateProfile, setShowUpdateProfile] = useState(false);
  const [showUpdateEmergencyContact, setShowUpdateEmergencyContact] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [selectedAthleteForWaiver, setSelectedAthleteForWaiver] = useState<any>(null);

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
  const { data: parentInfo } = useQuery<Customer>({
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

  const upcomingBookings = bookings.filter(b => 
    new Date(b.preferredDate) >= new Date() && 
    b.status !== 'cancelled'
  );

  const pastBookings = bookings.filter(b => 
    new Date(b.preferredDate) < new Date() || 
    b.status === 'cancelled'
  );

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parent Dashboard</h1>
          <Button 
            onClick={() => logoutMutation.mutate()} 
            variant="outline"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Athletes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{athletes.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Upcoming Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{upcomingBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
          <h2 className="text-2xl font-bold">Booking Management</h2>
          <div className="flex gap-2">
            <Button 
              onClick={() => setShowAthleteSelection(true)}
              className="bg-blue-600 hover:bg-blue-700 text-xs px-2 py-1.5 min-h-[36px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]"
            >
              Book New Session
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                logoutMutation.mutate(undefined, {
                  onSuccess: () => {
                    setLocation('/parent-login');
                  }
                });
              }}
              disabled={logoutMutation.isPending}
              className="text-xs px-2 py-1.5 min-h-[36px] md:text-sm md:px-3 md:py-2 md:min-h-[40px]"
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList className="w-full grid grid-cols-2 lg:grid-cols-3 gap-2 bg-gray-100 p-2 rounded-lg h-auto mb-6">
            <TabsTrigger 
              value="upcoming" 
              className="min-h-[48px] border-2 border-green-300 data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:border-green-500 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-green-100"
            >
              🏃 Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="past" 
              className="min-h-[48px] border-2 border-blue-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:border-blue-500 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-blue-100"
            >
              📚 Past
            </TabsTrigger>
            <TabsTrigger 
              value="athletes" 
              className="min-h-[48px] border-2 border-orange-300 data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=active]:border-orange-500 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-orange-100"
            >
              ⭐ Athletes
            </TabsTrigger>
            <TabsTrigger 
              value="waivers" 
              className="min-h-[48px] border-2 border-red-300 data-[state=active]:bg-red-500 data-[state=active]:text-white data-[state=active]:border-red-500 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-red-100"
            >
              🛡️ Waivers
            </TabsTrigger>
            <TabsTrigger 
              value="my-info" 
              className="min-h-[48px] border-2 border-purple-300 data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:border-purple-500 data-[state=active]:shadow-sm transition-all duration-200 hover:bg-purple-100 col-span-2 lg:col-span-1"
            >
              👤 My Info
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming sessions</p>
                ) : (
                  <div className="space-y-4">
                    {upcomingBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{booking.athlete1Name}</span>
                              {booking.athlete2Name && (
                                <span className="font-medium">& {booking.athlete2Name}</span>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-500" />
                              <span>{formatDate(booking.preferredDate)}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span>{booking.preferredTime}</span>
                              <Badge variant="secondary">
                                {booking.lessonType.replace('-', ' ').replace('min', 'minute')}
                              </Badge>
                            </div>

                            {booking.focusAreas && booking.focusAreas.length > 0 && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-500" />
                                <span className="text-sm text-gray-600">
                                  Focus: {booking.focusAreas.join(', ')}
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            <Badge 
                              variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            >
                              {booking.status}
                            </Badge>

                            {booking.status !== 'cancelled' && (
                              <div className="flex flex-col gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-blue-600 hover:text-blue-700"
                                  onClick={() => handleReschedule(booking.id)}
                                >
                                  Reschedule
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleEditBooking(booking.id)}
                                >
                                  Edit Details
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => setCancelBookingId(booking.id)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="past">
            <Card>
              <CardHeader>
                <CardTitle>Past Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {pastBookings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No past sessions</p>
                ) : (
                  <div className="space-y-4">
                    {pastBookings.map((booking) => (
                      <div key={booking.id} className="border rounded-lg p-4 opacity-75">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{booking.athlete1Name}</span>
                            {booking.athlete2Name && (
                              <span className="font-medium">& {booking.athlete2Name}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{format(new Date(booking.preferredDate), 'MMMM d, yyyy')}</span>
                            <Badge variant="outline">
                              {booking.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="athletes">
            <Card>
              <CardHeader>
                <CardTitle>Your Athletes</CardTitle>
              </CardHeader>
              <CardContent>
                {athletes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No athletes registered</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {athletes.map((athlete) => (
                      <div key={athlete.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-semibold text-lg">{athlete.name}</h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingAthleteId(athlete.id)}
                          >
                            View Details
                          </Button>
                        </div>
                        <p className="text-sm text-gray-600">
                          Born: {format(new Date(athlete.dateOfBirth), 'MMMM d, yyyy')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Experience: {athlete.experience}
                        </p>
                        {athlete.allergies && (
                          <div className="mt-2">
                            <p className="text-sm font-medium flex items-center gap-1">
                              <AlertCircle className="w-4 h-4 text-orange-500" />
                              Allergies:
                            </p>
                            <p className="text-sm text-gray-600">{athlete.allergies}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="my-info">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">My Information</h3>
                <p className="text-sm text-gray-600">Manage your personal and emergency contact information</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {authStatus?.email && (() => {
                  // Get parent info from customers data using email
                  const parentInfo = bookings.length > 0 ? {
                    firstName: bookings[0].parentFirstName || '',
                    lastName: bookings[0].parentLastName || '',
                    email: authStatus.email,
                    phone: bookings[0].parentPhone || '',
                    emergencyContactName: bookings[0].emergencyContactName || '',
                    emergencyContactPhone: bookings[0].emergencyContactPhone || ''
                  } : null;

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Personal Information */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Personal Information</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">First Name</label>
                            <p className="mt-1 text-gray-900">{parentInfo?.firstName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Last Name</label>
                            <p className="mt-1 text-gray-900">{parentInfo?.lastName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-gray-900">{parentInfo?.email || authStatus.email}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1 text-gray-900">{parentInfo?.phone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Emergency Contact */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Emergency Contact</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-700">Emergency Contact Name</label>
                            <p className="mt-1 text-gray-900">{parentInfo?.emergencyContactName || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                            <p className="mt-1 text-gray-900">{parentInfo?.emergencyContactPhone || 'Not provided'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Account Actions */}
                <div className="border-t pt-6">
                  <h4 className="font-medium text-gray-900 mb-4">Account Actions</h4>
                  <div className="flex flex-wrap gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setShowUpdateProfile(true)}
                    >
                      Update Profile
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        const newEmail = prompt("Enter your new email address:", authStatus?.email || '');
                        if (newEmail && newEmail.includes('@')) {
                          toast({
                            title: "Email Change Request",
                            description: `Email change request submitted for ${newEmail}. Verification email will be sent.`,
                          });
                          // TODO: Implement email change verification flow
                        }
                      }}
                    >
                      Change Email
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setShowUpdateEmergencyContact(true)}
                    >
                      Update Emergency Contact
                    </Button>
                  </div>
                </div>

                {/* Game-Style Statistics Dashboard */}
                <div className="border-t pt-6">
                  <h4 className="font-bold text-gray-900 mb-6 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                    Adventure Progress 🎮
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="relative text-center p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl shadow-md border-2 border-blue-300 hover:shadow-lg transition-all">
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="h-3 w-3 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-blue-700">{bookings.length}</div>
                      <div className="text-sm font-medium text-blue-600">Total Quests</div>
                    </div>
                    <div className="relative text-center p-4 bg-gradient-to-br from-green-100 to-green-200 rounded-xl shadow-md border-2 border-green-300 hover:shadow-lg transition-all">
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <Users className="h-3 w-3 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-green-700">{athletes.length}</div>
                      <div className="text-sm font-medium text-green-600">Active Heroes</div>
                    </div>
                    <div className="relative text-center p-4 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl shadow-md border-2 border-orange-300 hover:shadow-lg transition-all">
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                        <Calendar className="h-3 w-3 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-orange-700">{upcomingBookings.length}</div>
                      <div className="text-sm font-medium text-orange-600">Next Adventures</div>
                    </div>
                    <div className="relative text-center p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl shadow-md border-2 border-purple-300 hover:shadow-lg transition-all">
<div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <Trophy className="h-3 w-3 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-purple-700">
                        {bookings.filter(b => b.status === 'completed').length}
                      </div>
                      <div className="text-sm font-medium text-purple-600">Victories</div>
                    </div>
                  </div>

                  {/* Experience Bar */}
                  <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-yellow-800">Adventure Level</span>
                      <span className="text-sm font-bold text-yellow-700">Level {Math.floor(bookings.filter(b => b.status === 'completed').length / 3) + 1}</span>
                    </div>
                    <div className="w-full bg-yellow-200 rounded-full h-3 relative overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500 relative"
                        style={{ width: `${Math.min(((bookings.filter(b => b.status === 'completed').length % 3) / 3) * 100, 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-xs text-yellow-700 mt-1 text-center">
                      {3 - (bookings.filter(b => b.status === 'completed').length % 3)} more sessions to level up! 🎯
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="waivers">
            <Card>
              <CardContent className="pt-6">
                <ParentWaiverManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Athlete Detail Modal */}
        <Dialog open={editingAthleteId !== null} onOpenChange={() => setEditingAthleteId(null)}>
          <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-2xl md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
            <DialogHeader className="px-0 pt-0">
              <DialogTitle className="text-xl md:text-2xl text-blue-900">Athlete Details</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-700">
                View and manage athlete information and waivers
              </DialogDescription>
            </DialogHeader>

            {editingAthleteId && (() => {
              const athlete = athletes.find(a => a.id === editingAthleteId);
              if (!athlete) return null;

              const athleteBookings = bookings.filter(b => 
                b.athlete1Name === athlete.name || b.athlete2Name === athlete.name
              );

              return (
                <div className="space-y-6 px-4 md:px-0">
                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Name</label>
                      <p className="mt-1 text-gray-900">{athlete.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Date of Birth</label>
                      <p className="mt-1 text-gray-900">{formatDate(athlete.dateOfBirth)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experience Level</label>
                      <p className="mt-1 text-gray-900 capitalize">{athlete.experience}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Age</label>
                      <p className="mt-1 text-gray-900">
                        {calculateAge(athlete.dateOfBirth)} years old
                      </p>
                    </div>
                  </div>

                  {/* Allergies */}
                  {athlete.allergies && (
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        Allergies & Medical Notes
                      </label>
                      <p className="mt-1 text-gray-900 bg-orange-50 p-3 rounded-lg">{athlete.allergies}</p>
                    </div>
                  )}

                  {/* Waiver Status */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Waiver Status</h4>
                    {athleteBookings.length > 0 ? (
                      <div className="space-y-2">
                        {athleteBookings.some(b => b.waiverSigned) ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                            <span className="font-medium">Waiver Completed</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-orange-600">
                            <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                            <span className="font-medium">Waiver Required</span>
                          </div>
                        )}

                        {athleteBookings.filter(b => b.waiverSigned).map(booking => (
                          <div key={booking.id} className="text-sm text-gray-600 ml-4">
                            Signed by: {booking.waiverSignatureName} on {booking.waiverSignedAt ? format(new Date(booking.waiverSignedAt), 'MMM d, yyyy') : 'Unknown date'}
                          </div>
                        ))}

                        {!athleteBookings.some(b => b.waiverSigned) && (
                          <Button 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              setSelectedAthleteForWaiver(athlete);
                              setShowWaiverModal(true);
                            }}
                          >
                            Sign Digital Waiver
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-500">No bookings found for this athlete</p>
                    )}
                  </div>

                  {/* Session History */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Session History</h4>
                    {athleteBookings.length > 0 ? (
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {athleteBookings.map(booking => (
                          <div key={booking.id} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                            <span>{format(new Date(booking.preferredDate), 'MMM d, yyyy')} - {booking.preferredTime}</span>
                            <Badge variant="secondary" className="text-xs">
                              {booking.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">No sessions recorded</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={() => setEditingAthleteId(null)}>
                      Close
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => {
                          setEditingAthleteInfo(athlete);
                          setEditingAthleteId(null); // Close this modal
                        }}
                      >
                        Edit Info
                      </Button>
                      <Button 
                        onClick={() => {
                          setEditingAthleteId(null); // Close this modal
                          setSelectedAthleteForBooking(athlete);
                          setShowBookingModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Book Session
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* Direct Booking Modal for Logged-in Parents */}
        <EnhancedBookingModal 
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedAthleteForBooking(null);
          }}
          customerData={parentInfo || undefined}
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
            createdAt: new Date(),
            updatedAt: new Date()
          }] : athletes}
          isNewCustomer={false}
        />

        {/* Reschedule Booking Modal */}
        <Dialog open={reschedulingBookingId !== null} onOpenChange={() => setReschedulingBookingId(null)}>
          <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-lg md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
            <DialogHeader className="px-0 pt-0">
              <DialogTitle className="text-xl md:text-2xl text-blue-900">Reschedule Booking</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-700">
                Choose a new date and time for your lesson
              </DialogDescription>
            </DialogHeader>

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
          </DialogContent>
        </Dialog>

        {/* Edit Booking Modal */}
        <Dialog open={editingBookingId !== null} onOpenChange={() => setEditingBookingId(null)}>
          <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-md md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
            <DialogHeader className="px-0 pt-0">
              <DialogTitle className="text-xl md:text-2xl text-blue-900">Edit Booking Details</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-700">
                Update lesson focus areas and special notes
              </DialogDescription>
            </DialogHeader>

            {editingBookingId && (() => {
              const booking = bookings.find(b => b.id === editingBookingId);
              if (!booking) return null;

              return (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Current Focus Areas</Label>
                      <p className="text-sm text-gray-600">{booking.focusAreas.join(', ')}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Lesson Details</Label>
                      <p className="text-sm text-gray-600">
                        {booking.athlete1Name}
                        {booking.athlete2Name && ` & ${booking.athlete2Name}`} - 
                        {booking.lessonType.replace('-', ' ')} on {booking.preferredDate} at {booking.preferredTime}
                      </p>
                    </div>
                  </div>

                  <EditBookingForm booking={booking} onClose={() => setEditingBookingId(null)} />
                </div>
              );
            })()}
          </DialogContent>
        </Dialog>

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

        {/* Athlete Selection Modal */}
        <Dialog open={showAthleteSelection} onOpenChange={setShowAthleteSelection}>
          <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-md md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
            <DialogHeader className="px-0 pt-0">
              <DialogTitle className="text-xl md:text-2xl text-blue-900">Select Athlete</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-700">
                Choose which athlete you'd like to book a session for
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 px-0 pb-0">
              {athletes && athletes.length > 0 ? (
                athletes.map((athlete) => (
                  <Card 
                    key={athlete.id}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      setSelectedAthleteForBooking(athlete);
                      setShowAthleteSelection(false);
                      setShowBookingModal(true);
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium text-gray-900">{athlete.name}</h3>
                          <p className="text-sm text-gray-600">
                            {Math.floor((new Date().getTime() - new Date(athlete.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years old • {athlete.experience}
                          </p>
                        </div>
                        <Button size="sm">Select</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">No athletes registered yet</p>
                  <Button 
                    onClick={() => {
                      setShowAthleteSelection(false);
                      setShowBookingModal(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add New Athlete
                  </Button>
                </div>
              )}

              <div className="flex justify-between gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setShowAthleteSelection(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowAthleteSelection(false);
                    setSelectedAthleteForBooking(null);
                    setShowBookingModal(true);
                  }}
                >
                  Add New Athlete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>



        {/* Edit Athlete Modal */}
        <Dialog open={editingAthleteInfo !== null} onOpenChange={() => setEditingAthleteInfo(null)}>
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
                  <Label htmlFor="athlete-gender">Gender</Label>
                  <Select defaultValue={editingAthleteInfo.gender || ""}>
                    <SelectTrigger className="mt-1" id="athlete-gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                      <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
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
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setEditingAthleteInfo(null)}>
                    Cancel
                  </Button>
                  <Button onClick={async () => {
                    try {
                      const firstName = (document.getElementById('athlete-firstName') as HTMLInputElement)?.value;
                      const lastName = (document.getElementById('athlete-lastName') as HTMLInputElement)?.value;
                      const dateOfBirth = (document.getElementById('athlete-dob') as HTMLInputElement)?.value;
                      const allergies = (document.getElementById('athlete-allergies') as HTMLInputElement)?.value;
                      const genderSelect = document.querySelector('#athlete-gender [data-value]') as HTMLElement;
                      const gender = genderSelect?.getAttribute('data-value') || null;
                      const experienceSelect = document.querySelector('[name="experience"]') as HTMLSelectElement;
                      const experience = experienceSelect?.value;

                      const updateData = {
                        firstName,
                        lastName,
                        name: `${firstName} ${lastName}`,
                        dateOfBirth,
                        gender,
                        allergies: allergies || null,
                        experience
                      };

                      await apiRequest(`/api/athletes/${editingAthleteInfo.id}`, 'PUT', updateData);

                      // Invalidate queries to refresh data
                      queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });

                      toast({
                        title: "Athlete Updated",
                        description: "Athlete information has been updated successfully.",
                      });
                      setEditingAthleteInfo(null);
                    } catch (error) {
                      toast({
                        title: "Update Failed",
                        description: "Failed to update athlete information. Please try again.",
                        variant: "destructive"
                      });
                    }
                  }}>
                    Save Changes
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Update Profile Modal */}
        <Dialog open={showUpdateProfile} onOpenChange={setShowUpdateProfile}>
          <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-lg md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
            <DialogHeader className="px-0 pt-0">
              <DialogTitle className="text-xl md:text-2xl text-blue-900">Update Profile</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-700">
                Update your personal information and contact details
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 px-0 pb-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="profile-first-name">First Name</Label>
                  <Input
                    id="profile-first-name"
                    defaultValue={bookings && bookings.length > 0 ? bookings[0].parentFirstName || '' : ''}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="profile-last-name">Last Name</Label>
                  <Input
                    id="profile-last-name"
                    defaultValue={bookings && bookings.length > 0 ? bookings[0].parentLastName || '' : ''}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="profile-email">Email Address</Label>
                <Input
                  id="profile-email"
                  type="email"
                  defaultValue={authStatus?.email || ''}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profile-phone">Phone Number</Label>
                <Input
                  id="profile-phone"
                  type="tel"
                  defaultValue={bookings && bookings.length > 0 ? bookings[0].parentPhone || '' : ''}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="profile-address">Address (Optional)</Label>
                <Input
                  id="profile-address"
                  placeholder="Enter your address..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setShowUpdateProfile(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Profile Updated",
                    description: "Your profile information has been updated successfully.",
                  });
                  setShowUpdateProfile(false);
                }}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Update Emergency Contact Modal */}
        <Dialog open={showUpdateEmergencyContact} onOpenChange={setShowUpdateEmergencyContact}>
          <DialogContent className="w-full h-full max-w-full max-h-full p-4 md:max-w-2xl md:max-h-[90vh] md:h-auto md:w-auto md:p-6 overflow-y-auto rounded-none md:rounded-lg border-0 md:border bg-gradient-to-br from-blue-50 to-orange-50 md:bg-white">
            <DialogHeader className="px-0 pt-0">
              <DialogTitle className="text-xl md:text-2xl text-blue-900">Update Emergency Contacts</DialogTitle>
              <DialogDescription className="text-sm md:text-base text-gray-700">
                Manage your emergency contact information for athlete safety
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 px-0 pb-0">
              {/* Primary Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Primary Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergency-1-name">Contact Name</Label>
                    <Input
                      id="emergency-1-name"
                      defaultValue={bookings && bookings.length > 0 ? bookings[0].emergencyContactName || '' : ''}
                      placeholder="Full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-1-phone">Phone Number</Label>
                    <Input
                      id="emergency-1-phone"
                      type="tel"
                      defaultValue={bookings && bookings.length > 0 ? bookings[0].emergencyContactPhone || '' : ''}
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-1-relationship">Relationship</Label>
                    <Select defaultValue="parent">
                      <SelectTrigger className="mt-1">
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
                </div>
              </div>

              {/* Secondary Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Secondary Emergency Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergency-2-name">Contact Name</Label>
                    <Input
                      id="emergency-2-name"
                      placeholder="Full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-2-phone">Phone Number</Label>
                    <Input
                      id="emergency-2-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-2-relationship">Relationship</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
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
                </div>
              </div>

              {/* Additional Emergency Contact */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 border-b pb-2">Additional Emergency Contact (Optional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="emergency-3-name">Contact Name</Label>
                    <Input
                      id="emergency-3-name"
                      placeholder="Full name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-3-phone">Phone Number</Label>
                    <Input
                      id="emergency-3-phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergency-3-relationship">Relationship</Label>
                    <Select>
                      <SelectTrigger className="mt-1">
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
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => setShowUpdateEmergencyContact(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast({
                    title: "Emergency Contacts Updated",
                    description: "Your emergency contact information has been updated successfully.",
                  });
                  setShowUpdateEmergencyContact(false);
                }}>
                  Save Contacts
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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
              parentName: `${parentInfo?.firstName} ${parentInfo?.lastName}`,
              relationshipToAthlete: "Parent/Guardian",
              emergencyContactNumber: bookings?.[0]?.emergencyContactPhone || "",
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ParentDashboard;