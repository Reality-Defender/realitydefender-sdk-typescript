/**
 * Delete a scan analysis
 */

import { HttpClient } from '../client/types';
import { API_PATHS } from '../core/constants';
import { RealityDefenderError } from '../errors';

/**
 * Delete a scan analysis. The API responds with 204 No Content.
 *
 * @param client HTTP client
 * @param requestId Request ID returned by upload or social media upload
 */
export async function deleteAnalysis(
  client: HttpClient,
  requestId: string
): Promise<void> {
  const id = requestId?.trim();
  if (!id) {
    throw new RealityDefenderError('requestId is required', 'invalid_request');
  }

  await client.delete(`${API_PATHS.DELETE_MEDIA}/${id}`);
}
