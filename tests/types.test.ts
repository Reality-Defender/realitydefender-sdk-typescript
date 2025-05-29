/**
 * Tests for the type definitions
 */
import {
  SignedUrlResponse,
  ModelResult,
  ResultsSummary,
  MediaResponse,
  RealityDefenderConfig,
  UploadOptions,
  UploadResult,
  DetectionResult,
  ErrorCode,
  RealityDefenderError,
  GetResultOptions
} from '../src/types';

describe('Type Definitions', () => {
  // Test the type interfaces by creating instances of them
  it('should create a SignedUrlResponse object', () => {
    const response: SignedUrlResponse = {
      code: 'ok',
      response: { signedUrl: 'https://example.com/upload' },
      errno: 0,
      mediaId: 'media-123',
      requestId: 'request-123'
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
        decision: 'ARTIFICIAL',
        raw_score: 0.95
      },
      status: 'ARTIFICIAL',
      predictionNumber: 0.95,
      normalizedPredictionNumber: 95,
      rollingAvgNumber: null,
      finalScore: 95
    };
    
    expect(modelResult.name).toBe('model-1');
    expect(modelResult.status).toBe('ARTIFICIAL');
    expect(modelResult.data?.score).toBe(0.95);
  });
  
  it('should create a ResultsSummary object', () => {
    const resultsSummary: ResultsSummary = {
      status: 'ARTIFICIAL',
      metadata: {
        finalScore: 95
      }
    };
    
    expect(resultsSummary.status).toBe('ARTIFICIAL');
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
      overallStatus: 'ARTIFICIAL',
      resultsSummary: {
        status: 'ARTIFICIAL',
        metadata: {
          finalScore: 95
        }
      },
      models: [
        {
          name: 'model-1',
          data: { score: 0.95, decision: 'ARTIFICIAL', raw_score: 0.95 },
          status: 'ARTIFICIAL',
          predictionNumber: 0.95,
          normalizedPredictionNumber: 95,
          rollingAvgNumber: null,
          finalScore: 95
        }
      ]
    };
    
    expect(mediaResponse.name).toBe('test-file.jpg');
    expect(mediaResponse.mediaType).toBe('IMAGE');
    expect(mediaResponse.models.length).toBe(1);
  });
  
  it('should create SDK configuration types', () => {
    const config: RealityDefenderConfig = {
      apiKey: 'test-key',
      baseUrl: 'https://custom-api.example.com'
    };
    
    const uploadOptions: UploadOptions = {
      filePath: '/path/to/file.jpg'
    };
    
    const getResultOptions: GetResultOptions = {
      maxAttempts: 3,
      pollingInterval: 5000
    };
    
    const uploadResult: UploadResult = {
      requestId: 'request-123',
      mediaId: 'media-123'
    };
    
    const detectionResult: DetectionResult = {
      status: 'ARTIFICIAL',
      score: 95,
      models: [
        {
          name: 'model-1',
          status: 'ARTIFICIAL',
          score: 95
        }
      ]
    };
    
    expect(config.apiKey).toBe('test-key');
    expect(uploadOptions.filePath).toBe('/path/to/file.jpg');
    expect(getResultOptions.pollingInterval).toBe(5000);
    expect(uploadResult.requestId).toBe('request-123');
    expect(detectionResult.models[0].name).toBe('model-1');
  });
  
  it('should validate ErrorCode values', () => {
    // Test that all possible error codes work with the type
    const errorCodes: ErrorCode[] = [
      'unauthorized',
      'server_error',
      'timeout',
      'invalid_file',
      'upload_failed',
      'not_found',
      'unknown_error'
    ];
    
    errorCodes.forEach(code => {
      const error = new RealityDefenderError('Test error', code);
      expect(error.code).toBe(code);
    });
  });
});

describe('UploadOptions', () => {
  it('validates upload options', () => {
    const validOptions: UploadOptions = {
      filePath: '/path/to/file.jpg'
    };
    
    expect(validOptions.filePath).toBe('/path/to/file.jpg');
  });
});

describe('GetResultOptions', () => {
  it('validates get result options', () => {
    const validOptions: GetResultOptions = {
      maxAttempts: 3,
      pollingInterval: 5000
    };
    
    expect(validOptions.maxAttempts).toBe(3);
    expect(validOptions.pollingInterval).toBe(5000);
  });
}); 