import { render } from '@react-email/render';
import React from 'react';
import { Resend } from 'resend';
import { BirthdayEmail } from '../../emails/BirthdayEmail';
import { EmailVerification } from '../../emails/EmailVerification';
import { ManualBookingConfirmation } from '../../emails/ManualBookingConfirmation';
import { NewTipOrBlog } from '../../emails/NewTipOrBlog';
import { ParentAuthorization } from '../../emails/ParentAuthorization';
import { ParentWelcome } from '../../emails/ParentWelcome';
import { PasswordSetupEmail } from '../../emails/PasswordSetupEmail';
import { PasswordResetEmail } from '../../emails/PasswordResetEmail';
import { RescheduleConfirmation } from '../../emails/RescheduleConfirmation';
import { ReservationPaymentLink } from '../../emails/ReservationPaymentLink';
import { SafetyInformationLink } from '../../emails/SafetyInformationLink';
import { SessionCancellation } from '../../emails/SessionCancellation';
import { SessionConfirmation } from '../../emails/SessionConfirmation';
import { SessionFollowUp } from '../../emails/SessionFollowUp';
import { SessionNoShow } from '../../emails/SessionNoShow';
import { SessionReminder } from '../../emails/SessionReminder';
import { WaiverCompletionLink } from '../../emails/WaiverCompletionLink';
import { WaiverReminder } from '../../emails/WaiverReminder';
import { PaymentStatusEnum } from '../../shared/schema';
import { ContactMessage } from '../../emails/ContactMessage';

// Email type mapping
export const emailTemplates = {
  'parent-auth': { 
    subject: '🗝️ Access Code to Begin Your Journey', 
    component: ParentAuthorization 
  },
  'parent-welcome': {
    subject: '🤸‍♀️ Welcome to Coach Will Tumbles!',
    component: ParentWelcome
  },
  'email-verification': {
    subject: '✉️ Verify Your Email — Coach Will Tumbles',
    component: EmailVerification
  },
  'password-setup': {
    subject: '🔐 Set Up Your Password — Coach Will Tumbles',
    component: PasswordSetupEmail
  },
  'password-reset': {
    subject: '🔒 Reset Your Password — Coach Will Tumbles',
    component: PasswordResetEmail
  },
  'session-confirmation': { 
    subject: '✅ Session Confirmed! — Coach Will Tumbles', 
    component: SessionConfirmation 
  },
  'manual-booking': { 
    subject: '⚠️ Confirm Your Session Booking', 
    component: ManualBookingConfirmation 
  },
  'waiver-reminder': { 
    subject: '📜 Complete Your Training Scroll', 
    component: WaiverReminder 
  },
  'session-reminder': { 
    subject: '⏰ Adventure Incoming!', 
    component: SessionReminder 
  },
  'session-cancelled': { 
    subject: '❌ Session Cancelled — Let\'s Reschedule!', 
    component: SessionCancellation 
  },
  'session-no-show': { 
    subject: '🤸 We Missed You — Let\'s Reschedule!', 
    component: SessionNoShow 
  },
  'reschedule-confirmation': { 
    subject: '🔄 New Adventure Scheduled!', 
    component: RescheduleConfirmation 
  },
  'session-follow-up': { 
    subject: '🏆 Training with Coach Will!', 
    component: SessionFollowUp 
  },
  'birthday': { 
    subject: '🎉 Happy Birthday from Coach Will!', 
    component: BirthdayEmail 
  },
  'new-tip': { 
    subject: '✨ New Tip Unlocked on Your Journey!', 
    component: NewTipOrBlog 
  },
  'new-blog': { 
    subject: '📝 New Blog Post from Coach Will!', 
    component: NewTipOrBlog 
  },
  'reservation-payment': { 
    subject: '💳 Complete Your Reservation Payment', 
    component: ReservationPaymentLink 
  },
  'waiver-completion': { 
    subject: '📋 Complete Your Waiver Form', 
    component: WaiverCompletionLink 
  },
  'safety-information': { 
    subject: '🛡️ Important Safety Information', 
    component: SafetyInformationLink 
  },
  'contact-message': {
    subject: '📬 New Contact Form Message',
    component: ContactMessage,
  }
};

export type EmailType = keyof typeof emailTemplates;

interface SendEmailOptions<T extends EmailType> {
  type: T;
  to: string;
  data: React.ComponentProps<typeof emailTemplates[T]['component']>;
  logoUrl?: string; // Optional logo URL to use in email
}

export async function sendEmail<T extends EmailType>({ type, to, data, logoUrl }: SendEmailOptions<T>) {
  // Get Resend API key from environment
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!to) {
    console.error(`[EMAIL][${type}] Aborting send: empty 'to' address`, { dataPreview: Object.keys(data || {}) });
    return;
  }
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not found in environment variables');
    // In development, just log the email that would be sent
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - Email that would be sent:', {
        type,
        to,
        subject: emailTemplates[type].subject,
        data,
        logoUrl
      });
      return;
    }
  // In non-development environments, emit structured log for alerting
  console.error(`[EMAIL][${type}] Cannot send email in non-development environment - missing RESEND_API_KEY`);
    throw new Error('RESEND_API_KEY is required for sending emails');
  }

  const resend = new Resend(resendApiKey);
  const template = emailTemplates[type];
  
  if (!template) {
    throw new Error(`Invalid email type: ${type}`);
  }

  // If no logoUrl was provided, try to get it from site content
  let finalLogoUrl = logoUrl;
  if (!finalLogoUrl) {
    try {
      // Import at function level to avoid circular dependencies
      const { Storage } = require('../storage');
      const storage = new Storage();
      const siteContent = await storage.getSiteContent();
      // Use the text logo if available, otherwise use default
      finalLogoUrl = siteContent?.logo?.text || undefined;
    } catch (error) {
      console.warn('Could not fetch logo URL from site content:', error);
    }
  }

  // Add the logo URL to the component props if the property exists on the component
  const componentData = {
    ...data,
    ...(finalLogoUrl && 'logoUrl' in template.component ? { logoUrl: finalLogoUrl } : {})
  };

  try {
    // Make React available globally for email components
    (global as any).React = React;
    
    // Render the email component to HTML
    const EmailComponent = template.component as React.ComponentType<any>;
    const html = await render(React.createElement(EmailComponent, componentData));
    
    // Send the email
    const result = await resend.emails.send({
      from: 'Coach Will Tumbles <coach@coachwilltumbles.com>',
      to,
      subject: template.subject,
      html,
    });

    console.log(`Email sent successfully: ${type} to ${to}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send email: ${type} to ${to}`, error);
    throw error;
  }
}

// Generic send email function for custom HTML content
export async function sendGenericEmail(to: string, subject: string, htmlContent: string) {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not found in environment variables');
    // In development, just log the email that would be sent
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - Email that would be sent:', {
        to,
        subject,
        htmlContent: htmlContent.substring(0, 200) + '...'
      });
      return;
    }
    throw new Error('RESEND_API_KEY is required for sending emails');
  }

  const resend = new Resend(resendApiKey);
  
  try {
    // Send the email
    const result = await resend.emails.send({
      from: 'Coach Will Tumbles <coach@coachwilltumbles.com>',
      to,
      subject,
      html: htmlContent,
    });

    console.log(`Generic email sent successfully to ${to}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send generic email to ${to}`, error);
    throw error;
  }
}

// Helper function to send parent auth code
export async function sendParentAuthCode(to: string, parentName: string, authCode: string) {
  return sendEmail({
    type: 'parent-auth',
    to,
    data: { parentName, authCode }
  });
}

// Helper function to send session confirmation
export async function sendSessionConfirmation(
  to: string,
  parentName: string,
  athleteName: string,
  sessionDate: string,
  sessionTime: string
) {
  return sendEmail({
    type: 'session-confirmation',
    to,
    data: { parentName, athleteName, sessionDate, sessionTime }
  });
}

// Idempotent wrapper: ensures session confirmation email is sent exactly once per booking
// Relies on new boolean/timestamp columns: session_confirmation_email_sent / session_confirmation_email_sent_at
type EmailStorage = {
  getBookingWithRelations: (id: number) => Promise<any | undefined>;
  updateBooking: (id: number, data: any) => Promise<any | undefined>;
  getBooking: (id: number) => Promise<any | undefined>;
};

export async function sendSessionConfirmationIfNeeded(bookingId: number, storage: EmailStorage & { markSessionConfirmationEmailSent: (bookingId: number, sentAt: string) => Promise<boolean> }) {
  try {
    const booking = await storage.getBookingWithRelations(bookingId);
    if (!booking) {
      console.warn(`[SESSION-CONFIRMATION][IDEMPOTENT] Booking ${bookingId} not found`);
      return false;
    }
    // Only send if payment indicates success AND not already sent
    if (booking.sessionConfirmationEmailSent) {
      console.log(`[SESSION-CONFIRMATION][IDEMPOTENT] Already sent for booking ${bookingId}, skipping.`);
      return false;
    }
    const paid = booking.paymentStatus === PaymentStatusEnum.RESERVATION_PAID || booking.paymentStatus === PaymentStatusEnum.SESSION_PAID;
    if (!paid) {
      console.log(`[SESSION-CONFIRMATION][IDEMPOTENT] Booking ${bookingId} paymentStatus=${booking.paymentStatus} not paid yet, skipping.`);
      return false;
    }
    // Attempt atomic flag set (only if not already true)
    const sentAt = new Date().toISOString();
    const marked = await storage.markSessionConfirmationEmailSent(bookingId, sentAt);
    if (!marked) {
      console.log(`[SESSION-CONFIRMATION][IDEMPOTENT] Another process already sent booking ${bookingId}.`);
      return false;
    }
    const parentEmail = booking.parent?.email || booking.parentEmail;
    const parentName = `${booking.parent?.firstName || booking.parentFirstName || ''} ${booking.parent?.lastName || booking.parentLastName || ''}`.trim() || 'Parent';
    const athleteName = booking.athletes?.[0]?.name || booking.athlete1Name || 'Athlete';
    let sessionDate = 'Unknown Date';
    if (booking.preferredDate) {
      try { sessionDate = new Date(booking.preferredDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }); } catch {}
    }
    const sessionTime = booking.preferredTime || 'TBD';
    if (!parentEmail) {
      console.warn(`[SESSION-CONFIRMATION][IDEMPOTENT] No parent email for booking ${bookingId}; reverting sent flag.`);
      // Revert flag so we can retry later
      await storage.updateBooking(bookingId, {
        // @ts-ignore
        sessionConfirmationEmailSent: false,
        // @ts-ignore
        sessionConfirmationEmailSentAt: null,
      });
      return false;
    }
    console.log(`[SESSION-CONFIRMATION][IDEMPOTENT] Sending confirmation email for booking ${bookingId} to ${parentEmail}`);
    try {
      await sendSessionConfirmation(parentEmail, parentName, athleteName, sessionDate, sessionTime);
      console.log(`[SESSION-CONFIRMATION][IDEMPOTENT] ✅ Sent confirmation email for booking ${bookingId}`);
      return true;
    } catch (sendErr) {
      console.error(`[SESSION-CONFIRMATION][IDEMPOTENT] Failed to send email for booking ${bookingId}, reverting flag`, sendErr);
      // Revert flag for retry on next trigger
      await storage.updateBooking(bookingId, {
        // best-effort revert
        sessionConfirmationEmailSent: false as any,
        sessionConfirmationEmailSentAt: null as any,
      });
      return false;
    }
  } catch (err) {
    console.error(`[SESSION-CONFIRMATION][IDEMPOTENT] Unexpected error booking ${bookingId}`, err);
    return false;
  }
}

// Helper function to send session cancellation email (idempotent, fetches all needed data)
export async function sendSessionCancellationIfNeeded(bookingId: number, storage: EmailStorage, rescheduleLink?: string) {
  console.log(`🚨 [SESSION-CANCELLATION-DEBUG] Function called for booking ${bookingId}`);
  try {
    const booking = await storage.getBookingWithRelations(bookingId);
    if (!booking) {
      console.warn(`[SESSION-CANCELLATION] Booking ${bookingId} not found`);
      return false;
    }

    console.log(`🔍 [SESSION-CANCELLATION-DEBUG] Booking found:`, {
      id: booking.id,
      preferredDate: booking.preferredDate,
      preferredTime: booking.preferredTime,
      lessonType: booking.lessonType,
      athletes: booking.athletes
    });

    // Get parent info (from relations or fallback to booking fields)
    const parentEmail = booking.parent?.email || booking.parentEmail;
    const parentName = `${booking.parent?.firstName || booking.parentFirstName || ''} ${booking.parent?.lastName || booking.parentLastName || ''}`.trim() || 'Parent';
    
    if (!parentEmail) {
      console.warn(`[SESSION-CANCELLATION] No parent email found for booking ${bookingId}`);
      return false;
    }

    // Use provided reschedule link or build default one
    const finalRescheduleLink = rescheduleLink || '/booking';
    
    // Extract session information
    const sessionData = {
      sessionDate: booking.preferredDate,
      sessionTime: booking.preferredTime,
      athleteNames: booking.athletes?.map((athlete: any) => athlete.firstName || athlete.name) || [],
      lessonType: booking.lessonType?.name
    };
    
    console.log(`📧 [SESSION-CANCELLATION-DEBUG] Session data being sent:`, JSON.stringify(sessionData, null, 2));
    console.log(`[SESSION-CANCELLATION] Sending cancellation email for booking ${bookingId} to ${parentEmail}`);
    try {
      await sendSessionCancellation(parentEmail, parentName, finalRescheduleLink, sessionData);
      console.log(`[SESSION-CANCELLATION] ✅ Sent cancellation email for booking ${bookingId}`);
      return true;
    } catch (sendErr) {
      console.error(`[SESSION-CANCELLATION] Failed to send email for booking ${bookingId}`, sendErr);
      return false;
    }
  } catch (err) {
    console.error(`[SESSION-CANCELLATION] Unexpected error booking ${bookingId}`, err);
    return false;
  }
}

// Helper function to send manual booking confirmation
export async function sendManualBookingConfirmation(
  to: string,
  parentName: string,
  confirmLink: string
) {
  return sendEmail({
    type: 'manual-booking',
    to,
    data: { parentName, confirmLink }
  });
}

// Helper function to send waiver reminder
export async function sendWaiverReminder(
  to: string,
  parentName: string,
  waiverLink: string
) {
  return sendEmail({
    type: 'waiver-reminder',
    to,
    data: { parentName, waiverLink }
  });
}

// Helper function to send session reminder
export async function sendSessionReminder(
  to: string,
  athleteName: string,
  sessionDate: string,
  sessionTime: string
) {
  return sendEmail({
    type: 'session-reminder',
    to,
    data: { athleteName, sessionDate, sessionTime }
  });
}

// Helper function to send session cancellation
export async function sendSessionCancellation(
  to: string,
  parentName: string,
  rescheduleLink: string,
  sessionData?: {
    sessionDate?: string;
    sessionTime?: string;
    athleteNames?: string[];
    lessonType?: string;
  }
) {
  return sendEmail({
    type: 'session-cancelled',
    to,
    data: { 
      parentName, 
      rescheduleLink,
      ...sessionData
    }
  });
}

// Helper function to send session no-show
export async function sendSessionNoShow(
  to: string,
  parentName: string,
  rescheduleLink: string,
  sessionData?: {
    sessionDate?: string;
    sessionTime?: string;
    athleteNames?: string[];
    lessonType?: string;
  }
) {
  return sendEmail({
    type: 'session-no-show',
    to,
    data: { 
      parentName, 
      rescheduleLink,
      ...sessionData
    }
  });
}

// Helper function to send reschedule confirmation
export async function sendRescheduleConfirmation(
  to: string,
  newSessionDate: string,
  newSessionTime: string,
  athleteNames?: string[]
) {
  return sendEmail({
    type: 'reschedule-confirmation',
    to,
    data: { newSessionDate, newSessionTime, athleteNames }
  });
}

// Helper function to send session follow-up
export async function sendSessionFollowUp(
  to: string,
  athleteName: string,
  bookingLink: string
) {
  return sendEmail({
    type: 'session-follow-up',
    to,
    data: { athleteName, bookingLink }
  });
}

// Helper function to send birthday email
export async function sendBirthdayEmail(
  to: string,
  athleteName: string
) {
  return sendEmail({
    type: 'birthday',
    to,
    data: { athleteName }
  });
}

// Helper function to send new tip/blog notification
export async function sendNewTipOrBlogNotification(
  to: string,
  contentTitle: string,
  contentLink: string,
  type: 'tip' | 'blog' = 'tip'
) {
  const emailType = type === 'blog' ? 'new-blog' : 'new-tip';
  return sendEmail({
    type: emailType,
    to,
    data: { blogTitle: contentTitle, blogLink: contentLink }
  });
}

// Helper function to send reservation payment link
export async function sendReservationPaymentLink(
  to: string,
  parentName: string,
  athleteName: string,
  lessonType: string,
  lessonDate: string,
  lessonTime: string,
  amount: string,
  paymentLink: string
) {
  return sendEmail({
    type: 'reservation-payment',
    to,
    data: { 
      parentName, 
      athleteName, 
      lessonType, 
      lessonDate, 
      lessonTime, 
      amount, 
      paymentLink 
    }
  });
}

// Helper function to send waiver completion link
export async function sendWaiverCompletionLink(
  to: string,
  parentName: string,
  athleteName: string,
  loginLink: string
) {
  return sendEmail({
    type: 'waiver-completion',
    to,
    data: { parentName, athleteName, loginLink }
  });
}

// Helper function to send safety information link
export async function sendSafetyInformationLink(
  to: string,
  parentName: string,
  athleteName: string,
  loginLink: string
) {
  return sendEmail({
    type: 'safety-information',
    to,
    data: { parentName, athleteName, loginLink }
  });
}

// Helper function to send safety information reminder
export async function sendSafetyInformationReminder(
  to: string,
  parentName: string,
  athleteName: string,
  loginLink: string
) {
  return sendEmail({
    type: 'safety-information',
    to,
    data: { parentName, athleteName, loginLink }
  });
}

// Helper function to send signed waiver confirmation
export async function sendSignedWaiverConfirmation(
  to: string,
  parentName: string,
  athleteName: string,
  pdfBuffer?: Buffer
) {
  // Get Resend API key from environment
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not found in environment variables');
    // In development, just log the email that would be sent
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - Signed waiver confirmation email that would be sent:', {
        to,
        parentName,
        athleteName,
        hasPdfAttachment: !!pdfBuffer
      });
      return;
    }
    throw new Error('RESEND_API_KEY is required for sending emails');
  }

  const resend = new Resend(resendApiKey);
  
  try {
    // Import the component here to avoid circular imports
    const { SignedWaiverConfirmation } = await import('../../emails/SignedWaiverConfirmation');
    const { render } = await import('@react-email/render');
    
    // Render the email component to HTML
    const html = await render(React.createElement(SignedWaiverConfirmation, { 
      parentName, 
      athleteName 
    }));
    
    // Prepare email data
    const emailData: any = {
      from: 'Coach Will Tumbles <coach@coachwilltumbles.com>',
      to,
      subject: `CoachWillTumbles - Signed Waiver for ${athleteName}`,
      html,
    };

    // Attach PDF if provided
    if (pdfBuffer) {
      emailData.attachments = [{
        filename: `${athleteName}_waiver.pdf`,
        content: pdfBuffer,
      }];
    }
    
    // Send the email
    const result = await resend.emails.send(emailData);

    console.log(`Signed waiver confirmation email sent successfully to ${to}`, result);
    return result;
  } catch (error) {
    console.error(`Failed to send signed waiver confirmation email to ${to}`, error);
    throw error;
  }
}

// Helper function to send welcome email to new parents
export async function sendParentWelcomeEmail(
  to: string,
  parentName: string,
  loginLink: string
) {
  return sendEmail({
    type: 'parent-welcome',
    to,
    data: {
      parentName,
      loginLink,
    },
  });
}

// Helper function to send email verification link
export async function sendEmailVerificationLink(
  to: string,
  firstName: string,
  verificationToken: string
) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  
  return sendEmail({
    type: 'email-verification',
    to,
    data: {
      firstName,
      verificationUrl,
    },
  });
}

// Helper function to send password setup email to new parents
export async function sendPasswordSetupEmail(
  to: string,
  firstName: string,
  resetToken: string,
) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/parent/set-password?token=${resetToken}`;
  
  return sendEmail({
    type: 'password-setup',
    to,
    data: {
      firstName,
      resetToken,
      resetUrl,
    },
  });
}

// Helper function to send password reset email to existing parents
export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetToken: string,
) {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/parent/set-password?token=${resetToken}`;
  
  return sendEmail({
    type: 'password-reset',
    to,
    data: {
      firstName,
      resetToken,
      resetUrl,
    },
  });
}

// Delayed Email System for Attendance Status Changes
interface DelayedStatusEmail {
  bookingId: number;
  originalStatus: string;
  targetStatus: string;
  timestamp: number;
  timeoutId: NodeJS.Timeout;
}

// In-memory store for delayed emails (in production, you'd use Redis or similar)
const delayedStatusEmails = new Map<number, DelayedStatusEmail>();

export async function scheduleStatusChangeEmail(
  bookingId: number,
  originalStatus: string,
  newStatus: string,
  storage: EmailStorage,
  rescheduleLink?: string
) {
  console.log(`[STATUS-EMAIL-DELAY] Scheduling email for booking ${bookingId}: ${originalStatus} -> ${newStatus}`);
  
  // Clear any existing delayed email for this booking
  const existing = delayedStatusEmails.get(bookingId);
  if (existing) {
    console.log(`[STATUS-EMAIL-DELAY] Clearing existing timer for booking ${bookingId}`);
    clearTimeout(existing.timeoutId);
    delayedStatusEmails.delete(bookingId);
  }

  // Only schedule emails for status changes that require notification
  const emailableStatuses = ['completed', 'cancelled', 'no-show'];
  if (!emailableStatuses.includes(newStatus)) {
    console.log(`[STATUS-EMAIL-DELAY] Status ${newStatus} doesn't require email notification`);
    return;
  }

  // Schedule the email to be sent after 30 seconds
  const timeoutId = setTimeout(async () => {
    try {
      console.log(`[STATUS-EMAIL-DELAY] 30 seconds elapsed, checking final status for booking ${bookingId}`);
      
      // Get current booking status
      const booking = await storage.getBookingWithRelations(bookingId);
      if (!booking) {
        console.warn(`[STATUS-EMAIL-DELAY] Booking ${bookingId} not found`);
        delayedStatusEmails.delete(bookingId);
        return;
      }

      const currentStatus = booking.attendanceStatus;
      console.log(`[STATUS-EMAIL-DELAY] Final status for booking ${bookingId}: ${currentStatus}`);

      // Send email based on final status
      if (currentStatus === 'completed') {
        await sendCompletedSessionEmail(bookingId, storage);
      } else if (currentStatus === 'cancelled') {
        await sendSessionCancellationIfNeeded(bookingId, storage, rescheduleLink);
      } else if (currentStatus === 'no-show') {
        await sendNoShowSessionEmail(bookingId, storage, rescheduleLink);
      }

      // Clean up
      delayedStatusEmails.delete(bookingId);
      
    } catch (error) {
      console.error(`[STATUS-EMAIL-DELAY] Error sending delayed email for booking ${bookingId}:`, error);
      delayedStatusEmails.delete(bookingId);
    }
  }, 30000); // 30 seconds

  // Store the delayed email info
  delayedStatusEmails.set(bookingId, {
    bookingId,
    originalStatus,
    targetStatus: newStatus,
    timestamp: Date.now(),
    timeoutId
  });

  console.log(`[STATUS-EMAIL-DELAY] Scheduled ${newStatus} email for booking ${bookingId} in 30 seconds`);
}

async function sendCompletedSessionEmail(bookingId: number, storage: EmailStorage) {
  console.log(`[STATUS-EMAIL] Sending completed session follow-up for booking ${bookingId}`);
  
  try {
    // Get booking with full relations to access parent and athlete data
    const booking = await storage.getBookingWithRelations(bookingId);
    if (!booking) {
      console.warn(`[STATUS-EMAIL] Booking ${bookingId} not found for completed email`);
      return;
    }

    // Get parent info
    const parentEmail = booking.parent?.email || booking.parentEmail;
    const parentName = `${booking.parent?.firstName || booking.parentFirstName || ''} ${booking.parent?.lastName || booking.parentLastName || ''}`.trim() || 'Parent';
    
    if (!parentEmail) {
      console.warn(`[STATUS-EMAIL] No parent email found for booking ${bookingId}`);
      return;
    }

    // Get athlete name
    let athleteName = 'Athlete';
    if (booking.athletes && booking.athletes.length > 0) {
      athleteName = booking.athletes[0].firstName || booking.athletes[0].name || 'Athlete';
    } else if (booking.athlete1Name) {
      athleteName = booking.athlete1Name;
    }
    
    // Create booking link for next session
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const bookingLink = `${baseUrl}/parent/dashboard`;
    
    console.log(`[STATUS-EMAIL] Sending completed session follow-up for booking ${bookingId} to ${parentEmail}`);
    
    await sendSessionFollowUp(parentEmail, athleteName, bookingLink);
    console.log(`[STATUS-EMAIL] ✅ Sent completed session follow-up for booking ${bookingId}`);
    
  } catch (error) {
    console.error(`[STATUS-EMAIL] Error sending completed session follow-up for booking ${bookingId}:`, error);
  }
}

async function sendNoShowSessionEmail(bookingId: number, storage: EmailStorage, rescheduleLink?: string) {
  try {
    const booking = await storage.getBookingWithRelations(bookingId);
    if (!booking) {
      console.warn(`[STATUS-EMAIL] Booking ${bookingId} not found for no-show email`);
      return;
    }

    // Get parent info
    const parentEmail = booking.parent?.email || booking.parentEmail;
    const parentName = `${booking.parent?.firstName || booking.parentFirstName || ''} ${booking.parent?.lastName || booking.parentLastName || ''}`.trim() || 'Parent';
    
    if (!parentEmail) {
      console.warn(`[STATUS-EMAIL] No parent email found for booking ${bookingId}`);
      return;
    }

    // Use provided reschedule link or build default one
    const finalRescheduleLink = rescheduleLink || '/booking';
    
    // Extract session information
    const sessionData = {
      sessionDate: booking.preferredDate,
      sessionTime: booking.preferredTime,
      athleteNames: booking.athletes?.map((athlete: any) => athlete.firstName || athlete.name) || [],
      lessonType: booking.lessonType?.name
    };
    
    console.log(`[STATUS-EMAIL] Sending no-show email for booking ${bookingId} to ${parentEmail}`);
    
    await sendSessionNoShow(parentEmail, parentName, finalRescheduleLink, sessionData);
    console.log(`[STATUS-EMAIL] ✅ Sent no-show email for booking ${bookingId}`);
    
  } catch (error) {
    console.error(`[STATUS-EMAIL] Error sending no-show email for booking ${bookingId}:`, error);
  }
}

