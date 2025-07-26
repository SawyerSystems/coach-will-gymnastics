import { WaiverStatusDisplay } from "@/components/WaiverStatusDisplay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { calculateAge } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Athlete, Booking, Parent } from "@shared/schema";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Plus, User } from "lucide-react";
import React, { useState } from "react";

interface AthleteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
  bookings: Booking[];
  parentInfo?: Parent | null;
  onBookSession?: () => void;
  onEditAthlete?: () => void;
  showActionButtons?: boolean;
}

export function AthleteDetailDialog({
  open,
  onOpenChange,
  athlete,
  bookings,
  parentInfo,
  onBookSession,
  onEditAthlete,
  showActionButtons = true
}: AthleteDetailDialogProps) {
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [isPhotoEnlarged, setIsPhotoEnlarged] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handlePhotoClick = (photoUrl: string) => {
    setEnlargedPhoto(photoUrl);
    setIsPhotoEnlarged(true);
  };

  const compressImage = (file: File, maxWidth: number, quality: number): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            // Create a new blob with the file name attached as a property
            const compressedBlob = Object.assign(blob, { 
              name: file.name.replace(/\.[^/.]+$/, '.jpg'), // Change extension to .jpg
              lastModified: Date.now()
            });
            resolve(compressedBlob as File);
          }
        }, 'image/jpeg', quality);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, athleteId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const compressedFile = await compressImage(file, 800, 0.8);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Photo = reader.result as string;
        
        const response = await apiRequest("PUT", `/api/athletes/${athleteId}/photo`, {
          photo: base64Photo
        });
        
        if (response.ok) {
          queryClient.invalidateQueries({ queryKey: ['/api/athletes'] });
          toast({
            title: "Photo Updated",
            description: "Athlete photo has been successfully updated.",
          });
        } else {
          throw new Error('Upload failed');
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (!athlete) return null;

  const athleteBookings = bookings.filter(b => {
    // Check if athlete is in booking_athletes relationship
    if (b.athletes && Array.isArray(b.athletes)) {
      return b.athletes.some((bookingAthlete: any) => 
        bookingAthlete.id === athlete.id ||
        bookingAthlete.name === athlete.name ||
        (athlete.firstName && athlete.lastName && 
         bookingAthlete.name === `${athlete.firstName} ${athlete.lastName}`)
      );
    }
    // Fallback to legacy fields
    return b.athlete1Name === athlete.name || 
           b.athlete2Name === athlete.name ||
           (athlete.firstName && athlete.lastName && 
            (b.athlete1Name === `${athlete.firstName} ${athlete.lastName}` ||
             b.athlete2Name === `${athlete.firstName} ${athlete.lastName}`));
  });

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-3xl max-h-[90vh] overflow-y-auto" 
          aria-describedby="athlete-profile-description"
        >
          <DialogHeader>
            <DialogTitle id="athlete-profile-title">
              Athlete Profile
            </DialogTitle>
            <DialogDescription id="athlete-profile-description">
              Viewing profile for {athlete.name}
            </DialogDescription>
          </DialogHeader>
          
          {/* Basic Info */}
          <div className="border rounded-lg p-4" role="region" aria-labelledby="basic-info-heading">
            <h3 id="basic-info-heading" className="font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  {athlete.photo ? (
                    <img
                      src={athlete.photo}
                      alt={`${athlete.name}'s profile photo`}
                      className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      onClick={() => handlePhotoClick(athlete.photo!)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePhotoClick(athlete.photo!);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label={`View ${athlete.name}'s photo in full size`}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center" aria-label="No photo available">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, athlete.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingPhoto}
                    aria-label={`Upload new photo for ${athlete.name}`}
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center" aria-live="polite">
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="sr-only">Uploading photo...</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-lg">{athlete.name}</p>
                  <p className="text-sm text-gray-600">
                    Age: {athlete.dateOfBirth ? calculateAge(athlete.dateOfBirth) : 'Unknown'} years old
                  </p>
                  <p className="text-sm text-gray-600">
                    Born: {athlete.dateOfBirth ? new Date(athlete.dateOfBirth).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Click photo to enlarge or click to upload new
                  </p>
                </div>
              </div>
              <div role="group" aria-label="Athlete details">
                <p className="text-sm"><span className="font-medium">Experience:</span> {athlete.experience}</p>
                <p className="text-sm"><span className="font-medium">Gender:</span> {athlete.gender || 'Not specified'}</p>
                {athlete.allergies && (
                  <p className="text-sm text-red-600 mt-1">
                    <span className="font-medium">⚠️ Allergies:</span> {athlete.allergies}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parent Info */}
          {parentInfo && (
            <div className="border rounded-lg p-4" role="region" aria-labelledby="parent-info-heading">
              <h3 id="parent-info-heading" className="font-semibold mb-3">Parent Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm" role="group" aria-label="Parent contact details">
                <div>
                  <p><span className="font-medium">Name:</span> {parentInfo.firstName} {parentInfo.lastName}</p>
                  <p><span className="font-medium">Email:</span> 
                    <a href={`mailto:${parentInfo.email}`} className="text-blue-600 hover:underline ml-1">
                      {parentInfo.email}
                    </a>
                  </p>
                </div>
                <div>
                  <p><span className="font-medium">Phone:</span> 
                    <a href={`tel:${parentInfo.phone}`} className="text-blue-600 hover:underline ml-1">
                      {parentInfo.phone}
                    </a>
                  </p>
                  <p><span className="font-medium">Emergency Contact:</span> {parentInfo.emergencyContactName} 
                    <a href={`tel:${parentInfo.emergencyContactPhone}`} className="text-blue-600 hover:underline ml-1">
                      ({parentInfo.emergencyContactPhone})
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Waiver Status */}
          <WaiverStatusDisplay 
            athleteId={athlete.id}
            athleteName={athlete.name || 'Unknown Athlete'}
            onResendWaiver={() => {
              // TODO: Implement waiver resend functionality
              toast({
                title: "Feature Coming Soon",
                description: "Waiver resend functionality will be implemented soon.",
              });
            }}
          />

          {/* Bookings History */}
          <div className="border rounded-lg p-4" role="region" aria-labelledby="booking-history-heading">
            <h3 id="booking-history-heading" className="font-semibold mb-3">Booking History</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto" role="log" aria-label="Booking history list">
              {athleteBookings
                .sort((a, b) => {
                  const dateA = a.preferredDate ? new Date(a.preferredDate).getTime() : 0;
                  const dateB = b.preferredDate ? new Date(b.preferredDate).getTime() : 0;
                  return dateB - dateA;
                })
                .map((booking) => (
                  <div key={booking.id} className="border rounded p-3" role="article" aria-label={`Booking ${booking.id}`}>
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium">{(() => {
                          const lt = booking.lessonType;
                          const name = (typeof lt === 'object' && lt && 'name' in lt) 
                            ? (lt as any).name 
                            : lt;
                          return (name || '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
                        })()}</p>
                        <p className="text-sm text-gray-600">
                          <time dateTime={booking.preferredDate || undefined}>
                            {booking.preferredDate}
                          </time> at {booking.preferredTime}
                        </p>
                        <p className="text-sm text-gray-600">Focus: {booking.focusAreas?.join(', ') || 'Not specified'}</p>
                        <p className="text-sm text-blue-600">Payment: {booking.paymentStatus}</p>
                        {(booking.waiverId || booking.waiverSigned) && (
                          <p className="text-xs text-green-600 font-medium" role="status">✓ Waiver Signed</p>
                        )}
                      </div>
                      <div className="text-right">
                        {booking.attendanceStatus && (
                          <p className="text-xs text-gray-500 mt-1">
                            Attendance: {booking.attendanceStatus}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              {athleteBookings.length === 0 && (
                <p className="text-gray-500 text-center" role="status">No bookings found</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {showActionButtons && (
            <div className="flex justify-between pt-4 border-t" role="group" aria-label="Athlete actions">
              {onBookSession && (
                <Button 
                  onClick={onBookSession}
                  aria-label={`Book a session for ${athlete.name}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
              )}
              <div className="space-x-2">
                {onEditAthlete && (
                  <Button 
                    variant="outline"
                    onClick={onEditAthlete}
                    aria-label={`Edit ${athlete.name}'s information`}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  aria-label="Close athlete profile"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Enlargement Modal */}
      <Dialog open={isPhotoEnlarged} onOpenChange={setIsPhotoEnlarged}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Athlete Photo</DialogTitle>
          </DialogHeader>
          {enlargedPhoto && (
            <div className="flex justify-center">
              <img
                src={enlargedPhoto}
                alt={`${athlete.name}'s enlarged photo`}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}