import React from 'react';
import { Text } from '@react-email/components';
import { EmailLayout } from './components/EmailLayout';
import { theme } from './components/theme';
import { EmailFooter } from './components/EmailFooter';
import { formatTime } from './utils/timeFormat';

export const SUBJECT = 'We missed you at your session';
export const PREHEADER = 'No worries — let\'s get you rescheduled for your next tumbling adventure.';

export function SessionNoShow({ 
  parentName, 
  rescheduleLink,
  sessionDate,
  sessionTime,
  athleteNames,
  lessonType
}: { 
  parentName: string; 
  rescheduleLink: string;
  sessionDate?: string;
  sessionTime?: string;
  athleteNames?: string[];
  lessonType?: string;
}) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <EmailLayout title="🤸 We Missed You!" preheader={PREHEADER}>
      <Text style={{ color: theme.colors.text }}>Hi {parentName},</Text>
      
      {sessionDate && sessionTime && (
        <>
          <Text style={{ color: theme.colors.text, fontWeight: 'bold', marginBottom: '8px' }}>
            We missed you at your session:
          </Text>
          <div style={{ 
            backgroundColor: '#fff3cd', 
            border: '1px solid #ffeaa7', 
            borderRadius: '8px', 
            padding: '16px', 
            margin: '16px 0' 
          }}>
            <Text style={{ color: theme.colors.text, margin: '0 0 8px 0', fontSize: '16px' }}>
              📅 <strong>{formatDate(sessionDate)}</strong>
            </Text>
            <Text style={{ color: theme.colors.text, margin: '0 0 8px 0', fontSize: '16px' }}>
              ⏰ <strong>{formatTime(sessionTime)}</strong>
            </Text>
            {athleteNames && athleteNames.length > 0 && (
              <Text style={{ color: theme.colors.text, margin: '0 0 8px 0', fontSize: '16px' }}>
                👤 <strong>{athleteNames.join(', ')}</strong>
              </Text>
            )}
            {lessonType && (
              <Text style={{ color: theme.colors.text, margin: '0', fontSize: '16px' }}>
                🎯 <strong>{lessonType}</strong>
              </Text>
            )}
          </div>
        </>
      )}
      
      <Text style={{ color: theme.colors.text }}>
        I totally understand that life happens! No worries at all — let's get you rescheduled so we can continue the tumbling fun.
      </Text>
      
      <Text style={{ color: theme.colors.text }}>
        I've got plenty of availability next week and beyond, so we'll find a perfect time that works for your schedule.
      </Text>
      
      <div style={{ textAlign: 'center', margin: `${theme.spacing.lg} 0` }}>
        <a
          href={rescheduleLink}
          style={{
            display: 'inline-block',
            backgroundColor: theme.colors.primary,
            color: '#FFFFFF',
            padding: '12px 24px',
            borderRadius: '6px',
            textDecoration: 'none',
            fontSize: '16px',
            fontWeight: 'bold',
          }}
        >
          Reschedule Your Session
        </a>
      </div>
      
      <Text style={{ color: theme.colors.muted }}>
        Have questions or need help finding a time? Just reply to this email and I'll personally help you get back on track!
      </Text>

      <EmailFooter />
    </EmailLayout>
  );
}
