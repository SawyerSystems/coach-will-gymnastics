import React from 'react';
import { Html, Text, Heading, Container } from '@react-email/components';

export function BirthdayEmail({ athleteName }: { athleteName: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Comic Sans MS, cursive' }}>
        <Heading style={{ color: '#F472B6' }}>🎉 Happy Birthday, {athleteName}!</Heading>
        <Text>Another year stronger, faster, and braver — the hero's path continues!</Text>
        <Text>🎂 May your flips be high, your landings clean, and your cake magical!</Text>
        <Text>We're cheering for you loud from the Tumbleverse 🥳</Text>
      </Container>
    </Html>
  );
}