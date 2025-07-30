import { useQuery } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Mail, Phone, Shield, User } from "lucide-react";

interface ParentInfo {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  totalChildren: number;
  totalBookings: number;
  activeBookings: number;
  lastLoginAt?: string;
}

interface ParentInfoDisplayProps {
  athleteId: number;
  parentInfo?: any; // Fallback parent info from props
}

export function ParentInfoDisplay({ athleteId, parentInfo: fallbackParentInfo }: ParentInfoDisplayProps) {
  const { data: parentDetails, isLoading, error } = useQuery<ParentInfo>({
    queryKey: [`/api/athletes/${athleteId}/parent-details`],
    queryFn: async () => {
      const response = await fetch(`/api/athletes/${athleteId}/parent-details`);
      if (!response.ok) {
        throw new Error('Failed to fetch parent details');
      }
      return response.json();
    },
    retry: 1,
  });

  const parentData = parentDetails || fallbackParentInfo;

  if (isLoading) {
    return (
      <div className="border rounded-lg p-4" role="region" aria-labelledby="parent-info-heading">
        <h3 id="parent-info-heading" className="font-semibold mb-3">Parent Information</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-gray-600">Loading parent information...</span>
        </div>
      </div>
    );
  }

  if (error || !parentData) {
    return (
      <div className="border rounded-lg p-4 bg-red-50" role="region" aria-labelledby="parent-info-heading">
        <h3 id="parent-info-heading" className="font-semibold mb-3">Parent Information</h3>
        <div className="flex items-center text-red-600">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span>Unable to load parent information</span>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4" role="region" aria-labelledby="parent-info-heading">
      <div className="flex items-center justify-between mb-3">
        <h3 id="parent-info-heading" className="font-semibold">Parent Information</h3>
        <div className="flex items-center gap-2">
          {parentData.isVerified ? (
            <div className="flex items-center text-green-600 text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Verified
            </div>
          ) : (
            <div className="flex items-center text-orange-600 text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Unverified
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        {/* Basic Contact Info */}
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">Name:</span>
            <span className="ml-1">
              {parentData.firstName} {parentData.lastName}
            </span>
          </div>
          
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">Email:</span>
            {parentData.email ? (
              <a href={`mailto:${parentData.email}`} className="text-blue-600 hover:underline ml-1">
                {parentData.email}
              </a>
            ) : (
              <span className="ml-1 text-gray-500">Not provided</span>
            )}
          </div>

          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500" />
            <span className="font-medium">Phone:</span>
            {parentData.phone ? (
              <a href={`tel:${parentData.phone}`} className="text-blue-600 hover:underline ml-1">
                {parentData.phone}
              </a>
            ) : (
              <span className="ml-1 text-gray-500">Not provided</span>
            )}
          </div>
        </div>

        {/* Emergency Contact & Stats */}
        <div className="space-y-2">
          <div className="flex items-start">
            <Shield className="h-4 w-4 mr-2 text-gray-500 mt-0.5" />
            <div>
              <span className="font-medium">Emergency Contact:</span>
              <div className="ml-1">
                {parentData.emergencyContactName ? (
                  <div>
                    <div>{parentData.emergencyContactName}</div>
                    {parentData.emergencyContactPhone && (
                      <a href={`tel:${parentData.emergencyContactPhone}`} className="text-blue-600 hover:underline text-xs">
                        {parentData.emergencyContactPhone}
                      </a>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">Not provided</span>
                )}
              </div>
            </div>
          </div>

          {/* Account Statistics (if available from enhanced endpoint) */}
          {parentDetails && (
            <div className="bg-gray-50 rounded p-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="font-medium">Children:</span> {parentDetails.totalChildren}
                </div>
                <div>
                  <span className="font-medium">Total Bookings:</span> {parentDetails.totalBookings}
                </div>
                <div>
                  <span className="font-medium">Active:</span> {parentDetails.activeBookings}
                </div>
                <div>
                  <span className="font-medium">Member Since:</span>{' '}
                  {new Date(parentDetails.createdAt).toLocaleDateString()}
                </div>
              </div>
              {parentDetails.lastLoginAt && (
                <div className="mt-1 pt-1 border-t border-gray-200">
                  <span className="font-medium">Last Login:</span>{' '}
                  {new Date(parentDetails.lastLoginAt).toLocaleDateString()} at {new Date(parentDetails.lastLoginAt).toLocaleTimeString()}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
