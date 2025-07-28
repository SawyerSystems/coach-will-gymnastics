import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Booking } from '@shared/schema';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';

type AdminEditBookingFormProps = {
  booking: Booking;
  onClose: () => void;
};

export function AdminEditBookingForm({ booking, onClose }: AdminEditBookingFormProps) {
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
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '');
  const [specialRequests, setSpecialRequests] = useState(booking.specialRequests || '');

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateBookingMutation = useMutation({
    mutationFn: async (data: {
      dropoffPersonName: string;
      dropoffPersonRelationship: string;
      dropoffPersonPhone: string;
      pickupPersonName: string;
      pickupPersonRelationship: string;
      pickupPersonPhone: string;
      altPickupPersonName?: string;
      altPickupPersonRelationship?: string;
      altPickupPersonPhone?: string;
      adminNotes?: string;
      specialRequests?: string;
    }) => {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to update booking');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
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
      dropoffPersonName,
      dropoffPersonRelationship,
      dropoffPersonPhone,
      pickupPersonName,
      pickupPersonRelationship,
      pickupPersonPhone,
      altPickupPersonName,
      altPickupPersonRelationship,
      altPickupPersonPhone,
      adminNotes,
      specialRequests
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Safety Information Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Safety Information</h3>
        
        {/* Drop-off Person Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Drop-off Person Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dropoff-name">Name*</Label>
              <input
                id="dropoff-name"
                value={dropoffPersonName}
                onChange={(e) => setDropoffPersonName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="dropoff-relationship">Relationship to Athlete*</Label>
              <input
                id="dropoff-relationship"
                value={dropoffPersonRelationship}
                onChange={(e) => setDropoffPersonRelationship(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Parent, Guardian, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="dropoff-phone">Phone Number*</Label>
              <input
                id="dropoff-phone"
                value={dropoffPersonPhone}
                onChange={(e) => setDropoffPersonPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Pick-up Person Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Pick-up Person Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pickup-name">Name*</Label>
              <input
                id="pickup-name"
                value={pickupPersonName}
                onChange={(e) => setPickupPersonName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Full name"
                required
              />
            </div>
            <div>
              <Label htmlFor="pickup-relationship">Relationship to Athlete*</Label>
              <input
                id="pickup-relationship"
                value={pickupPersonRelationship}
                onChange={(e) => setPickupPersonRelationship(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Parent, Guardian, etc."
                required
              />
            </div>
            <div>
              <Label htmlFor="pickup-phone">Phone Number*</Label>
              <input
                id="pickup-phone"
                value={pickupPersonPhone}
                onChange={(e) => setPickupPersonPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Alternative Pick-up Person Section */}
        <div className="space-y-4">
          <h4 className="font-medium">Alternative Pick-up Person (Optional)</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alt-pickup-name">Name</Label>
              <input
                id="alt-pickup-name"
                value={altPickupPersonName}
                onChange={(e) => setAltPickupPersonName(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Full name"
              />
            </div>
            <div>
              <Label htmlFor="alt-pickup-relationship">Relationship to Athlete</Label>
              <input
                id="alt-pickup-relationship"
                value={altPickupPersonRelationship}
                onChange={(e) => setAltPickupPersonRelationship(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Relative, Friend, etc."
              />
            </div>
            <div>
              <Label htmlFor="alt-pickup-phone">Phone Number</Label>
              <input
                id="alt-pickup-phone"
                value={altPickupPersonPhone}
                onChange={(e) => setAltPickupPersonPhone(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="(555) 123-4567"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Admin Notes */}
      <div>
        <Label htmlFor="admin-notes">Admin Notes</Label>
        <textarea
          id="admin-notes"
          value={adminNotes}
          onChange={(e) => setAdminNotes(e.target.value)}
          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
          placeholder="Add any administrative notes about this booking..."
        />
      </div>
      
      {/* Special Requests */}
      <div>
        <Label htmlFor="special-requests">Special Requests</Label>
        <textarea
          id="special-requests"
          value={specialRequests}
          onChange={(e) => setSpecialRequests(e.target.value)}
          className="w-full min-h-[100px] px-3 py-2 border rounded-md"
          placeholder="Add any special requests for this booking..."
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
