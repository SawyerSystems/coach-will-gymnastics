/**
 * Calculate age from date of birth string in YYYY-MM-DD format
 * Handles timezone issues by parsing the date components directly
 */
export function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const [year, month, day] = dateOfBirth.split('-').map(Number);
  
  let age = today.getFullYear() - year;
  const monthDiff = today.getMonth() + 1 - month; // getMonth() is 0-based
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < day)) {
    age--;
  }
  
  return age;
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-based in Date constructor
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}