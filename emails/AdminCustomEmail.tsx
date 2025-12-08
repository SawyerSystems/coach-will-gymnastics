import * as React from 'react';

// AdminCustomEmail: Branded simple layout for custom broadcasts
// Reuses site logo URL and contact info passed in via email.ts sendEmail helper (logoUrl, contactEmail, contactPhone)
// Assumptions: This follows styling conventions used by other email components in `emails/`.

type Props = {
  logoUrl?: string;
  subject: string;
  greetingLine?: string; // e.g., "Hi Sarah," or generic
  bodyText: string;      // plain text from admin
  contactEmail?: string;
  contactPhone?: string;
};

export default function AdminCustomEmail({ logoUrl, subject, greetingLine, bodyText, contactEmail, contactPhone }: Props) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{subject}</title>
        <style>{`
          body { background: #f7f7fb; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; }
          .container { max-width: 640px; margin: 0 auto; padding: 24px; }
          .card { background: #ffffff; border-radius: 12px; box-shadow: 0 2px 12px rgba(17, 24, 39, 0.08); overflow: hidden; }
          .header { padding: 20px 24px; border-bottom: 1px solid #eef2ff; display: flex; align-items: center; gap: 12px; }
          .logo { height: 40px; width: 40px; border-radius: 100%; background: #eef2ff; display: inline-flex; align-items: center; justify-content: center; }
          .title { font-size: 18px; font-weight: 600; color: #0f172a; }
          .content { padding: 24px; line-height: 1.6; }
          .greeting { margin: 0 0 12px; font-size: 16px; }
          .body { white-space: pre-wrap; }
          .footer { padding: 16px 24px; border-top: 1px solid #eef2ff; font-size: 12px; color: #475569; }
          .contact { margin-top: 6px; }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="card">
            <div className="header">
              <div className="logo">
                {logoUrl ? (
                  <img src={logoUrl} alt="Coach Will Tumbles" height={40} width={40} style={{ borderRadius: 9999 }} />
                ) : (
                  <span style={{ fontWeight: 700, color: '#0F0276' }}>CWT</span>
                )}
              </div>
              <div className="title">{subject}</div>
            </div>
            <div className="content">
              {greetingLine ? <p className="greeting">{greetingLine}</p> : null}
              <div className="body">{bodyText}</div>
            </div>
            <div className="footer">
              <div>Sent by Coach Will Tumbles</div>
              {contactEmail || contactPhone ? (
                <div className="contact">
                  {contactEmail ? <div>Email: {contactEmail}</div> : null}
                  {contactPhone ? <div>Phone: {contactPhone}</div> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
