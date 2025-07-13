import React from 'react';
import { Html, Text, Heading, Container, Section, Button, Hr } from '@react-email/components';

export function SignedWaiverConfirmation({ 
  parentName, 
  athleteName 
}: { 
  parentName: string; 
  athleteName: string; 
}) {
  return (
    <Html>
      <Container style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '600px' }}>
        <Heading style={{ color: '#EF4444', textAlign: 'center' }}>
          🏆 Adventure Waiver Complete!
        </Heading>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Hey {parentName},
        </Text>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          Perfect! {athleteName}'s waiver is now complete and securely stored in our system. 
          You're all set for the gymnastics adventure ahead!
        </Text>
        
        <Section style={{ backgroundColor: '#F3F4F6', padding: '20px', borderRadius: '8px', margin: '20px 0' }}>
          <Heading style={{ color: '#374151', fontSize: '18px', margin: '0 0 10px 0' }}>
            What's Next?
          </Heading>
          <Text style={{ margin: '0 0 10px 0', fontSize: '14px' }}>
            ✅ Waiver signed and filed<br/>
            ✅ Ready for training sessions<br/>
            📧 PDF copy attached to this email<br/>
            🏋️ Remember to stretch before class!
          </Text>
        </Section>
        
        <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
          <strong>Quick Training Tips:</strong><br/>
          • Arrive 5-10 minutes early for warm-up<br/>
          • Wear comfortable athletic clothing<br/>
          • Bring water and a positive attitude!<br/>
          • Remember: every expert was once a beginner 🌟
        </Text>
        
        <Hr style={{ margin: '30px 0' }} />
        
        <Text style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.4' }}>
          Questions? Reply to this email or text Coach Will directly. 
          Looking forward to an amazing training journey with {athleteName}!
        </Text>
        
        <Text style={{ fontSize: '14px', color: '#6B7280', marginTop: '20px' }}>
          Coach Will Sawyer<br/>
          CoachWillTumbles.com<br/>
          📧 coach@coachwilltumbles.com<br/>
          📱 Text: (858) 220-7059
        </Text>
      </Container>
    </Html>
  );
}