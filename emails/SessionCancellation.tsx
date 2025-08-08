import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function SessionCancellation({ parentName, rescheduleLink }: { parentName: string; rescheduleLink: string }) {
  return (
    <EmailLayout title="❌ Session Cancelled">
      <Text style={{ color: theme.colors.text }}>Hi {parentName},</Text>
      <Text style={{ color: theme.colors.text }}>
        This session has been cancelled — but no worries, we’ve got plenty of times open next week and beyond.
      </Text>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <CTAButton href={rescheduleLink} color="danger">Reschedule Now</CTAButton>
      </div>
      <Text style={{ color: theme.colors.muted }}>
        Need help finding a time? Just reply and we’ll help you pick a great slot.
      </Text>
    </EmailLayout>
  );
}