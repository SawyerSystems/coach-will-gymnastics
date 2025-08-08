import { Html, Head, Preview, Link, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

interface PasswordSetupEmailProps {
  firstName: string;
  resetToken: string;
  resetUrl: string;
  logoUrl?: string;
}

export function PasswordSetupEmail({ firstName = 'Gymnastics Parent', resetToken = 'xyz123', resetUrl = 'https://coachwilltumbles.com/parent/set-password?token=xyz123', logoUrl }: PasswordSetupEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Set up your password for Coach Will Tumbles</Preview>
      <EmailLayout logoUrl={logoUrl} title="Set Up Your Password">
        <Text style={{ color: theme.colors.text }}>Hi {firstName},</Text>
        <Text style={{ color: theme.colors.text }}>
          An account was recently created for you through our booking system. To access your account and view your bookings, you'll need to set up a password.
        </Text>
        <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
          <CTAButton href={resetUrl}>Set Up Password</CTAButton>
        </div>
        <Text style={{ color: theme.colors.text }}>
          If the button doesn't work, copy and paste this link into your browser:
        </Text>
        <Text style={{ color: theme.colors.primary }}>
          <Link href={resetUrl}>{resetUrl}</Link>
        </Text>
        <Text style={{ color: theme.colors.muted, fontSize: '12px', textAlign: 'center' }}>
          © {new Date().getFullYear()} Coach Will Tumbles. All rights reserved.
        </Text>
      </EmailLayout>
    </Html>
  );
}

export default PasswordSetupEmail;
