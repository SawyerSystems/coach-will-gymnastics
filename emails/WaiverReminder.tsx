import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function WaiverReminder({ parentName, waiverLink }: { parentName: string; waiverLink: string }) {
  return (
    <EmailLayout title="📜 One quick step before the fun!">
      <Text style={{ color: theme.colors.text }}>Hey {parentName},</Text>
      <Text style={{ color: theme.colors.text }}>
        You’re almost set — we just need your digital waiver to finalize your athlete’s first session.
      </Text>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <CTAButton href={waiverLink} color="danger">Complete the Waiver</CTAButton>
      </div>
      <Text style={{ color: theme.colors.muted }}>
        It only takes a minute, and then you’re all set. We can’t wait to welcome you!
      </Text>
    </EmailLayout>
  );
}