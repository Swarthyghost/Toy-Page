import { Timestamp } from 'firebase/firestore';

/**
 * Safely parses any date input (Timestamp, Date, ISO string, YYYY-MM-DD string, or number)
 * into a valid JavaScript Date object in local time, without timezone shifts.
 */
export function toLocalDate(input: any): Date {
  if (input === null || input === undefined) {
    return new Date();
  }

  // If it's a Firestore Timestamp
  if (input instanceof Timestamp || (input && typeof input.toDate === 'function')) {
    return input.toDate();
  }

  // If it's a Firestore Timestamp serialized across a Server/Client Component
  // boundary (plain object of shape { seconds, nanoseconds }, no toDate method)
  if (input && typeof input === 'object' && typeof input.seconds === 'number') {
    const ms = input.seconds * 1000 + Math.round((input.nanoseconds || 0) / 1e6);
    const d = new Date(ms);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  // If it's already a JS Date
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? new Date() : input;
  }

  // If it's a number (milliseconds timestamp)
  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  // If it's a string
  if (typeof input === 'string') {
    const cleaned = input.trim();
    if (!cleaned) return new Date();

    // Check if it's YYYY-MM-DD format (like "2026-08-06")
    const yyyymmddRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
    const match = cleaned.match(yyyymmddRegex);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // 0-indexed
      const day = parseInt(match[3], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) {
        return date;
      }
    }

    // Try standard ISO-8601 / other parsing
    const ms = Date.parse(cleaned);
    if (!isNaN(ms)) {
      return new Date(ms);
    }

    // Attempt direct constructor fallback
    const d = new Date(cleaned);
    if (!isNaN(d.getTime())) {
      return d;
    }
  }

  console.warn("[dateHelper] Invalid or unrecognized date input:", input);
  return new Date();
}

/**
 * Formats a Date (or any date input) to YYYY-MM-DD string using LOCAL time components
 * to prevent any timezone shifts.
 */
export function formatLocalDateToYYYYMMDD(input: any): string {
  try {
    const d = toLocalDate(input);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (err) {
    console.error("[dateHelper] Error formatting local date:", err);
    return new Date().toISOString().substring(0, 10);
  }
}

/**
 * Formats a Date (or any date input) to a localized display string using local time
 * e.g., "Aug 6, 2026, 10:57 AM" or "Aug 6, 10:57 AM"
 */
export function formatLocalDateForDisplay(input: any, includeYear: boolean = true): string {
  try {
    const d = toLocalDate(input);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    
    if (includeYear) {
      return `${month} ${day}, ${year}, ${hoursStr}:${minutes} ${ampm}`;
    }
    return `${month} ${day}, ${hoursStr}:${minutes} ${ampm}`;
  } catch (err) {
    console.error("[dateHelper] Error formatting display date:", err);
    return 'Invalid Date';
  }
}
