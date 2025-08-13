import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';
import { EmailFooter } from './components/EmailFooter';

export const SUBJECT = 'Your session has been rescheduled';
export const PREHEADER = 'Here are your updated date and time — see you soon!';

export function RescheduleConfirmation({ newSessionDate, newSessionTime, logoUrl }: { newSessionDate: string; newSessionTime: string; logoUrl?: string }) {
  return (
  <EmailLayout title="🔄 New Adventure Scheduled!" preheader={PREHEADER}>

      <Text style={{ color: theme.colors.text }}>Your session has been successfully rescheduled.</Text>
      <Text style={{ color: theme.colors.text }}>📅 New Date: {newSessionDate}</Text>
      <Text style={{ color: theme.colors.text }}>🕓 New Time: {newSessionTime}</Text>

      <EmailFooter />
    </EmailLayout>
  );
}