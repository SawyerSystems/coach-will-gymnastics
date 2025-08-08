import React from 'react';
import { Section, Text, Hr } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';

export function SignedWaiverConfirmation({ parentName, athleteName, logoUrl }: { parentName: string; athleteName: string; logoUrl?: string }) {
  return (
    <EmailLayout logoUrl={logoUrl} title="🏆 Adventure Waiver Complete!">
      <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
        Hey {parentName},
      </Text>
      <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight }}>
        Perfect! {athleteName}'s waiver is now complete and securely stored in our system. You're all set for the gymnastics adventure ahead!
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

      <Hr style={{ margin: '30px 0', borderColor: theme.colors.border }} />

      <Text style={{ fontSize: '14px', color: theme.colors.muted, lineHeight: '1.4' }}>
        Questions? Reply to this email or text Coach Will directly. Looking forward to an amazing training journey with {athleteName}!
      </Text>

      <Text style={{ fontSize: '14px', color: theme.colors.muted, marginTop: '20px' }}>
        Coach Will Sawyer<br/>
        CoachWillTumbles.com<br/>
        📧 will@coachwilltumbles.com<br/>
        📱 Text: (585) 755-8122
      </Text>
    </EmailLayout>
  );
}