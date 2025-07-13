import React from 'react';
import { Html, Text, Heading, Container, Button } from '@react-email/components';

export function WaiverReminder({ parentName, waiverLink }: { parentName: string; waiverLink: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#EF4444' }}>📜 Complete Your Training Scroll</Heading>
        <Text>Hey {parentName},</Text>
        <Text>You're almost ready to begin your training journey — but we still need your waiver to activate your hero's badge.</Text>
        <Button href={waiverLink} style={{ backgroundColor: '#EF4444', color: '#fff', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none' }}>Complete the Waiver</Button>
      </Container>
    </Html>
  );
}