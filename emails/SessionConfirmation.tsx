import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailFooter } from './components/EmailFooter';
import { theme } from './components/theme';
import { formatPossessivePronoun, type Gender } from './utils/pronouns';

export const SUBJECT = 'Session confirmed! See you soon';
export const PREHEADER = 'Your lesson details and what to expect.';

export default function SessionConfirmation({
  parentName,
  athleteName,
  athleteGender,
  sessionDate,
  sessionTime,
  manageLink,
  logoUrl,
  contactEmail,
  contactPhone,
}: {
  parentName: string;
  athleteName: string;
  athleteGender?: Gender;
  sessionDate: string;
  sessionTime: string;
  manageLink?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
}) {
  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours, 10);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    } catch {
      return timeStr || '';
    }
  };

  return (
    <EmailLayout logoUrl={logoUrl} title="✅ Session Confirmed!" preheader={PREHEADER}>

      <Text style={{ color: theme.colors.text }}>
        Hi {parentName}, big news — {athleteName}'s session is officially booked for <strong>{sessionDate}</strong> at <strong>{formatTime(sessionTime)}</strong>.
      </Text>
      <Text style={{ color: theme.colors.text }}>
        Here's how to get the most out of {formatPossessivePronoun(athleteGender)} training:
      </Text>
      <ul style={{ color: theme.colors.text, paddingLeft: '18px', marginTop: 0 }}>
        <li>Arrive 5–10 minutes early to warm up</li>
        <li>Bring water and comfy athletic wear</li>
        <li>Quick stretch at home = bonus confidence</li>
      </ul>
      {manageLink ? (
        <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
          <a
            href={manageLink}
            style={{
              display: 'inline-block',
              backgroundColor: theme.colors.primary,
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: '5px',
              textDecoration: 'none',
              fontSize: '16px',
            }}
          >
            View / Manage Your Booking
          </a>
        </div>
      ) : null}

      <Text style={{ color: theme.colors.muted }}>
        I can't wait to see {athleteName} shine! If plans change, you can reschedule anytime.
      </Text>

      <EmailFooter contactEmail={contactEmail} contactPhone={contactPhone} />
    </EmailLayout>
  );
}
