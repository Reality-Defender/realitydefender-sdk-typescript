/**
 * Tests for user feedback V2 detection module
 */
import { createUserFeedbackV2 } from '../../src/detection/user-feedback';
import { mockClient } from '../setupTests';

describe('User Feedback V2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts required fields without comment', async () => {
    const apiResponse = { id: 'fb-1', requestId: 'req-1' };
    mockClient.post.mockResolvedValueOnce(apiResponse);

    const result = await createUserFeedbackV2(mockClient, {
      requestId: 'req-1',
      label: 'REAL',
      feedbackCategory: 'CONFIRMATION',
    });

    expect(mockClient.post).toHaveBeenCalledWith('/api/v2/user-feedback', {
      requestId: 'req-1',
      label: 'REAL',
      feedbackCategory: 'CONFIRMATION',
    });
    expect(result).toEqual(apiResponse);
  });

  it('includes comment when provided', async () => {
    mockClient.post.mockResolvedValueOnce({ id: 'fb-2' });

    await createUserFeedbackV2(mockClient, {
      requestId: 'req-2',
      label: 'SYNTHETIC',
      feedbackCategory: 'FALSE_NEGATIVE',
      comment: 'needs review',
    });

    expect(mockClient.post).toHaveBeenCalledWith('/api/v2/user-feedback', {
      requestId: 'req-2',
      label: 'SYNTHETIC',
      feedbackCategory: 'FALSE_NEGATIVE',
      comment: 'needs review',
    });
  });
});
