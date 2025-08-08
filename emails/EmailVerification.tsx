import { Html, Head, Preview, Link, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

interface EmailVerificationProps {
  firstName: string;
  verificationUrl: string;
  logoUrl?: string;
}

export function EmailVerification({ firstName = 'Gymnastics Parent', verificationUrl = 'https://example.com/verify', logoUrl }: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Coach Will Tumbles</Preview>
      <EmailLayout logoUrl={logoUrl} title="Verify Your Email Address">
        <Text style={{ color: theme.colors.text }}>Hi {firstName},</Text>
        <Text style={{ color: theme.colors.text }}>
          Thank you for registering with Coach Will Tumbles! Please verify your email address to complete your account setup and ensure you receive important updates about your sessions.
        </Text>
        <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
          <CTAButton href={verificationUrl}>Verify My Email</CTAButton>
        </div>
        <Text style={{ color: theme.colors.text }}>
          If the button above doesn't work, copy and paste this URL into your browser:
        </Text>
        <Text style={{ backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', fontSize: '14px', wordBreak: 'break-all', color: theme.colors.text }}>
          {verificationUrl}
        </Text>
        <Text style={{ fontSize: '12px', color: theme.colors.muted, textAlign: 'center' }}>
          © {new Date().getFullYear()} Coach Will Tumbles. All rights reserved.{' '}
          <Link href="https://coachwilltumbles.com" style={{ color: theme.colors.primary, textDecoration: 'underline' }}>
            coachwilltumbles.com
          </Link>
        </Text>
      </EmailLayout>
    </Html>
  );
}

export default EmailVerification;
