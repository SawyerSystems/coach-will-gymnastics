import React from 'react';
import { Html, Text, Heading, Container, Button } from '@react-email/components';

export function SessionFollowUp({ athleteName, bookingLink }: { athleteName: string; bookingLink: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#0EA5E9' }}>🏆 Training with Coach Will!</Heading>
        <Text>{athleteName} crushed it today! Time to rest, recharge, and prepare for the next challenge.</Text>
        <Button href={bookingLink} style={{ backgroundColor: '#0EA5E9', color: '#fff', padding: '10px 20px', borderRadius: '5px' }}>Book Your Next Session</Button>
      </Container>
    </Html>
  );
}