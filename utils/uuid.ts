/**
 * Cross-browser UUID generation utility
 * Provides a fallback for browsers that don't support crypto.randomUUID()
 */

/**
 * Generates a v4 UUID with fallback for older browsers
 * @returns A RFC 4122 compliant v4 UUID string
 */
export function generateUUID(): string {
  // Try native crypto.randomUUID first (most secure and compliant)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (error) {
      console.warn('crypto.randomUUID failed, falling back to manual generation');
    }
  }

  // Fallback: Manual v4 UUID generation using crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 2);
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // Last resort: Math.random based UUID (less secure but works everywhere)
  console.warn('crypto API not available, using Math.random for UUID generation');
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Validates if a string is a valid UUID format
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * @deprecated Use generateUUID() instead
 * Legacy compatibility function
 */
export const uuid = generateUUID;