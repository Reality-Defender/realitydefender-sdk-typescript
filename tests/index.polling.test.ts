/**
 * Additional tests to improve coverage of the polling functionality
 */
import { RealityDefender } from '../src';
import { getDetectionResult } from '../src/detection/results';
import { RealityDefenderError } from '../src/errors';

// Mock the modules we depend on
jest.mock('../src/detection/results');

describe('RealityDefender SDK Polling Tests', () => {
  // Mock the getDetectionResult function
  const mockGetDetectionResult = getDetectionResult as jest.MockedFunction<
    typeof getDetectionResult
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Error handling in polling', () => {
    it('should handle not_found errors and continue polling', async () => {
      const sdk = new RealityDefender({ apiKey: 'test-api-key' });
      const resultHandler = jest.fn();
      const errorHandler = jest.fn();

      sdk.on('result', resultHandler);
      sdk.on('error', errorHandler);

      // First call throws not_found, second call returns a result
      mockGetDetectionResult
        .mockRejectedValueOnce(new RealityDefenderError('Not found', 'not_found'))
        .mockResolvedValueOnce({
          status: 'ARTIFICIAL',
          score: 95,
          models: [],
        });

      // Mock sleep to resolve immediately
      jest.spyOn(require('../src/utils/async'), 'sleep').mockResolvedValue(undefined);

      // Start polling - should handle the not_found error and continue
      await sdk.pollForResults('request-123', { pollingInterval: 0 });

      // Should not have emitted an error since it's just a transient not_found
      expect(errorHandler).not.toHaveBeenCalled();

      // Should have emitted a result when the second call succeeded
      expect(resultHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'ARTIFICIAL',
          score: 95,
        })
      );

      // Should have called getDetectionResult twice
      expect(mockGetDetectionResult).toHaveBeenCalledTimes(2);
    });

    it('should handle other types of errors and stop polling', async () => {
      const sdk = new RealityDefender({ apiKey: 'test-api-key' });
      const errorHandler = jest.fn();

      sdk.on('error', errorHandler);

      // Throw a server error
      const serverError = new RealityDefenderError('Server error', 'server_error');
      mockGetDetectionResult.mockRejectedValueOnce(serverError);

      // Mock sleep to resolve immediately
      jest.spyOn(require('../src/utils/async'), 'sleep').mockResolvedValue(undefined);

      // Start polling - should immediately stop on server error
      await sdk.pollForResults('request-123', { pollingInterval: 0 });

      // Should have emitted the error
      expect(errorHandler).toHaveBeenCalledWith(serverError);

      // Should have only called getDetectionResult once before stopping
      expect(mockGetDetectionResult).toHaveBeenCalledTimes(1);
    });
  });
});
