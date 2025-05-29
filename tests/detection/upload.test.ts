/**
 * Tests for upload module
 */
import { getSignedUrl, uploadToSignedUrl, uploadFile } from '../../src/detection/upload';
import { RealityDefenderError } from '../../src/errors';
import { readFileContent, getFileName } from '../../src/utils/files';
import { mockClient } from '../setupTests';
import fs from 'fs';

// Mock readFileContent
jest.mock('../../src/utils/files', () => ({
  readFileContent: jest.fn(),
  getFileName: jest.fn()
}));

describe('Upload Module', () => {
  const mockFileContent = Buffer.from('test-file-content');
  
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock file reading
    (fs.existsSync as jest.Mock).mockImplementation(() => true);
    (fs.readFileSync as jest.Mock).mockImplementation(() => mockFileContent);
    (readFileContent as jest.Mock).mockReturnValue(mockFileContent);
    (getFileName as jest.Mock).mockReturnValue('test-file.jpg');
  });
  
  describe('getSignedUrl', () => {
    it('should get a signed URL successfully', async () => {
      const expectedResponse = {
        code: 'ok',
        response: { signedUrl: 'https://example.com/upload' },
        errno: 0,
        mediaId: 'media-123',
        requestId: 'request-123'
      };
      
      mockClient.post.mockResolvedValueOnce(expectedResponse);
      
      const result = await getSignedUrl(mockClient, 'test-file.jpg');
      
      expect(mockClient.post).toHaveBeenCalledWith('/api/files/aws-presigned', { fileName: 'test-file.jpg' });
      expect(result).toEqual(expectedResponse);
    });
    
    it('should handle RealityDefenderError errors', async () => {
      const error = new RealityDefenderError('Invalid request', 'server_error');
      mockClient.post.mockRejectedValueOnce(error);
      
      await expect(getSignedUrl(mockClient, 'test-file.jpg'))
        .rejects.toThrow(error);
    });
    
    it('should handle generic errors', async () => {
      const error = new Error('Network error');
      mockClient.post.mockRejectedValueOnce(error);
      
      await expect(getSignedUrl(mockClient, 'test-file.jpg'))
        .rejects.toThrow(RealityDefenderError);
      
      mockClient.post.mockRejectedValueOnce(error);
      await expect(getSignedUrl(mockClient, 'test-file.jpg'))
        .rejects.toThrow('Failed to get signed URL: Network error');
    });
  });
  
  describe('uploadToSignedUrl', () => {
    it('should upload file content to signed URL successfully', async () => {
      mockClient.put.mockResolvedValueOnce(undefined);
      
      await uploadToSignedUrl(mockClient, 'https://example.com/upload', '/path/to/test-file.jpg');
      
      expect(readFileContent).toHaveBeenCalledWith('/path/to/test-file.jpg');
      expect(mockClient.put).toHaveBeenCalledWith('https://example.com/upload', mockFileContent);
    });
    
    it('should handle RealityDefenderError errors', async () => {
      const error = new RealityDefenderError('Upload failed', 'upload_failed');
      mockClient.put.mockRejectedValueOnce(error);
      
      await expect(uploadToSignedUrl(mockClient, 'https://example.com/upload', '/path/to/file'))
        .rejects.toThrow(error);
    });
    
    it('should handle generic errors', async () => {
      const error = new Error('Upload error');
      mockClient.put.mockRejectedValueOnce(error);
      
      await expect(uploadToSignedUrl(mockClient, 'https://example.com/upload', '/path/to/file'))
        .rejects.toThrow(RealityDefenderError);
      
      mockClient.put.mockRejectedValueOnce(error);
      await expect(uploadToSignedUrl(mockClient, 'https://example.com/upload', '/path/to/file'))
        .rejects.toThrow('Upload failed: Upload error');
    });
  });
  
  describe('uploadFile', () => {
    it('should upload file successfully', async () => {
      // Mock the signed URL response
      const signedUrlResponse = {
        code: 'ok',
        response: { signedUrl: 'https://example.com/upload' },
        errno: 0,
        mediaId: 'media-123',
        requestId: 'request-123'
      };
      
      mockClient.post.mockResolvedValueOnce(signedUrlResponse);
      mockClient.put.mockResolvedValueOnce(undefined);
      
      const result = await uploadFile(mockClient, { filePath: '/path/to/test-file.jpg' });
      
      // Verify the signed URL was requested
      expect(mockClient.post).toHaveBeenCalledWith('/api/files/aws-presigned', { fileName: 'test-file.jpg' });
      
      // Verify file content was uploaded
      expect(mockClient.put).toHaveBeenCalledWith('https://example.com/upload', expect.any(Buffer));
      
      // Verify the result
      expect(result).toEqual({
        mediaId: 'media-123',
        requestId: 'request-123'
      });
    });
    
    it('should handle errors during signed URL request', async () => {
      const error = new Error('Network error');
      mockClient.post.mockRejectedValueOnce(error);
      
      await expect(uploadFile(mockClient, { filePath: '/path/to/test-file.jpg' }))
        .rejects.toThrow();
    });
    
    it('should handle errors during file upload', async () => {
      // Mock the signed URL response
      const signedUrlResponse = {
        code: 'ok',
        response: { signedUrl: 'https://example.com/upload' },
        errno: 0,
        mediaId: 'media-123',
        requestId: 'request-123'
      };
      
      // The first call (getSignedUrl) succeeds, but the upload fails
      mockClient.post.mockResolvedValueOnce(signedUrlResponse);
      mockClient.put.mockRejectedValueOnce(new Error('Upload failed'));
      
      await expect(uploadFile(mockClient, { filePath: '/path/to/test-file.jpg' }))
        .rejects.toThrow();
    });
  });
}); 