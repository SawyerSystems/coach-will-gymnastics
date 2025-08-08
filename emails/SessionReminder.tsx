import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function SessionReminder({ athleteName, sessionDate, sessionTime, manageLink }: { athleteName: string; sessionDate: string; sessionTime: string; manageLink?: string }) {
  return (
    <EmailLayout title="⏰ Session Reminder">
      <Text style={{ color: theme.colors.text }}>
        Quick heads‑up — {athleteName} has a session on <strong>{sessionDate}</strong> at <strong>{sessionTime}</strong>.
      </Text>
      <ul style={{ color: theme.colors.text, paddingLeft: '18px', marginTop: 0 }}>
        <li>Pack water and athletic wear</li>
        <li>Arrive a few minutes early</li>
        <li>A fast stretch = great start</li>
      </ul>
      {manageLink ? (
        <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
          <CTAButton href={manageLink} color="primary">View Your Booking</CTAButton>
        </div>
      ) : null}
      <Text style={{ color: theme.colors.muted }}>
        We’re excited for a great session — see you soon!
      </Text>
    </EmailLayout>
  );
}