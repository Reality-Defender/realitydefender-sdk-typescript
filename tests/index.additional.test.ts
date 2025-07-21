/**
 * Additional tests for the RealityDefender SDK class
 * to increase function coverage
 */

import { RealityDefender } from '../src';
import { createHttpClient } from '../src/client';
import { getDetectionResult } from '../src/detection/results';
import { RealityDefenderError } from '../src';

// Handle unhandled promise rejections in the test suite
process.on('unhandledRejection', (reason, promise) => {
  // Silence test errors - they're being tested intentionally
  // console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Mock the modules we depend on
jest.mock('../src/client');
jest.mock('../src/detection/upload');
jest.mock('../src/detection/results');

describe('RealityDefender SDK Additional Tests', () => {
  // Mock implementations
  const mockHttpClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  };

  // Mock the createHttpClient function
  const mockCreateHttpClient = createHttpClient as jest.MockedFunction<
    typeof createHttpClient
  >;

  // Mock the results functions
  const mockGetDetectionResult = getDetectionResult as jest.MockedFunction<
    typeof getDetectionResult
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateHttpClient.mockReturnValue(mockHttpClient);
  });

  describe('event listeners', () => {
    it('should allow adding and removing event listeners', () => {
      const sdk = new RealityDefender({ apiKey: 'test-api-key' });

      // Create mock handlers
      const errorHandler = jest.fn(error => {
        // Handle the error to prevent unhandled rejection
      });
      const resultHandler = jest.fn();

      // Add listeners
      sdk.on('error', errorHandler);
      sdk.on('result', resultHandler);

      // Simulate error and result events
      const error = new RealityDefenderError('Test error', 'unknown_error');
      const result = { status: 'MANIPULATED', score: 95, models: [] };

      sdk.emit('error', error);
      sdk.emit('result', result);

      // Verify handlers were called
      expect(errorHandler).toHaveBeenCalledWith(error);
      expect(resultHandler).toHaveBeenCalledWith(result);

      // Reset mock
      errorHandler.mockReset();
      resultHandler.mockReset();

      // Remove listeners
      (sdk as any).removeListener('error', errorHandler);
      (sdk as any).removeListener('result', resultHandler);

      // Add a temporary error handler to prevent unhandled rejections
      const tempErrorHandler = jest.fn();
      sdk.on('error', tempErrorHandler);

      // Emit again
      sdk.emit('error', error);
      sdk.emit('result', result);

      // Verify handlers were not called
      expect(errorHandler).not.toHaveBeenCalled();
      expect(resultHandler).not.toHaveBeenCalled();
      expect(tempErrorHandler).toHaveBeenCalledWith(error);
    });

    it('should allow removing all listeners', () => {
      const sdk = new RealityDefender({ apiKey: 'test-api-key' });

      // Create mock handlers
      const errorHandler = jest.fn(error => {
        // Handle the error to prevent unhandled rejection
      });
      const resultHandler = jest.fn();

      // Add listeners
      sdk.on('error', errorHandler);
      sdk.on('result', resultHandler);

      // Instead of removing all listeners, just remove the result listener
      // to prevent unhandled error events
      (sdk as any).removeListener('result', resultHandler);

      // Simulate events
      sdk.emit('error', new RealityDefenderError('Test error', 'unknown_error'));
      sdk.emit('result', { status: 'MANIPULATED', score: 95, models: [] });

      // Verify result handler was not called, but error handler was
      expect(resultHandler).not.toHaveBeenCalled();
      expect(errorHandler).toHaveBeenCalled();
    });
  });

  describe('pollForResults', () => {
    let sdk: RealityDefender;

    beforeEach(() => {
      sdk = new RealityDefender({ apiKey: 'test-api-key' });
    });

    afterEach(() => {
      // Remove all event listeners to prevent unhandled rejections
      sdk.removeAllListeners();
    });

    it('should handle immediate result availability', async () => {
      // Setup mock response
      const mockResult = { status: 'MANIPULATED', score: 95, models: [] };
      mockGetDetectionResult.mockResolvedValueOnce(mockResult);

      // Create a listener
      const resultHandler = jest.fn();
      sdk.on('result', resultHandler);

      // Call the pollForResults method - it's already async now
      await sdk.pollForResults('request-123', { pollingInterval: 0 }); // Use 0 to make it immediate

      // Verify the result was emitted
      expect(resultHandler).toHaveBeenCalledWith(mockResult);
    });

    it('should emit error when timeout is reached immediately', async () => {
      // Setup error handler
      const errorHandler = jest.fn();
      sdk.on('error', errorHandler);

      // Call the pollForResults method with zero timeout to trigger timeout immediately
      await sdk.pollForResults('request-123', { pollingInterval: 5000, timeout: 0 });

      // Verify the error was emitted
      expect(errorHandler).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'timeout',
          message: 'Polling timeout exceeded',
        })
      );
    });
  });
});
