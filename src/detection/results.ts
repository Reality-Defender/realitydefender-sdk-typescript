/**
 * Handling detection results
 */

import { HttpClient } from '../client/types';
import { API_PATHS, DEFAULT_POLLING_INTERVAL } from '../core/constants';
import { AllMediaResponse, MediaResponse } from '../types';
import { DetectionResult, DetectionOptions, DetectionResultList } from '../types';
import { RealityDefenderError } from '../errors';
import { sleep } from '../utils/async';

/**
 * Get the raw media result from the API
 * @param client HTTP client
 * @param requestId Request ID
 * @returns Raw media response
 */
export async function getMediaResult(
  client: HttpClient,
  requestId: string
): Promise<MediaResponse> {
  try {
    const path = `${API_PATHS.MEDIA_RESULT}/${requestId}`;
    return await client.get<MediaResponse>(path);
  } catch (error) {
    if (error instanceof RealityDefenderError) {
      throw error;
    }
    throw new RealityDefenderError(
      `Failed to get result: ${(error as Error).message}`,
      'unknown_error'
    );
  }
}

export async function getMediaResults(
  client: HttpClient,
  pageNumber: number = 0,
  size: number = 10,
  name: string | null = null,
  startDate: Date | null = null,
  endDate: Date | null = null
): Promise<AllMediaResponse> {
  try {
    const path = `${API_PATHS.ALL_MEDIA_RESULTS}/${pageNumber}`;
    const params: Record<string, unknown> = {
      size: size,
    };
    if (name) {
      params['name'] = name;
    }
    if (startDate) {
      params['startDate'] =
        `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`;
    }
    if (endDate) {
      params['endDate'] =
        `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`;
    }
    return await client.get<AllMediaResponse>(path, params);
  } catch (error) {
    if (error instanceof RealityDefenderError) {
      throw error;
    }
    throw new RealityDefenderError(
      `Failed to get paginated results: ${(error as Error).message}`,
      'unknown_error'
    );
  }
}

/**
 * Format the raw API response into a user-friendly result
 * @param response Raw API response
 * @returns Simplified detection result
 */
export function formatResult(response: MediaResponse): DetectionResult {
  // Extract active models (not NOT_APPLICABLE)
  const activeModels = response.models.filter(
    model => model.status !== 'NOT_APPLICABLE' && model.code !== 'not_applicable'
  );

  // Replace FAKE with MANIPULATED in response status
  const status =
    response.resultsSummary.status === 'FAKE'
      ? 'MANIPULATED'
      : response.resultsSummary.status;

  // Normalize the final score from 0-100 to 0-1 range
  const normalizedScore =
    response.resultsSummary.metadata.finalScore !== null
      ? response.resultsSummary.metadata.finalScore / 100
      : null;

  return {
    requestId: response.requestId,
    status: status,
    score: normalizedScore,
    models: activeModels.map(model => ({
      name: model.name,
      // Replace FAKE with MANIPULATED in model status
      status: model.status === 'FAKE' ? 'MANIPULATED' : model.status,
      // Score between 0-1 range or null if not available
      score: model.predictionNumber,
    })),
  };
}

/**
 * Format the all media API response into a user-friendly result
 * @param response Raw API response
 * @returns Simplified detection result list
 */
export function formatResults(response: AllMediaResponse): DetectionResultList {
  const result: DetectionResultList = {
    totalItems: response.totalItems ?? 0,
    currentPageItemsCount: response.currentPageItemsCount ?? 0,
    totalPages: response.totalPages ?? 0,
    currentPage: response.currentPage ?? 0,
    items: [],
  };

  if (response.mediaList) {
    for (const item of response.mediaList) {
      result.items.push(formatResult(item));
    }
  }

  return result;
}

/**
 * Get detection results for a media request
 * @param client HTTP client
 * @param requestId Request ID
 * @param options Detection options for polling configuration
 * @returns Detection results
 */
export async function getDetectionResult(
  client: HttpClient,
  requestId: string,
  options: Partial<DetectionOptions> = {}
): Promise<DetectionResult> {
  let attempts = 0;
  const {
    maxAttempts = Number.MAX_SAFE_INTEGER,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
  } = options;

  while (attempts < maxAttempts) {
    const mediaResult = await getMediaResult(client, requestId);

    // If the status is not ANALYZING, return the results immediately
    if (
      mediaResult.resultsSummary !== null &&
      mediaResult.resultsSummary?.status !== 'ANALYZING'
    ) {
      return formatResult(mediaResult);
    }

    // If we've reached the maximum attempts, return the results even if still analyzing
    if (++attempts >= maxAttempts) {
      return formatResult(mediaResult);
    }

    // Wait for the polling interval before trying again
    await sleep(pollingInterval);
  }

  // This should never be reached, but TypeScript needs it
  const mediaResult = await getMediaResult(client, requestId);
  return formatResult(mediaResult);
}

export async function getDetectionResults(
  client: HttpClient,
  pageNumber: number = 0,
  size: number = 10,
  name: string | null = null,
  startDate: Date | null = null,
  endDate: Date | null = null,
  options: Partial<DetectionOptions> = {}
): Promise<DetectionResultList> {
  let attempts = 0;
  const {
    maxAttempts = Number.MAX_SAFE_INTEGER,
    pollingInterval = DEFAULT_POLLING_INTERVAL,
  } = options;

  while (attempts < maxAttempts) {
    try {
      const mediaResults = await getMediaResults(
        client,
        pageNumber,
        size,
        name,
        startDate,
        endDate
      );

      return formatResults(mediaResults);
    } catch (error) {
      if (++attempts >= maxAttempts) {
        throw new RealityDefenderError(
          `Failed to get paginated results: ${(error as Error).message}`,
          'unknown_error'
        );
      }
      // Wait for the polling interval before trying again
      await sleep(pollingInterval);
    }
  }

  throw new RealityDefenderError(
    `Failed to get detection result list after ${attempts} attempts`,
    'timeout'
  );
}
