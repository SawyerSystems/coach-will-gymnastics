import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';

export function BirthdayEmail({ athleteName, logoUrl }: { athleteName: string; logoUrl?: string }) {
  return (
    <EmailLayout logoUrl={logoUrl} title={`🎉 Happy Birthday, ${athleteName}!`}>
      <Text style={{ color: theme.colors.text }}>Another year stronger, faster, and braver — the hero's path continues!</Text>
      <Text style={{ color: theme.colors.text }}>🎂 May your flips be high, your landings clean, and your cake magical!</Text>
      <Text style={{ color: theme.colors.muted }}>We're cheering for you loud from the Tumbleverse 🥳</Text>
    </EmailLayout>
  );
}