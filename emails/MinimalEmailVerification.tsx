import { Container, Heading, Html, Text } from '@react-email/components';

export function MinimalEmailVerification({ firstName, verificationUrl }: { firstName: string; verificationUrl: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#6366F1' }}>Verify Your Email Address</Heading>
        <Text>Hi {firstName},</Text>
        <Text>Please verify your email by clicking this link: {verificationUrl}</Text>
      </Container>
    </Html>
  );
}
