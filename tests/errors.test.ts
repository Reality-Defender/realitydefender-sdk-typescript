/**
 * Tests for error handling
 */
import { RealityDefenderError, ErrorCode } from '../src/errors';

describe('RealityDefenderError', () => {
  it('should create a properly formatted error', () => {
    const error = new RealityDefenderError('Test error message', 'unknown_error');
    
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(RealityDefenderError);
    expect(error.name).toBe('RealityDefenderError');
    expect(error.message).toBe('Test error message');
    expect(error.code).toBe('unknown_error');
  });
  
  it('should work with instanceof checks', () => {
    const error = new RealityDefenderError('Test error', 'timeout');
    
    // This test ensures proper prototype chain
    expect(error instanceof RealityDefenderError).toBe(true);
    expect(error instanceof Error).toBe(true);
  });
  
  it('should work with all error code types', () => {
    // Test all possible error codes
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
      const error = new RealityDefenderError(`Error with code ${code}`, code);
      expect(error.code).toBe(code);
    });
  });
}); 