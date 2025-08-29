/**
 * Convert 24-hour time format to 12-hour format with AM/PM
 * @param time24 - Time in 24-hour format (e.g., "14:30", "09:00")
 * @returns Time in 12-hour format (e.g., "2:30 PM", "9:00 AM")
 */
export function formatTime(time24?: string): string {
  if (!time24 || time24 === 'TBD') {
    return time24 || '';
  }

  try {
    // Handle both "HH:mm" and "HH:mm:ss" formats
    const [hourStr, minuteStr] = time24.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);

    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      return time24; // Return original if invalid
    }

    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, '0');

    return `${displayHour}:${displayMinute} ${period}`;
  } catch (error) {
    // If parsing fails, return the original time
    return time24;
  }
}
