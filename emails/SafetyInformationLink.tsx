import React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

interface SafetyInformationLinkProps {
  parentName: string;
  athleteName: string;
  loginLink: string;
  logoUrl?: string;
}

export function SafetyInformationLink({ parentName, athleteName, loginLink, logoUrl }: SafetyInformationLinkProps) {
  return (
    <EmailLayout logoUrl={logoUrl} title="Important: Safety Authorization Required 🛡️">
      <Section>
        <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
          Hi {parentName}! As part of keeping {athleteName} safe during their gymnastics sessions, we need you to specify who is authorized for pickup and drop-off.
        </Text>
      </Section>

      <Section style={{ backgroundColor: '#e8f5e8', padding: theme.spacing.lg, borderRadius: theme.radius.md, marginBottom: theme.spacing.lg, border: '1px solid #c3e6c3' }}>
        <Text style={{ fontSize: '14px', fontWeight: 700, color: '#2d5016', margin: 0 }}>🛡️ Our Safety Commitment</Text>
        <Text style={{ fontSize: '14px', color: '#2d5016', margin: 0, lineHeight: theme.font.lineHeight }}>
          We only release athletes to authorized individuals. This protects {athleteName} and gives you peace of mind.
        </Text>
      </Section>

      <Section>
        <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
          Please log in to your parent portal to specify:
        </Text>
        <Text style={{ fontSize: '14px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
          • <strong>Drop-off Person:</strong> Who can bring {athleteName} to sessions<br />
          • <strong>Pickup Person:</strong> Who can collect {athleteName} after sessions<br />
          • <strong>Emergency Contacts:</strong> Backup authorized individuals<br />
          • <strong>Relationship Details:</strong> How each person relates to {athleteName}
        </Text>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
        <CTAButton href={loginLink}>Set Safety Authorization</CTAButton>
      </Section>

      <Section>
        <Text style={{ fontSize: '14px', color: theme.colors.muted, lineHeight: theme.font.lineHeight }}>
          <strong>Quick & Easy Process:</strong><br />
          • Access your secure parent portal<br />
          • Complete safety authorization form<br />
          • Save authorized pickup/drop-off contacts<br />
          • Receive confirmation when complete
        </Text>
        <Hr style={{ borderColor: theme.colors.border, margin: `${theme.spacing.lg} 0` }} />
        <Text style={{ fontSize: '14px', color: theme.colors.muted, lineHeight: theme.font.lineHeight }}>
          Questions about safety procedures? Reply to this email or text Coach Will.
          <br /><br />
          Thank you for helping us keep {athleteName} safe!
          <br /><br />
          Coach Will<br />
          CoachWillTumbles.com
        </Text>
      </Section>
    </EmailLayout>
  );
}