import React from 'react';

export function EmailHeader({ logoUrl }: { logoUrl: string }) {
  return (
    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
      <a href="https://coachwilltumbles.com" style={{ display: 'inline-block' }}>
        <img
          src={logoUrl}
          alt="Coach Will Tumbles Logo"
          style={{ width: '150px', height: 'auto' }}
        />
      </a>
    </div>
  );
}
