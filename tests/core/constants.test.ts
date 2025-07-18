/**
 * Tests for constants
 */
import {
  DEFAULT_BASE_URL,
  DEFAULT_POLLING_INTERVAL,
  DEFAULT_TIMEOUT,
  API_PATHS,
} from '../../src/core/constants';

describe('Constants', () => {
  it('should export the correct default base URL', () => {
    expect(DEFAULT_BASE_URL).toBe('https://api.prd.realitydefender.xyz');
  });

  it('should export the correct default polling interval', () => {
    expect(DEFAULT_POLLING_INTERVAL).toBe(5000);
  });

  it('should export the correct default timeout', () => {
    expect(DEFAULT_TIMEOUT).toBe(300000);
  });

  it('should export the correct API paths', () => {
    expect(API_PATHS).toEqual({
      ALL_MEDIA_RESULTS: '/api/v2/media/users/pages',
      SIGNED_URL: '/api/files/aws-presigned',
      MEDIA_RESULT: '/api/media/users',
    });
  });
});
