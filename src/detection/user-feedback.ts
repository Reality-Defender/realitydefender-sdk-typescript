import { HttpClient } from '../client/types';
import { API_PATHS } from '../core/constants';
import { RealityDefenderError } from '../errors';
import { CreateUserFeedbackOptions, UserFeedback } from '../types';

function assertUserFeedbackOptions(options: CreateUserFeedbackOptions): void {
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
 * Submit user feedback for a completed scan result.
 * Follows the same validation + POST pattern as {@link uploadSocialMediaLink}.
 *
 * @param client HTTP client
 * @param options Feedback payload
 * @returns Created feedback record from the API
 */
export async function createUserFeedback(
  client: HttpClient,
  options: CreateUserFeedbackOptions
): Promise<UserFeedback> {
  assertUserFeedbackOptions(options);

  const body: Record<string, string> = {
    requestId: options.requestId.trim(),
    label: options.label.trim(),
    feedbackCategory: options.feedbackCategory.trim(),
  };
  if (options.comment !== undefined) {
    body.comment = options.comment;
  }

  return client.post<UserFeedback>(API_PATHS.USER_FEEDBACK, body);
}
