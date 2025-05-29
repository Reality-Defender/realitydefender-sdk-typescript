/**
 * Async utilities for the SDK
 */

/**
 * Sleep for a specified duration
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after the specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
