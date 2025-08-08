import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function ParentWelcome({ parentName, loginLink }: { parentName: string; loginLink: string }) {
  return (
    <EmailLayout title="Welcome to Coach Will Tumbles! 🤸‍♀️">
      <Text style={{ color: theme.colors.text }}>Hi {parentName},</Text>
      <Text style={{ color: theme.colors.text }}>
        We’re thrilled to welcome you to the Coach Will Tumbles family! Here’s how to get set up in just a few minutes:
      </Text>
      <ul style={{ color: theme.colors.text, paddingLeft: '18px', marginTop: 0 }}>
        <li>Complete your athlete’s profile</li>
        <li>Book your first session</li>
        <li>Sign the digital waiver</li>
      </ul>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <CTAButton href={loginLink}>Access Your Parent Portal</CTAButton>
      </div>
      <Text style={{ color: theme.colors.muted }}>
        Questions? Just reply here — we’re happy to help. We can’t wait to see your athlete grow in strength and confidence!
      </Text>
      <Text style={{ marginTop: theme.spacing.md, color: theme.colors.text }}>Best flips,</Text>
      <Text style={{ color: theme.colors.text }}>Coach Will 🏆</Text>
    </EmailLayout>
  );
}
