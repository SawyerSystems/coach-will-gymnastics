import React from "react";
import { Section, Text, Hr } from "@react-email/components";
import { EmailLayout } from "./components/EmailLayout";
import { CTAButton } from "./components/CTAButton";
import { theme } from "./components/theme";

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
    <EmailLayout title="Complete Your Reservation">
      {/* Greeting */}
      <Section>
        <Text style={{ fontSize: '18px', fontWeight: 700, color: theme.colors.text, marginBottom: theme.spacing.md }}>
          Hi {parentName}! 🎯
        </Text>
        <Text style={{ fontSize: '16px', color: theme.colors.text, lineHeight: theme.font.lineHeight, marginBottom: theme.spacing.lg }}>
          Fantastic news! We’ve reserved a spot for <strong>{athleteName}</strong> — here are the details:
        </Text>
      </Section>

      {/* Lesson Details */}
      <Section style={{ backgroundColor: theme.colors.surface, padding: theme.spacing.lg, borderRadius: theme.radius.md, marginBottom: theme.spacing.lg }}>
        <Text style={{ fontSize: '16px', fontWeight: 700, color: theme.colors.text, margin: 0 }}>Lesson Details</Text>
        <Text style={{ fontSize: '14px', color: theme.colors.muted, margin: '8px 0 0 0', lineHeight: theme.font.lineHeight }}>
          <strong>Lesson Type:</strong> {lessonType}<br />
          <strong>Date:</strong> {lessonDate}<br />
          <strong>Time:</strong> {lessonTime}<br />
          <strong>Athlete:</strong> {athleteName}<br />
          <strong>Reservation Amount:</strong> ${amount}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
        <CTAButton href={paymentLink} color="coral">
          Complete Reservation Payment
        </CTAButton>
      </Section>

      {/* Supporting Info */}
      <Section>
        <Text style={{ fontSize: '14px', color: theme.colors.muted, lineHeight: theme.font.lineHeight, marginBottom: theme.spacing.md }}>
          <strong>What happens next?</strong><br />
          • Complete your reservation payment (secure and quick!)<br />
          • Receive waiver and safety information emails<br />
          • Get ready for an amazing gymnastics adventure!
        </Text>
        <Hr style={{ borderColor: theme.colors.border, margin: `${theme.spacing.lg} 0` }} />
        <Text style={{ fontSize: '14px', color: theme.colors.muted, lineHeight: theme.font.lineHeight }}>
          Questions? Reply to this email or text Coach Will.
          <br /><br />
          We can’t wait to see {athleteName} shine!
          <br /><br />
          Coach Will<br />
          CoachWillTumbles.com
        </Text>
      </Section>
    </EmailLayout>
  );
}