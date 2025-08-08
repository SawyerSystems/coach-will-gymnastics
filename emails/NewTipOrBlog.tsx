import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { CTAButton } from './components/CTAButton';
import { theme } from './components/theme';

export function NewTipOrBlog({ blogTitle, blogLink, logoUrl }: { blogTitle: string; blogLink: string; logoUrl?: string }) {
  return (
    <EmailLayout logoUrl={logoUrl} title="✨ New Tip Unlocked!">
      <Text style={{ color: theme.colors.text }}>
        {blogTitle} is now live on the Tumbleverse journal. Time to level up your training knowledge.
      </Text>
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <CTAButton href={blogLink} color="primary">View the Tip</CTAButton>
      </div>
      <Text style={{ color: theme.colors.muted }}>
        Want more like this? Reply and tell us what you're training!
      </Text>
    </EmailLayout>
  );
}