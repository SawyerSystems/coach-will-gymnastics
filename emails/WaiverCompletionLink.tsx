import React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

interface WaiverCompletionLinkProps {
  parentName: string;
  athleteName: string;
  loginLink: string;
  logoUrl?: string;
}

export function WaiverCompletionLink({ parentName, athleteName, loginLink, logoUrl }: WaiverCompletionLinkProps) {
  return (
    <EmailLayout logoUrl={logoUrl} title={`Complete ${athleteName}'s Waiver Form 📋`}>
      <Section>
        <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
          Hi {parentName}! Welcome to the CoachWillTumbles family!
        </Text>
        <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
          Before {athleteName} can begin their gymnastics adventure, we need you to complete their digital waiver and adventure agreement. This ensures everyone's safety and sets clear expectations for the training experience.
        </Text>
      </Section>

      <Section style={{ backgroundColor: '#fff3cd', padding: theme.spacing.lg, borderRadius: theme.radius.md, marginBottom: theme.spacing.lg, border: '1px solid #ffeaa7' }}>
        <Text style={{ fontSize: '14px', fontWeight: 700, color: '#856404', margin: 0 }}>⚠️ Required Before First Lesson</Text>
        <Text style={{ fontSize: '14px', color: '#856404', margin: 0, lineHeight: theme.font.lineHeight }}>
          Every athlete must have a signed waiver on file before they can participate in any training session. No waiver = no training.
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
        <CTAButton href={loginLink}>Complete Waiver Form</CTAButton>
      </Section>

      <Section>
        <Text style={{ fontSize: '14px', color: theme.colors.muted, lineHeight: theme.font.lineHeight }}>
          <strong>What to expect:</strong><br />
          • Secure parent portal login<br />
          • Digital waiver form (takes 2-3 minutes)<br />
          • Electronic signature capability<br />
          • Automatic confirmation email when complete
        </Text>
        <Hr style={{ borderColor: theme.colors.border, margin: `${theme.spacing.lg} 0` }} />
        <Text style={{ fontSize: '14px', color: theme.colors.muted, lineHeight: theme.font.lineHeight }}>
          Need help with the waiver? Reply to this email or text Coach Will.
          <br /><br />
          Thanks for taking care of this important step!
          <br /><br />
          Coach Will<br />
          CoachWillTumbles.com
        </Text>
      </Section>
    </EmailLayout>
  );
}