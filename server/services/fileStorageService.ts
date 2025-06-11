import { Readable } from 'stream';
import fs from 'fs-extra';
import path from 'path';
import { config } from '../config'; // Will be used for the factory and LocalDisk service

export interface UploadedFileResponse {
  storageKey: string; // Unique key/path in the storage system
  publicUrl?: string;  // Optional direct public URL if applicable
  fileName: string; // Original filename
  mimeType?: string;
  size?: number;
  // Any other relevant metadata from the storage provider
}

export interface IFileStorageService {
  uploadFile(
    tempFilePath: string,
    originalName: string,
    mimeType: string,
    destinationPathPrefix?: string // e.g., 'user-documents/', 'avatars/'
  ): Promise<UploadedFileResponse>;

  deleteFile(storageKey: string): Promise<void>;

  getFileUrl(storageKey: string): Promise<string | null>;

  // Optional: For proxied downloads if direct URLs are not always used/desired
  // downloadFileStream(storageKey: string): Promise<Readable | null>;
}

// Mock Cloud File Storage Service
export class MockCloudFileStorageService implements IFileStorageService {
  async uploadFile(
    tempFilePath: string,
    originalName: string,
    mimeType: string,
    destinationPathPrefix: string = 'general'
  ): Promise<UploadedFileResponse> {
    console.log(`[MockCloudStorage] Uploading file: ${originalName} from ${tempFilePath} to prefix ${destinationPathPrefix}`);
    const timestamp = Date.now();
    const storageKey = `mock-cloud://${destinationPathPrefix}/${originalName}-${timestamp}`;

    try {
      // Simulate deleting the temporary file
      await fs.unlink(tempFilePath);
      console.log(`[MockCloudStorage] Deleted temporary file: ${tempFilePath}`);
    } catch (error) {
      console.error(`[MockCloudStorage] Error deleting temp file ${tempFilePath}:`, error);
      // Not throwing error for mock, just logging
    }

    const response: UploadedFileResponse = {
      storageKey,
      publicUrl: `https://example.com/mock-files/${storageKey.replace('mock-cloud://', '')}`,
      fileName: originalName,
      mimeType,
      // size: (await fs.stat(tempFilePath)).size, // tempFilePath would be deleted by now
    };
    console.log(`[MockCloudStorage] File uploaded. Response:`, response);
    return response;
  }

  async deleteFile(storageKey: string): Promise<void> {
    console.log(`[MockCloudStorage] Deleting file with storageKey: ${storageKey}`);
    // Simulate deletion
    return Promise.resolve();
  }

  async getFileUrl(storageKey: string): Promise<string | null> {
    const url = `https://example.com/mock-files/${storageKey.replace('mock-cloud://', '')}`;
    console.log(`[MockCloudStorage] Getting URL for storageKey ${storageKey}: ${url}`);
    return Promise.resolve(url);
  }
}

// Local Disk File Storage Service (Wrapper for current method)
export class LocalDiskFileStorageService implements IFileStorageService {
  private uploadDir = path.resolve(process.cwd(), 'uploads');

  constructor() {
    fs.ensureDirSync(this.uploadDir);
    console.log(`[LocalDiskStorage] Ensuring upload directory exists: ${this.uploadDir}`);
  }

  async uploadFile(
    tempFilePath: string,
    originalName: string,
    mimeType: string,
    destinationPathPrefix: string = 'general'
  ): Promise<UploadedFileResponse> {
    const safeOriginalName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_'); // Sanitize filename
    const uniqueFileName = `${Date.now()}-${safeOriginalName}`;
    const relativeDestPath = path.join(destinationPathPrefix, uniqueFileName);
    const absoluteDestPath = path.join(this.uploadDir, relativeDestPath);

    console.log(`[LocalDiskStorage] Moving file from ${tempFilePath} to ${absoluteDestPath}`);

    await fs.ensureDir(path.dirname(absoluteDestPath));
    await fs.move(tempFilePath, absoluteDestPath, { overwrite: true });

    const stats = await fs.stat(absoluteDestPath);

    const response: UploadedFileResponse = {
      storageKey: relativeDestPath.replace(/\\/g, '/'), // Use forward slashes for consistency
      // Public URL might depend on how server serves static files, e.g. /uploads/...
      publicUrl: `/uploads/${relativeDestPath.replace(/\\/g, '/')}`,
      fileName: originalName, // Store original name
      mimeType,
      size: stats.size,
    };
    console.log(`[LocalDiskStorage] File uploaded. Response:`, response);
    return response;
  }

  async deleteFile(storageKey: string): Promise<void> {
    const absolutePath = path.join(this.uploadDir, storageKey);
    console.log(`[LocalDiskStorage] Deleting file: ${absolutePath}`);
    try {
      await fs.unlink(absolutePath);
      console.log(`[LocalDiskStorage] File deleted: ${absolutePath}`);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        console.warn(`[LocalDiskStorage] File not found for deletion: ${absolutePath}`);
      } else {
        console.error(`[LocalDiskStorage] Error deleting file ${absolutePath}:`, error);
        throw error; // Re-throw other errors
      }
    }
  }

  async getFileUrl(storageKey: string): Promise<string | null> {
    // For local disk, the URL is typically a relative path served statically
    const url = `/uploads/${storageKey.replace(/\\/g, '/')}`;
    console.log(`[LocalDiskStorage] Getting URL for storageKey ${storageKey}: ${url}`);
    return Promise.resolve(url);
  }
}

// Factory for File Storage Service
export function getFileStorageService(): IFileStorageService {
  if (config.FILE_STORAGE_PROVIDER === 'mock-cloud') {
    console.log('[FileStorageFactory] Using MockCloudFileStorageService');
    return new MockCloudFileStorageService();
  }
  // Add 's3', 'gcs' cases here in the future
  console.log('[FileStorageFactory] Using LocalDiskFileStorageService');
  return new LocalDiskFileStorageService(); // Default or 'local'
}
