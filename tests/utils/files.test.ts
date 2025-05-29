/**
 * Tests for file utilities
 */
import fs from 'fs';
import path from 'path';
import { readFileContent, getFileName } from '../../src/utils/files';
import { RealityDefenderError } from '../../src/errors';

// Mock path.basename
jest.mock('path', () => ({
  basename: jest.fn()
}));

describe('File Utilities', () => {
  const mockFileContent = Buffer.from('test file content');
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('readFileContent', () => {
    it('should read file content successfully', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      (fs.readFileSync as jest.Mock).mockReturnValueOnce(mockFileContent);
      
      const content = readFileContent('/path/to/test-file.jpg');
      
      expect(fs.existsSync).toHaveBeenCalledWith('/path/to/test-file.jpg');
      expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/test-file.jpg');
      expect(content).toEqual(mockFileContent);
    });
    
    it('should throw error when file does not exist', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(false);
      
      expect(() => readFileContent('/path/to/test-file.jpg'))
        .toThrow('File not found: /path/to/test-file.jpg');
    });
    
    it('should throw error when file read fails', () => {
      (fs.existsSync as jest.Mock).mockReturnValueOnce(true);
      const error = new Error('Read error');
      (fs.readFileSync as jest.Mock).mockImplementationOnce(() => {
        throw error;
      });
      
      expect(() => readFileContent('/path/to/test-file.jpg'))
        .toThrow('Failed to read file: Read error');
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
}); 