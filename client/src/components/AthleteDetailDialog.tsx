import { BookingHistoryDisplay } from "@/components/BookingHistoryDisplay";
import { ParentInfoDisplay } from "@/components/ParentInfoDisplay";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WaiverStatusDisplay } from "@/components/WaiverStatusDisplay";
import { useToast } from "@/hooks/use-toast";
import { calculateAge } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Athlete, Booking, Parent } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  mode?: 'parent' | 'admin';
}

export function AthleteDetailDialog({
  open,
  onOpenChange,
  athlete,
  bookings,
  parentInfo,
  onBookSession,
  onEditAthlete,
  showActionButtons = true,
  mode = 'admin'
}: AthleteDetailDialogProps) {
  // Fetch complete athlete details to ensure we have all the data
  const { data: completeAthleteData } = useQuery<Athlete>({
    queryKey: ['/api/athletes', athlete?.id],
    queryFn: async () => {
      if (!athlete?.id) throw new Error('No athlete ID');
      const response = await apiRequest('GET', `/api/athletes/${athlete.id}`);
      return response.json();
    },
    enabled: !!athlete?.id && open,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use complete data if available, fallback to prop data
  const athleteData = completeAthleteData || athlete;

  // For parent mode, fetch all bookings to show complete booking history
  const { data: allBookings = [] } = useQuery<Booking[]>({
    queryKey: ['/api/parent/all-bookings'],
    enabled: mode === 'parent',
  });

  // Filter bookings for this specific athlete
  const athleteBookings = mode === 'parent' ? 
    allBookings.filter(booking => {
      // For parent mode, check if any athlete in booking_athletes matches
      const athleteId = athleteData?.id;
      if (!athleteId) return false;
      
      // Check if booking has athletes array (modern structure)
      if (booking.athletes && booking.athletes.length > 0) {
        return booking.athletes.some(a => a.athleteId === athleteId);
      }
      
      // Fallback to legacy name matching
      const athleteName = athleteData.name || 
                         (athleteData.firstName && athleteData.lastName ? 
                          `${athleteData.firstName} ${athleteData.lastName}` : '');
      
      return booking.athlete1Name === athleteName || 
             booking.athlete2Name === athleteName ||
             booking.athleteId === athleteId;
    }) : 
    bookings.filter(booking => {
      // For admin mode, use the provided bookings prop
      const athleteId = athleteData?.id;
      if (!athleteId) return false;
      
      if (booking.athletes && booking.athletes.length > 0) {
        return booking.athletes.some(a => a.athleteId === athleteId);
      }
      
      const athleteName = athleteData.name || 
                         (athleteData.firstName && athleteData.lastName ? 
                          `${athleteData.firstName} ${athleteData.lastName}` : '');
      
      return booking.athlete1Name === athleteName || 
             booking.athlete2Name === athleteName ||
             booking.athleteId === athleteId;
    });

  console.log('🔍 Filtered athlete bookings:', {
    athleteId: athleteData?.id,
    athleteName: athleteData?.name,
    totalBookings: mode === 'parent' ? allBookings.length : bookings.length,
    filteredBookings: athleteBookings.length,
    athleteBookings: athleteBookings.map(b => ({ 
      id: b.id, 
      status: b.status, 
      athleteName: b.athlete1Name,
      hasAthletes: !!b.athletes,
      athletesCount: b.athletes?.length || 0
    }))
  });
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
          queryClient.invalidateQueries({ queryKey: ['/api/athletes', athleteId] });
          queryClient.invalidateQueries({ queryKey: ['/api/parent/athletes'] });
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

  if (!athleteData) {
    console.log('🔍 AthleteDetailDialog: No athlete provided');
    return null;
  }

  console.log('🔍 AthleteDetailDialog photo debug:', {
    athleteId: athleteData.id,
    athleteName: athleteData.name,
    hasPhoto: !!athleteData.photo,
    photoValue: athleteData.photo,
    photoType: typeof athleteData.photo,
    photoLength: athleteData.photo?.length
  });

  // Debug logging to help identify issues
  console.log('=== AthleteDetailDialog Debug ===');
  console.log('Original athlete prop:', athlete);
  console.log('Complete athlete data:', athleteData);
  console.log('Total bookings received:', bookings.length);
  console.log('ParentInfo:', parentInfo);
  console.log('Filtered athlete bookings:', athleteBookings.length, athleteBookings);
  console.log('=== End Debug ===');

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
              Viewing profile for {athleteData.name || `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim() || 'Unknown Athlete'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Basic Info */}
          <div className="border rounded-lg p-4" role="region" aria-labelledby="basic-info-heading">
            <h3 id="basic-info-heading" className="font-semibold mb-3">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <div className="relative w-20 h-20 group">
                  {athleteData.photo ? (
                    <img
                      src={athleteData.photo}
                      alt={`${athleteData.name || 'Athlete'}'s photo`}
                      className="w-20 h-20 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => handlePhotoClick(athleteData.photo!)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePhotoClick(athleteData.photo!);
                        }
                      }}
                      aria-label={`View ${athleteData.name || 'athlete'}'s photo in full size`}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center" aria-label="No photo available">
                      <User className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, athleteData.id)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={uploadingPhoto}
                    aria-label={`Upload new photo for ${athleteData.name || 'athlete'}`}
                  />
                  {uploadingPhoto && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center" aria-live="polite">
                      <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                      <span className="sr-only">Uploading photo...</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-lg">{athleteData.name || `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim() || 'Unknown Athlete'}</p>
                  <p className="text-sm text-gray-600">
                    Age: {athleteData.dateOfBirth ? calculateAge(athleteData.dateOfBirth) : 'Unknown'} years old
                  </p>
                  <p className="text-sm text-gray-600">
                    Born: {athleteData.dateOfBirth ? new Date(athleteData.dateOfBirth).toLocaleDateString() : 'Unknown'}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Click photo to enlarge or click to upload new
                  </p>
                </div>
              </div>
              <div role="group" aria-label="Athlete details">
                <p className="text-sm"><span className="font-medium">Experience:</span> {athleteData.experience}</p>
                <p className="text-sm"><span className="font-medium">Gender:</span> {athleteData.gender || 'Not specified'}</p>
                {athleteData.allergies && (
                  <p className="text-sm text-red-600 mt-1">
                    <span className="font-medium">⚠️ Allergies:</span> {athleteData.allergies}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Parent Info */}
          <ParentInfoDisplay 
            athleteId={athleteData.id}
            parentInfo={parentInfo}
          />

          {/* Waiver Status */}
          <WaiverStatusDisplay 
            athleteId={athleteData.id}
            athleteName={athleteData.name || 'Unknown Athlete'}
            onResendWaiver={() => {
              // TODO: Implement waiver resend functionality
              toast({
                title: "Feature Coming Soon",
                description: "Waiver resend functionality will be implemented soon.",
              });
            }}
          />

          {/* Bookings History */}
          <BookingHistoryDisplay athleteId={athleteData.id} />

          {/* Action Buttons */}
          {showActionButtons && (
            <div className="flex justify-between pt-4 border-t" role="group" aria-label="Athlete actions">
              {onBookSession && (
                <Button onClick={onBookSession} className="bg-green-600 hover:bg-green-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Book Session
                </Button>
              )}
              {onEditAthlete && (
                <Button onClick={onEditAthlete} variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Athlete
                </Button>
              )}
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
                alt={`${athleteData.name || `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim() || 'Athlete'}'s enlarged photo`}
                className="max-w-full max-h-96 object-contain rounded-lg"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}