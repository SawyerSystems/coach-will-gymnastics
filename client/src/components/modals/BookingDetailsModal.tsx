import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { AdminModal, AdminModalSection, AdminModalDetailRow, AdminModalGrid } from "../admin-ui/AdminModal";
import { AdminButton } from "../admin-ui/AdminButton";
import { 
  Calendar, 
  User, 
  Users, 
  Mail, 
  Phone, 
  AlertCircle, 
  Medal, 
  Target, 
  Shield, 
  FileText,
  ExternalLink,
  CreditCard,
  Edit
} from "lucide-react";
import type { Booking } from "@shared/schema";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onOpenStripe?: (booking: Booking) => void;
  onEdit?: (booking: Booking) => void;
}

// Helper function to calculate age
function calculateAge(dateOfBirth: string): string {
  if (!dateOfBirth) return "N/A";
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return (age - 1).toString();
  }
  return age.toString();
}

// Helper functions for status badges
function getPaymentStatusBadgeProps(status: string) {
  switch (status) {
    case 'session-paid':
      return { 
        className: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Fully Paid',
        icon: <CreditCard className="w-3 h-3" />
      };
    case 'reservation-paid':
      return { 
        className: 'bg-blue-100 text-blue-800 border-blue-200', 
        text: 'Reservation Paid',
        icon: <CreditCard className="w-3 h-3" />
      };
    case 'unpaid':
      return { 
        className: 'bg-red-100 text-red-800 border-red-200', 
        text: 'Unpaid',
        icon: <AlertCircle className="w-3 h-3" />
      };
    default:
      return { 
        className: 'bg-gray-100 text-gray-800 border-gray-200', 
        text: status,
        icon: <CreditCard className="w-3 h-3" />
      };
  }
}

function getAttendanceStatusBadgeProps(status: string) {
  switch (status) {
    case 'completed':
      return { 
        className: 'bg-green-100 text-green-800 border-green-200', 
        text: 'Completed',
        icon: <Medal className="w-3 h-3" />
      };
    case 'confirmed':
      return { 
        className: 'bg-blue-100 text-blue-800 border-blue-200', 
        text: 'Confirmed',
        icon: <Calendar className="w-3 h-3" />
      };
    case 'no-show':
      return { 
        className: 'bg-red-100 text-red-800 border-red-200', 
        text: 'No Show',
        icon: <AlertCircle className="w-3 h-3" />
      };
    case 'cancelled':
      return { 
        className: 'bg-gray-100 text-gray-800 border-gray-200', 
        text: 'Cancelled',
        icon: <AlertCircle className="w-3 h-3" />
      };
    default:
      return { 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        text: 'Pending',
        icon: <Calendar className="w-3 h-3" />
      };
  }
}

export function BookingDetailsModal({ 
  isOpen, 
  onClose, 
  booking, 
  onOpenStripe,
  onEdit 
}: BookingDetailsModalProps) {
  if (!booking) return null;

  // Calculate lesson price
  const getLessonPrice = (booking: Booking): number => {
    let price = 0;
    if (booking.lessonType && typeof booking.lessonType === 'object') {
      const ltObj: any = booking.lessonType;
      if (typeof ltObj.price === 'number') price = ltObj.price;
      else if (ltObj.price) price = parseFloat(ltObj.price);
      else if (ltObj.total_price) price = parseFloat(ltObj.total_price);
    }
    if (!price && booking.amount) {
      const amt = parseFloat(booking.amount);
      if (!isNaN(amt)) price = amt;
    }
    return price;
  };

  // Calculate paid amount
  const getPaidAmount = (booking: Booking): number => {
    const total = getLessonPrice(booking);
    const status = booking.paymentStatus as string | undefined;
    let paid = 0;
    
    if (status === 'session-paid') {
      paid = total; // full lesson price paid
    } else if (status === 'reservation-paid') {
      paid = parseFloat(booking.paidAmount || '0');
      if (!Number.isFinite(paid) || paid <= 0) paid = 10.0; // fallback to default reservation fee
    } else {
      paid = parseFloat(booking.paidAmount || '0');
      if (!Number.isFinite(paid)) paid = 0;
    }
    
    return paid;
  };

  const lessonTypeName = (() => {
    const lessonType = booking.lessonType;
    if (typeof lessonType === 'object' && lessonType && 'name' in lessonType) {
      return (lessonType as any).name;
    }
    return lessonType || booking.lessonTypeName || 'Unknown Lesson Type';
  })();

  const paymentBadge = getPaymentStatusBadgeProps(booking.paymentStatus || 'unpaid');
  const attendanceBadge = getAttendanceStatusBadgeProps(booking.attendanceStatus || 'pending');

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <AdminButton variant="secondary" onClick={onClose}>
        Close
      </AdminButton>
      
      {/* Show Edit button if onEdit is provided (from booking manager) */}
      {onEdit && (
        <AdminButton
          variant="primary"
          onClick={() => onEdit(booking)}
          className="flex items-center gap-2"
        >
          <Edit className="w-4 h-4" />
          Edit Booking
        </AdminButton>
      )}
      
      {/* Show Stripe button if onOpenStripe is provided and no onEdit (from payments tab) */}
      {onOpenStripe && !onEdit && (booking.parent?.email || booking.parentEmail) && (
        <AdminButton
          variant="secondary"
          onClick={() => onOpenStripe(booking)}
          className="flex items-center gap-2"
        >
          <ExternalLink className="w-4 h-4" />
          Open in Stripe
        </AdminButton>
      )}
    </div>
  );

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Booking Details ${booking.id ? `#${booking.id}` : ''}`}
      size="3xl"
      showCloseButton={false}
      footer={footer}
    >
      <div className="space-y-6">
        <AdminModalGrid cols={2}>
          {/* Lesson Details */}
          <AdminModalSection
            title="Lesson Details"
            icon={<Calendar className="w-4 h-4" />}
            gradient="blue"
          >
            <div className="space-y-2.5 text-sm">
              <AdminModalDetailRow label="Type" value={lessonTypeName} />
              <AdminModalDetailRow label="Date" value={booking.preferredDate} />
              <AdminModalDetailRow label="Time" value={booking.preferredTime} />
              <AdminModalDetailRow 
                label="Payment Status" 
                value={
                  <Badge className={`${paymentBadge.className} flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium`}>
                    {paymentBadge.icon}
                    {booking.displayPaymentStatus || paymentBadge.text}
                  </Badge>
                } 
              />
              <AdminModalDetailRow 
                label="Attendance Status" 
                value={
                  <Badge className={`${attendanceBadge.className} flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium`}>
                    {attendanceBadge.icon}
                    {attendanceBadge.text}
                  </Badge>
                } 
              />
              <AdminModalDetailRow 
                label="Amount" 
                value={`$${getLessonPrice(booking).toFixed(2)}`}
                className="font-medium"
              />
              <AdminModalDetailRow 
                label="Paid Amount" 
                value={`$${getPaidAmount(booking).toFixed(2)}`}
                className="font-medium"
              />
            </div>
          </AdminModalSection>

          {/* Parent Information */}
          <AdminModalSection
            title="Parent Information"
            icon={<User className="w-4 h-4" />}
            gradient="purple"
          >
            <div className="space-y-2.5 text-sm">
              <AdminModalDetailRow 
                label="Name" 
                value={`${booking.parent?.firstName || booking.parentFirstName} ${booking.parent?.lastName || booking.parentLastName}`}
                icon={<User className="w-3.5 h-3.5 text-purple-500" />}
              />
              <AdminModalDetailRow 
                label="Email" 
                value={booking.parent?.email || booking.parentEmail}
                icon={<Mail className="w-3.5 h-3.5 text-purple-500" />}
              />
              <AdminModalDetailRow 
                label="Phone" 
                value={booking.parent?.phone || booking.parentPhone}
                icon={<Phone className="w-3.5 h-3.5 text-purple-500" />}
              />
              <AdminModalDetailRow 
                label="Emergency Contact" 
                value={booking.parent?.emergencyContactName || booking.emergencyContactName || 'N/A'}
                icon={<AlertCircle className="w-3.5 h-3.5 text-red-500" />}
              />
              <AdminModalDetailRow 
                label="Emergency Phone" 
                value={booking.parent?.emergencyContactPhone || booking.emergencyContactPhone || 'N/A'}
                icon={<Phone className="w-3.5 h-3.5 text-red-500" />}
              />
            </div>
          </AdminModalSection>
        </AdminModalGrid>

        {/* Athletes Section */}
        <AdminModalSection
          title="Athletes"
          icon={<Users className="w-4 h-4" />}
          gradient="green"
        >
          <div className="space-y-3">
            {booking.athletes && booking.athletes.length > 0 ? (
              booking.athletes.map((athlete: any, index: number) => (
                <div key={athlete.id || index} className="p-3 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-green-600" />
                    {athlete.firstName && athlete.lastName 
                      ? `${athlete.firstName} ${athlete.lastName}`
                      : athlete.name || 'Unnamed Athlete'}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1.5 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    Age: {calculateAge(athlete.dateOfBirth || '')} | 
                    <Medal className="w-3 h-3 text-gray-500" />
                    Experience: {athlete.experience}
                  </div>
                  {athlete.allergies && (
                    <div className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-start gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                      <span>Allergies: {athlete.allergies}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (booking as any).athleteNames && (booking as any).athleteNames.length > 0 ? (
              // Fallback to athleteNames from upcoming sessions
              (booking as any).athleteNames.map((athleteName: string, index: number) => (
                <div key={index} className="p-3 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-green-600" />
                    {athleteName}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-500 mt-1.5">
                    Limited athlete information available
                  </div>
                </div>
              ))
            ) : (
              // Fallback to legacy fields
              <>
                {booking.athlete1Name && (
                  <div className="p-3 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-green-600" />
                      {booking.athlete1Name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      Age: {calculateAge(booking.athlete1DateOfBirth || '')} | 
                      <Medal className="w-3 h-3 text-gray-500" />
                      Experience: {booking.athlete1Experience}
                    </div>
                    {booking.athlete1Allergies && (
                      <div className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                        <span>Allergies: {booking.athlete1Allergies}</span>
                      </div>
                    )}
                  </div>
                )}
                {booking.athlete2Name && (
                  <div className="p-3 bg-white rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="font-medium flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-green-600" />
                      {booking.athlete2Name}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 mt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-gray-500" />
                      Age: {booking.athlete2DateOfBirth ? calculateAge(booking.athlete2DateOfBirth) : "N/A"} | 
                      <Medal className="w-3 h-3 text-gray-500" />
                      Experience: {booking.athlete2Experience}
                    </div>
                    {booking.athlete2Allergies && (
                      <div className="text-xs sm:text-sm text-red-600 mt-1.5 flex items-start gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
                        <span>Allergies: {booking.athlete2Allergies}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {(!booking.athletes || booking.athletes.length === 0) && !(booking as any).athleteNames && !booking.athlete1Name && (
              <div className="text-center py-4 text-gray-500">
                <Users className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                No athletes assigned
              </div>
            )}
          </div>
        </AdminModalSection>

        {/* Focus Areas Section */}
        {booking.focusAreas && booking.focusAreas.length > 0 && (
          <AdminModalSection
            title="Focus Areas"
            icon={<Target className="w-4 h-4" />}
            gradient="amber"
          >
            <div className="flex flex-wrap gap-2">
              {booking.focusAreas.map((area: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border border-amber-200 hover:bg-amber-200"
                >
                  {area}
                </Badge>
              ))}
            </div>
          </AdminModalSection>
        )}

        {/* Safety Information Section */}
        <AdminModalSection
          title="Safety Information"
          icon={<Shield className="w-4 h-4" />}
          gradient="red"
        >
          <AdminModalGrid cols={2}>
            <div>
              <h5 className="font-medium text-red-700 text-sm flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5" />
                Drop-off Person
              </h5>
              <div className="space-y-2 text-xs sm:text-sm bg-white p-2 sm:p-3 rounded-lg border border-red-100">
                <AdminModalDetailRow label="Name" value={booking.dropoffPersonName || 'N/A'} />
                <AdminModalDetailRow label="Relationship" value={booking.dropoffPersonRelationship || 'N/A'} />
                <AdminModalDetailRow label="Phone" value={booking.dropoffPersonPhone || 'N/A'} />
              </div>
            </div>
            
            <div>
              <h5 className="font-medium text-red-700 text-sm flex items-center gap-1.5 mb-2">
                <User className="w-3.5 h-3.5" />
                Pick-up Person
              </h5>
              <div className="space-y-2 text-xs sm:text-sm bg-white p-2 sm:p-3 rounded-lg border border-red-100">
                <AdminModalDetailRow label="Name" value={booking.pickupPersonName || 'N/A'} />
                <AdminModalDetailRow label="Relationship" value={booking.pickupPersonRelationship || 'N/A'} />
                <AdminModalDetailRow label="Phone" value={booking.pickupPersonPhone || 'N/A'} />
              </div>
            </div>
          </AdminModalGrid>

          {booking.altPickupPersonName && (
            <div className="mt-4">
              <h5 className="font-medium text-red-700 text-sm flex items-center gap-1.5 mb-2">
                <Users className="w-3.5 h-3.5" />
                Alternative Pick-up Person
              </h5>
              <div className="space-y-2 text-xs sm:text-sm bg-white p-2 sm:p-3 rounded-lg border border-red-100">
                <AdminModalDetailRow label="Name" value={booking.altPickupPersonName} />
                <AdminModalDetailRow label="Relationship" value={booking.altPickupPersonRelationship || 'N/A'} />
                <AdminModalDetailRow label="Phone" value={booking.altPickupPersonPhone || 'N/A'} />
              </div>
            </div>
          )}
        </AdminModalSection>

        {/* Admin Notes Section */}
        {booking.adminNotes && (
          <AdminModalSection
            title="Admin Notes"
            icon={<FileText className="w-4 h-4" />}
            gradient="gray"
          >
            <p className="text-sm bg-white p-3 rounded-lg border border-gray-100 text-gray-700 leading-relaxed">
              {booking.adminNotes}
            </p>
          </AdminModalSection>
        )}
      </div>
    </AdminModal>
  );
}
