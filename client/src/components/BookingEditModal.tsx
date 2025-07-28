import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Athlete, Booking, LessonType, Parent } from '@shared/schema';
import { AttendanceStatusEnum, BookingStatusEnum, PaymentStatusEnum } from '@shared/schema';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Clock, FileText, MessageSquare, User, Users, X } from "lucide-react";
import React, { useEffect, useState } from 'react';

type BookingEditModalProps = {
  booking: Booking;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function BookingEditModal({ booking, open, onClose, onSuccess }: BookingEditModalProps) {
  // Ensure booking exists with fallback values
  if (!booking) {
    console.error('BookingEditModal: No booking provided');
    return null;
  }
  
  const [tab, setTab] = useState('general');
  const [status, setStatus] = useState((booking.status || 'pending') as string);
  const [paymentStatus, setPaymentStatus] = useState((booking.paymentStatus || 'unpaid') as string);
  const [attendanceStatus, setAttendanceStatus] = useState((booking.attendanceStatus || 'pending') as string);
  const [paidAmount, setPaidAmount] = useState<string>(booking.paidAmount?.toString() || '0.00');
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '');
  const [specialRequests, setSpecialRequests] = useState(booking.specialRequests || '');
  const [selectedLessonTypeId, setSelectedLessonTypeId] = useState<number>(booking.lessonTypeId || 0);
  const [focusAreas, setFocusAreas] = useState<string[]>(booking.focusAreas || []);
  const [tempFocusArea, setTempFocusArea] = useState('');
  const [bookingAthletes, setBookingAthletes] = useState<{ athleteId: number | null }[]>([]);
  const [isValidationError, setIsValidationError] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  
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
  const { toast } = useToast();

  // Fetch all lesson types
  const { data: lessonTypes = [] } = useQuery<LessonType[]>({
    queryKey: ['/api/lesson-types'],
  });

  // Fetch all parents for athlete selection
  const { data: parents = [] } = useQuery<Parent[]>({
    queryKey: ['/api/parents'],
    // Add staleTime to prevent unnecessary refetches
    staleTime: 60 * 1000 // 1 minute
  });

  // Fetch all athletes
  const { data: allAthletes = [] } = useQuery<Athlete[]>({
    queryKey: ['/api/athletes'],
    // Add staleTime to prevent unnecessary refetches
    staleTime: 60 * 1000 // 1 minute
  });

  // Fetch athletes for current booking
  const { data: bookingDetails } = useQuery({
    queryKey: ['/api/bookings', booking.id, 'details'],
    queryFn: async () => {
      const response = await fetch(`/api/bookings/${booking.id}/details`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking details');
      }
      return response.json();
    },
    enabled: open,
  });

  // Get the selected lesson type
  const selectedLessonType = Array.isArray(lessonTypes) 
    ? lessonTypes.find(lt => lt.id === selectedLessonTypeId) 
    : null;
  
  // Filter athletes by parent
  const [selectedParentId, setSelectedParentId] = useState<number | null>(booking.parentId || null);
  const parentAthletes = Array.isArray(allAthletes) 
    ? allAthletes.filter((athlete: any) => athlete && athlete.parentId === selectedParentId)
    : [];
  
  // Log filtered athletes whenever parent changes
  useEffect(() => {
    console.log("Selected parent:", selectedParentId);
    console.log("Filtered athletes:", parentAthletes);
    
    // If parent changes and there are no athletes, initialize with an empty athlete slot
    if (selectedParentId && parentAthletes.length === 0 && bookingAthletes.length === 0) {
      setBookingAthletes([{ athleteId: null }]);
    }
  }, [selectedParentId, parentAthletes.length]);

  // Initialize booking athletes when booking details are loaded
  useEffect(() => {
    try {
      console.log("BookingDetails loaded:", bookingDetails);
      
      if (bookingDetails?.athletes && Array.isArray(bookingDetails.athletes)) {
        const mappedAthletes = bookingDetails.athletes.map((athlete: Athlete) => ({ 
          athleteId: athlete && athlete.id ? athlete.id : null 
        }));
        console.log("Mapped athletes:", mappedAthletes);
        
        // Only update if we have valid athletes or if there are none yet
        if (mappedAthletes.length > 0 || bookingAthletes.length === 0) {
          setBookingAthletes(mappedAthletes.length > 0 ? mappedAthletes : [{ athleteId: null }]);
        }
        
        // Also ensure parent ID is set correctly
        if (bookingDetails.parentId && (!selectedParentId || selectedParentId !== bookingDetails.parentId)) {
          console.log("Setting parent ID:", bookingDetails.parentId);
          setSelectedParentId(bookingDetails.parentId);
        }
      } else if (open && (!bookingAthletes || bookingAthletes.length === 0)) {
        // If no athletes but modal is open, set at least one empty slot
        console.log("No athletes found, initializing with empty slot");
        setBookingAthletes([{ athleteId: null }]);
      }
    } catch (error) {
      console.error('Error initializing booking athletes:', error);
      // Fallback to empty array with one slot
      setBookingAthletes([{ athleteId: null }]);
    }
  }, [bookingDetails, open]);

  // Update mutation
  const updateBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', booking.id, 'details'] });
      
      toast({
        title: "Booking Updated",
        description: "Booking information has been updated successfully."
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Could not update booking. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleLessonTypeChange = (lessonTypeId: string) => {
    const newLessonTypeId = parseInt(lessonTypeId);
    const newLessonType = lessonTypes.find(lt => lt.id === newLessonTypeId);
    const currentLessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
    
    if (!newLessonType || !currentLessonType) return;
    
    // Handle private to semi-private transition (add athlete slot)
    if (currentLessonType.maxAthletes === 1 && newLessonType.maxAthletes > 1) {
      // Keep the existing athlete and allow adding more
    }
    
    // Handle semi-private to private transition (remove extra athletes)
    if (currentLessonType.maxAthletes > 1 && newLessonType.maxAthletes === 1) {
      if (bookingAthletes.length > 1) {
        setBookingAthletes([bookingAthletes[0]]);
      }
    }
    
    // Handle duration change and focus areas
    if (currentLessonType.duration !== newLessonType.duration) {
      if (newLessonType.duration > currentLessonType.duration) {
        // Going from short to long session - allow more focus areas
      } else {
        // Going from long to short session - limit focus areas
        if (focusAreas.length > 2) {
          setFocusAreas(focusAreas.slice(0, 2));
        }
      }
    }
    
    setSelectedLessonTypeId(newLessonTypeId);
  };
  
  const addFocusArea = () => {
    if (!tempFocusArea.trim()) return;
    
    const newLessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
    if (!newLessonType) return;
    
    const maxFocusAreas = newLessonType.duration >= 60 ? 4 : 2;
    
    if (focusAreas.length < maxFocusAreas) {
      setFocusAreas([...focusAreas, tempFocusArea.trim()]);
      setTempFocusArea('');
    } else {
      toast({
        title: "Maximum Focus Areas",
        description: `You can only add up to ${maxFocusAreas} focus areas for this lesson type.`,
        variant: "destructive"
      });
    }
  };
  
  const removeFocusArea = (index: number) => {
    const newFocusAreas = [...focusAreas];
    newFocusAreas.splice(index, 1);
    setFocusAreas(newFocusAreas);
  };
  
  const handleAthleteChange = (athleteId: string, index: number) => {
    try {
      const newBookingAthletes = Array.isArray(bookingAthletes) ? [...bookingAthletes] : [];
      // Skip special values like "no-athletes"
      if (athleteId === "no-athletes") {
        return;
      }
      
      // Handle empty string or invalid value
      if (!athleteId || athleteId === '') {
        newBookingAthletes[index] = { athleteId: null };
      } else {
        const parsedId = parseInt(athleteId, 10);
        newBookingAthletes[index] = { athleteId: isNaN(parsedId) ? null : parsedId };
      }
      setBookingAthletes(newBookingAthletes);
    } catch (error) {
      console.error('Error updating athlete selection:', error);
      toast({
        title: "Error",
        description: "Failed to update athlete selection. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const addAthleteSlot = () => {
    try {
      if (!Array.isArray(lessonTypes)) {
        toast({
          title: "Error",
          description: "Lesson types not loaded yet. Please try again.",
          variant: "destructive"
        });
        return;
      }

      const newLessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
      if (!newLessonType) {
        toast({
          title: "Error",
          description: "Please select a lesson type first",
          variant: "destructive"
        });
        return;
      }
      
      const currentAthletes = Array.isArray(bookingAthletes) ? bookingAthletes : [];
      
      if (currentAthletes.length < newLessonType.maxAthletes) {
        setBookingAthletes([...currentAthletes, { athleteId: null }]);
      } else {
        toast({
          title: "Maximum Athletes",
          description: `This lesson type can only have ${newLessonType.maxAthletes} athletes.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error adding athlete slot:', error);
      toast({
        title: "Error",
        description: "Failed to add athlete. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const removeAthleteSlot = (index: number) => {
    try {
      if (!Array.isArray(bookingAthletes)) {
        console.error('bookingAthletes is not an array');
        return;
      }
      
      if (bookingAthletes.length <= 1) {
        toast({
          title: "Cannot Remove",
          description: "At least one athlete is required for booking.",
          variant: "destructive"
        });
        return;
      }
      
      const newBookingAthletes = [...bookingAthletes];
      newBookingAthletes.splice(index, 1);
      setBookingAthletes(newBookingAthletes);
    } catch (error) {
      console.error('Error removing athlete slot:', error);
      toast({
        title: "Error",
        description: "Failed to remove athlete. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const validateForm = () => {
    // Validate required safety fields
    if (!dropoffPersonName || !dropoffPersonRelationship || !dropoffPersonPhone || 
        !pickupPersonName || !pickupPersonRelationship || !pickupPersonPhone) {
      setIsValidationError(true);
      setValidationMessage("Please fill in all required pickup and drop-off information.");
      return false;
    }
    
    // Validate at least one athlete is selected
    if (!Array.isArray(bookingAthletes) || 
        bookingAthletes.length === 0 || 
        bookingAthletes.some(a => !a || a.athleteId === null || a.athleteId === 0 || a.athleteId === undefined)) {
      setIsValidationError(true);
      setValidationMessage("Please select at least one athlete.");
      return false;
    }
    
    // Validate at least one focus area
    if (focusAreas.length === 0) {
      setIsValidationError(true);
      setValidationMessage("Please add at least one focus area.");
      return false;
    }
    
    setIsValidationError(false);
    setValidationMessage("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Convert paid amount to decimal
    const numericPaidAmount = parseFloat(paidAmount);
    if (isNaN(numericPaidAmount)) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid number for paid amount.",
        variant: "destructive"
      });
      return;
    }
    
    updateBookingMutation.mutate({
      status,
      paymentStatus,
      attendanceStatus,
      paidAmount: numericPaidAmount,
      adminNotes,
      specialRequests,
      lessonTypeId: selectedLessonTypeId,
      focusAreas,
      athletes: bookingAthletes,
      parentId: selectedParentId,
      dropoffPersonName,
      dropoffPersonRelationship,
      dropoffPersonPhone,
      pickupPersonName,
      pickupPersonRelationship,
      pickupPersonPhone,
      altPickupPersonName,
      altPickupPersonRelationship,
      altPickupPersonPhone,
    });
  };

  // Calculate total price
  const calculatePrice = () => {
    const lessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
    return lessonType ? lessonType.price : 0;
  };

  const getMaxAthletes = () => {
    const lessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
    return lessonType ? lessonType.maxAthletes : 1;
  };

  const getMaxFocusAreas = () => {
    const lessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
    return lessonType ? (lessonType.duration >= 60 ? 4 : 2) : 2;
  };

  const getLessonTypeDuration = () => {
    const lessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
    return lessonType ? `${lessonType.duration} minutes` : '';
  };

  const isPrivateLessonType = () => {
    const lessonType = lessonTypes.find(lt => lt.id === selectedLessonTypeId);
    return lessonType ? lessonType.isPrivate : true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="booking-edit-description">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-between">
            <span>Edit Booking #{booking.id}</span>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <p id="booking-edit-description" className="sr-only">
            Edit booking details including status, payment, athletes, and more
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isValidationError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm">{validationMessage}</div>
            </div>
          )}
          
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="athletes">Athletes</TabsTrigger>
              <TabsTrigger value="safety">Safety Info</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Booking Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(BookingStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(PaymentStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Attendance Status</Label>
                  <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select attendance status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(AttendanceStatusEnum).map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Paid Amount ($)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    value={paidAmount} 
                    onChange={(e) => setPaidAmount(e.target.value)} 
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Label>Lesson Type</Label>
                <Select 
                  value={selectedLessonTypeId?.toString()} 
                  onValueChange={handleLessonTypeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lesson type" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name} - {type.duration} min ({type.isPrivate ? 'Private' : `Semi-private (${type.maxAthletes})`}) - ${type.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Focus Areas ({focusAreas.length}/{getMaxFocusAreas()})</Label>
                <div className="flex gap-2">
                  <Input 
                    value={tempFocusArea} 
                    onChange={(e) => setTempFocusArea(e.target.value)} 
                    placeholder="Add focus area"
                    disabled={focusAreas.length >= getMaxFocusAreas()}
                  />
                  <Button 
                    type="button" 
                    onClick={addFocusArea}
                    disabled={focusAreas.length >= getMaxFocusAreas() || !tempFocusArea.trim()}
                  >
                    Add
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {focusAreas.map((area, index) => (
                    <div key={index} className="bg-blue-50 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
                      <span>{area}</span>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5 rounded-full"
                        onClick={() => removeFocusArea(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <Card className="mt-4 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">Session Details</span>
                    </div>
                    <span className="text-lg font-bold">${calculatePrice()}</span>
                  </div>
                  
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{getLessonTypeDuration()}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{getMaxAthletes()} Athlete{getMaxAthletes() > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="athletes" className="space-y-4 pt-4">
              <div>
                <Label>Parent</Label>
                <Select 
                  value={selectedParentId?.toString() || 'no-parent-selected'} 
                  onValueChange={(value) => {
                    try {
                      // Skip special values
                      if (value === "no-parents" || value === "no-parent-selected") {
                        return;
                      }
                      
                      const parsedValue = parseInt(value, 10);
                      if (!isNaN(parsedValue)) {
                        console.log("Parent selected:", parsedValue);
                        setSelectedParentId(parsedValue);
                      }
                    } catch (error) {
                      console.error('Error setting parent ID:', error);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(parents) && parents.length > 0 ? parents.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id.toString()}>
                        {parent.firstName || parent.lastName ? 
                          `${parent.firstName || ''} ${parent.lastName || ''}`.trim() : 
                          parent.email || 'Unknown Parent'} 
                        {parent.email ? `(${parent.email})` : ''}
                      </SelectItem>
                    )) : (
                      <SelectItem value="no-parents" disabled>No parents available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Athletes ({Array.isArray(bookingAthletes) ? bookingAthletes.length : 0}/{getMaxAthletes()})</Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addAthleteSlot}
                    disabled={Array.isArray(bookingAthletes) && bookingAthletes.length >= getMaxAthletes()}
                  >
                    Add Athlete
                  </Button>
                </div>
                
                {Array.isArray(bookingAthletes) ? bookingAthletes.map((bookingAthlete, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Select 
                        value={bookingAthlete && bookingAthlete.athleteId ? bookingAthlete.athleteId.toString() : 'select-athlete'} 
                        onValueChange={(value) => handleAthleteChange(value, index)}
                        defaultValue="select-athlete"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select athlete">
                            {bookingAthlete && bookingAthlete.athleteId ? "" : "Select athlete"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="select-athlete" disabled>Select an athlete</SelectItem>
                          {selectedParentId && Array.isArray(parentAthletes) && parentAthletes.length > 0 ? (
                            parentAthletes.map((athlete: any) => (
                              <SelectItem key={athlete.id} value={athlete.id.toString()}>
                                {athlete.name || (athlete.firstName || athlete.lastName ? 
                                  `${athlete.firstName || ''} ${athlete.lastName || ''}`.trim() : 
                                  'Unnamed Athlete')}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="no-athletes" disabled>No athletes found for this parent</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="h-9 w-9"
                      onClick={() => removeAthleteSlot(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )) : <div className="p-4 text-center bg-gray-50 rounded-md text-gray-500 text-sm">
                  No athletes added yet. Please select a parent and add athletes.
                </div>}
              </div>
            </TabsContent>
            
            <TabsContent value="safety" className="space-y-6 pt-4">
              {/* Drop-off Person Section */}
              <div className="space-y-4 bg-gradient-to-r from-white to-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium text-blue-700 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Drop-off Person Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dropoff-name" className="text-sm">Name*</Label>
                    <Input
                      id="dropoff-name"
                      value={dropoffPersonName}
                      onChange={(e) => setDropoffPersonName(e.target.value)}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dropoff-relationship" className="text-sm">Relationship to Athlete*</Label>
                    <Input
                      id="dropoff-relationship"
                      value={dropoffPersonRelationship}
                      onChange={(e) => setDropoffPersonRelationship(e.target.value)}
                      placeholder="Parent, Guardian, etc."
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="dropoff-phone" className="text-sm">Phone Number*</Label>
                    <Input
                      id="dropoff-phone"
                      value={dropoffPersonPhone}
                      onChange={(e) => setDropoffPersonPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Pick-up Person Section */}
              <div className="space-y-4 bg-gradient-to-r from-white to-green-50 p-4 rounded-lg border border-green-100">
                <h4 className="font-medium text-green-700 flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  Pick-up Person Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pickup-name" className="text-sm">Name*</Label>
                    <Input
                      id="pickup-name"
                      value={pickupPersonName}
                      onChange={(e) => setPickupPersonName(e.target.value)}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="pickup-relationship" className="text-sm">Relationship to Athlete*</Label>
                    <Input
                      id="pickup-relationship"
                      value={pickupPersonRelationship}
                      onChange={(e) => setPickupPersonRelationship(e.target.value)}
                      placeholder="Parent, Guardian, etc."
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="pickup-phone" className="text-sm">Phone Number*</Label>
                    <Input
                      id="pickup-phone"
                      value={pickupPersonPhone}
                      onChange={(e) => setPickupPersonPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Alternative Pick-up Person Section */}
              <div className="space-y-4 bg-gradient-to-r from-white to-purple-50 p-4 rounded-lg border border-purple-100">
                <h4 className="font-medium text-purple-700 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Alternative Pick-up Person (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="alt-pickup-name" className="text-sm">Name</Label>
                    <Input
                      id="alt-pickup-name"
                      value={altPickupPersonName}
                      onChange={(e) => setAltPickupPersonName(e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="alt-pickup-relationship" className="text-sm">Relationship to Athlete</Label>
                    <Input
                      id="alt-pickup-relationship"
                      value={altPickupPersonRelationship}
                      onChange={(e) => setAltPickupPersonRelationship(e.target.value)}
                      placeholder="Parent, Guardian, etc."
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="alt-pickup-phone" className="text-sm">Phone Number</Label>
                    <Input
                      id="alt-pickup-phone"
                      value={altPickupPersonPhone}
                      onChange={(e) => setAltPickupPersonPhone(e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="notes" className="space-y-4 pt-4">
              <div>
                <Label htmlFor="admin-notes" className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4" />
                  Admin Notes
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="h-24 mt-2"
                  placeholder="Internal notes visible only to admin"
                />
              </div>
              
              <div className="pt-2">
                <Label htmlFor="special-requests" className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4" />
                  Special Requests
                </Label>
                <Textarea
                  id="special-requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="h-24 mt-2"
                  placeholder="Special requests from parents"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateBookingMutation.isPending}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              {updateBookingMutation.isPending ? 'Updating...' : 'Update Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
