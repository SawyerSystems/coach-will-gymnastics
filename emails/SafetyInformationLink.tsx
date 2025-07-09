import React from "react";
import { Html, Head, Body, Container, Section, Text, Button, Hr } from "@react-email/components";

interface SafetyInformationLinkProps {
  parentName: string;
  athleteName: string;
  loginLink: string;
}

export function SafetyInformationLink({
  parentName,
  athleteName,
  loginLink
}: SafetyInformationLinkProps) {
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
              Important: Safety Authorization Required 🛡️
            </Text>
            
            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>
              Hi {parentName}! As part of keeping {athleteName} safe during their gymnastics sessions, we need you to specify who is authorized for pickup and drop-off.
            </Text>

            {/* Safety Notice */}
            <Section style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '25px', border: '1px solid #c3e6c3' }}>
              <Text style={{ fontSize: '14px', fontWeight: 'bold', color: '#2d5016', margin: '0 0 10px 0' }}>
                🛡️ Our Safety Commitment
              </Text>
              <Text style={{ fontSize: '14px', color: '#2d5016', margin: '0', lineHeight: '1.5' }}>
                We only release athletes to authorized individuals. This protects {athleteName} and gives you peace of mind.
              </Text>
            </Section>

            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>
              Please log in to your parent portal to specify:
            </Text>

            <Text style={{ fontSize: '14px', color: '#333', lineHeight: '1.6', marginBottom: '25px' }}>
              • <strong>Drop-off Person:</strong> Who can bring {athleteName} to sessions<br />
              • <strong>Pickup Person:</strong> Who can collect {athleteName} after sessions<br />
              • <strong>Emergency Contacts:</strong> Backup authorized individuals<br />
              • <strong>Relationship Details:</strong> How each person relates to {athleteName}
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
                Set Safety Authorization
              </Button>
            </Section>

            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
              <strong>Quick & Easy Process:</strong><br />
              • Access your secure parent portal<br />
              • Complete safety authorization form<br />
              • Save authorized pickup/drop-off contacts<br />
              • Receive confirmation when complete
            </Text>

            <Hr style={{ borderColor: '#eee', margin: '25px 0' }} />

            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
              Questions about safety procedures? Reply to this email or text Coach Will at (760) 123-4567.
              <br /><br />
              Thank you for helping us keep {athleteName} safe!
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