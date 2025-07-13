import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, AlertCircle, FileText, Calendar, User, Phone, Mail, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UpdatedWaiverModal } from '@/components/updated-waiver-modal';

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

  const [showWaiverModal, setShowWaiverModal] = useState(false);

  const handleCreateWaiver = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setShowWaiverModal(true);
  };

  const handleWaiverSigned = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/parent/waivers'] });
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
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-orange-600" />
        <h2 className="text-xl font-semibold">Waiver Management</h2>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{athletesWithWaivers.length}</p>
                <p className="text-sm text-gray-600">Signed Waivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">{athletesNeedingWaivers.length}</p>
                <p className="text-sm text-gray-600">Pending Waivers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{waiverStatus.length}</p>
                <p className="text-sm text-gray-600">Total Athletes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Waivers */}
      {athletesNeedingWaivers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-semibold">Athletes Needing Waivers</h3>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              The following athletes need signed waivers before participating in coaching sessions. Please complete the waiver process for each athlete.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            {athletesNeedingWaivers.map((status: AthleteWaiverStatus) => (
              <Card key={status.athlete.id} className="border-orange-200 bg-orange-50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {status.athlete.name || `${status.athlete.first_name} ${status.athlete.last_name}`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Age: {getAthleteAge(status.athlete.date_of_birth)}
                        </span>
                        <span className="capitalize">
                          Experience: {status.athlete.experience}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Waiver Required
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
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
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Sign Waiver
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Signed Waivers */}
      {athletesWithWaivers.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold">Signed Waivers</h3>
          </div>

          <div className="grid gap-4">
            {athletesWithWaivers.map((status: AthleteWaiverStatus) => (
              <Card key={status.athlete.id} className="border-green-200 bg-green-50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {status.athlete.name || `${status.athlete.first_name} ${status.athlete.last_name}`}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Age: {getAthleteAge(status.athlete.date_of_birth)}
                        </span>
                        <span className="capitalize">
                          Experience: {status.athlete.experience}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Waiver Signed
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Signed by:</span>
                      <span className="text-sm font-medium">{status.waiver?.signer_name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Date signed:</span>
                      <span className="text-sm font-medium">
                        {status.waiver?.signed_at ? formatDate(status.waiver.signed_at) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Relationship:</span>
                      <span className="text-sm font-medium">{status.waiver?.relationship_to_athlete}</span>
                    </div>
                    {status.waiver?.emergency_contact_number && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Emergency Contact:</span>
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
          bookingData={{
            athleteName: selectedAthlete.name,
            parentName: '', // Will be filled by parent auth
            emergencyContactNumber: '',
            relationshipToAthlete: 'Parent/Guardian'
          }}
        />
      )}
    </div>
  );
}