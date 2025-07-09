import React from 'react';
import { Html, Text, Heading, Container, Button } from '@react-email/components';

export function SessionCancellation({ parentName, rescheduleLink }: { parentName: string; rescheduleLink: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#DC2626' }}>❌ Session Cancelled</Heading>
        <Text>Hi {parentName},</Text>
        <Text>Your session has been cancelled. But don't worry — the journey continues!</Text>
        <Button href={rescheduleLink} style={{ backgroundColor: '#DC2626', color: '#fff', padding: '10px 20px', borderRadius: '5px' }}>Reschedule Now</Button>
      </Container>
    </Html>
  );
}