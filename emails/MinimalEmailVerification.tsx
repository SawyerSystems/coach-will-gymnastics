import { Html, Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';

export function MinimalEmailVerification({ firstName, verificationUrl, logoUrl }: { firstName: string; verificationUrl: string; logoUrl?: string }) {
  return (
    <Html>
      <EmailLayout logoUrl={logoUrl} title="Verify Your Email Address">
        <Text style={{ color: theme.colors.text }}>Hi {firstName},</Text>
        <Text style={{ color: theme.colors.text }}>Please verify your email by clicking this link:</Text>
        <Text style={{ color: theme.colors.primary }}>{verificationUrl}</Text>
      </EmailLayout>
    </Html>
  );
}
