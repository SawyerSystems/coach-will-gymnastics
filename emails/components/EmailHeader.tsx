import React from 'react';

export function EmailHeader({ logoUrl }: { logoUrl?: string }) {
  // Use a more reliable logo URL - either provided or default to CoachWillTumbles text logo
  const defaultLogoUrl = 'https://coachwilltumbles.com/assets/CoachWillTumblesText.png';
  
  return (
    <div style={{ textAlign: 'left', marginBottom: '20px' }}>
      <a href="https://coachwilltumbles.com" style={{ display: 'inline-block' }}>
        <img
          src={logoUrl || defaultLogoUrl}
          alt="Coach Will Tumbles Logo"
          style={{ width: '150px', height: 'auto' }}
          onError={(e) => {
            // Fallback to text if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const textNode = document.createElement('div');
            textNode.innerHTML = '<strong style="color: #0F0276; font-size: 18px;">CoachWillTumbles.com</strong>';
            target.parentNode?.appendChild(textNode);
          }}
        />
      </a>
    </div>
  );
}
