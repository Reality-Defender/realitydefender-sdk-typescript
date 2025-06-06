/**
 * Tests for the results module
 */
import { getMediaResult, formatResult, getDetectionResult } from '../../src/detection/results';
import { RealityDefenderError } from '../../src';
import { MediaResponse, ModelResult } from '../../src/types';
import { mockClient } from '../setupTests';

describe('Results Module', () => {
    const mockMediaResponse: MediaResponse = {
        name: 'test-file.jpg',
        filename: 'test-file.jpg',
        originalFileName: 'test-file.jpg',
        requestId: 'request-123',
        uploadedDate: '2023-06-25T12:34:56Z',
        mediaType: 'IMAGE',
        overallStatus: 'ARTIFICIAL',
        resultsSummary: {
            status: 'ARTIFICIAL',
            metadata: {
                finalScore: 95,
            },
        },
        models: [
            {
                name: 'model-1',
                data: { score: 0.95, decision: 'ARTIFICIAL', raw_score: 0.95 },
                status: 'ARTIFICIAL',
                predictionNumber: 0.95,
                normalizedPredictionNumber: 95,
                rollingAvgNumber: null,
                finalScore: 95,
            },
            {
                name: 'model-2',
                data: null,
                code: 'not_applicable',
                status: 'NOT_APPLICABLE',
                predictionNumber: null,
                normalizedPredictionNumber: null,
                rollingAvgNumber: null,
                finalScore: null,
            },
            {
                name: 'model-3',
                data: { score: 0.2, decision: 'HUMAN', raw_score: 0.2 },
                status: 'AUTHENTIC',
                predictionNumber: 0.2,
                normalizedPredictionNumber: 20,
                rollingAvgNumber: null,
                finalScore: 20,
            },
        ],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getMediaResult', () => {
        it('should get media results successfully', async () => {
            mockClient.get.mockResolvedValueOnce(mockMediaResponse);

            const result = await getMediaResult(mockClient, 'request-123');

            expect(mockClient.get).toHaveBeenCalledWith('/api/media/users/request-123');
            expect(result).toEqual(mockMediaResponse);
        });

        it('should handle RealityDefenderError errors', async () => {
            const error = new RealityDefenderError('Not found', 'not_found');
            mockClient.get.mockRejectedValueOnce(error);

            await expect(getMediaResult(mockClient, 'request-123')).rejects.toThrow(error);
        });

        it('should handle generic errors', async () => {
            const error = new Error('Network error');
            mockClient.get.mockRejectedValueOnce(error);

            await expect(getMediaResult(mockClient, 'request-123')).rejects.toThrow(RealityDefenderError);

            mockClient.get.mockRejectedValueOnce(error);
            await expect(getMediaResult(mockClient, 'request-123')).rejects.toThrow(
                'Failed to get result: Network error'
            );
        });
    });

    describe('formatResult', () => {
        it('should format results correctly', () => {
            const formattedResult = formatResult(mockMediaResponse);

            expect(formattedResult).toEqual({
                status: 'ARTIFICIAL',
                score: 0.95,
                models: [
                    {
                        name: 'model-1',
                        status: 'ARTIFICIAL',
                        score: 0.95,
                    },
                    {
                        name: 'model-3',
                        status: 'AUTHENTIC',
                        score: 0.2,
                    },
                ],
            });
        });

        it('should convert FAKE status to ARTIFICIAL in response status', () => {
            const fakeStatusResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'FAKE' as any,
                    metadata: {
                        finalScore: 95,
                    },
                },
            };

            const formattedResult = formatResult(fakeStatusResponse);

            expect(formattedResult.status).toBe('ARTIFICIAL');
        });

        it('should convert FAKE status to ARTIFICIAL in model status', () => {
            const fakeModelResponse = {
                ...mockMediaResponse,
                models: [
                    {
                        name: 'model-fake',
                        data: { score: 0.95, decision: 'FAKE', raw_score: 0.95 },
                        status: 'FAKE' as any,
                        predictionNumber: 0.95,
                        normalizedPredictionNumber: 95,
                        rollingAvgNumber: null,
                        finalScore: 95,
                    },
                ],
            };

            const formattedResult = formatResult(fakeModelResponse);

            expect(formattedResult.models[0].status).toBe('ARTIFICIAL');
        });

        it('should handle models with code attribute set to not_applicable', () => {
            const notApplicableCodeResponse = {
                ...mockMediaResponse,
                models: [
                    {
                        name: 'model-1',
                        data: { score: 0.95, decision: 'ARTIFICIAL', raw_score: 0.95 },
                        status: 'ARTIFICIAL',
                        code: 'applicable',
                        predictionNumber: 0.95,
                        normalizedPredictionNumber: 95,
                        rollingAvgNumber: null,
                        finalScore: 95,
                    },
                    {
                        name: 'model-not-applicable',
                        data: null,
                        code: 'not_applicable',
                        status: 'PROCESSING',
                        predictionNumber: null,
                        normalizedPredictionNumber: null,
                        rollingAvgNumber: null,
                        finalScore: null,
                    },
                ],
            };

            const formattedResult = formatResult(notApplicableCodeResponse);

            expect(formattedResult.models).toHaveLength(1);
            expect(formattedResult.models[0].name).toBe('model-1');
        });

        it('should handle empty models array', () => {
            const emptyResponse = {
                ...mockMediaResponse,
                models: [],
            };

            const formattedResult = formatResult(emptyResponse);

            expect(formattedResult).toEqual({
                status: 'ARTIFICIAL',
                score: 0.95,
                models: [],
            });
        });

        it('should filter out NOT_APPLICABLE models', () => {
            const onlyNotApplicableResponse = {
                ...mockMediaResponse,
                models: [
                    {
                        name: 'model-2',
                        data: null,
                        code: 'not_applicable',
                        status: 'NOT_APPLICABLE',
                        predictionNumber: null,
                        normalizedPredictionNumber: null,
                        rollingAvgNumber: null,
                        finalScore: null,
                    },
                ],
            };

            const formattedResult = formatResult(onlyNotApplicableResponse);

            expect(formattedResult).toEqual({
                status: 'ARTIFICIAL',
                score: 0.95,
                models: [],
            });
        });

        it('should handle null scores', () => {
            const nullScoreResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'PROCESSING',
                    metadata: {
                        finalScore: null,
                    },
                },
                models: [
                    {
                        name: 'model-1',
                        data: { score: 0, decision: 'PROCESSING', raw_score: 0 },
                        status: 'PROCESSING',
                        predictionNumber: 0,
                        normalizedPredictionNumber: 0,
                        rollingAvgNumber: null,
                        finalScore: null,
                    },
                ],
            } as unknown as MediaResponse; // Type assertion to handle null finalScore

            const formattedResult = formatResult(nullScoreResponse);

            expect(formattedResult).toEqual({
                status: 'PROCESSING',
                score: null,
                models: [
                    {
                        name: 'model-1',
                        status: 'PROCESSING',
                        score: 0,
                    },
                ],
            });
        });

        it('should handle models with missing code attribute', () => {
            const missingCodeResponse = {
                ...mockMediaResponse,
                models: [
                    {
                        name: 'model-1',
                        data: { score: 0.95, decision: 'ARTIFICIAL', raw_score: 0.95 },
                        status: 'ARTIFICIAL',
                        predictionNumber: 0.95,
                        normalizedPredictionNumber: 95,
                        rollingAvgNumber: null,
                        finalScore: 95,
                    } as ModelResult,
                    // Model with no code but NOT_APPLICABLE status
                    {
                        name: 'model-4',
                        data: null,
                        // code is missing
                        status: 'NOT_APPLICABLE',
                        predictionNumber: null,
                        normalizedPredictionNumber: null,
                        rollingAvgNumber: null,
                        finalScore: null,
                    } as ModelResult,
                ],
            };

            const formattedResult = formatResult(missingCodeResponse);

            expect(formattedResult).toEqual({
                status: 'ARTIFICIAL',
                score: 0.95,
                models: [
                    {
                        name: 'model-1',
                        status: 'ARTIFICIAL',
                        score: 0.95,
                    },
                ],
            });
        });

        it('should handle zero score values', () => {
            const zeroScoreResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'AUTHENTIC',
                    metadata: {
                        finalScore: 0,
                    },
                },
                models: [
                    {
                        name: 'model-zero',
                        data: { score: 0, decision: 'AUTHENTIC', raw_score: 0 },
                        status: 'AUTHENTIC',
                        predictionNumber: 0,
                        normalizedPredictionNumber: 0,
                        rollingAvgNumber: null,
                        finalScore: 0,
                    },
                ],
            };

            const formattedResult = formatResult(zeroScoreResponse);

            expect(formattedResult.score).toBe(0);
            expect(formattedResult.models[0].score).toBe(0);
        });
    });

    describe('getDetectionResult', () => {
        it('should get and format detection results', async () => {
            mockClient.get.mockResolvedValueOnce(mockMediaResponse);

            const result = await getDetectionResult(mockClient, 'request-123', {
                maxAttempts: 1,
                pollingInterval: 100,
            });

            expect(mockClient.get).toHaveBeenCalledWith('/api/media/users/request-123');
            expect(result).toEqual({
                status: 'ARTIFICIAL',
                score: 0.95,
                models: [
                    {
                        name: 'model-1',
                        status: 'ARTIFICIAL',
                        score: 0.95,
                    },
                    {
                        name: 'model-3',
                        status: 'AUTHENTIC',
                        score: 0.2,
                    },
                ],
            });
        });

        it('should use default options when none provided', async () => {
            mockClient.get.mockResolvedValueOnce(mockMediaResponse);

            const result = await getDetectionResult(mockClient, 'request-123');

            expect(mockClient.get).toHaveBeenCalledWith('/api/media/users/request-123');
            expect(result).toBeDefined();
        });

        it('should handle media that is still analyzing with polling', async () => {
            // First call returns ANALYZING status
            const analyzingResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'ANALYZING',
                    metadata: {
                        finalScore: null,
                    },
                },
            };

            // Second call returns completed result
            const completedResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'ARTIFICIAL',
                    metadata: {
                        finalScore: 90,
                    },
                },
            };

            // Setup the mock to return analyzing first, then completed
            mockClient.get
                .mockResolvedValueOnce(analyzingResponse)
                .mockResolvedValueOnce(completedResponse);

            // Call with maxAttempts=2 to allow for retry
            const result = await getDetectionResult(mockClient, 'request-123', {
                maxAttempts: 2,
                pollingInterval: 100,
            });

            // Should have called the API twice
            expect(mockClient.get).toHaveBeenCalledTimes(2);
            expect(mockClient.get).toHaveBeenCalledWith('/api/media/users/request-123');

            // Should return the completed result
            expect(result).toEqual({
                status: 'ARTIFICIAL',
                score: 0.9,
                models: expect.any(Array),
            });
        });

        it('should return analyzing result if max attempts reached', async () => {
            // Setup response that always returns ANALYZING
            const analyzingResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'ANALYZING',
                    metadata: {
                        finalScore: null,
                    },
                },
                models: [
                    {
                        ...mockMediaResponse.models[0],
                        status: 'ANALYZING',
                        finalScore: null,
                    },
                ],
            };

            // Mock to always return analyzing
            mockClient.get.mockResolvedValue(analyzingResponse);

            // Call with maxAttempts=3
            const result = await getDetectionResult(mockClient, 'request-123', {
                maxAttempts: 3,
                pollingInterval: 100,
            });

            // Should have called the API 3 times
            expect(mockClient.get).toHaveBeenCalledTimes(3);

            // Should still return the analyzing result after max attempts
            expect(result).toEqual({
                status: 'ANALYZING',
                score: null,
                models: expect.any(Array),
            });
        });

        it('should handle the unreachable fallback code path', async () => {
            // This tests the final fallback in getDetectionResult that should never be reached
            // but is required for TypeScript completeness

            // Mock a scenario where maxAttempts is 0
            mockClient.get.mockResolvedValueOnce(mockMediaResponse);

            const result = await getDetectionResult(mockClient, 'request-123', {
                maxAttempts: 0,
                pollingInterval: 100,
            });

            // Should still call the API once due to the fallback
            expect(mockClient.get).toHaveBeenCalledWith('/api/media/users/request-123');
            expect(result).toBeDefined();
        });

        it('should handle negative maxAttempts', async () => {
            mockClient.get.mockResolvedValueOnce(mockMediaResponse);

            const result = await getDetectionResult(mockClient, 'request-123', {
                maxAttempts: -1,
                pollingInterval: 100,
            });

            // Should call the API once due to the fallback mechanism
            expect(mockClient.get).toHaveBeenCalledWith('/api/media/users/request-123');
            expect(result).toBeDefined();
        });

        it('should handle errors during getMediaResult', async () => {
            const error = new Error('API error');
            mockClient.get.mockRejectedValueOnce(error);

            await expect(
                getDetectionResult(mockClient, 'request-123', { maxAttempts: 1, pollingInterval: 100 })
            ).rejects.toThrow();
        });

        it('should handle multiple polling cycles before completion', async () => {
            const analyzingResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'ANALYZING',
                    metadata: {
                        finalScore: null,
                    },
                },
            };

            const completedResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'ARTIFICIAL',
                    metadata: {
                        finalScore: 85,
                    },
                },
            };

            // Setup: analyzing -> analyzing -> analyzing -> completed
            mockClient.get
                .mockResolvedValueOnce(analyzingResponse)
                .mockResolvedValueOnce(analyzingResponse)
                .mockResolvedValueOnce(analyzingResponse)
                .mockResolvedValueOnce(completedResponse);

            const result = await getDetectionResult(mockClient, 'request-123', {
                maxAttempts: 5,
                pollingInterval: 50,
            });

            expect(mockClient.get).toHaveBeenCalledTimes(4);
            expect(result.status).toBe('ARTIFICIAL');
            expect(result.score).toBe(0.85);
        });

        it('should handle edge case where attempts equals maxAttempts exactly', async () => {
            const analyzingResponse = {
                ...mockMediaResponse,
                resultsSummary: {
                    status: 'ANALYZING',
                    metadata: {
                        finalScore: null,
                    },
                },
            };

            // Mock to return analyzing status exactly maxAttempts times
            mockClient.get
                .mockResolvedValueOnce(analyzingResponse)
                .mockResolvedValueOnce(analyzingResponse);

            const result = await getDetectionResult(mockClient, 'request-123', {
                maxAttempts: 2,
                pollingInterval: 50,
            });

            // Should call exactly 2 times (maxAttempts)
            expect(mockClient.get).toHaveBeenCalledTimes(2);
            expect(result.status).toBe('ANALYZING');
        });
    });
});
