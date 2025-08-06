import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Text
} from '@react-email/components';
import { EmailLogo } from './components/EmailLogo';

interface EmailVerificationProps {
  firstName: string;
  verificationUrl: string;
  logoUrl?: string;
}

export function EmailVerification({
  firstName = 'Gymnastics Parent',
  verificationUrl = 'https://example.com/verify',
  logoUrl,
}: EmailVerificationProps) {
  return (
    <Html>
      <Head />
      <Preview>Verify your email address for Coach Will Tumbles</Preview>
      <Body style={{ backgroundColor: '#f5f5f5', margin: 0, padding: 0 }}>
        <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' }}>
          <EmailLogo logoUrl={logoUrl} />
          <Heading style={{ color: '#6366F1' }}>Verify Your Email Address</Heading>
          
          <Text>Hi {firstName},</Text>
          
          <Text>
            Thank you for registering with Coach Will Tumbles! Please verify your email address
            to complete your account setup and ensure you receive important updates about your sessions.
          </Text>
          
          <Section style={{ textAlign: 'center', margin: '30px 0' }}>
            <Button
              style={{
                backgroundColor: '#6366F1',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              href={verificationUrl}
            >
              Verify My Email
            </Button>
          </Section>
          
          <Text>
            This link will expire in 24 hours. If you did not create an account with Coach Will Tumbles, 
            please ignore this email.
          </Text>
          
          <Text>
            If the button above doesn't work, copy and paste this URL into your browser:
          </Text>
          
          <Text style={{ 
            backgroundColor: '#f0f0f0', 
            padding: '10px', 
            borderRadius: '4px', 
            fontSize: '14px',
            wordBreak: 'break-all'
          }}>
            {verificationUrl}
          </Text>
          
          <Hr style={{ borderTop: '1px solid #ddd', margin: '30px 0' }} />
          
          <Text style={{ fontSize: '12px', color: '#666', textAlign: 'center' }}>
            © {new Date().getFullYear()} Coach Will Tumbles. All rights reserved.
            <br />
            <Link
              href="https://coachwilltumbles.com"
              style={{ color: '#6366F1', textDecoration: 'underline' }}
            >
              coachwilltumbles.com
            </Link>
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default EmailVerification;
