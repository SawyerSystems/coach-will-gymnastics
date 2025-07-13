import React from 'react';
import { Html, Text, Heading, Container, Button } from '@react-email/components';

export function NewTipOrBlog({ blogTitle, blogLink }: { blogTitle: string; blogLink: string }) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <Heading style={{ color: '#8B5CF6' }}>✨ New Tip Unlocked!</Heading>
        <Text>{blogTitle} is now live on the Tumbleverse journal. Time to level up your training knowledge.</Text>
        <Button href={blogLink} style={{ backgroundColor: '#8B5CF6', color: '#fff', padding: '10px 20px', borderRadius: '5px' }}>View the Tip</Button>
      </Container>
    </Html>
  );
}