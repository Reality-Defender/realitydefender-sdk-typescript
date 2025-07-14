/**
 * API response types for the Reality Defender service
 */

/**
 * Response from the signed URL request
 */
export interface SignedUrlResponse {
  /** Status code from the API */
  code: string;
  /** Response containing the signed URL for upload */
  response: {
    /** URL where the file should be uploaded */
    signedUrl: string;
  };
  /** Error number (0 if successful) */
  errno: number;
  /** ID assigned to the media */
  mediaId: string;
  /** Request ID to track the analysis */
  requestId: string;
}

/**
 * Individual model analysis result
 */
export interface ModelResult {
  /** Name of the AI model used for analysis */
  name: string;
  /** Raw data from the model */
  data: {
    /** Raw confidence score */
    score?: number;
    /** Decision classification */
    decision?: string;
    /** Raw score value */
    raw_score?: number;
  } | null;
  /** Status code (e.g., "not_applicable") */
  code?: string;
  /** Status string (e.g., "MANIPULATED", "AUTHENTIC", "NOT_APPLICABLE") */
  status: string;
  /** Raw prediction number */
  predictionNumber: number | null;
  /** Normalized prediction value (0-100) */
  normalizedPredictionNumber: number | null;
  /** Rolling average if applicable */
  rollingAvgNumber: number | null;
  /** Final score for this model (0-100) */
  finalScore?: number | null;
}

/**
 * Summary of detection results
 */
export interface ResultsSummary {
  /** Overall status determination */
  status: string;
  /** Metadata about the analysis */
  metadata: {
    /** Final confidence score (0-100) */
    finalScore: number | null;
  };
}

/**
 * Complete media analysis response
 */
export interface MediaResponse {
  /** Name assigned to the media */
  name: string;
  /** Filename in the system */
  filename: string;
  /** Original filename that was uploaded */
  originalFileName: string;
  /** Request ID to track the analysis */
  requestId: string;
  /** Upload timestamp */
  uploadedDate: string;
  /** Type of media (IMAGE, VIDEO, etc.) */
  mediaType: string;
  /** Overall analysis status */
  overallStatus: string;
  /** Summary of results */
  resultsSummary: ResultsSummary;
  /** Individual model results */
  models: ModelResult[];
}
