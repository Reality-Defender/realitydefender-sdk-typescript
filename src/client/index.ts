/**
 * HTTP client implementation using Axios
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { HttpClient, HttpClientConfig, AxiosClientInstance } from './types';
import { DEFAULT_BASE_URL } from '../core/constants';
import { RealityDefenderError } from '../errors';
import { BasicResponse } from '../types';

/**
 * Creates an Axios HTTP client
 * @param config Client configuration
 * @returns Axios client instance
 */
export function createAxiosClient(config: HttpClientConfig): AxiosClientInstance {
  const baseUrl = config.baseUrl || DEFAULT_BASE_URL;

  const client = axios.create({
    baseURL: baseUrl,
    headers: {
      'X-API-KEY': config.apiKey,
      'Content-Type': 'application/json',
    },
  });

  return {
    client,
    baseUrl,
  };
}

/**
 * Create an HTTP client for API communication
 * @param config Client configuration
 * @returns HTTP client instance
 */
export function createHttpClient(config: HttpClientConfig): HttpClient {
  const { client } = createAxiosClient(config);

  return {
    /**
     * Send a GET request
     */
    async get<T>(path: string, params?: Record<string, any>): Promise<T> {
      try {
        const response = await client.get<T>(path, { params });
        return response.data;
      } catch (error) {
        throw handleAxiosError(error);
      }
    },

    /**
     * Send a POST request
     */
    async post<T>(path: string, data?: any): Promise<T> {
      try {
        const response = await client.post<T>(path, data);
        return response.data;
      } catch (error) {
        throw handleAxiosError(error);
      }
    },

    /**
     * Send a PUT request
     */
    async put(
      url: string,
      data: any,
      contentType = 'application/octet-stream'
    ): Promise<void> {
      try {
        const config: AxiosRequestConfig = {
          headers: {
            'Content-Type': contentType,
          },
        };

        await axios.put(url, data, config);
      } catch (error) {
        throw handleAxiosError(error);
      }
    },
  };
}

/**
 * Handle Axios errors and convert them to SDK errors
 * @param error Error from Axios
 * @returns SDK error
 */
export function handleAxiosError(error: unknown): RealityDefenderError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    if (axiosError.response) {
      const status = axiosError.response.status;
      const responseData = axiosError.response.data as BasicResponse;

      if (status === 400 && responseData.code?.includes('free-tier-not-allowed')) {
        return new RealityDefenderError(
          responseData.message || 'Free tier not allowed',
          'unauthorized'
        );
      } else if (status === 401) {
        return new RealityDefenderError('Unauthorized: Invalid API key', 'unauthorized');
      } else if (status === 404) {
        return new RealityDefenderError(
          `Resource not found: ${axiosError.config?.url || ''}`,
          'not_found'
        );
      } else if (status === 415) {
        return new RealityDefenderError('Unsupported file type', 'invalid_file');
      } else if (status >= 500) {
        return new RealityDefenderError('Server error', 'server_error');
      } else {
        return new RealityDefenderError(`API error: ${responseData}`, 'unknown_error');
      }
    }

    return new RealityDefenderError(`API error: ${axiosError.message}`, 'unknown_error');
  }

  return new RealityDefenderError(
    `Request failed: ${(error as Error).message}`,
    'unknown_error'
  );
}
