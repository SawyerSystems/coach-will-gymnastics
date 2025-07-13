import React from 'react';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { ParentAuthorization } from '../../emails/ParentAuthorization';
import { SessionConfirmation } from '../../emails/SessionConfirmation';
import { ManualBookingConfirmation } from '../../emails/ManualBookingConfirmation';
import { WaiverReminder } from '../../emails/WaiverReminder';
import { SessionReminder } from '../../emails/SessionReminder';
import { SessionCancellation } from '../../emails/SessionCancellation';
import { RescheduleConfirmation } from '../../emails/RescheduleConfirmation';
import { SessionFollowUp } from '../../emails/SessionFollowUp';
import { BirthdayEmail } from '../../emails/BirthdayEmail';
import { NewTipOrBlog } from '../../emails/NewTipOrBlog';
import { ReservationPaymentLink } from '../../emails/ReservationPaymentLink';
import { WaiverCompletionLink } from '../../emails/WaiverCompletionLink';
import { SafetyInformationLink } from '../../emails/SafetyInformationLink';

// Email type mapping
export const emailTemplates = {
  'parent-auth': { 
    subject: '🗝️ Access Code to Begin Your Journey', 
    component: ParentAuthorization 
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
  }
};

export type EmailType = keyof typeof emailTemplates;

interface SendEmailOptions<T extends EmailType> {
  type: T;
  to: string;
  data: React.ComponentProps<typeof emailTemplates[T]['component']>;
}

export async function sendEmail<T extends EmailType>({ type, to, data }: SendEmailOptions<T>) {
  // Get Resend API key from environment
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    console.error('RESEND_API_KEY not found in environment variables');
    // In development, just log the email that would be sent
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode - Email that would be sent:', {
        type,
        to,
        subject: emailTemplates[type].subject,
        data
      });
      return;
    }
    throw new Error('RESEND_API_KEY is required for sending emails');
  }

  const resend = new Resend(resendApiKey);
  const template = emailTemplates[type];
  
  if (!template) {
    throw new Error(`Invalid email type: ${type}`);
  }

  try {
    // Render the email component to HTML
    const EmailComponent = template.component as React.ComponentType<any>;
    const html = await render(React.createElement(EmailComponent, data));
    
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
  rescheduleLink: string
) {
  return sendEmail({
    type: 'session-cancelled',
    to,
    data: { parentName, rescheduleLink }
  });
}

// Helper function to send reschedule confirmation
export async function sendRescheduleConfirmation(
  to: string,
  newSessionDate: string,
  newSessionTime: string
) {
  return sendEmail({
    type: 'reschedule-confirmation',
    to,
    data: { newSessionDate, newSessionTime }
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
  blogTitle: string,
  blogLink: string
) {
  return sendEmail({
    type: 'new-tip',
    to,
    data: { blogTitle, blogLink }
  });
}

