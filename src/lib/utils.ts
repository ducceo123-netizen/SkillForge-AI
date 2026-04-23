/**
 * Formats a Firestore Timestamp or a Date string into a human-readable format.
 * @param timestamp - The timestamp to format (Firestore Timestamp object or string/Date)
 * @returns A formatted date string
 */
export function formatDate(timestamp: any): string {
  if (!timestamp) return 'Just now';
  
  // Handle Firestore Timestamp object
  if (typeof timestamp === 'object' && timestamp.seconds !== undefined) {
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
  
  // Handle string or Date object
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return String(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch (e) {
    return String(timestamp);
  }
}

/**
 * Combines multiple class names into a single string.
 */
export function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
