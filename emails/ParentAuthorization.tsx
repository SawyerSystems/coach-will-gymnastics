import React from 'react';
import { Html, Text, Heading, Container } from '@react-email/components';

export function ParentAuthorization({ parentName, authCode }: { parentName: string; authCode: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#3B82F6', fontSize: '24px' }}>🗝️ Access Code to Begin Your Journey</Heading>
        <Text>Hi {parentName},</Text>
        <Text>Welcome to the Tumbleverse! You're one step closer to unlocking your athlete's next level.</Text>
        <Text style={{ fontSize: '18px', fontWeight: 'bold' }}>Your Access Code: {authCode}</Text>
        <Text>This code expires in 10 minutes. Let the journey begin!</Text>
      </Container>
    </Html>
  );
}