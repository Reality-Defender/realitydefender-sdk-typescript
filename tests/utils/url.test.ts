import { testUrl } from '../../src/utils/url';

describe('testUrl', () => {
  describe('valid URLs', () => {
    test('should return true for valid HTTP URLs', () => {
      expect(testUrl('http://example.com')).toBe(true);
      expect(testUrl('http://www.example.com')).toBe(true);
      expect(testUrl('http://subdomain.example.com')).toBe(true);
      expect(testUrl('http://example.com/path')).toBe(true);
      expect(testUrl('http://example.com/path?query=value')).toBe(true);
      expect(testUrl('http://example.com:8080')).toBe(true);
      expect(testUrl('http://192.168.1.1')).toBe(true);
      expect(testUrl('http://localhost')).toBe(true);
      expect(testUrl('http://localhost:3000')).toBe(true);
    });

    test('should return true for valid HTTPS URLs', () => {
      expect(testUrl('https://example.com')).toBe(true);
      expect(testUrl('https://www.example.com')).toBe(true);
      expect(testUrl('https://subdomain.example.com')).toBe(true);
      expect(testUrl('https://example.com/path')).toBe(true);
      expect(testUrl('https://example.com/path?query=value')).toBe(true);
      expect(testUrl('https://example.com:443')).toBe(true);
      expect(testUrl('https://api.example.com/v1/users')).toBe(true);
    });
  });

  describe('invalid URLs', () => {
    test('should return false for non-string inputs', () => {
      expect(testUrl(null)).toBe(false);
      expect(testUrl(undefined)).toBe(false);
      expect(testUrl(123)).toBe(false);
      expect(testUrl({})).toBe(false);
      expect(testUrl([])).toBe(false);
      expect(testUrl(true)).toBe(false);
    });

    test('should return false for empty or whitespace strings', () => {
      expect(testUrl('')).toBe(false);
      expect(testUrl(' ')).toBe(false);
      expect(testUrl('  ')).toBe(false);
      expect(testUrl('\t')).toBe(false);
      expect(testUrl('\n')).toBe(false);
    });

    test('should return false for invalid URL formats', () => {
      expect(testUrl('not-a-url')).toBe(false);
      expect(testUrl('example.com')).toBe(false);
      expect(testUrl('www.example.com')).toBe(false);
      expect(testUrl('//example.com')).toBe(false);
      expect(testUrl('http://')).toBe(false);
      expect(testUrl('https://')).toBe(false);
      expect(testUrl('http://?')).toBe(false);
      expect(testUrl('http://??')).toBe(false);
      expect(testUrl('http://??/')).toBe(false);
      expect(testUrl('http://#')).toBe(false);
      expect(testUrl('http://##')).toBe(false);
      expect(testUrl('http://##/')).toBe(false);
      expect(testUrl('http:// shouldfail.com')).toBe(false);
      expect(testUrl(':// should fail')).toBe(false);
    });

    test('should return false for non-HTTP/HTTPS protocols', () => {
      expect(testUrl('ftp://example.com')).toBe(false);
      expect(testUrl('file:///path/to/file')).toBe(false);
      expect(testUrl('mailto:user@example.com')).toBe(false);
      expect(testUrl('tel:+1234567890')).toBe(false);
      expect(testUrl('data:text/plain;base64,SGVsbG8=')).toBe(false);
      expect(testUrl('javascript:alert("hello")')).toBe(false);
      expect(testUrl('about:blank')).toBe(false);
    });

    test('should return false for malformed URLs', () => {
      expect(testUrl('http//example.com')).toBe(false);
      expect(testUrl('https//example.com')).toBe(false);
      expect(testUrl('http://[invalid')).toBe(false);
      expect(testUrl('http://invalid]')).toBe(false);
    });
  });

  describe('edge cases', () => {
    test('should handle URLs with special characters', () => {
      expect(testUrl('http://example.com/path%20with%20spaces')).toBe(true);
      expect(testUrl('https://example.com/path?param=value&other=test')).toBe(true);
      expect(testUrl('http://example.com/#section')).toBe(true);
      expect(testUrl('https://example.com/path?query=value#section')).toBe(true);
    });

    test('should handle IPv6 addresses', () => {
      expect(testUrl('http://[::1]')).toBe(true);
      expect(testUrl('https://[2001:db8::1]')).toBe(true);
      expect(testUrl('http://[2001:db8::1]:8080')).toBe(true);
    });

    test('should handle punycode domains', () => {
      expect(testUrl('http://xn--nxasmq6b')).toBe(true);
      expect(testUrl('https://xn--fsq.xn--0zwm56d')).toBe(true);
    });

    test('should handle very long URLs', () => {
      const longPath = 'a'.repeat(1000);
      expect(testUrl(`http://example.com/${longPath}`)).toBe(true);
      expect(testUrl(`https://example.com/${longPath}`)).toBe(true);
    });
  });
});
