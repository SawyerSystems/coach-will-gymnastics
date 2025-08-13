import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';
import { EmailFooter } from './components/EmailFooter';
export const SUBJECT = 'Your session has been canceled';
export const PREHEADER = 'No worries — you can reschedule in seconds with the link inside.';

export function SessionCancellation({ parentName, rescheduleLink }: { parentName: string; rescheduleLink: string }) {
  return (
  <EmailLayout title="❌ Session Cancelled" preheader={PREHEADER}>

      <Text style={{ color: theme.colors.text }}>Hi {parentName},</Text>
      <Text style={{ color: theme.colors.text }}>
        This session has been cancelled — but no worries, I’ve got plenty of times open next week and beyond.
      </Text>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <a
          href={rescheduleLink}
          style={{
            display: 'inline-block',
            backgroundColor: theme.colors.danger,
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '16px',
          }}
        >
          Reschedule Now
        </a>
      </div>
      <Text style={{ color: theme.colors.muted }}>
        Need help finding a time? Just reply and I’ll help you pick a great slot.
      </Text>

      <EmailFooter />
  </EmailLayout>
  );
}