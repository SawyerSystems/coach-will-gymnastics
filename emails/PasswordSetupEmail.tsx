import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { EmailFooter } from './components/EmailFooter';
import { theme } from './components/theme';

interface PasswordSetupEmailProps {
  firstName: string;
  resetToken: string;
  resetUrl: string;
  logoUrl?: string;
}

export const SUBJECT = 'Set your password to get started';
export const PREHEADER = 'Create your password now to access your parent portal.';

export function PasswordSetupEmail({ firstName = 'Gymnastics Parent', resetToken = 'xyz123', resetUrl = 'https://coachwilltumbles.com/parent/set-password?token=xyz123', logoUrl }: PasswordSetupEmailProps) {
  return (
      <EmailLayout logoUrl={logoUrl} title="Set Up Your Password" preheader={PREHEADER}>

        <Text style={{ color: theme.colors.text }}>Hi {firstName},</Text>
        <Text style={{ color: theme.colors.text }}>
          An account was recently created for you through my booking system. To access your account and view your bookings, you'll need to set up a password.
        </Text>
        <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
          <a
            href={resetUrl}
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
            Set Up Password
          </a>
        </div>
        <Text style={{ color: theme.colors.text }}>
          If the button doesn't work, copy and paste this link into your browser:
        </Text>
        <Text style={{ color: theme.colors.primary }}>
          <a href={resetUrl} style={{ color: theme.colors.primary, textDecoration: 'underline' }}>{resetUrl}</a>
        </Text>

        <EmailFooter />
      </EmailLayout>
  );
}

export default PasswordSetupEmail;
