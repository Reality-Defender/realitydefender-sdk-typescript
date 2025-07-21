/**
 * File handling utilities
 */

import fs from 'fs';
import path from 'path';
import { RealityDefenderError } from '../errors';
import { SUPPORTED_FILE_TYPES } from '../core/constants';

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
  const fileExtension = path.extname(filePath);
  const supportedFileType = SUPPORTED_FILE_TYPES.find(type =>
    type.extensions.includes(fileExtension)
  );

  if (!supportedFileType) {
    throw new RealityDefenderError(`Invalid file type: ${filePath}`, 'invalid_file');
  }

  const fileSize = fs.statSync(filePath).size;
  if (fileSize > supportedFileType.size_limit) {
    throw new RealityDefenderError(
      `File size exceeds limit: ${filePath}`,
      'file_too_large'
    );
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
