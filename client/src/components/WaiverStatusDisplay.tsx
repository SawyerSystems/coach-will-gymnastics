import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAthleteWaiverStatus } from "@/hooks/use-waiver-status";
import { AlertCircle, CheckCircle, Loader2, RefreshCw } from "lucide-react";

interface WaiverStatusDisplayProps {
  athleteId: string | number;
  athleteName: string;
  onResendWaiver?: () => void;
}

export function WaiverStatusDisplay({ athleteId, athleteName, onResendWaiver }: WaiverStatusDisplayProps) {
  const { data: waiverStatus, isLoading, error, refetch } = useAthleteWaiverStatus(athleteId);

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4" role="status" aria-label="Loading waiver status">
        <h3 className="font-semibold mb-3">Waiver Status</h3>
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Checking waiver status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border rounded-lg p-4" role="alert" aria-label="Waiver status error">
        <h3 className="font-semibold mb-3">Waiver Status</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error Loading Status</span>
          </div>
          <p className="text-sm text-gray-600">
            Unable to check waiver status. Please try again.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            className="mt-2"
            aria-label="Retry loading waiver status"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const hasWaiver = waiverStatus?.hasWaiver || waiverStatus?.waiverSigned;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Waiver Status</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => refetch()}
          aria-label="Refresh waiver status"
          title="Refresh status"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      </div>
      
      {hasWaiver ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
              Waiver Signed
            </Badge>
          </div>
          
          {waiverStatus && (
            <div className="space-y-3">
              {/* Signer Information */}
              <div className="text-sm text-gray-600 space-y-1" role="group" aria-label="Waiver signer details">
                {waiverStatus.waiverSignatureName && (
                  <p>
                    <span className="font-medium">Signed by:</span> {waiverStatus.waiverSignatureName}
                  </p>
                )}
                {waiverStatus.waiverAgreements?.relationship && (
                  <p>
                    <span className="font-medium">Relationship:</span> {waiverStatus.waiverAgreements.relationship}
                  </p>
                )}
                {waiverStatus.waiverSignedAt && (
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {new Date(waiverStatus.waiverSignedAt).toLocaleDateString()} at{' '}
                    {new Date(waiverStatus.waiverSignedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {/* Agreement Details */}
              {waiverStatus.waiverAgreements && (
                <div className="border-t pt-3">
                  <h4 className="font-medium text-sm mb-2">Agreement Details:</h4>
                  <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${waiverStatus.waiverAgreements.understands_risks ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>Understands gymnastics risks</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${waiverStatus.waiverAgreements.agrees_to_policies ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>Agrees to gym policies</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${waiverStatus.waiverAgreements.authorizes_emergency_care ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>Authorizes emergency medical care</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${waiverStatus.waiverAgreements.allows_photo_video ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>Allows photos/videos for promotion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${waiverStatus.waiverAgreements.confirms_authority ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span>Confirms authority to sign</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Details */}
              {(waiverStatus.latestWaiverId || waiverStatus.bookingId) && (
                <div className="text-xs text-gray-500 space-y-1">
                  {waiverStatus.latestWaiverId && (
                    <p>
                      <span className="font-medium">Waiver ID:</span> #{waiverStatus.latestWaiverId}
                    </p>
                  )}
                  {waiverStatus.bookingId && (
                    <p>
                      <span className="font-medium">Booking ID:</span> #{waiverStatus.bookingId}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 hover:bg-orange-200">
              Waiver Required
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="mb-2">
              No waiver found for {athleteName}. A waiver must be signed before the first lesson.
            </p>
            
            {onResendWaiver && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={onResendWaiver}
                aria-label={`Send waiver email for ${athleteName}`}
              >
                Send Waiver Email
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
