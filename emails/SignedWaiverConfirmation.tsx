import React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';
import { EmailFooter } from './components/EmailFooter';

export const SUBJECT = 'Waiver complete — you’re all set ✅';
export const PREHEADER = 'Thanks! Your waiver is on file. Quick tips and the PDF are inside.';

export function SignedWaiverConfirmation(allProps: { parentName: string; athleteName: string; logoUrl?: string } & Record<string, any>) {
  const { parentName, athleteName, logoUrl, contactEmail, contactPhone } = allProps;
  return (
  <EmailLayout logoUrl={logoUrl} title="🏆 Adventure Waiver Complete!" preheader={PREHEADER}>

      <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
        Hi {parentName},
      </Text>
      <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
        Perfect! {athleteName}'s waiver is now complete and securely stored in my system. You're all set for the gymnastics adventure ahead!
      </Text>

      <Section style={{ backgroundColor: '#F3F4F6', padding: theme.spacing.lg, borderRadius: theme.radius.md, margin: '20px 0' }}>
        <Text style={{ color: '#374151', fontSize: '18px', margin: '0 0 10px 0', fontWeight: 700 }}>What's Next?</Text>
        <Text style={{ margin: 0, fontSize: '14px', color: theme.colors.text }}>
          ✅ Waiver signed and filed<br/>
          ✅ Ready for training sessions<br/>
          📧 PDF copy attached to this email<br/>
          🏋️ Remember to stretch before class!
        </Text>
      </Section>

      <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
        <strong>Quick Training Tips:</strong><br/>
        • Arrive 5-10 minutes early for warm-up<br/>
        • Wear comfortable athletic clothing<br/>
        • Bring water and a positive attitude!<br/>
        • Remember: every expert was once a beginner 🌟
      </Text>

      <Section style={{ textAlign: 'center', margin: '30px 0' }}>
        <a
          href="https://coachwilltumbles.com/waiver"
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
          View Waiver
        </a>
      </Section>

      <EmailFooter contactEmail={contactEmail} contactPhone={contactPhone} />
    </EmailLayout>
  );
}