import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function ManualBookingConfirmation({ parentName, confirmLink, logoUrl }: { parentName: string; confirmLink: string; logoUrl?: string }) {
  return (
    <EmailLayout logoUrl={logoUrl} title="⚠️ Action Required: Confirm Your Session">
      <Text style={{ color: theme.colors.text }}>Hey {parentName},</Text>
      <Text style={{ color: theme.colors.text }}>
        Coach Will has scheduled a session just for you. Hit the button below to confirm and complete your booking quest:
      </Text>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <CTAButton href={confirmLink} color="accent">Confirm My Session</CTAButton>
      </div>
      <Text style={{ color: theme.colors.muted }}>If you didn't request this, no worries — you can ignore it.</Text>
    </EmailLayout>
  );
}