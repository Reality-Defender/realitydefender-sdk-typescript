import { HttpClient } from '../client/types';
import { API_PATHS } from '../core/constants';
import { RealityDefenderError } from '../errors';
import { CreateUserFeedbackV2Options, UserFeedbackV2 } from '../types';

function assertUserFeedbackOptions(options: CreateUserFeedbackV2Options): void {
  if (!options.requestId.trim()) {
    throw new RealityDefenderError('requestId is required', 'invalid_request');
  }
  if (!options.label.trim()) {
    throw new RealityDefenderError('label is required', 'invalid_request');
  }
  if (!options.feedbackCategory.trim()) {
    throw new RealityDefenderError('feedbackCategory is required', 'invalid_request');
  }
}

/**
 * Submit user feedback (V2) for a completed scan result.
 * Follows the same validation + POST pattern as {@link uploadSocialMediaLink}.
 *
 * @param client HTTP client
 * @param options Feedback payload
 * @returns Created feedback record from the API
 */
export async function createUserFeedbackV2(
  client: HttpClient,
  options: CreateUserFeedbackV2Options
): Promise<UserFeedbackV2> {
  assertUserFeedbackOptions(options);

  const body: Record<string, string> = {
    requestId: options.requestId.trim(),
    label: options.label.trim(),
    feedbackCategory: options.feedbackCategory.trim(),
  };
  if (options.comment !== undefined) {
    body.comment = options.comment;
  }

  return client.post<UserFeedbackV2>(API_PATHS.USER_FEEDBACK_V2, body);
}
