import React from 'react';
import { Html, Text, Heading, Container } from '@react-email/components';
import { EmailLogo } from './components/EmailLogo';

export function SessionConfirmation({ 
  parentName, 
  athleteName, 
  sessionDate, 
  sessionTime,
  logoUrl
}: { 
  parentName: string; 
  athleteName: string; 
  sessionDate: string; 
  sessionTime: string;
  logoUrl?: string;
}) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <EmailLogo logoUrl={logoUrl} />
        <Heading style={{ color: '#10B981' }}>✅ Session Confirmed!</Heading>
        <Text>Hi {parentName},</Text>
        <Text>Your session with {athleteName} is locked in for {sessionDate} at {sessionTime}.</Text>
        <Text>🎒 Pro Tip: Stretch and hydrate before training for max XP!</Text>
        <Text>We're pumped to see y'all on the mats.</Text>
      </Container>
    </Html>
  );
}