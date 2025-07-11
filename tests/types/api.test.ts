/**
 * Tests for API types
 */
import { SignedUrlResponse, ModelResult, ResultsSummary, MediaResponse } from '../../src/types/api';

describe('API Types', () => {
  it('should create a SignedUrlResponse object', () => {
    const response: SignedUrlResponse = {
      code: 'ok',
      response: { signedUrl: 'https://example.com/upload' },
      errno: 0,
      mediaId: 'media-123',
      requestId: 'request-123',
    };

    expect(response.code).toBe('ok');
    expect(response.mediaId).toBe('media-123');
    expect(response.requestId).toBe('request-123');
    expect(response.response.signedUrl).toBe('https://example.com/upload');
  });

  it('should create a ModelResult object', () => {
    const modelResult: ModelResult = {
      name: 'model-1',
      data: {
        score: 0.95,
        decision: 'FAKE',
        raw_score: 0.95,
      },
      status: 'FAKE',
      predictionNumber: 0.95,
      normalizedPredictionNumber: 95,
      rollingAvgNumber: null,
      finalScore: 95,
    };

    expect(modelResult.name).toBe('model-1');
    expect(modelResult.status).toBe('MANIPULATED');
    expect(modelResult.data?.score).toBe(0.95);
  });

  it('should create a ResultsSummary object', () => {
    const resultsSummary: ResultsSummary = {
      status: 'FAKE',
      metadata: {
        finalScore: 95,
      },
    };

    expect(resultsSummary.status).toBe('MANIPULATED');
    expect(resultsSummary.metadata.finalScore).toBe(95);
  });

  it('should create a MediaResponse object', () => {
    const mediaResponse: MediaResponse = {
      name: 'test-file.jpg',
      filename: 'test-file.jpg',
      originalFileName: 'test-file.jpg',
      requestId: 'request-123',
      uploadedDate: '2023-06-25T12:34:56Z',
      mediaType: 'IMAGE',
      overallStatus: 'FAKE',
      resultsSummary: {
        status: 'FAKE',
        metadata: {
          finalScore: 95,
        },
      },
      models: [
        {
          name: 'model-1',
          data: { score: 0.95, decision: 'FAKE', raw_score: 0.95 },
          status: 'FAKE',
          predictionNumber: 0.95,
          normalizedPredictionNumber: 95,
          rollingAvgNumber: null,
          finalScore: 95,
        },
      ],
    };

    expect(mediaResponse.name).toBe('test-file.jpg');
    expect(mediaResponse.mediaType).toBe('IMAGE');
    expect(mediaResponse.models.length).toBe(1);
  });
});
