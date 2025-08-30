import React from 'react';

export interface EmailFooterProps {
  contactEmail?: string;
  contactPhone?: string;
}

export function EmailFooter({ 
  contactEmail = "admin@coachwilltumbles.com",
  contactPhone = "(585) 755-8122"
}: EmailFooterProps) {
  return (
    <div style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5', marginTop: '30px' }}>
      <p style={{ margin: 0 }}>Coach Will</p>
      <p style={{ margin: 0 }}>CoachWillTumbles.com</p>
      <p style={{ margin: 0 }}>📧 {contactEmail}</p>
      <p style={{ margin: 0 }}>📱 Text: {contactPhone}</p>
    </div>
  );
}
