import React from 'react';
import { Html, Text, Heading, Container } from '@react-email/components';

export function SessionConfirmation({ parentName, athleteName, sessionDate, sessionTime }: { parentName: string; athleteName: string; sessionDate: string; sessionTime: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#10B981' }}>✅ Session Confirmed!</Heading>
        <Text>Hi {parentName},</Text>
        <Text>Your session with {athleteName} is locked in for {sessionDate} at {sessionTime}.</Text>
        <Text>🎒 Pro Tip: Stretch and hydrate before training for max XP!</Text>
        <Text>We're pumped to see y'all on the mats.</Text>
      </Container>
    </Html>
  );
}