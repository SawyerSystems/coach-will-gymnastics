import React from 'react';
import { Html, Head, Body, Container, Section, Text, Hr } from '@react-email/components';
import { EmailLogo } from './EmailLogo';
import { theme } from './theme';

interface EmailLayoutProps {
  children: React.ReactNode;
  logoUrl?: string;
  title?: string;
}

export function EmailLayout({ children, logoUrl, title }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: theme.font.family, backgroundColor: theme.colors.surface, margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '640px', margin: '0 auto', backgroundColor: theme.colors.bg, padding: theme.spacing.lg }}>
          <Section style={{ textAlign: 'center', marginBottom: theme.spacing.lg }}>
            <EmailLogo logoUrl={logoUrl || theme.logoUrl} />
            {title ? (
              <Text style={{
                margin: 0,
                fontSize: '22px',
                fontWeight: 700,
                color: theme.colors.primary,
                letterSpacing: '0.2px',
              }}>{title}</Text>
            ) : null}
          </Section>
          <Section>
            {children}
          </Section>
          <Hr style={{ borderColor: theme.colors.border, margin: `${theme.spacing.lg} 0` }} />
          <Section style={{ textAlign: 'center' }}>
            <Text style={{ color: theme.colors.muted, fontSize: '12px', margin: 0 }}>
              CoachWillTumbles.com • Adventure in Every Tumble
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
