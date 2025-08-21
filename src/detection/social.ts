import { HttpClient } from '../client/types';
import { SocialResponse, SocialUploadOptions, UploadResult } from '../types';
import { RealityDefenderError } from '../errors';
import { testUrl } from '../utils/url';
import { API_PATHS } from '../core/constants';

/**
 * Send a social media post to the API for analysis
 * @param client HTTP client
 * @param options Upload options
 * @returns Upload result with request and media IDs
 */
export async function uploadSocialMediaLink(
  client: HttpClient,
  options: SocialUploadOptions
): Promise<UploadResult> {
  // Check if the link is a valid URL.
  if (!testUrl(options.socialLink)) {
    throw new RealityDefenderError(
      `Invalid social media link: ${options.socialLink}`,
      'invalid_request'
    );
  }

  const result = await client.post<SocialResponse>(API_PATHS.SOCIAL_MEDIA, options);

  if (!result.requestId) {
    throw new RealityDefenderError(
      'Invalid response from API - missing requestId',
      'server_error'
    );
  }

  // Return result for tracking
  return {
    requestId: result.requestId,
  };
}
