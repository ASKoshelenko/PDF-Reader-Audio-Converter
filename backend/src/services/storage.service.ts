import {
  BlobServiceClient,
  ContainerClient,
  BlobClient,
  BlockBlobClient,
} from '@azure/storage-blob';
import { getStorageConfig } from '../config/azure';
import { ErrorResponse } from '../types';

export class StorageService {
  private containerClient: ContainerClient;

  constructor() {
    const { connectionString, containerName } = getStorageConfig();
    const blobServiceClient = BlobServiceClient.fromConnectionString(
      connectionString
    );
    this.containerClient = blobServiceClient.getContainerClient(containerName);
  }

  async initialize(): Promise<void> {
    try {
      await this.containerClient.createIfNotExists({
        access: 'blob',
      });
    } catch (error) {
      throw new Error('Failed to initialize storage container');
    }
  }

  async uploadFile(
    blobName: string,
    fileBuffer: Buffer,
    contentType: string
  ): Promise<string> {
    try {
      const blockBlobClient = this.containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
        blobHTTPHeaders: { blobContentType: contentType },
      });
      return blockBlobClient.url;
    } catch (error) {
      throw new ErrorResponse({
        code: 'STORAGE_UPLOAD_ERROR',
        message: 'Failed to upload file',
        details: error,
      });
    }
  }

  async downloadFile(blobName: string): Promise<Buffer> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      const downloadResponse = await blobClient.download();
      const chunks: Buffer[] = [];
      for await (const chunk of downloadResponse.readableStreamBody || []) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    } catch (error) {
      throw new ErrorResponse({
        code: 'STORAGE_DOWNLOAD_ERROR',
        message: 'Failed to download file',
        details: error,
      });
    }
  }

  async deleteFile(blobName: string): Promise<void> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      await blobClient.delete();
    } catch (error) {
      throw new ErrorResponse({
        code: 'STORAGE_DELETE_ERROR',
        message: 'Failed to delete file',
        details: error,
      });
    }
  }

  async getFileUrl(blobName: string): Promise<string> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      return blobClient.url;
    } catch (error) {
      throw new ErrorResponse({
        code: 'STORAGE_URL_ERROR',
        message: 'Failed to get file URL',
        details: error,
      });
    }
  }

  async generateSasUrl(
    blobName: string,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      const sasUrl = await blobClient.generateSasUrl({
        permissions: 'r',
        expiresOn: new Date(Date.now() + expiresIn * 1000),
      });
      return sasUrl;
    } catch (error) {
      throw new ErrorResponse({
        code: 'STORAGE_SAS_URL_ERROR',
        message: 'Failed to generate SAS URL',
        details: error,
      });
    }
  }

  async checkFileExists(blobName: string): Promise<boolean> {
    try {
      const blobClient = this.containerClient.getBlobClient(blobName);
      return await blobClient.exists();
    } catch (error) {
      throw new ErrorResponse({
        code: 'STORAGE_CHECK_ERROR',
        message: 'Failed to check file existence',
        details: error,
      });
    }
  }
} 