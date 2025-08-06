import { Img } from '@react-email/components';

interface EmailLogoProps {
  logoUrl?: string;
  width?: string | number;
  height?: string | number;
}

export function EmailLogo({
  logoUrl = 'https://storage.googleapis.com/coach-will-tumbles/CoachWillTumblesText.png',
  width = 300,
  height = 85,
}: EmailLogoProps) {
  return (
    <Img
      src={logoUrl}
      width={width}
      height={height}
      alt="Coach Will Tumbles Logo"
      style={{
        display: 'block',
        margin: '0 auto',
        marginBottom: '20px',
      }}
    />
  );
}
