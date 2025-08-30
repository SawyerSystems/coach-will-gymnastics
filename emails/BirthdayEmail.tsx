import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';
import { EmailFooter } from './components/EmailFooter';

export const SUBJECT = 'Happy Birthday! 🎉 Keep shining';
export const PREHEADER = 'A quick birthday cheer from Coach Will — keep exploring and tumbling.';

export function BirthdayEmail(allProps: { athleteName: string; logoUrl?: string } & Record<string, any>) {
  const { athleteName, logoUrl, contactEmail, contactPhone } = allProps;
  return (
  <EmailLayout title={`🎉 Happy Birthday, ${athleteName}!`} preheader={PREHEADER}>

      <Text style={{ color: theme.colors.text }}>
        Another year stronger, faster, and braver — the hero's path continues!
      </Text>
      <Text style={{ color: theme.colors.text }}>
        🎂 May your flips be high, your landings clean, and your cake magical!
      </Text>
      <Text style={{ color: theme.colors.muted }}>
        I'm cheering for you loud from the Tumbleverse 🥳
      </Text>

      <EmailFooter contactEmail={contactEmail} contactPhone={contactPhone} />
    </EmailLayout>
  );
}