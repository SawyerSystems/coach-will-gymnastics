import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function SessionFollowUp({ athleteName, bookingLink }: { athleteName: string; bookingLink: string }) {
  return (
    <EmailLayout title="🏆 Great work today!">
      <Text style={{ color: theme.colors.text }}>
        {athleteName} crushed it today — we’re proud of their effort and progress.
      </Text>
      <Text style={{ color: theme.colors.text }}>
        Keep the momentum going with another session:
      </Text>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <CTAButton href={bookingLink} color="info">Book Your Next Session</CTAButton>
      </div>
      <Text style={{ color: theme.colors.muted }}>
        Questions or goals to share? Reply to this email — we love partnering with parents.
      </Text>
    </EmailLayout>
  );
}