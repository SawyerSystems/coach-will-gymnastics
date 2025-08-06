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
import { RescheduleConfirmation } from '../../emails/RescheduleConfirmation';
import { ReservationPaymentLink } from '../../emails/ReservationPaymentLink';
import { SafetyInformationLink } from '../../emails/SafetyInformationLink';
import { SessionCancellation } from '../../emails/SessionCancellation';
import { SessionConfirmation } from '../../emails/SessionConfirmation';
import { SessionFollowUp } from '../../emails/SessionFollowUp';
import { SessionReminder } from '../../emails/SessionReminder';
import { WaiverCompletionLink } from '../../emails/WaiverCompletionLink';
import { WaiverReminder } from '../../emails/WaiverReminder';

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

