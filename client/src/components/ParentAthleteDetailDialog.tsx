import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UpdatedWaiverModal } from "@/components/updated-waiver-modal";
import { WaiverStatusDisplay } from "@/components/WaiverStatusDisplay";
import { useToast } from "@/hooks/use-toast";
import { useAthleteWaiverStatus } from "@/hooks/use-waiver-status";
import { calculateAge } from "@/lib/dateUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Athlete } from "@shared/schema";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, FileCheck, Plus, User } from "lucide-react";
import React, { useState } from "react";

interface ParentAthleteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athlete: Athlete | null;
  onBookSession?: () => void;
  onEditAthlete?: () => void;
  showActionButtons?: boolean;
}

export function ParentAthleteDetailDialog({
  open,
  onOpenChange,
  athlete,
  onBookSession,
  onEditAthlete,
  showActionButtons = true,
}: ParentAthleteDetailDialogProps) {
  const [isPhotoEnlarged, setIsPhotoEnlarged] = useState(false);
  const [enlargedPhoto, setEnlargedPhoto] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isWaiverModalOpen, setIsWaiverModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  // Fetch waiver status for the athlete
  const { data: waiverStatus } = useAthleteWaiverStatus(athlete?.id || 0);

  // Fetch parent information for waiver pre-filling
  const { 
    data: parentInfo, 
    isLoading: isLoadingParentInfo, 
    refetch: refetchParentInfo 
  } = useQuery({
    queryKey: ['/api/parent/info'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/parent/info');
      return response.json();
    },
    enabled: open, // Only fetch when modal is open
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Use complete data if available, fallback to prop data
  const athleteData = completeAthleteData || athlete;

  const handlePhotoClick = (photo: string) => {
    setEnlargedPhoto(photo);
    setIsPhotoEnlarged(true);
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>, athleteId: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const formData = new FormData();
      formData.append('photo', file);

      const response = await apiRequest('POST', `/api/athletes/${athleteId}/photo`, {
        body: formData,
      });

      if (response.ok) {
        toast({
          title: "Photo uploaded successfully!",
          description: "The athlete's photo has been updated.",
        });
        // The query will automatically refetch and update the UI
      } else {
        throw new Error('Failed to upload photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the photo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      // Reset the input
      event.target.value = '';
    }
  };

  const handleWaiverSigned = async (waiverData: any) => {
    try {
      toast({
        title: "Waiver signed successfully!",
        description: `Waiver has been signed for ${athleteData?.name}.`,
      });
      
      // Refresh all waiver-related data to update UI dynamically
      await queryClient.invalidateQueries({ queryKey: ['/api/parent/athletes'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/parent/waivers'] });
      await queryClient.invalidateQueries({ queryKey: ['/api/waivers'] });
      
      setIsWaiverModalOpen(false);
    } catch (error) {
      console.error('Error handling waiver signature:', error);
      toast({
        title: "Error",
        description: "There was an error processing the waiver signature.",
        variant: "destructive",
      });
    }
  };

  if (!athleteData) {
    return null;
  }

  const hasWaiver = waiverStatus?.hasWaiver || waiverStatus?.waiverSigned;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent 
          className="max-w-2xl max-h-[90vh] overflow-y-auto" 
          aria-describedby="parent-athlete-profile-description"
        >
          <DialogHeader>
            <DialogTitle id="parent-athlete-profile-title">
              Athlete Profile
            </DialogTitle>
            <DialogDescription id="parent-athlete-profile-description">
              Viewing profile for {athleteData.name || `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim() || 'Unknown Athlete'}
            </DialogDescription>
          </DialogHeader>
          
          {/* Basic Info */}
          <div className="border rounded-lg p-6 space-y-4" role="region" aria-labelledby="basic-info-heading">
            <h3 id="basic-info-heading" className="font-semibold text-lg mb-4">Basic Information</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Photo Section */}
              <div className="flex flex-col items-center space-y-3">
                <div className="relative w-24 h-24 group">
                  {athleteData.photo ? (
                    <img
                      src={athleteData.photo}
                      alt={`${athleteData.name || 'Athlete'}'s photo`}
                      className="w-24 h-24 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity border-2 border-gray-200"
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
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300" aria-label="No photo available">
                      <User className="h-10 w-10 text-gray-400" />
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
                <p className="text-xs text-gray-500 text-center max-w-24">
                  Click to enlarge or upload new photo
                </p>
              </div>

              {/* Athlete Details */}
              <div className="flex-1 space-y-3" role="group" aria-label="Athlete details">
                <div>
                  <h4 className="font-semibold text-xl text-gray-900">
                    {athleteData.name || `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim() || 'Unknown Athlete'}
                  </h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Age:</span>
                    <span className="ml-2 text-gray-900">
                      {athleteData.dateOfBirth ? calculateAge(athleteData.dateOfBirth) : 'Unknown'} years old
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Date of Birth:</span>
                    <span className="ml-2 text-gray-900">
                      {athleteData.dateOfBirth ? new Date(`${athleteData.dateOfBirth}T12:00:00Z`).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Experience Level:</span>
                    <span className="ml-2 text-gray-900 capitalize">
                      {athleteData.experience || 'Not specified'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Gender:</span>
                    <span className="ml-2 text-gray-900">
                      {athleteData.gender || 'Not specified'}
                    </span>
                  </div>
                </div>

                {athleteData.allergies && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
                    <p className="text-sm text-red-800">
                      <span className="font-medium">⚠️ Allergies/Medical Notes:</span>
                      <span className="ml-2">{athleteData.allergies}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Waiver Status */}
          <div className="border rounded-lg p-4" role="region" aria-labelledby="waiver-status-heading">
            <h3 id="waiver-status-heading" className="font-semibold text-lg mb-3">Waiver Status</h3>
            <WaiverStatusDisplay 
              athleteId={athleteData.id}
              athleteName={athleteData.name || `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim() || 'Unknown Athlete'}
            />
            
            {/* Sign Waiver Button - Show only if waiver is not signed */}
            {!hasWaiver && (
              <div className="mt-4 pt-3 border-t">
                <Button 
                  onClick={() => {
                    // Ensure parent info is loaded before opening waiver modal
                    if (parentInfo) {
                      setIsWaiverModalOpen(true);
                    } else {
                      // If parent info isn't loaded yet, try to refetch
                      refetchParentInfo().then(() => {
                        setIsWaiverModalOpen(true);
                      });
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  size="lg"
                  disabled={isLoadingParentInfo}
                >
                  <FileCheck className="h-4 w-4 mr-2" />
                  {isLoadingParentInfo ? 'Loading...' : 'Sign Waiver Now'}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Complete the waiver to enable booking sessions for this athlete
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {showActionButtons && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t" role="group" aria-label="Athlete actions">
              {onBookSession && (
                <Button 
                  onClick={onBookSession} 
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Book New Session
                </Button>
              )}
              {onEditAthlete && (
                <Button 
                  onClick={onEditAthlete} 
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Information
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Waiver Signing Modal */}
      <UpdatedWaiverModal
        isOpen={isWaiverModalOpen}
        onClose={() => setIsWaiverModalOpen(false)}
        onWaiverSigned={handleWaiverSigned}
        athleteId={athleteData.id}
        parentId={parentInfo?.id || 0}
        bookingData={{
          athleteName: athleteData.name || `${athleteData.firstName || ''} ${athleteData.lastName || ''}`.trim(),
          parentName: parentInfo ? `${parentInfo.firstName || ''} ${parentInfo.lastName || ''}`.trim() : '',
          emergencyContactNumber: parentInfo?.phone || '',
          relationshipToAthlete: 'Parent', // Default value
        }}
      />

      {/* Photo Enlargement Modal */}
      <Dialog open={isPhotoEnlarged} onOpenChange={setIsPhotoEnlarged}>
        <DialogContent 
          className="max-w-2xl"
          aria-describedby="athlete-photo-description"
        >
          <DialogHeader>
            <DialogTitle>Athlete Photo</DialogTitle>
            <DialogDescription id="athlete-photo-description">
              Enlarged view of {athleteData.name || 'athlete'}'s photo
            </DialogDescription>
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
