/**
 * Tests for the main RealityDefender SDK class
 */
import {RealityDefender} from '../src';
import {createHttpClient} from '../src/client';
import {uploadFile} from '../src/detection/upload';
import {getDetectionResult, getDetectionResults} from '../src/detection/results';
import {RealityDefenderError} from '../src';
import {DEFAULT_POLLING_INTERVAL, DEFAULT_TIMEOUT} from '../src/core/constants';
import {DetectionResultList} from '../src/types';

// Mock the modules we depend on
jest.mock('../src/client');
jest.mock('../src/detection/upload');
jest.mock('../src/detection/results');

describe('RealityDefender SDK', () => {
    // Mock implementations
    const mockHttpClient = {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
    };

    // Mock the createHttpClient function
    const mockCreateHttpClient = createHttpClient as jest.MockedFunction<typeof createHttpClient>;

    // Mock the upload functions
    const mockUploadFile = uploadFile as jest.MockedFunction<typeof uploadFile>;

    // Mock the results functions
    const mockGetDetectionResult = getDetectionResult as jest.MockedFunction<
        typeof getDetectionResult
    >;

    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateHttpClient.mockReturnValue(mockHttpClient);
    });

    describe('constructor', () => {
        it('should throw error when API key is missing', () => {
            expect(() => new RealityDefender({apiKey: ''})).toThrow(RealityDefenderError);

            expect(() => new RealityDefender({apiKey: ''})).toThrow('API key is required');
        });

        it('should create HTTP client with API key', () => {
            new RealityDefender({apiKey: 'test-api-key'});

            expect(mockCreateHttpClient).toHaveBeenCalledWith({
                apiKey: 'test-api-key',
                baseUrl: undefined,
            });
        });

        it('should create HTTP client with custom base URL when provided', () => {
            const customUrl = 'https://custom-api.example.com';
            new RealityDefender({
                apiKey: 'test-api-key',
                baseUrl: customUrl,
            });

            expect(mockCreateHttpClient).toHaveBeenCalledWith({
                apiKey: 'test-api-key',
                baseUrl: customUrl,
            });
        });
    });

    describe('upload', () => {
        it('should call uploadFile with correct parameters', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const mockUploadResult = {
                requestId: 'request-123',
                mediaId: 'media-123',
            };

            mockUploadFile.mockResolvedValueOnce(mockUploadResult);

            const result = await sdk.upload({filePath: '/path/to/test-file.jpg'});

            expect(mockUploadFile).toHaveBeenCalledWith(mockHttpClient, {
                filePath: '/path/to/test-file.jpg',
            });

            expect(result).toEqual(mockUploadResult);
        });

        it('should pass through RealityDefenderError errors', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const error = new RealityDefenderError('Invalid file', 'invalid_file');
            mockUploadFile.mockRejectedValueOnce(error);

            const uploadOptions = {
                filePath: '/path/to/test-file.jpg',
            };

            await expect(sdk.upload(uploadOptions)).rejects.toThrow(error);
        });

        it('should wrap generic errors in RealityDefenderError', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const error = new Error('Unknown upload error');
            mockUploadFile.mockImplementationOnce(() => {
                throw error;
            });

            const uploadOptions = {
                filePath: '/path/to/test-file.jpg',
            };

            await expect(sdk.upload(uploadOptions)).rejects.toThrow(
                new RealityDefenderError('Upload failed: Unknown upload error', 'upload_failed')
            );
        });
    });

    describe('getResult', () => {
        it('should call getDetectionResult with correct parameters', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const mockResult = {
                status: 'MANIPULATED',
                score: 95,
                models: [
                    {
                        name: 'model-1',
                        status: 'MANIPULATED',
                        score: 95,
                    },
                ],
            };

            mockGetDetectionResult.mockResolvedValueOnce(mockResult);

            const result = await sdk.getResult('request-123');

            expect(mockGetDetectionResult).toHaveBeenCalledWith(
                mockHttpClient,
                'request-123',
                {} // Now we're passing empty options to use defaults in getDetectionResult
            );
            expect(result).toEqual(mockResult);
        });

        it('should handle not found errors', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const notFoundError = new RealityDefenderError(
                'Result not found for request ID: non-existent-id',
                'not_found'
            );
            mockGetDetectionResult.mockRejectedValueOnce(notFoundError);

            await expect(sdk.getResult('non-existent-id')).rejects.toEqual(notFoundError);
        });

        it('should handle server errors in getResult', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const serverError = new RealityDefenderError('Server error', 'server_error');
            mockGetDetectionResult.mockRejectedValueOnce(serverError);

            await expect(sdk.getResult('request-123')).rejects.toEqual(serverError);
        });

        it('should handle unauthorized errors in getResult', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const authError = new RealityDefenderError('Unauthorized: Invalid API key', 'unauthorized');
            mockGetDetectionResult.mockRejectedValueOnce(authError);

            await expect(sdk.getResult('request-123')).rejects.toEqual(authError);
        });

        it('should handle generic errors in getResult', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const genericError = new RealityDefenderError(
                'Failed to get result: Generic Error',
                'unknown_error'
            );
            mockGetDetectionResult.mockRejectedValueOnce(genericError);

            await expect(sdk.getResult('request-123')).rejects.toEqual(genericError);
        });
    });

    const mockGetDetectionResults = getDetectionResults as jest.MockedFunction<
        typeof getDetectionResults
    >;

    describe('getResults', () => {
        it('should handle partial parameters correctly', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});


            const mockResults: DetectionResultList = {
                items: [
                    {
                        status: 'AUTHENTIC',
                        score: 15,
                        models: [],
                    },
                    {
                        status: 'AUTHENTIC',
                        score: 15,
                        models: [],
                    },
                    {
                        status: 'AUTHENTIC',
                        score: 15,
                        models: [],
                    },
                    {
                        status: 'AUTHENTIC',
                        score: 15,
                        models: [],
                    },
                    {
                        status: 'AUTHENTIC',
                        score: 15,
                        models: [],
                    },
                ],
                totalItems: 5,
                currentPage: 2,
                currentPageItemsCount: 5,
                totalPages: 1,
            };

            mockGetDetectionResults.mockResolvedValueOnce(mockResults);

            const result = await sdk.getResults(2, 5);

            expect(mockGetDetectionResults).toHaveBeenCalledWith(
                mockHttpClient,
                2,
                5,
                null,
                null,
                null,
                {}
            );

            expect(result).toEqual(mockResults);
        });

        it('should handle date filters without name filter', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const mockResults: DetectionResultList = {
                items: [
                    {
                        status: 'AUTHENTIC',
                        score: 15,
                        models: [],
                    },
                ],
                totalItems: 1,
                currentPage: 0,
                currentPageItemsCount: 1,
                totalPages: 1,
            };

            mockGetDetectionResults.mockResolvedValueOnce(mockResults);

            const startDate = new Date('2025-07-01');
            const endDate = new Date('2025-07-15');

            const result = await sdk.getResults(0, 10, null, startDate, endDate);

            expect(mockGetDetectionResults).toHaveBeenCalledWith(
                mockHttpClient,
                0,
                10,
                null,
                startDate,
                endDate,
                {}
            );

            expect(result).toEqual(mockResults);
        });

        it('should call getDetectionResults with correct parameters', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const mockResults: DetectionResultList = {
                totalItems: 1,
                currentPageItemsCount: 1,
                totalPages: 1,
                currentPage: 0,
                items: [
                    {
                        status: 'MANIPULATED',
                        score: 95,
                        models: [],
                    },
                ],
            };

            mockGetDetectionResults.mockResolvedValueOnce(mockResults);

            const result = await sdk.getResults(
                1,
                20,
                'test-name',
                new Date('2025-07-01'),
                new Date('2025-07-16')
            );

            expect(mockGetDetectionResults).toHaveBeenCalledWith(
                mockHttpClient,
                1,
                20,
                'test-name',
                new Date('2025-07-01'),
                new Date('2025-07-16'),
                {}
            );

            expect(result).toEqual(mockResults);
        });

        it('should use default parameters when not provided', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const mockResults: DetectionResultList = {
                items: [],
                totalItems: 0,
                currentPageItemsCount: 0,
                totalPages: 0,
                currentPage: 0,
            };

            mockGetDetectionResults.mockResolvedValueOnce(mockResults);

            const result = await sdk.getResults();

            expect(mockGetDetectionResults).toHaveBeenCalledWith(
                mockHttpClient,
                0,
                10,
                null,
                null,
                null,
                {}
            );

            expect(result).toEqual(mockResults);
        });

        it('should pass options parameter correctly', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const mockResults: DetectionResultList = {
                items: [],
                totalItems: 0,
                currentPageItemsCount: 0,
                totalPages: 0,
                currentPage: 0,
            };

            mockGetDetectionResults.mockResolvedValueOnce(mockResults);

            const options = {maxAttempts: 5, pollingInterval: 2000};

            await sdk.getResults(0, 10, null, null, null, options);

            expect(mockGetDetectionResults).toHaveBeenCalledWith(
                mockHttpClient,
                0,
                10,
                null,
                null,
                null,
                options
            );
        });

        it('should handle RealityDefenderError from getDetectionResults', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const error = new RealityDefenderError('Server error', 'server_error');
            mockGetDetectionResults.mockRejectedValueOnce(error);

            await expect(sdk.getResults()).rejects.toThrow(error);
        });

        it('should handle generic errors from getDetectionResults', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            const error = new Error('Network error');
            mockGetDetectionResults.mockRejectedValueOnce(error);

            await expect(sdk.getResults()).rejects.toThrow(error);
        });
    });

    describe('detect', () => {
        it('should chain upload and getResult methods', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            // Mock upload result
            const mockUploadResult = {
                requestId: 'request-123',
                mediaId: 'media-123',
            };

            // Mock detection result
            const mockDetectionResult = {
                status: 'MANIPULATED',
                score: 95,
                models: [
                    {
                        name: 'model-1',
                        status: 'MANIPULATED',
                        score: 95,
                    },
                ],
            };

            // Setup mocks
            mockUploadFile.mockResolvedValueOnce(mockUploadResult);
            mockGetDetectionResult.mockResolvedValueOnce(mockDetectionResult);

            // Call the detect method
            const result = await sdk.detect({filePath: '/path/to/test-file.jpg'});

            // Verify upload was called with correct parameters
            expect(mockUploadFile).toHaveBeenCalledWith(mockHttpClient, {
                filePath: '/path/to/test-file.jpg',
            });

            // Verify getDetectionResult was called with correct parameters
            expect(mockGetDetectionResult).toHaveBeenCalledWith(mockHttpClient, 'request-123', {});

            // Verify final result is the detection result
            expect(result).toEqual(mockDetectionResult);
        });

        it('should pass result options to getResult method', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            // Mock results
            mockUploadFile.mockResolvedValueOnce({
                requestId: 'request-123',
                mediaId: 'media-123',
            });
            mockGetDetectionResult.mockResolvedValueOnce({
                status: 'MANIPULATED',
                score: 95,
                models: [],
            });

            // Custom result options
            const resultOptions = {
                maxAttempts: 5,
                pollingInterval: 2000,
            };

            // Call detect with result options
            await sdk.detect({filePath: '/path/to/test-file.jpg'}, resultOptions);

            // Verify options were passed to getDetectionResult
            expect(mockGetDetectionResult).toHaveBeenCalledWith(
                mockHttpClient,
                'request-123',
                resultOptions
            );
        });

        it('should propagate upload errors', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            // Mock upload error
            const uploadError = new RealityDefenderError('Invalid file', 'invalid_file');
            mockUploadFile.mockRejectedValueOnce(uploadError);

            // Call detect and expect it to throw the upload error
            await expect(sdk.detect({filePath: '/path/to/test-file.jpg'})).rejects.toThrow(uploadError);

            // Verify getDetectionResult was not called
            expect(mockGetDetectionResult).not.toHaveBeenCalled();
        });

        it('should propagate getResult errors', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            // Mock successful upload but failed result
            mockUploadFile.mockResolvedValueOnce({
                requestId: 'request-123',
                mediaId: 'media-123',
            });

            // Mock result error
            const resultError = new RealityDefenderError('Result not available', 'not_found');
            mockGetDetectionResult.mockRejectedValueOnce(resultError);

            // Call detect and expect it to throw the result error
            await expect(sdk.detect({filePath: '/path/to/test-file.jpg'})).rejects.toThrow(resultError);
        });
    });

    describe('pollForResults', () => {
        it('should call _pollForResults with correct parameters', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            // Mock the implementation to resolve immediately
            jest.spyOn(sdk as any, '_pollForResults').mockResolvedValue(undefined);

            const customPollingInterval = 10000;
            const customTimeout = 600000;

            await sdk.pollForResults('request-123', {
                pollingInterval: customPollingInterval,
                timeout: customTimeout,
            });

            expect((sdk as any)._pollForResults).toHaveBeenCalledWith(
                'request-123',
                customPollingInterval,
                customTimeout
            );
        });

        it('should use default polling parameters when not specified', async () => {
            const sdk = new RealityDefender({apiKey: 'test-api-key'});

            // Mock the implementation to resolve immediately
            jest.spyOn(sdk as any, '_pollForResults').mockResolvedValue(undefined);

            await sdk.pollForResults('request-123');

            expect((sdk as any)._pollForResults).toHaveBeenCalledWith(
                'request-123',
                DEFAULT_POLLING_INTERVAL,
                DEFAULT_TIMEOUT
            );
        });
    });

    describe('internal polling', () => {
        let sdk: RealityDefender;
        let mockSleep: jest.Mock;

        beforeEach(() => {
            sdk = new RealityDefender({apiKey: 'test-api-key'});

            // Mock the sleep function to resolve immediately
            mockSleep = jest.fn().mockResolvedValue(undefined);
            jest.spyOn(require('../src/utils/async'), 'sleep').mockImplementation(mockSleep);

            // Add an event listener to track emitted events
            sdk.on('error', jest.fn());
            sdk.on('result', jest.fn());

            // Mock getResult to return ANALYZING status once then MANIPULATED
            mockGetDetectionResult.mockReset();
            mockGetDetectionResult.mockResolvedValueOnce({
                status: 'ANALYZING',
                score: 0,
                models: [],
            });
            mockGetDetectionResult.mockResolvedValueOnce({
                status: 'MANIPULATED',
                score: 95,
                models: [],
            });
        });

        afterEach(() => {
            // Restore original implementations
            jest.restoreAllMocks();

            // Remove all event listeners
            sdk.removeAllListeners();
        });

        it('should initiate polling correctly', async () => {
            // Call the polling method directly and await its completion
            await (sdk as any)._pollForResults('request-123', 5000, 300000);

            // Verify sleep was called after the first ANALYZING status
            expect(mockSleep).toHaveBeenCalledWith(5000);

            // Verify getDetectionResult was called twice
            expect(mockGetDetectionResult).toHaveBeenCalledTimes(2);
        });
    });
});
