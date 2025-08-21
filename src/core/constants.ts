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
  /** Path for retrieving all media results */
  ALL_MEDIA_RESULTS: '/api/v2/media/users/pages',
  /** Path for uploading social media */
  SOCIAL_MEDIA: '/api/files/social',
};

export const SUPPORTED_FILE_TYPES = [
  { extensions: ['.mp4', '.mov'], size_limit: 262144000 },
  { extensions: ['.jpg', '.png', '.jpeg', '.gif', '.webp'], size_limit: 52428800 },
  {
    extensions: ['.flac', '.wav', '.mp3', '.m4a', '.aac', '.alac', '.ogg'],
    size_limit: 20971520,
  },
  { extensions: ['.txt'], size_limit: 5242880 },
];
