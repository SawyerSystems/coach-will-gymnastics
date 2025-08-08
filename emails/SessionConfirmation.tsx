import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function SessionConfirmation({
  parentName,
  athleteName,
  sessionDate,
  sessionTime,
  manageLink,
  logoUrl,
}: {
  parentName: string;
  athleteName: string;
  sessionDate: string;
  sessionTime: string;
  manageLink?: string;
  logoUrl?: string;
}) {
  return (
    <EmailLayout logoUrl={logoUrl} title="✅ Session Confirmed!">
      <Text style={{ color: theme.colors.text }}>
        Hey {parentName}, big news — {athleteName}'s session is officially booked for <strong>{sessionDate}</strong> at <strong>{sessionTime}</strong>.
      </Text>
      <Text style={{ color: theme.colors.text }}>
        Here’s how to get the most out of their training:
      </Text>
      <ul style={{ color: theme.colors.text, paddingLeft: '18px', marginTop: 0 }}>
        <li>Arrive 5–10 minutes early to warm up</li>
        <li>Bring water and comfy athletic wear</li>
        <li>Quick stretch at home = bonus confidence</li>
      </ul>
      {manageLink ? (
        <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
          <CTAButton href={manageLink} color="accent">View / Manage Your Booking</CTAButton>
        </div>
      ) : null}
      <Text style={{ color: theme.colors.muted }}>
        We can’t wait to see {athleteName} shine! If plans change, you can reschedule anytime.
      </Text>
    </EmailLayout>
  );
}