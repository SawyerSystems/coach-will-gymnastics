import React from 'react';
import { Html, Text, Heading, Container } from '@react-email/components';

export function RescheduleConfirmation({ newSessionDate, newSessionTime }: { newSessionDate: string; newSessionTime: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#4ADE80' }}>🔄 New Adventure Scheduled!</Heading>
        <Text>Your session has been successfully rescheduled.</Text>
        <Text>🗓️ New Date: {newSessionDate}</Text>
        <Text>🕓 New Time: {newSessionTime}</Text>
      </Container>
    </Html>
  );
}