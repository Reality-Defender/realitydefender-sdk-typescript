/**
 * Handling detection results
 */

import { HttpClient } from '../client/types';
import { API_PATHS, DEFAULT_POLLING_INTERVAL } from '../core/constants';
import { MediaResponse } from '../types/api';
import { DetectionResult, DetectionOptions } from '../types/sdk';
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
    throw new RealityDefenderError(`Failed to get result: ${(error as Error).message}`, 'unknown_error');
  }
}

/**
 * Format the raw API response into a user-friendly result
 * @param response Raw API response
 * @returns Simplified detection result
 */
export function formatResult(response: MediaResponse): DetectionResult {
  // Extract active models (not NOT_APPLICABLE)
  const activeModels = response.models.filter(model => 
    model.status !== 'NOT_APPLICABLE' && model.code !== 'not_applicable'
  );

  // Replace FAKE with ARTIFICIAL in response status
  const status = response.resultsSummary.status === 'FAKE' 
    ? 'ARTIFICIAL' 
    : response.resultsSummary.status;

  // Normalize the final score from 0-100 to 0-1 range
  const normalizedScore = response.resultsSummary.metadata.finalScore !== null
    ? response.resultsSummary.metadata.finalScore / 100
    : null;

  return {
    status: status,
    score: normalizedScore,
    models: activeModels.map(model => ({
      name: model.name,
      // Replace FAKE with ARTIFICIAL in model status
      status: model.status === 'FAKE' ? 'ARTIFICIAL' : model.status,
      // Score between 0-1 range or null if not available
      score: model.predictionNumber
    }))
  };
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
    pollingInterval = DEFAULT_POLLING_INTERVAL 
  } = options;
  
  while (attempts < maxAttempts) {
    const mediaResult = await getMediaResult(client, requestId);
    
    // If the status is not ANALYZING, return the results immediately
    if (mediaResult.resultsSummary.status !== 'ANALYZING') {
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
