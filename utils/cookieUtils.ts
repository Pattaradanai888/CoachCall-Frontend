/**
 * Utility functions for cookie management
 */

/**
 * Checks if a specific cookie exists and logs its value
 * Use this for debugging cookie-related issues
 * 
 * @param cookieName The name of the cookie to check
 * @returns True if the cookie exists, false otherwise
 */
export function checkCookie(cookieName: string): boolean {
  if (import.meta.client) {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        console.log(`Cookie ${cookieName} exists with value: ${value}`);
        return true;
      }
    }
    console.log(`Cookie ${cookieName} does not exist`);
    return false;
  }
  return false;
}

/**
 * Forcefully clears a specific cookie by setting its expiration to the past
 * This attempts various domain combinations to ensure the cookie is cleared
 * 
 * @param cookieName The name of the cookie to clear
 */
export function clearCookie(cookieName: string): void {
  if (import.meta.client) {
    // Try multiple domain variations to ensure cookie is cleared
    const domains = [
      '', // current domain only
      window.location.hostname,
      `.${window.location.hostname}`, // include subdomains
    ];
    
    for (const domain of domains) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; ${domain ? `domain=${domain};` : ''} secure; samesite=lax`;
    }
    
    console.log(`Attempted to clear cookie: ${cookieName}`);
  }
}

/**
 * This function can be added to your auth store logout to debug cookies
 */
export function debugLogoutCookies(): void {
  if (import.meta.client) {
    console.log('=== DEBUG COOKIES DURING LOGOUT ===');
    console.log('All cookies:', document.cookie);
    checkCookie('refresh_token');
    
    // Try to inspect localStorage as well in case tokens are stored there
    try {
      const localStorageItems = Object.keys(localStorage);
      console.log('LocalStorage items:', localStorageItems);
    } catch {
      // Ignore any errors accessing localStorage (could happen in some browsers with privacy settings)
      console.log('Unable to access localStorage');
    }
    console.log('================================');
  }
}
