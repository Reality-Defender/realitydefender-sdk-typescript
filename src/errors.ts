/**
 * Error types and classes for the Reality Defender SDK
 */

/**
 * Error codes returned by the SDK
 */
export type ErrorCode =
  /** Invalid or missing API key */
  | 'unauthorized'
  /** Invalid request parameters or format */
  | 'invalid_request'
  /** Server-side error occurred */
  | 'server_error'
  /** Operation timed out */
  | 'timeout'
  /** File not found or invalid format */
  | 'invalid_file'
  /**  File too large to upload. */
  | 'file_too_large'
  /** Failed to upload the file */
  | 'upload_failed'
  /** Requested resource not found */
  | 'not_found'
  /** Unexpected error */
  | 'unknown_error';

/**
 * Custom error class for Reality Defender SDK errors
 */
export class RealityDefenderError extends Error {
  /**
   * Error code indicating the type of error
   */
  code: ErrorCode;

  /**
   * Creates a new SDK error
   * @param message Human-readable error message
   * @param code Machine-readable error code
   */
  constructor(message: string, code: ErrorCode) {
    super(message);
    this.code = code;
    this.name = 'RealityDefenderError';

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, RealityDefenderError.prototype);
  }
}
