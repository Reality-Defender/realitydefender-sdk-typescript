/**
 * SDK-specific type definitions
 */

/**
 * Configuration options for the Reality Defender SDK
 */
export interface RealityDefenderConfig {
  /** API key for authentication */
  apiKey: string;
  /** Optional custom base URL for the API (defaults to production) */
  baseUrl?: string;
}

/**
 * Options for uploading media
 */
export interface UploadOptions {
  /** Path to the file to be analyzed */
  filePath: string;
}

/**
 * Options for retrieving results
 */
export interface GetResultOptions {
  /** Maximum number of polling attempts before returning even if still analyzing */
  maxAttempts?: number;
  /** Interval in milliseconds between polling attempts */
  pollingInterval?: number;
}

/**
 * Internal options for detection operations
 */
export interface DetectionOptions {
  /** Maximum number of polling attempts before returning even if still analyzing */
  maxAttempts: number;
  /** Interval in milliseconds between polling attempts */
  pollingInterval: number;
}

/**
 * Result of a successful upload
 */
export interface UploadResult {
  /** Request ID used to retrieve results */
  requestId: string;
  /** Media ID assigned by the system */
  mediaId: string;
}

/**
 * Detection result with status and scores
 */
export interface DetectionResult {
  /** Overall status determination (e.g., "ARTIFICIAL", "AUTHENTIC") */
  status: string;
  /** Confidence score (0-1 range, null if processing) */
  score: number | null;
  /** Results from individual detection models */
  models: {
    /** Model name */
    name: string;
    /** Model status determination */
    status: string;
    /** Model confidence score (0-1 range, null if not available) */
    score: number | null;
  }[];
}
