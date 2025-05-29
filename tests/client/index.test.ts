/**
 * Tests for HTTP client module
 */
import axios from 'axios';
import { createHttpClient, createAxiosClient, handleAxiosError } from '../../src/client';
import { DEFAULT_BASE_URL } from '../../src/core/constants';
import { RealityDefenderError } from '../../src/errors';
import { mockClient } from '../setupTests';

// Get the mocked axios
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('HTTP Client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAxiosClient', () => {
    it('should create client with default base URL when not provided', () => {
      const client = createAxiosClient({ apiKey: 'test-key' });
      
      expect(client.baseUrl).toBe(DEFAULT_BASE_URL);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: DEFAULT_BASE_URL,
        headers: {
          'X-API-KEY': 'test-key',
          'Content-Type': 'application/json',
        },
      });
    });

    it('should create client with custom base URL when provided', () => {
      const customUrl = 'https://custom-api.example.com';
      const client = createAxiosClient({ 
        apiKey: 'test-key',
        baseUrl: customUrl
      });
      
      expect(client.baseUrl).toBe(customUrl);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: customUrl,
        headers: {
          'X-API-KEY': 'test-key',
          'Content-Type': 'application/json',
        },
      });
    });
  });

  describe('createHttpClient', () => {
    it('should create HTTP client with get, post and put methods', () => {
      const client = createHttpClient({ apiKey: 'test-key' });
      
      expect(client).toHaveProperty('get');
      expect(client).toHaveProperty('post');
      expect(client).toHaveProperty('put');
    });

    it('should handle successful GET requests', async () => {
      const mockData = { test: 'data' };
      const mockResponse = { data: mockData };
      mockedAxios.create.mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce(mockResponse)
      } as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      const result = await client.get('/test-path', { param: 'value' });
      
      expect(result).toEqual(mockData);
    });

    it('should handle GET requests without parameters', async () => {
      const mockData = { test: 'data' };
      const mockResponse = { data: mockData };
      mockedAxios.create.mockReturnValueOnce({
        get: jest.fn().mockResolvedValueOnce(mockResponse)
      } as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      const result = await client.get('/test-path');
      
      expect(result).toEqual(mockData);
    });

    it('should handle successful POST requests', async () => {
      const mockData = { id: '123' };
      const mockResponse = { data: mockData };
      mockedAxios.create.mockReturnValueOnce({
        post: jest.fn().mockResolvedValueOnce(mockResponse)
      } as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      const postData = { name: 'test' };
      const result = await client.post('/test-path', postData);
      
      expect(result).toEqual(mockData);
    });

    it('should handle POST requests without data', async () => {
      const mockData = { success: true };
      const mockResponse = { data: mockData };
      mockedAxios.create.mockReturnValueOnce({
        post: jest.fn().mockResolvedValueOnce(mockResponse)
      } as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      const result = await client.post('/test-path');
      
      expect(result).toEqual(mockData);
    });

    it('should handle successful PUT requests', async () => {
      mockedAxios.put.mockResolvedValueOnce({} as any);
      mockedAxios.create.mockReturnValueOnce({} as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      const putData = Buffer.from('test-data');
      const url = 'https://example.com/upload';
      
      await client.put(url, putData);
      
      // Verify the call was made
      expect(mockedAxios.put).toHaveBeenCalledWith(
        url,
        putData,
        expect.objectContaining({
          headers: {
            'Content-Type': 'application/octet-stream'
          }
        })
      );
    });

    it('should handle PUT requests with custom content type', async () => {
      mockedAxios.put.mockResolvedValueOnce({} as any);
      mockedAxios.create.mockReturnValueOnce({} as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      const putData = { test: 'data' };
      const url = 'https://example.com/upload';
      const contentType = 'application/json';
      
      await client.put(url, putData, contentType);
      
      // Verify the call was made
      expect(mockedAxios.put).toHaveBeenCalledWith(
        url,
        putData,
        expect.objectContaining({
          headers: {
            'Content-Type': contentType
          }
        })
      );
    });

    it('should handle errors in GET requests', async () => {
      const error = new Error('Network error');
      mockedAxios.create.mockReturnValueOnce({
        get: jest.fn().mockRejectedValueOnce(error)
      } as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      
      await expect(client.get('/test-path')).rejects.toThrow();
    });

    it('should handle errors in POST requests', async () => {
      const error = new Error('API error');
      mockedAxios.create.mockReturnValueOnce({
        post: jest.fn().mockRejectedValueOnce(error)
      } as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      
      await expect(client.post('/test-path', { data: 'test' })).rejects.toThrow();
    });

    it('should handle errors in PUT requests', async () => {
      const error = new Error('Upload error');
      mockedAxios.put.mockRejectedValueOnce(error);
      mockedAxios.create.mockReturnValueOnce({} as any);
      
      const client = createHttpClient({ apiKey: 'test-key' });
      
      await expect(client.put('https://example.com/upload', Buffer.from('test'))).rejects.toThrow();
    });
  });

  describe('handleAxiosError', () => {
    it('should handle unauthorized errors (401)', () => {
      const error = {
        isAxiosError: true,
        response: { status: 401 },
        message: 'Unauthorized',
        config: {},
        request: {}
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('unauthorized');
    });

    it('should handle not found errors (404)', () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 },
        message: 'Not Found',
        config: { url: '/test/url' },
        request: {}
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('not_found');
    });

    it('should handle not found errors without URL', () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 },
        message: 'Not Found',
        config: {},
        request: {}
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('not_found');
    });

    it('should handle unsupported file type errors (415)', () => {
      const error = {
        isAxiosError: true,
        response: { status: 415 },
        message: 'Unsupported Media Type',
        config: {},
        request: {}
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('invalid_file');
    });

    it('should handle server errors (5xx)', () => {
      const error = {
        isAxiosError: true,
        response: { status: 500 },
        message: 'Internal Server Error',
        config: {},
        request: {}
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('server_error');
    });

    it('should handle other response status codes', () => {
      const error = {
        isAxiosError: true,
        response: { status: 429 },
        message: 'Too Many Requests',
        config: {},
        request: {}
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('unknown_error');
    });

    it('should handle axios errors without response', () => {
      const error = {
        isAxiosError: true,
        message: 'Network Error',
        config: {},
        request: {}
      };
      mockedAxios.isAxiosError.mockReturnValueOnce(true);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('unknown_error');
    });

    it('should handle non-axios errors', () => {
      const error = new Error('Generic Error');
      mockedAxios.isAxiosError.mockReturnValueOnce(false);
      
      const result = handleAxiosError(error);
      
      expect(result).toBeInstanceOf(RealityDefenderError);
      expect(result.code).toBe('unknown_error');
    });
  });
}); 