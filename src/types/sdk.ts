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
 * Options for uploading social media
 */
export interface SocialUploadOptions {
  /** Social media link */
  socialLink: string;
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
  mediaId?: string;
}

export interface DetectionResult {
  /** The request ID that initiated the detection process */
  requestId: string;
  /** Overall status determination (e.g., "MANIPULATED", "AUTHENTIC") */
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
  /**
   * Pre-signed heatmap URLs for IMAGE media, keyed by model name.
   * Only non-ensemble models with API status FAKE. Null when none apply.
   */
  heatmaps: Record<string, string> | null;
}

/** Label values accepted by the user feedback API */
export type FeedbackLabel = 'REAL' | 'SYNTHETIC' | 'MANIPULATED' | 'UNKNOWN';

/** Feedback category values for the user feedback API */
export type UserFeedbackCategory =
  | 'FALSE_POSITIVE'
  | 'FALSE_NEGATIVE'
  | 'CONFIRMATION'
  | 'OTHER';

/**
 * Payload for {@link RealityDefender.createUserFeedback | createUserFeedback}
 */
export interface CreateUserFeedbackOptions {
  /** Media result ID (same as detection request ID) */
  requestId: string;
  /** Your judgment of the content */
  label: FeedbackLabel;
  /** Reason for flagging feedback */
  feedbackCategory: UserFeedbackCategory;
  /** Optional explanation */
  comment?: string;
}

/**
 * Record returned when user feedback is created successfully (`201`).
 * The server always returns `id` and `requestId` for the created resource.
 * Other fields may be omitted depending on profile, stored result, or whether a `comment` was sent (e.g. `text`).
 */
export interface UserFeedback {
  id: string;
  requestId: string;
  userId?: string;
  institutionId?: string;
  text?: string;
  category?: UserFeedbackCategory;
  userName?: string;
  userEmail?: string;
  orgName?: string;
  mediaType?: string;
  mediaViewUrl?: string;
  mediaSource?: string;
  label?: FeedbackLabel;
  createdAt?: string;
}

export interface DetectionResultList {
  /** Total number of detection results **/
  totalItems: number;

  /** Number of detection results on the current page **/
  currentPageItemsCount: number;

  /** Total number of pages **/
  totalPages: number;

  /** Current page number **/
  currentPage: number;

  /** List of detection results **/
  items: DetectionResult[];
}
