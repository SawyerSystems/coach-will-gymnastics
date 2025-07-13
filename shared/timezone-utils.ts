/**
 * Pacific Timezone Utilities for CoachWillTumbles.com
 * Provides consistent Pacific Time (PST/PDT) handling across the platform
 */

const PACIFIC_TIMEZONE = 'America/Los_Angeles';

/**
 * Formats a Date object to Pacific Time string
 * @param date - Date object to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string in Pacific Time
 */
export function formatToPacificTime(date: Date, options?: Intl.DateTimeFormatOptions): string {
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    timeZone: PACIFIC_TIMEZONE,
    dateStyle: 'medium',
    timeStyle: 'short'
  };

  return date.toLocaleString('en-US', { ...defaultOptions, ...options });
}

/**
 * Formats a Date object to Pacific Time date string (no time)
 * @param date - Date object to format
 * @returns Date string in Pacific Time (e.g., "Jul 6, 2025")
 */
export function formatToPacificDate(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleDateString('en-US', {
    timeZone: PACIFIC_TIMEZONE,
    dateStyle: 'medium'
  });
}

/**
 * Formats a Date object to ISO date string in Pacific Time
 * @param date - Date object to format
 * @returns ISO date string (YYYY-MM-DD) in Pacific Time
 */
export function formatToPacificISO(date: Date): string {
  if (!date || isNaN(date.getTime())) {
    return '';
  }

  // Create a new date in Pacific timezone
  const pacificDate = new Date(date.toLocaleString('en-US', { timeZone: PACIFIC_TIMEZONE }));
  
  // Return YYYY-MM-DD format
  return pacificDate.toISOString().split('T')[0];
}

/**
 * Formats a time string to HH:MM format
 * @param timeString - Time string to format
 * @returns Formatted time string (HH:MM)
 */
export function formatTimeToHHMM(timeString: string): string {
  if (!timeString) return '';
  
  // If already in HH:MM format, return as is
  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // If in HH:MM:SS format, strip seconds
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeString)) {
    return timeString.substring(0, 5);
  }
  
  return timeString;
}

/**
 * Parses a published_at timestamp from database to Pacific Time
 * @param publishedAt - Published timestamp from database
 * @returns Formatted Pacific Time string
 */
export function formatPublishedAtToPacific(publishedAt: string | Date): string {
  if (!publishedAt) return 'Invalid Date';
  
  try {
    const date = typeof publishedAt === 'string' ? new Date(publishedAt) : publishedAt;
    return formatToPacificTime(date, {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  } catch (error) {
    console.error('Error formatting published_at:', error);
    return 'Invalid Date';
  }
}

/**
 * Creates a Date object in Pacific timezone for today
 * @returns Date object representing today in Pacific Time
 */
export function getTodayInPacific(): Date {
  const now = new Date();
  const pacificTimeString = now.toLocaleString('en-US', { timeZone: PACIFIC_TIMEZONE });
  return new Date(pacificTimeString);
}

/**
 * Checks if a date is today in Pacific timezone
 * @param date - Date to check
 * @returns True if the date is today in Pacific Time
 */
export function isTodayInPacific(date: Date): boolean {
  const today = getTodayInPacific();
  const checkDate = new Date(date.toLocaleString('en-US', { timeZone: PACIFIC_TIMEZONE }));
  
  return today.toDateString() === checkDate.toDateString();
}

/**
 * Converts a database timestamp to Pacific timezone for API responses
 * @param timestamp - Database timestamp
 * @returns Object with formatted date and time in Pacific timezone
 */
export function convertDBTimestampToPacific(timestamp: string | Date) {
  if (!timestamp) return { date: '', time: '', full: 'Invalid Date' };
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    
    return {
      date: formatToPacificDate(date),
      time: formatToPacificTime(date, { timeStyle: 'short' }),
      full: formatToPacificTime(date),
      iso: formatToPacificISO(date)
    };
  } catch (error) {
    console.error('Error converting timestamp:', error);
    return { date: '', time: '', full: 'Invalid Date', iso: '' };
  }
}