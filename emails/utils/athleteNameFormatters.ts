/**
 * Utility functions for formatting athlete names in emails
 */

/**
 * Simple list format for admin emails: "John Smith, Jane Doe"
 */
export function formatAthleteList(names?: string[]): string {
  if (!names || names.length === 0) return 'Not specified';
  return names.join(', ');
}

/**
 * Possessive format for parent emails: "John's", "John and Jane's", "John, Jane, and Mike's"
 */
export function formatAthletePossessive(names?: string[]): string {
  if (!names || names.length === 0) return "Your";
  
  // Extract first names from full names (in case they're provided as "First Last")
  const firstNames = names.map(name => name.split(' ')[0]);
  
  if (firstNames.length === 1) {
    return `${firstNames[0]}'s`;
  } else if (firstNames.length === 2) {
    return `${firstNames[0]} and ${firstNames[1]}'s`;
  } else {
    // For 3+ athletes, use "FirstName, SecondName, and ThirdName's"
    const lastIndex = firstNames.length - 1;
    const allButLast = firstNames.slice(0, lastIndex).join(', ');
    return `${allButLast}, and ${firstNames[lastIndex]}'s`;
  }
}

/**
 * First names only for casual context: "John", "John and Jane", "John, Jane, and Mike"
 */
export function formatAthleteFirstNames(names?: string[]): string {
  if (!names || names.length === 0) return 'your athlete';
  
  const firstNames = names.map(name => name.split(' ')[0]);
  
  if (firstNames.length === 1) {
    return firstNames[0];
  } else if (firstNames.length === 2) {
    return `${firstNames[0]} and ${firstNames[1]}`;
  } else {
    const lastIndex = firstNames.length - 1;
    const allButLast = firstNames.slice(0, lastIndex).join(', ');
    return `${allButLast}, and ${firstNames[lastIndex]}`;
  }
}
