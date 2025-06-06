/**
 * Constants used throughout the SDK
 */

/**
 * Default base URL for the Reality Defender API
 */
export const DEFAULT_BASE_URL = 'https://api.prd.realitydefender.xyz';

/**
 * Default interval (in milliseconds) between polling attempts
 */
export const DEFAULT_POLLING_INTERVAL = 5000; // 5 seconds

/**
 * Default timeout (in milliseconds) for polling operations
 */
export const DEFAULT_TIMEOUT = 300000; // 5 minutes

/**
 * API paths
 */
export const API_PATHS = {
  /** Path for requesting a signed upload URL */
  SIGNED_URL: '/api/files/aws-presigned',
  /** Path for retrieving media results */
  MEDIA_RESULT: '/api/media/users',
};
