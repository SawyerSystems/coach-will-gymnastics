import React from "react";
import { Html, Head, Body, Container, Section, Text, Button, Hr, Img } from "@react-email/components";

interface ReservationPaymentLinkProps {
  parentName: string;
  athleteName: string;
  lessonType: string;
  lessonDate: string;
  lessonTime: string;
  amount: string;
  paymentLink: string;
}

export function ReservationPaymentLink({
  parentName,
  athleteName,
  lessonType,
  lessonDate,
  lessonTime,
  amount,
  paymentLink
}: ReservationPaymentLinkProps) {
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
              Hi {parentName}! 🎯
            </Text>
            
            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '20px' }}>
              Fantastic news! We've reserved a spot for <strong>{athleteName}</strong> for their upcoming gymnastics adventure:
            </Text>

            {/* Lesson Details */}
            <Section style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '25px' }}>
              <Text style={{ fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 10px 0' }}>
                Lesson Details
              </Text>
              <Text style={{ fontSize: '14px', color: '#666', margin: '5px 0', lineHeight: '1.5' }}>
                <strong>Lesson Type:</strong> {lessonType}<br />
                <strong>Date:</strong> {lessonDate}<br />
                <strong>Time:</strong> {lessonTime}<br />
                <strong>Athlete:</strong> {athleteName}<br />
                <strong>Reservation Amount:</strong> ${amount}
              </Text>
            </Section>

            <Text style={{ fontSize: '16px', color: '#333', lineHeight: '1.6', marginBottom: '25px' }}>
              To secure this spot, please complete your reservation payment using the secure link below. This confirms your commitment and holds the time slot exclusively for {athleteName}.
            </Text>

            {/* Payment Button */}
            <Section style={{ textAlign: 'center', marginBottom: '30px' }}>
              <Button
                href={paymentLink}
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
                Complete Reservation Payment
              </Button>
            </Section>

            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5', marginBottom: '20px' }}>
              <strong>What happens next?</strong><br />
              • Complete your reservation payment (secure and quick!)<br />
              • Receive waiver and safety information emails<br />
              • Get ready for an amazing gymnastics adventure!
            </Text>

            <Hr style={{ borderColor: '#eee', margin: '25px 0' }} />

            <Text style={{ fontSize: '14px', color: '#666', lineHeight: '1.5' }}>
              Questions? Reply to this email or text Coach Will at (760) 123-4567.
              <br /><br />
              Looking forward to {athleteName}'s gymnastics journey!
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