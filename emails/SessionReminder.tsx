import React from 'react';
import { Html, Text, Heading, Container } from '@react-email/components';

export function SessionReminder({ athleteName, sessionDate, sessionTime }: { athleteName: string; sessionDate: string; sessionTime: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#6366F1' }}>⏰ Adventure Incoming!</Heading>
        <Text>{athleteName} has a session on {sessionDate} at {sessionTime}.</Text>
        <Text>🧘‍♀️ Don't forget to stretch, hydrate, and bring that warrior mindset!</Text>
      </Container>
    </Html>
  );
}