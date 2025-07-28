import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Booking } from "@shared/schema";
import { Edit } from "lucide-react";
import { useState } from 'react';
import { AdminEditBookingForm } from "./admin-edit-booking-form";

type AdminBookingDetailActionsProps = {
  booking: Booking;
};

export function AdminBookingDetailActions({ booking }: AdminBookingDetailActionsProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  if (isEditing) {
    return (
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <AdminEditBookingForm 
            booking={booking} 
            onClose={() => setIsEditing(false)}
          />
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => setIsEditing(true)}
    >
      <Edit className="h-4 w-4 mr-1" />
      Edit
    </Button>
  );
}
