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
import {
  AlertTriangle,
  Bookmark,
  CheckCircle,
  ClipboardList,
  Clock,
  CreditCard,
  DollarSign,
  MessageSquare,
  Target,
  User,
  UserCheck,
  Users,
  X
} from "lucide-react";
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

  // Function to populate all booking data from bookingDetails
  const populateBookingData = () => {
    try {
      if (!bookingDetails) return;
      
      console.log("Populating booking data from:", bookingDetails);
      
      // Set all basic booking fields
      setStatus(bookingDetails.status || 'pending');
      setPaymentStatus(bookingDetails.paymentStatus || 'unpaid');
      setAttendanceStatus(bookingDetails.attendanceStatus || 'pending');
      setPaidAmount(bookingDetails.paidAmount?.toString() || '0.00');
      setAdminNotes(bookingDetails.adminNotes || '');
      setSpecialRequests(bookingDetails.specialRequests || '');
      
      // Set lesson type
      if (bookingDetails.lessonTypeId) {
        setSelectedLessonTypeId(bookingDetails.lessonTypeId);
      }
      
      // Set focus areas
      if (bookingDetails.focusAreas && Array.isArray(bookingDetails.focusAreas)) {
        setFocusAreas(bookingDetails.focusAreas);
      }
      
      // Set safety information
      setDropoffPersonName(bookingDetails.dropoffPersonName || '');
      setDropoffPersonRelationship(bookingDetails.dropoffPersonRelationship || '');
      setDropoffPersonPhone(bookingDetails.dropoffPersonPhone || '');
      setPickupPersonName(bookingDetails.pickupPersonName || '');
      setPickupPersonRelationship(bookingDetails.pickupPersonRelationship || '');
      setPickupPersonPhone(bookingDetails.pickupPersonPhone || '');
      setAltPickupPersonName(bookingDetails.altPickupPersonName || '');
      setAltPickupPersonRelationship(bookingDetails.altPickupPersonRelationship || '');
      setAltPickupPersonPhone(bookingDetails.altPickupPersonPhone || '');
      
      // Set parent ID
      if (bookingDetails.parentId) {
        console.log("Setting parent ID:", bookingDetails.parentId);
        setSelectedParentId(bookingDetails.parentId);
      }
      
      // Set athletes
      if (bookingDetails.athletes && Array.isArray(bookingDetails.athletes)) {
        const mappedAthletes = bookingDetails.athletes.map((athlete: Athlete) => ({ 
          athleteId: athlete && athlete.id ? athlete.id : null 
        }));
        console.log("Mapped athletes:", mappedAthletes);
        
        setBookingAthletes(mappedAthletes.length > 0 ? mappedAthletes : [{ athleteId: null }]);
      } else {
        // If no athletes but modal is open, set at least one empty slot
        console.log("No athletes found, initializing with empty slot");
        setBookingAthletes([{ athleteId: null }]);
      }
    } catch (error) {
      console.error('Error populating booking data:', error);
      toast({
        title: "Error",
        description: "Failed to load booking details. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Initialize booking data when booking details are loaded
  useEffect(() => {
    if (bookingDetails && open) {
      populateBookingData();
    }
  }, [bookingDetails, open]);

  // Reset all form fields to initial state
  const resetForm = () => {
    console.log("Resetting form state");
    
    // Reset general booking info
    setStatus(booking.status || 'pending');
    setPaymentStatus(booking.paymentStatus || 'unpaid');
    setAttendanceStatus(booking.attendanceStatus || 'pending');
    setPaidAmount(booking.paidAmount?.toString() || '0.00');
    setAdminNotes(booking.adminNotes || '');
    setSpecialRequests(booking.specialRequests || '');
    setSelectedLessonTypeId(booking.lessonTypeId || 0);
    setFocusAreas(booking.focusAreas || []);
    setTempFocusArea('');
    
    // Reset athletes
    setBookingAthletes([]);
    
    // Reset safety information
    setDropoffPersonName(booking.dropoffPersonName || '');
    setDropoffPersonRelationship(booking.dropoffPersonRelationship || '');
    setDropoffPersonPhone(booking.dropoffPersonPhone || '');
    setPickupPersonName(booking.pickupPersonName || '');
    setPickupPersonRelationship(booking.pickupPersonRelationship || '');
    setPickupPersonPhone(booking.pickupPersonPhone || '');
    setAltPickupPersonName(booking.altPickupPersonName || '');
    setAltPickupPersonRelationship(booking.altPickupPersonRelationship || '');
    setAltPickupPersonPhone(booking.altPickupPersonPhone || '');
    
    // Reset validation state
    setIsValidationError(false);
    setValidationMessage('');
    
    // Reset tab
    setTab('general');
  };
  
  // Update mutation with comprehensive error handling and data validation
  const updateBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("Sending booking update data:", data);
      
      try {
        // Validate athletes before sending
        if (!Array.isArray(data.athletes) || data.athletes.length === 0) {
          throw new Error("At least one athlete is required");
        }
        
        // Ensure all athlete IDs are valid
        const validAthletes = data.athletes.filter((a: {athleteId?: number | null}) => a && a.athleteId);
        if (validAthletes.length === 0) {
          throw new Error("Please select valid athletes");
        }
        
        // Validate parent ID
        if (!data.parentId) {
          throw new Error("Parent selection is required");
        }
        
        // Send update request
        const response = await fetch(`/api/bookings/${booking.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Booking update failed:", errorData);
          throw new Error(errorData.message || 'Failed to update booking');
        }
        
        const result = await response.json();
        console.log("Booking update successful:", result);
        return result;
      } catch (error: any) {
        console.error("Error in update mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/bookings', booking.id, 'details'] });
      
      // Reset form state
      resetForm();
      
      // Format updated fields for success message
      const updatedFields = [];
      if (data.status) updatedFields.push('Status');
      if (data.paymentStatus) updatedFields.push('Payment Status');
      if (data.attendanceStatus) updatedFields.push('Attendance');
      if (data.focusAreas?.length > 0) updatedFields.push('Focus Areas');
      if (data.athletes?.length > 0) updatedFields.push('Athletes');
      if (data.dropoffPersonName) updatedFields.push('Safety Info');
      
      const updatedFieldsText = updatedFields.length > 0 
        ? `Updated: ${updatedFields.join(', ')}`
        : 'All changes saved';
      
      // Show success toast with more details
      toast({
        title: "Booking Updated Successfully",
        description: `Booking #${booking.id} has been updated. ${updatedFieldsText}`,
        variant: "default"
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the modal
      onClose();
    },
    onError: (error: Error) => {
      // Log the detailed error for debugging
      console.error("Booking update error:", error);
      
      // Create a user-friendly error message
      let errorMessage = error.message || "Failed to update booking";
      
      // Check for common error patterns and provide specific guidance
      if (errorMessage.includes("athlete")) {
        errorMessage = "There was an issue with the selected athletes. Please check your athlete selections.";
        setTab('athletes');
      } else if (errorMessage.includes("parent")) {
        errorMessage = "There was an issue with the parent selection. Please select a valid parent.";
        setTab('general');
      } else if (errorMessage.includes("focus")) {
        errorMessage = "Please provide at least one focus area for the lesson.";
        setTab('general');
      } else if (errorMessage.toLowerCase().includes("database") || errorMessage.toLowerCase().includes("connection")) {
        errorMessage = "Database connection error. Please try again or contact support if the problem persists.";
      }
      
      // Show toast with the user-friendly error message
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Set validation error for in-form display
      setIsValidationError(true);
      setValidationMessage(errorMessage);
    }
  });
  
  // Delete mutation
  const deleteBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      console.log("Sending booking delete request for ID:", bookingId);
      
      try {
        // Send delete request
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Booking delete failed:", errorData);
          throw new Error(errorData.message || 'Failed to delete booking');
        }
        
        return { success: true, id: bookingId };
      } catch (error: any) {
        console.error("Error in delete mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      
      // Show success toast
      toast({
        title: "Booking Deleted",
        description: `Booking #${booking.id} has been permanently deleted`,
        variant: "default"
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the modal
      onClose();
    },
    onError: (error: Error) => {
      // Log the detailed error for debugging
      console.error("Booking delete error:", error);
      
      // Show toast with the error message
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete booking. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Function to handle booking deletion
  const handleDeleteBooking = (bookingId: number) => {
    deleteBookingMutation.mutate(bookingId);
  };

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
    // Reset validation state first
    setIsValidationError(false);
    setValidationMessage("");
    
    // Validate required booking information
    if (!selectedLessonTypeId) {
      setIsValidationError(true);
      setValidationMessage("Please select a lesson type.");
      setTab('general');
      return false;
    }
    
    if (!selectedParentId) {
      setIsValidationError(true);
      setValidationMessage("Please select a parent for this booking.");
      setTab('general');
      return false;
    }
    
    if (!status) {
      setIsValidationError(true);
      setValidationMessage("Please select a booking status.");
      setTab('general');
      return false;
    }
    
    if (!paymentStatus) {
      setIsValidationError(true);
      setValidationMessage("Please select a payment status.");
      setTab('general');
      return false;
    }
    
          // Validate at least one athlete is selected
    if (!Array.isArray(bookingAthletes) || 
        bookingAthletes.length === 0 || 
        bookingAthletes.every((a: { athleteId: number | null }) => !a || a.athleteId === null || a.athleteId === 0 || a.athleteId === undefined)) {
      setIsValidationError(true);
      setValidationMessage("Please select at least one athlete.");
      setTab('athletes');
      return false;
    }
    
    // Validate at least one focus area
    if (!Array.isArray(focusAreas) || focusAreas.length === 0) {
      setIsValidationError(true);
      setValidationMessage("Please add at least one focus area.");
      setTab('general');
      return false;
    }
    
    // Validate required safety fields
    if (!dropoffPersonName || !dropoffPersonRelationship || !dropoffPersonPhone) {
      setIsValidationError(true);
      setValidationMessage("Please fill in all required drop-off information.");
      setTab('safety');
      return false;
    }
    
    if (!pickupPersonName || !pickupPersonRelationship || !pickupPersonPhone) {
      setIsValidationError(true);
      setValidationMessage("Please fill in all required pickup information.");
      setTab('safety');
      return false;
    }
    
    // Check for any non-numeric characters in phone numbers
    const phoneRegex = /^[\d\+\-\(\)\s\.]+$/;
    if (dropoffPersonPhone && !phoneRegex.test(dropoffPersonPhone)) {
      setIsValidationError(true);
      setValidationMessage("Drop-off person phone number contains invalid characters.");
      setTab('safety');
      return false;
    }
    
    if (pickupPersonPhone && !phoneRegex.test(pickupPersonPhone)) {
      setIsValidationError(true);
      setValidationMessage("Pickup person phone number contains invalid characters.");
      setTab('safety');
      return false;
    }
    
    if (altPickupPersonPhone && !phoneRegex.test(altPickupPersonPhone)) {
      setIsValidationError(true);
      setValidationMessage("Alternative pickup person phone number contains invalid characters.");
      setTab('safety');
      return false;
    }
    
    // All validations passed
    setIsValidationError(false);
    setValidationMessage("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Run form validation
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
      
      // Clean up athlete data before sending
      const cleanedAthletes = Array.isArray(bookingAthletes) 
        ? bookingAthletes
            .filter((a: { athleteId: number | null }) => a && (a.athleteId !== null && a.athleteId !== undefined)) 
            .map((a: { athleteId: number | null }) => ({ athleteId: a.athleteId }))
        : [];
      
      // Add validation for at least one athlete
      if (cleanedAthletes.length === 0) {
        setIsValidationError(true);
        setValidationMessage("Please select at least one athlete.");
        setTab('athletes'); // Switch to athletes tab
        return;
      }
      
      // Prepare complete booking data for update
      const bookingData = {
        status,
        paymentStatus,
        attendanceStatus,
        paidAmount: numericPaidAmount,
        adminNotes,
        specialRequests,
        lessonTypeId: selectedLessonTypeId,
        focusAreas,
        athletes: cleanedAthletes,
        parentId: selectedParentId,
        
        // Safety information
        dropoffPersonName,
        dropoffPersonRelationship,
        dropoffPersonPhone,
        pickupPersonName,
        pickupPersonRelationship,
        pickupPersonPhone,
        altPickupPersonName,
        altPickupPersonRelationship,
        altPickupPersonPhone,
        
        // Add timestamp for the update
        updatedAt: new Date().toISOString(),
      };
      
      console.log("Submitting booking update:", bookingData);
      
      // Submit data to the mutation
      updateBookingMutation.mutate(bookingData);
      
    } catch (error: any) {
      console.error("Error in form submission:", error);
      toast({
        title: "Form Submission Error",
        description: error.message || "An error occurred while processing your form. Please try again.",
        variant: "destructive"
      });
    }
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
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0" aria-describedby="booking-edit-description">
        <DialogHeader className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-6 py-4 rounded-t-lg">
          <DialogTitle className="text-xl font-bold">
            Edit Booking #{booking.id}
          </DialogTitle>
          <p id="booking-edit-description" className="text-sm text-blue-100 mt-1">
            Edit booking details including status, payment, athletes, and safety information
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-4">
          {isValidationError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm">{validationMessage}</div>
            </div>
          )}
          
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-4 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="general" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">General</TabsTrigger>
              <TabsTrigger value="athletes" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Athletes</TabsTrigger>
              <TabsTrigger value="safety" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Safety Info</TabsTrigger>
              <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">Notes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white bg-opacity-80 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    Booking Status
                  </Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="bg-white border-gray-200 mt-1.5">
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
                
                <div className="bg-white bg-opacity-80 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <CreditCard className="h-4 w-4 text-green-500" />
                    Payment Status
                  </Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger className="bg-white border-gray-200 mt-1.5">
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
                <div className="bg-white bg-opacity-80 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-purple-500" />
                    Attendance Status
                  </Label>
                  <Select value={attendanceStatus} onValueChange={setAttendanceStatus}>
                    <SelectTrigger className="bg-white border-gray-200 mt-1.5">
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
                
                <div className="bg-white bg-opacity-80 p-3 rounded-lg border border-gray-200 shadow-sm">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    Paid Amount
                  </Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      type="number" 
                      step="0.01" 
                      value={paidAmount} 
                      onChange={(e) => setPaidAmount(e.target.value)} 
                      placeholder="0.00"
                      className="pl-8 bg-white border-gray-200"
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="bg-gradient-to-r from-white to-indigo-50 p-3 rounded-lg border border-indigo-100 shadow-sm">
                  <Label className="text-sm font-medium text-indigo-700 flex items-center gap-1.5">
                    <Bookmark className="h-4 w-4 text-indigo-600" />
                    Lesson Type
                  </Label>
                  <Select 
                    value={selectedLessonTypeId?.toString()} 
                    onValueChange={handleLessonTypeChange}
                  >
                    <SelectTrigger className="bg-white border-indigo-100 mt-1.5">
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
              </div>
              
              <div className="bg-gradient-to-r from-white to-teal-50 p-4 rounded-lg border border-teal-100 shadow-sm mt-4">
                <Label className="text-sm font-medium text-teal-700 flex items-center gap-1.5 mb-2">
                  <Target className="h-4 w-4 text-teal-600" />
                  Focus Areas ({focusAreas.length}/{getMaxFocusAreas()})
                </Label>
                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Select
                        value="custom"
                        onValueChange={(value) => {
                          if (value !== "custom") {
                            setTempFocusArea(value);
                            if (focusAreas.length < getMaxFocusAreas() && !focusAreas.includes(value)) {
                              setFocusAreas([...focusAreas, value]);
                            }
                          }
                        }}
                      >
                        <SelectTrigger className="bg-white border-teal-100">
                          <SelectValue placeholder="Select focus area" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="custom">Custom focus area...</SelectItem>
                          <SelectItem value="Floor Skills">Floor Skills</SelectItem>
                          <SelectItem value="Balance Beam">Balance Beam</SelectItem>
                          <SelectItem value="Bars">Bars</SelectItem>
                          <SelectItem value="Vault">Vault</SelectItem>
                          <SelectItem value="Strength Training">Strength Training</SelectItem>
                          <SelectItem value="Flexibility">Flexibility</SelectItem>
                          <SelectItem value="Tumbling">Tumbling</SelectItem>
                          <SelectItem value="Handstands">Handstands</SelectItem>
                          <SelectItem value="Cartwheels">Cartwheels</SelectItem>
                          <SelectItem value="Forward Rolls">Forward Rolls</SelectItem>
                          <SelectItem value="Backward Rolls">Backward Rolls</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Input 
                        value={tempFocusArea} 
                        onChange={(e) => setTempFocusArea(e.target.value)} 
                        placeholder="Custom focus area"
                        disabled={focusAreas.length >= getMaxFocusAreas()}
                        className="w-48 bg-white border-teal-100"
                      />
                      <Button 
                        type="button" 
                        onClick={addFocusArea}
                        disabled={focusAreas.length >= getMaxFocusAreas() || !tempFocusArea.trim()}
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {focusAreas.map((area, index) => (
                        <div key={index} className="bg-teal-50 text-teal-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-teal-200">
                          <span>{area}</span>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5 rounded-full hover:bg-teal-100"
                            onClick={() => removeFocusArea(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {focusAreas.length === 0 && (
                        <div className="text-gray-500 text-sm italic py-2">No focus areas added yet</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <Card className="mt-4 border-blue-100 shadow-sm bg-gradient-to-r from-white to-blue-50">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="bg-blue-100 p-1.5 rounded-full">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-800">Session Details</span>
                    </div>
                    <span className="text-lg font-bold bg-blue-50 px-3 py-1 rounded-full text-blue-700">${calculatePrice()}</span>
                  </div>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1.5 bg-white bg-opacity-70 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-700">Duration:</span>
                      <span className="ml-auto">{getLessonTypeDuration()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white bg-opacity-70 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-gray-700">Capacity:</span>
                      <span className="ml-auto">{getMaxAthletes()} Athlete{getMaxAthletes() > 1 ? 's' : ''}</span>
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
              
              <div className="bg-gradient-to-r from-white to-orange-50 p-4 rounded-lg border border-orange-100 shadow-sm mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-orange-700 flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-orange-600" />
                    Athletes ({Array.isArray(bookingAthletes) ? bookingAthletes.length : 0}/{getMaxAthletes()})
                  </Label>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={addAthleteSlot}
                    disabled={Array.isArray(bookingAthletes) && bookingAthletes.length >= getMaxAthletes()}
                    className="border-orange-200 hover:bg-orange-50 text-orange-700"
                  >
                    Add Athlete
                  </Button>
                </div>
                
                <div className="space-y-3 bg-white bg-opacity-70 p-3 rounded-lg">
                {Array.isArray(bookingAthletes) ? bookingAthletes.map((bookingAthlete, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Select 
                        value={bookingAthlete && bookingAthlete.athleteId ? bookingAthlete.athleteId.toString() : 'select-athlete'} 
                        onValueChange={(value) => handleAthleteChange(value, index)}
                        defaultValue="select-athlete"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select athlete" />
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
                            <SelectItem value="no-athletes" disabled>
                              {selectedParentId ? "No athletes found for this parent" : "Please select a parent first"}
                            </SelectItem>
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
              <div className="bg-gradient-to-r from-white to-purple-50 p-4 rounded-lg border border-purple-100 shadow-sm">
                <Label htmlFor="admin-notes" className="text-sm font-medium text-purple-700 flex items-center gap-1.5 mb-2">
                  <ClipboardList className="h-4 w-4 text-purple-600" />
                  Admin Notes
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[100px] bg-white border-purple-100"
                  placeholder="Internal notes visible only to admin"
                />
              </div>
              
              <div className="bg-gradient-to-r from-white to-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm mt-4">
                <Label htmlFor="special-requests" className="text-sm font-medium text-blue-700 flex items-center gap-1.5 mb-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  Special Requests
                </Label>
                <Textarea
                  id="special-requests"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="min-h-[100px] bg-white border-blue-100"
                  placeholder="Special requests from parents"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between gap-4 pt-6 mt-2">
            <div>
              {booking.id && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
                      handleDeleteBooking(booking.id);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Booking
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onClose()}
                className="border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={updateBookingMutation.isPending}
                className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
              >
                {updateBookingMutation.isPending ? 'Updating...' : 'Update Booking'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
