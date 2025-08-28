/**
 * Type declarations for email-enhanced.js
 */

/**
 * Data structure for admin booking notification emails
 */
export interface AdminBookingEmailData {
  bookingId: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  athleteNames: string[];
  sessionDate: string;
  sessionTime: string;
  lessonType: string | { 
    id: number;
    name: string;
    duration: number;
    price: number;
    description: string;
    key: string;
  };
  paymentStatus: string;
  totalAmount: string;
  specialRequests?: string;
  adminPanelLink: string;
}

/**
 * Response type from Resend API
 */
export interface ResendEmailResponse {
  id?: string;
  error?: any;
  data?: {
    id: string;
  };
}

/**
 * Enhanced function for sending admin booking notifications with fallback mechanism
 * @param to Email address to send the notification to
 * @param data Booking data for the email content
 * @returns Promise resolving to the email sending response
 */
export function sendAdminNewBookingWithFallback(
  to: string,
  data: AdminBookingEmailData
): Promise<ResendEmailResponse>;
