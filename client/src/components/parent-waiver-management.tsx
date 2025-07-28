import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UpdatedWaiverModal } from '@/components/updated-waiver-modal';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Calendar, CheckCircle, FileText, FileX, Phone, Shield, User } from 'lucide-react';
import { useState } from 'react';

interface Athlete {
  id: number;
  name: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  parent_id: number;
  experience: string;
  allergies?: string;
}

interface Waiver {
  id: number;
  athlete_id: number;
  parent_id: number;
  athlete_name: string;
  signer_name: string;
  relationship_to_athlete: string;
  signature: string;
  emergency_contact_number: string;
  understands_risks: boolean;
  agrees_to_policies: boolean;
  authorizes_emergency_care: boolean;
  allows_photo_video: boolean;
  confirms_authority: boolean;
  signed_at: string;
  created_at: string;
}

interface AthleteWaiverStatus {
  athlete: Athlete;
  waiver: Waiver | null;
  hasWaiver: boolean;
  waiverSigned: boolean;
  needsWaiver: boolean;
}

export function ParentWaiverManagement() {
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [showWaiverDialog, setShowWaiverDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch waiver status for all parent's athletes
  const { data: waiverStatus, isLoading } = useQuery<AthleteWaiverStatus[]>({
    queryKey: ['/api/parent/waivers'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const [showWaiverModal, setShowWaiverModal] = useState(false);

  const handleCreateWaiver = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    // Ensure parent info is loaded before opening waiver modal
    if (parentInfo) {
      setShowWaiverModal(true);
    } else {
      // If parent info isn't loaded yet, try to refetch
      refetchParentInfo().then(() => {
        setShowWaiverModal(true);
      });
    }
  };

  const handleWaiverSigned = () => {
    // Invalidate all waiver-related queries to update UI dynamically
    queryClient.invalidateQueries({ queryKey: ['/api/parent/waivers'] });
    queryClient.invalidateQueries({ queryKey: ['/api/parent/athletes'] });
    setShowWaiverModal(false);
    setSelectedAthlete(null);
    toast({
      title: "Waiver Signed Successfully",
      description: "The waiver has been completed and saved.",
    });
  };

  const confirmCreateWaiver = () => {
    setShowWaiverDialog(false);
    if (selectedAthlete) {
      setShowWaiverModal(true);
    }
  };

  const getAthleteAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Waiver Management</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!waiverStatus || !Array.isArray(waiverStatus) || waiverStatus.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-600" />
          <h2 className="text-xl font-semibold">Waiver Management</h2>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Athletes Found</h3>
              <p className="text-gray-600">
                No athletes are currently registered under your account. Add athletes through the booking system to manage waivers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const athletesNeedingWaivers = waiverStatus?.filter((status: AthleteWaiverStatus) => status.needsWaiver) || [];
  const athletesWithWaivers = waiverStatus?.filter((status: AthleteWaiverStatus) => status.hasWaiver) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-blue-800">Waiver Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">{athletesWithWaivers.length}</p>
                <p className="text-sm font-medium text-green-700">Signed Waivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-full">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">{athletesNeedingWaivers.length}</p>
                <p className="text-sm font-medium text-orange-700">Pending Waivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600">{waiverStatus.length}</p>
                <p className="text-sm font-medium text-blue-700">Total Athletes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Waivers */}
      {athletesNeedingWaivers.length > 0 && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 py-4">
              <CardTitle className="text-white flex items-center gap-2">
                <FileX className="h-5 w-5" />
                Athletes Needing Waivers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The following athletes need signed waivers before participating in coaching sessions. Please complete the waiver process for each athlete.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                {athletesNeedingWaivers.map((status: AthleteWaiverStatus) => (
                  <Card key={status.athlete.id} className="border-orange-200 bg-orange-50/50 hover:bg-orange-50 transition-all duration-200 shadow-sm hover:shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-orange-800">
                            {status.athlete.name || `${status.athlete.first_name} ${status.athlete.last_name}`}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1 text-orange-700">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Age: {getAthleteAge(status.athlete.date_of_birth)}
                            </span>
                            <span className="capitalize">
                              Experience: {status.athlete.experience}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-orange-600 border-orange-600 font-medium bg-orange-50">
                          Waiver Required
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-orange-700">
                            A liability waiver is required before this athlete can participate in coaching sessions.
                          </p>
                          {status.athlete.allergies && (
                            <p className="text-sm text-red-600 mt-1">
                              <strong>Allergies:</strong> {status.athlete.allergies}
                            </p>
                          )}
                        </div>
                        <Button 
                          onClick={() => handleCreateWaiver(status.athlete)}
                          className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-medium shadow-sm"
                          disabled={isLoadingParentInfo}
                        >
                          {isLoadingParentInfo ? 'Loading...' : 'Sign Waiver'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Signed Waivers */}
      {athletesWithWaivers.length > 0 && (
        <div className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 py-4">
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Signed Waivers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid gap-4">
                {athletesWithWaivers.map((status: AthleteWaiverStatus) => (
                  <Card key={status.athlete.id} className="border-green-200 bg-green-50/50 hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg text-green-800">
                            {status.athlete.name || `${status.athlete.first_name} ${status.athlete.last_name}`}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-4 mt-1 text-green-700">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Age: {getAthleteAge(status.athlete.date_of_birth)}
                            </span>
                            <span className="capitalize">
                              Experience: {status.athlete.experience}
                            </span>
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-green-600 border-green-600 font-medium bg-green-50">
                          Waiver Signed
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-700">Signed by:</span>
                          <span className="text-sm font-medium">{status.waiver?.signer_name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-700">Date signed:</span>
                          <span className="text-sm font-medium">
                            {status.waiver?.signed_at ? formatDate(status.waiver.signed_at) : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-green-700">Relationship:</span>
                          <span className="text-sm font-medium">{status.waiver?.relationship_to_athlete}</span>
                        </div>
                        {status.waiver?.emergency_contact_number && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-green-700">Emergency Contact:</span>
                            <span className="text-sm font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {status.waiver.emergency_contact_number}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Waiver Dialog */}
      <Dialog open={showWaiverDialog} onOpenChange={setShowWaiverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Waiver for {selectedAthlete?.name || `${selectedAthlete?.first_name} ${selectedAthlete?.last_name}`}</DialogTitle>
            <DialogDescription>
              This will create a new waiver document for your athlete. You'll need to complete the signing process afterward.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Waiver Requirements</h4>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• Acknowledgment of inherent risks in gymnastics activities</li>
                <li>• Agreement to facility policies and procedures</li>
                <li>• Authorization for emergency medical care</li>
                <li>• Photo/video consent for promotional purposes</li>
                <li>• Confirmation of legal authority to sign</li>
              </ul>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowWaiverDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={confirmCreateWaiver}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Sign Waiver
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waiver Modal */}
      {showWaiverModal && selectedAthlete && (
        <UpdatedWaiverModal
          isOpen={showWaiverModal}
          onClose={() => setShowWaiverModal(false)}
          onWaiverSigned={handleWaiverSigned}
          athleteId={selectedAthlete.id}
          parentId={parentInfo?.id}
          bookingData={{
            athleteName: selectedAthlete.name,
            parentName: parentInfo ? `${parentInfo.firstName || ''} ${parentInfo.lastName || ''}`.trim() : '',
            emergencyContactNumber: parentInfo?.phone || '',
            relationshipToAthlete: 'Parent/Guardian'
          }}
        />
      )}
    </div>
  );
}