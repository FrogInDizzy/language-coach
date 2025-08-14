/**
 * User utility functions for parsing names and profile data
 */

export interface ParsedUserName {
  firstName: string;
  lastName?: string;
  displayName: string;
}

/**
 * Parse user name from email or user metadata
 */
export function parseUserName(
  email?: string, 
  fullName?: string,
  firstName?: string,
  lastName?: string
): ParsedUserName {
  // If we have explicit first/last name, use those
  if (firstName?.trim()) {
    return {
      firstName: firstName.trim(),
      lastName: lastName?.trim(),
      displayName: firstName.trim()
    };
  }

  // If we have a full name, try to parse it
  if (fullName?.trim()) {
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
    if (nameParts.length >= 2) {
      return {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' '),
        displayName: nameParts[0]
      };
    } else if (nameParts.length === 1) {
      return {
        firstName: nameParts[0],
        displayName: nameParts[0]
      };
    }
  }

  // Fall back to parsing email
  if (email) {
    const username = email.split('@')[0];
    
    // Try to parse common email patterns
    const cleanedUsername = username
      .replace(/[._-]/g, ' ')  // Replace dots, underscores, hyphens with spaces
      .replace(/\d+/g, '')     // Remove numbers
      .trim();

    if (cleanedUsername) {
      const nameParts = cleanedUsername.split(' ').filter(part => part.length > 0);
      if (nameParts.length >= 2) {
        // Capitalize each part
        const firstName = capitalize(nameParts[0]);
        const lastName = nameParts.slice(1).map(capitalize).join(' ');
        return {
          firstName,
          lastName,
          displayName: firstName
        };
      } else if (nameParts.length === 1) {
        const firstName = capitalize(nameParts[0]);
        return {
          firstName,
          displayName: firstName
        };
      }
    }

    // Last resort: use the raw username
    const fallbackName = capitalize(username.replace(/[._-]/g, ''));
    return {
      firstName: fallbackName,
      displayName: fallbackName
    };
  }

  // Ultimate fallback
  return {
    firstName: 'there',
    displayName: 'there'
  };
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Get greeting based on time of day
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Get welcome back vs first time greeting
 */
export function getWelcomeMessage(isNewUser: boolean, firstName: string): string {
  if (isNewUser) {
    return `Welcome to Language Coach, ${firstName}!`;
  }
  return `Welcome back, ${firstName}!`;
}