import React from "react";
import { Html, Head, Body, Container, Section, Text, Button, Hr } from "@react-email/components";

interface WaiverCompletionLinkProps {
  parentName: string;
  athleteName: string;
  loginLink: string;
}

export function WaiverCompletionLink({
  parentName,
  athleteName,
  loginLink
}: WaiverCompletionLinkProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', padding: '20px' }}>
          
          {/* Header */}
          <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#e76f51', margin: '0' }}>
              CoachWillTumbles.com
            </Text>
            <Text style={{ fontSize: '16px', color: '#666', margin: '5px 0 0 0' }}>
              Adventure in Every Tumble
            </Text>
          </Section>

          {/* Main Content */}
          <Section>
            <Text style={{ fontSize: '18px', fontWeight: 'bold', color: '#333', marginBottom: '15px' }}>
              Complete {athleteName}'s Waiver Form 📋
            </Text>
            
            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>
              Hi {parentName}! Welcome to the CoachWillTumbles family! 
            </Text>

            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>
              Before {athleteName} can begin their gymnastics adventure, we need you to complete their digital waiver and adventure agreement. This ensures everyone's safety and sets clear expectations for the training experience.
            </Text>

            {/* Important Notice */}
            <Section style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #ffeaa7' }}>
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#856404', margin: '0 0 10px 0' }}>
                ⚠️ Required Before First Lesson
              </Text>
              <Text style={{ fontSize: '14px', color: '#856404', margin: '0', lineHeight: '1.5' }}>
                Every athlete must have a signed waiver on file before they can participate in any training session. No waiver = no training.
              </Text>
            </Section>

            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '25px' }}>
              Click the button below to access your parent portal and complete the waiver form with your digital signature:
            </Text>

            {/* Login Button */}
            <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Button
                href={loginLink}
                style={{
                  backgroundColor: '#e76f51',
                  color: '#ffffff',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'inline-block'
                }}
              >
                Complete Waiver Form
              </Button>
            </Section>

            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
              <strong>What to expect:</strong><br />
              • Secure parent portal login<br />
              • Digital waiver form (takes 2-3 minutes)<br />
              • Electronic signature capability<br />
              • Automatic confirmation email when complete
            </Text>

            <Hr style={{ borderColor: '#eee', margin: '25px 0' }} />

            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
              Need help with the waiver? Reply to this email or text Coach Will at (760) 123-4567.
              <br /><br />
              Thanks for taking care of this important step!
              <br /><br />
              Coach Will<br />
              CoachWillTumbles.com
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}