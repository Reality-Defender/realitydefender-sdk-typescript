/**
 * Tests for SDK types
 */
import {
  RealityDefenderConfig,
  UploadOptions,
  GetResultOptions,
  UploadResult,
  DetectionResult,
} from '../../src/types/sdk';

describe('SDK Types', () => {
  it('should create a RealityDefenderConfig object', () => {
    const config: RealityDefenderConfig = {
      apiKey: 'test-api-key',
      baseUrl: 'https://custom-api.example.com',
    };

    expect(config.apiKey).toBe('test-api-key');
    expect(config.baseUrl).toBe('https://custom-api.example.com');
  });

  it('should create an UploadOptions object', () => {
    const options: UploadOptions = {
      filePath: '/path/to/file.jpg',
    };

    expect(options.filePath).toBe('/path/to/file.jpg');
  });

  it('should create a GetResultOptions object', () => {
    const options: GetResultOptions = {
      maxAttempts: 3,
      pollingInterval: 5000,
    };

    expect(options.maxAttempts).toBe(3);
    expect(options.pollingInterval).toBe(5000);
  });

  it('should accept empty GetResultOptions', () => {
    const options: GetResultOptions = {};

    expect(options.maxAttempts).toBeUndefined();
    expect(options.pollingInterval).toBeUndefined();
  });

  it('should create an UploadResult object', () => {
    const result: UploadResult = {
      requestId: 'request-123',
      mediaId: 'media-123',
    };

    expect(result.requestId).toBe('request-123');
    expect(result.mediaId).toBe('media-123');
  });

  it('should create a DetectionResult object', () => {
    const result: DetectionResult = {
      status: 'MANIPULATED',
      score: 95,
      models: [
        {
          name: 'model-1',
          status: 'MANIPULATED',
          score: 95,
        },
        {
          name: 'model-2',
          status: 'AUTHENTIC',
          score: 10,
        },
      ],
    };

    expect(result.status).toBe('MANIPULATED');
    expect(result.score).toBe(95);
    expect(result.models.length).toBe(2);
    expect(result.models[0].name).toBe('model-1');
    expect(result.models[1].status).toBe('AUTHENTIC');
  });

  it('should handle null values in DetectionResult', () => {
    const result: DetectionResult = {
      status: 'PROCESSING',
      score: null,
      models: [
        {
          name: 'model-1',
          status: 'PROCESSING',
          score: null,
        },
      ],
    };

    expect(result.status).toBe('PROCESSING');
    expect(result.score).toBeNull();
    expect(result.models[0].score).toBeNull();
  });
});
