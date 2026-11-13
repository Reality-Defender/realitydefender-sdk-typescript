/**
 * Tests for deleting a scan request
 */
import { deleteRequest } from '../../src/detection/delete';
import { RealityDefenderError } from '../../src/errors';
import { mockClient } from '../setupTests';

describe('deleteRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes /api/media/{requestId}', async () => {
    mockClient.delete.mockResolvedValueOnce(undefined);

    await deleteRequest(mockClient, 'req-1');

    expect(mockClient.delete).toHaveBeenCalledWith('/api/media/req-1');
  });

  it('trims the request id', async () => {
    mockClient.delete.mockResolvedValueOnce(undefined);

    await deleteRequest(mockClient, '  req-2  ');

    expect(mockClient.delete).toHaveBeenCalledWith('/api/media/req-2');
  });

  it('rejects a blank request id without calling the API', async () => {
    await expect(deleteRequest(mockClient, '   ')).rejects.toMatchObject({
      code: 'invalid_request',
    });
    expect(mockClient.delete).not.toHaveBeenCalled();
  });

  it('propagates API errors', async () => {
    mockClient.delete.mockRejectedValueOnce(
      new RealityDefenderError('Resource not found', 'not_found')
    );

    await expect(deleteRequest(mockClient, 'missing')).rejects.toMatchObject({
      code: 'not_found',
    });
  });
});
