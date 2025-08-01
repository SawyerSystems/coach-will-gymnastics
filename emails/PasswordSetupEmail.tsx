import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';

interface PasswordSetupEmailProps {
  firstName: string;
  resetToken: string;
  resetUrl: string;
}

export function PasswordSetupEmail({
  firstName = 'Gymnastics Parent',
  resetToken = 'xyz123',
  resetUrl = 'https://coachwilltumbles.com/parent/set-password?token=xyz123',
}: PasswordSetupEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Set up your password for Coach Will Tumbles</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src="https://storage.googleapis.com/coach-will-tumbles/CoachWillTumblesText.png"
            width="300"
            height="85"
            alt="Coach Will Tumbles Logo"
            style={logo}
          />
          <Heading style={h1}>Set Up Your Password</Heading>
          <Text style={text}>Hi {firstName},</Text>
          <Text style={text}>
            An account was recently created for you through our booking system. To access your account and view your bookings, you'll need to set up a password.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Set Up Password
            </Button>
          </Section>
          <Text style={text}>
            This link will expire in 24 hours. If you didn't request this email, you can safely ignore it.
          </Text>
          <Text style={text}>
            If the button doesn't work, copy and paste this link into your browser:
          </Text>
          <Text style={link}>
            <Link href={resetUrl}>{resetUrl}</Link>
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            © 2025 Coach Will Tumbles. All rights reserved.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const logo = {
  margin: '0 auto',
  marginBottom: '32px',
};

const h1 = {
  color: '#484848',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '16px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#484848',
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
};

const link = {
  color: '#6366f1',
  fontSize: '14px',
  lineHeight: '24px',
  marginBottom: '40px',
  wordBreak: 'break-all' as const,
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 32px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '42px 0 26px',
};

const footer = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '24px',
  textAlign: 'center' as const,
};

export default PasswordSetupEmail;
