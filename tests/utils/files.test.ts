/**
 * Tests file utilities
 */
import fs from 'fs';
import path from 'path';
import { readFileContent, getFileName } from '../../src/utils/files';

// Mock path.basename and path.extname
jest.mock('path', () => ({
  basename: jest.fn(),
  extname: jest.fn(),
}));

// Mock fs.statSync
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
  statSync: jest.fn(),
}));

describe('File Utilities', () => {
  const mockFileContent = Buffer.from('test file content');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readFileContent', () => {
    it('should read file content successfully', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (path.extname as jest.Mock).mockReturnValueOnce('.jpg');
      (fs.statSync as jest.Mock).mockReturnValueOnce({ size: 1000 });
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(mockFileContent);

      const content = readFileContent('/path/to/test-file.jpg');

      expect(content).toEqual(mockFileContent);
    });

    it('should throw error when file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);

      expect(() => readFileContent('/path/to/test-file.jpg')).toThrow(
        'File not found: /path/to/test-file.jpg'
      );
    });

    it('should throw error for unsupported file type', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (path.extname as jest.Mock).mockReturnValueOnce('.pdf');

      expect(() => readFileContent('/path/to/test.pdf')).toThrow(
        'Invalid file type: /path/to/test.pdf'
      );
    });

    it('should throw error when file exceeds size limit', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (path.extname as jest.Mock).mockReturnValueOnce('.jpg');
      (fs.statSync as jest.Mock).mockReturnValueOnce({ size: 999999999 });

      expect(() => readFileContent('/path/to/large.jpg')).toThrow(
        'File size exceeds limit: /path/to/large.jpg'
      );
    });

    it('should throw error when file read fails', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (path.extname as jest.Mock).mockReturnValueOnce('.jpg');
      (fs.statSync as jest.Mock).mockReturnValueOnce({ size: 1000 });
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Read error');
      });

      expect(() => readFileContent('/path/to/test-file.jpg')).toThrow(
        'Failed to read file: Read error'
      );
    });
  });

  describe('getFileName', () => {
    it('should extract filename from a path', () => {
      const filePath = '/path/to/test-file.jpg';
      (path.basename as jest.Mock).mockReturnValueOnce('test-file.jpg');

      const fileName = getFileName(filePath);

      expect(path.basename).toHaveBeenCalledWith(filePath);
      expect(fileName).toBe('test-file.jpg');
    });

    it('should handle Windows-style paths', () => {
      const filePath = 'C:\\path\\to\\test-file.jpg';
      (path.basename as jest.Mock).mockReturnValueOnce('test-file.jpg');

      const fileName = getFileName(filePath);

      expect(path.basename).toHaveBeenCalledWith(filePath);
      expect(fileName).toBe('test-file.jpg');
    });

    it('should handle filenames without directories', () => {
      const filePath = 'test-file.jpg';
      (path.basename as jest.Mock).mockReturnValueOnce('test-file.jpg');

      const fileName = getFileName(filePath);

      expect(path.basename).toHaveBeenCalledWith(filePath);
      expect(fileName).toBe('test-file.jpg');
    });

    it('should handle paths ending with a separator', () => {
      const filePath = '/path/to/';
      (path.basename as jest.Mock).mockReturnValueOnce('to');

      const fileName = getFileName(filePath);

      expect(path.basename).toHaveBeenCalledWith(filePath);
      expect(fileName).toBe('to');
    });
  });

  describe('SUPPORTED_FILE_TYPES validation', () => {
    it('should validate video files within size limit', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (path.extname as jest.Mock).mockReturnValueOnce('.mp4');
      (fs.statSync as jest.Mock).mockReturnValueOnce({ size: 100000000 });
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(mockFileContent);

      expect(() => readFileContent('/path/to/video.mp4')).not.toThrow();
    });

    it('should validate audio files within size limit', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (path.extname as jest.Mock).mockReturnValueOnce('.mp3');
      (fs.statSync as jest.Mock).mockReturnValueOnce({ size: 10000000 });
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(mockFileContent);

      expect(() => readFileContent('/path/to/audio.mp3')).not.toThrow();
    });

    it('should validate text files within size limit', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (path.extname as jest.Mock).mockReturnValueOnce('.txt');
      (fs.statSync as jest.Mock).mockReturnValueOnce({ size: 1000000 });
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(mockFileContent);

      expect(() => readFileContent('/path/to/text.txt')).not.toThrow();
    });
  });
});
