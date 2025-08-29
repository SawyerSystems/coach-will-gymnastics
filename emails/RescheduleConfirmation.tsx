import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';
import { EmailFooter } from './components/EmailFooter';
import { formatTime } from './utils/timeFormat';
import { formatAthletePossessive } from './utils/athleteNameFormatters';

export const SUBJECT = 'Your session has been rescheduled';
export const PREHEADER = 'Here are your updated date and time — see you soon!';

export function RescheduleConfirmation({ 
  newSessionDate, 
  newSessionTime, 
  athleteNames, 
  logoUrl 
}: { 
  newSessionDate: string; 
  newSessionTime: string; 
  athleteNames?: string[]; 
  logoUrl?: string;
}) {
  return (
  <EmailLayout title="🔄 New Adventure Scheduled!" preheader={PREHEADER}>

      <Text style={{ color: theme.colors.text }}>{formatAthletePossessive(athleteNames)} session has been successfully rescheduled.</Text>
      <Text style={{ color: theme.colors.text }}>📅 New Date: {newSessionDate}</Text>
      <Text style={{ color: theme.colors.text }}>🕓 New Time: {formatTime(newSessionTime)}</Text>

      <EmailFooter />
    </EmailLayout>
  );
}