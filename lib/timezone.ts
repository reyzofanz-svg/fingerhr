/**
 * Timezone utilities for FingerHR
 * Handles WIB (Asia/Jakarta) timezone consistently
 */

export const WIB_TIMEZONE = 'Asia/Jakarta';

/**
 * Get current time in WIB timezone
 * More robust approach - calculate WIB time directly
 */
export function getCurrentWIBTime(): Date {
  const now = new Date();
  // Get current UTC time and add 7 hours for WIB
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const wibTime = new Date(utcTime + (7 * 60 * 60 * 1000));
  return wibTime;
}

/**
 * Convert any date to WIB timezone  
 * More robust approach - calculate WIB time directly
 */
export function toWIBTime(date: Date): Date {
  const utcTime = date.getTime() + (date.getTimezoneOffset() * 60000);
  const wibTime = new Date(utcTime + (7 * 60 * 60 * 1000));
  return wibTime;
}

/**
 * Format time in WIB timezone (HH:mm format)
 */
export function formatWIBTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('id-ID', {
    hour: '2-digit',
    minute: '2-digit', 
    timeZone: WIB_TIMEZONE,
    hour12: false
  }).format(dateObj);
}

/**
 * Format date in WIB timezone (dd/mm/yyyy format)
 */
export function formatWIBDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: WIB_TIMEZONE
  }).format(dateObj);
}

/**
 * Format full datetime in WIB timezone
 */
export function formatWIBDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: WIB_TIMEZONE,
    hour12: false
  }).format(dateObj);
}

/**
 * Get WIB date string for database grouping (YYYY-MM-DD)
 */
export function getWIBDateString(date: Date): string {
  const wibDate = toWIBTime(date);
  return wibDate.toISOString().split('T')[0];
}