import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailFooter } from './components/EmailFooter';
export const SUBJECT = 'Confirm your session — one quick step';
export const PREHEADER = 'Tap to confirm and secure your athlete’s spot; details inside.';
import { theme } from './components/theme';

export function ManualBookingConfirmation(allProps: { parentName: string; confirmLink: string; logoUrl?: string } & Record<string, any>) {
  const { parentName, confirmLink, logoUrl, contactEmail, contactPhone } = allProps;
  return (
    <EmailLayout logoUrl={logoUrl} title="🔒 Action Needed: Confirm Your Session" preheader={PREHEADER}>

      <Text style={{ color: theme.colors.text }}>Hi {parentName},</Text>
      <Text style={{ color: theme.colors.text }}>
        I’ve scheduled a session just for you. Hit the button below to confirm and complete your booking quest:
      </Text>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <a
          href={confirmLink}
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
          Confirm My Session
        </a>
      </div>
      <Text style={{ color: theme.colors.muted }}>
        If you didn’t request this, no worries — you can ignore it.
      </Text>

      <EmailFooter contactEmail={contactEmail} contactPhone={contactPhone} />
    </EmailLayout>
  );
}