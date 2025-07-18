/**
 * Reality Defender SDK
 * Client library for deepfake detection using the Reality Defender API
 */

import { sleep } from './utils/async';
import { createHttpClient } from './client';
import { DEFAULT_POLLING_INTERVAL, DEFAULT_TIMEOUT } from './core/constants';
import { TypedEventEmitter } from './core/events';
import { uploadFile as internalUploadFile } from './detection/upload';
import {
  getDetectionResult as internalGetDetectionResult,
  getDetectionResults,
} from './detection/results';
import { RealityDefenderError } from './errors';

// Import types from the types directory
import {
  DetectionResult,
  DetectionResultList,
  GetResultOptions,
  RealityDefenderConfig,
  UploadOptions,
  UploadResult,
} from './types';

/**
 * Main SDK class for interacting with the Reality Defender API
 */
export class RealityDefender extends TypedEventEmitter {
  private readonly apiKey: string;
  private readonly client: ReturnType<typeof createHttpClient>;

  /**
   * Creates a new Reality Defender SDK instance
   * @param config Configuration options
   */
  constructor(config: RealityDefenderConfig) {
    super();

    if (!config.apiKey) {
      throw new RealityDefenderError('API key is required', 'unauthorized');
    }

    this.apiKey = config.apiKey;
    this.client = createHttpClient({
      apiKey: this.apiKey,
      baseUrl: config.baseUrl,
    });
  }

  /**
   * Upload a file to Reality Defender for analysis
   *
   * @param options Upload options including file path
   * @returns Promise with the request ID
   */
  public async upload(options: UploadOptions): Promise<UploadResult> {
    try {
      // Upload the file and get tracking IDs
      return await internalUploadFile(this.client, options);
    } catch (error) {
      if (error instanceof RealityDefenderError) {
        throw error;
      }
      throw new RealityDefenderError(`Upload failed: ${(error as Error).message}`, 'upload_failed');
    }
  }

  /**
   * Get the detection result for a specific request ID
   *
   * @param requestId The request ID to get results for
   * @param options Optional parameters for polling
   * @returns Promise with the detection result
   */
  public async getResult(
    requestId: string,
    options: GetResultOptions = {}
  ): Promise<DetectionResult> {
    return internalGetDetectionResult(this.client, requestId, options);
  }

  /**
   * Retrieves a paginated list of detection results based on the specified parameters.
   *
   * @param {number} pageNumber - The page number to retrieve. Defaults to 0.
   * @param {number} size - The number of results per page. Defaults to 10.
   * @param {string | null} name - An optional name filter for the results. Pass null to ignore this filter.
   * @param {Date | null} startDate - The start date to filter the results. Pass null to ignore this filter.
   * @param {Date | null} endDate - The end date to filter the results. Pass null to ignore this filter.
   * @param {GetResultOptions} options - Optional additional options for customizing the results.
   * @return {Promise<DetectionResult>} A Promise that resolves to the detection results.
   */
  public async getResults(
    pageNumber: number = 0,
    size: number = 10,
    name: string | null = null,
    startDate: Date | null = null,
    endDate: Date | null = null,
    options: GetResultOptions = {}
  ): Promise<DetectionResultList> {
    return getDetectionResults(this.client, pageNumber, size, name, startDate, endDate, options);
  }

  /**
   * Upload a file and get detection results in a single operation
   *
   * @param options Upload options including file path
   * @param resultOptions Optional parameters for polling results
   * @returns Promise with the detection result
   */
  public async detect(
    options: UploadOptions,
    resultOptions: GetResultOptions = {}
  ): Promise<DetectionResult> {
    // First upload the file
    const uploadResult = await this.upload(options);

    // Then get the results using the request ID from the upload
    return this.getResult(uploadResult.requestId, resultOptions);
  }

  /**
   * Start polling for results with event-based callback
   *
   * @param requestId The request ID to poll for
   * @param options Polling configuration options
   * @returns Promise that resolves when polling completes (for testing purposes)
   */
  public pollForResults(
    requestId: string,
    options: { pollingInterval?: number; timeout?: number } = {}
  ): Promise<void> {
    const { pollingInterval = DEFAULT_POLLING_INTERVAL, timeout = DEFAULT_TIMEOUT } = options;

    return this._pollForResults(requestId, pollingInterval, timeout);
  }

  /**
   * Internal implementation of polling for results
   * @returns Promise that resolves when polling completes (for testing purposes)
   */
  private async _pollForResults(
    requestId: string,
    pollingInterval: number,
    timeout: number
  ): Promise<void> {
    let elapsed = 0;
    const maxWaitTime = timeout;

    // Use a flag to track if we've already emitted a result
    let isCompleted = false;

    // Check if timeout is already zero/expired before starting
    if (timeout <= 0) {
      this.emit('error', new RealityDefenderError('Polling timeout exceeded', 'timeout'));
      return;
    }

    // Create a polling loop that uses await instead of setTimeout
    while (!isCompleted && elapsed < maxWaitTime) {
      try {
        // Use the built-in polling mechanism with just a single attempt per call
        const result = await this.getResult(requestId);

        // If the status is still ANALYZING and we haven't exceeded the timeout,
        // continue polling after a delay
        if (result.status === 'ANALYZING') {
          elapsed += pollingInterval;
          await sleep(pollingInterval);
        } else {
          // We have a final result
          isCompleted = true;
          this.emit('result', result);
        }
      } catch (error) {
        if (error instanceof RealityDefenderError && error.code === 'not_found') {
          // Result not ready yet, continue polling if we haven't exceeded the timeout
          elapsed += pollingInterval;
          await sleep(pollingInterval);
        } else {
          // Any other error is emitted and polling stops
          isCompleted = true;
          this.emit('error', error as RealityDefenderError);
        }
      }
    }

    // Check if we timed out
    if (!isCompleted && elapsed >= maxWaitTime) {
      this.emit('error', new RealityDefenderError('Polling timeout exceeded', 'timeout'));
    }
  }
}

// Export necessary types for consumer use
export {
  RealityDefenderConfig,
  UploadOptions,
  UploadResult,
  DetectionResult,
  GetResultOptions,
  DetectionOptions,
} from './types/sdk';

// Export error classes and types
export { RealityDefenderError, ErrorCode } from './errors';
