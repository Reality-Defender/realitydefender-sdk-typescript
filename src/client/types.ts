/**
 * HTTP client type definitions
 */

import { AxiosInstance, AxiosError } from 'axios';
import { RealityDefenderConfig } from '../types/sdk';

/**
 * HTTP client interface for API communication
 */
export interface HttpClient {
  /**
   * Send a GET request
   * @param path API endpoint path
   * @param params Optional query parameters
   * @returns Promise resolving to the response data
   */
  get<T>(path: string, params?: Record<string, any>): Promise<T>;
  
  /**
   * Send a POST request
   * @param path API endpoint path
   * @param data Request body data
   * @returns Promise resolving to the response data
   */
  post<T>(path: string, data?: any): Promise<T>;
  
  /**
   * Send a PUT request
   * @param url Full URL for the request
   * @param data Request body data
   * @param contentType Optional content type
   * @returns Promise resolving to the response data
   */
  put<T>(url: string, data: any, contentType?: string): Promise<void>;
}

/**
 * Configuration for creating an HTTP client
 */
export type HttpClientConfig = Pick<RealityDefenderConfig, 'apiKey' | 'baseUrl'>;

/**
 * Type for the Axios instance and configuration
 */
export interface AxiosClientInstance {
  /**
   * Axios HTTP client
   */
  client: AxiosInstance;
  
  /**
   * Base URL for API requests
   */
  baseUrl: string;
} 