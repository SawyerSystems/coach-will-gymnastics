import React from 'react';
import { Html, Text, Heading, Container, Button } from '@react-email/components';

export function ManualBookingConfirmation({ parentName, confirmLink }: { parentName: string; confirmLink: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#F59E0B' }}>⚠️ Action Required: Confirm Your Session</Heading>
        <Text>Hey {parentName},</Text>
        <Text>Coach Will has scheduled a session just for you. Hit the button below to confirm and complete your booking quest:</Text>
        <Button href={confirmLink} style={{ backgroundColor: '#F59E0B', color: '#fff', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>Confirm My Session</Button>
        <Text>If you didn't request this, no worries — you can ignore it.</Text>
      </Container>
    </Html>
  );
}