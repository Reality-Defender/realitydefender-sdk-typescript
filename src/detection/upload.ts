/**
 * Media upload functionality
 */

import { HttpClient } from '../client/types';
import { API_PATHS } from '../core/constants';
import { SignedUrlResponse } from '../types/api';
import { UploadOptions, UploadResult } from '../types/sdk';
import { readFileContent, getFileName } from '../utils/files';
import { RealityDefenderError } from '../errors';

/**
 * Get a signed URL for uploading a file
 * @param client HTTP client
 * @param fileName Name of the file to upload
 * @returns Signed URL response
 */
export async function getSignedUrl(
  client: HttpClient,
  fileName: string
): Promise<SignedUrlResponse> {
  try {
    return await client.post<SignedUrlResponse>(API_PATHS.SIGNED_URL, { fileName });
  } catch (error) {
    if (error instanceof RealityDefenderError) {
      throw error;
    }
    throw new RealityDefenderError(
      `Failed to get signed URL: ${(error as Error).message}`,
      'unknown_error'
    );
  }
}

/**
 * Upload file content to a signed URL
 * @param client HTTP client
 * @param signedUrl URL for uploading
 * @param filePath Path to the file to upload
 */
export async function uploadToSignedUrl(
  client: HttpClient,
  signedUrl: string,
  filePath: string
): Promise<void> {
  try {
    const fileContent = readFileContent(filePath);
    await client.put<void>(signedUrl, fileContent);
  } catch (error) {
    if (error instanceof RealityDefenderError) {
      throw error;
    }
    throw new RealityDefenderError(`Upload failed: ${(error as Error).message}`, 'upload_failed');
  }
}

/**
 * Upload a file for analysis
 * @param client HTTP client
 * @param options Upload options
 * @returns Upload result with request and media IDs
 */
export async function uploadFile(
  client: HttpClient,
  options: UploadOptions
): Promise<UploadResult> {
  const { filePath } = options;

  // Get the filename
  const fileName = getFileName(filePath);

  // Get signed URL
  const signedUrlResponse = await getSignedUrl(client, fileName);

  // Upload to signed URL
  await uploadToSignedUrl(client, signedUrlResponse.response.signedUrl, filePath);

  // Return result for tracking
  return {
    requestId: signedUrlResponse.requestId,
    mediaId: signedUrlResponse.mediaId,
  };
}
