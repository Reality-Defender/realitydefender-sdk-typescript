/**
 * File handling utilities
 */

import fs from 'fs';
import path from 'path';
import { RealityDefenderError } from '../errors';

/**
 * Validates that a file exists and reads its content
 * @param filePath Path to the file
 * @returns File contents as a Buffer
 */
export function readFileContent(filePath: string): Buffer {
  // Validate file exists
  if (!fs.existsSync(filePath)) {
    throw new RealityDefenderError(`File not found: ${filePath}`, 'invalid_file');
  }
  
  try {
    // Read file content
    return fs.readFileSync(filePath);
  } catch (error) {
    throw new RealityDefenderError(
      `Failed to read file: ${(error as Error).message}`, 
      'invalid_file'
    );
  }
}

/**
 * Extracts the filename from a file path
 * @param filePath Path to the file
 * @returns Base filename
 */
export function getFileName(filePath: string): string {
  return path.basename(filePath);
}
