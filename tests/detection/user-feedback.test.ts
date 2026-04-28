/**
 * Tests for user feedback detection module
 */
import { createUserFeedback } from '../../src/detection/user-feedback';
import { mockClient } from '../setupTests';

describe('User feedback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts required fields without comment', async () => {
    const apiResponse = { id: 'fb-1', requestId: 'req-1' };
    mockClient.post.mockResolvedValueOnce(apiResponse);

    const result = await createUserFeedback(mockClient, {
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

    await createUserFeedback(mockClient, {
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
