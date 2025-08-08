import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';

export function RescheduleConfirmation({ newSessionDate, newSessionTime, logoUrl }: { newSessionDate: string; newSessionTime: string; logoUrl?: string }) {
  return (
    <EmailLayout logoUrl={logoUrl} title="🔄 New Adventure Scheduled!">
      <Text style={{ color: theme.colors.text }}>Your session has been successfully rescheduled.</Text>
      <Text style={{ color: theme.colors.text }}>� New Date: {newSessionDate}</Text>
      <Text style={{ color: theme.colors.text }}>🕓 New Time: {newSessionTime}</Text>
    </EmailLayout>
  );
}