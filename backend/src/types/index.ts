export interface User {
  id: string;
  email: string;
  name: string;
  subscription: 'free' | 'premium';
  createdAt: Date;
  lastLoginAt: Date;
}

export interface PDFFile {
  id: string;
  userId: string;
  name: string;
  size: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  language: 'en' | 'ru';
  blobName: string;
  audioBlobName?: string;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AudioSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  language: 'en' | 'ru';
}

export interface ConversionJob {
  id: string;
  fileId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AzureConfig {
  storage: {
    connectionString: string;
    containerName: string;
  };
  openai: {
    apiKey: string;
    endpoint: string;
    deploymentName: string;
  };
  speech: {
    key: string;
    region: string;
  };
  ad: {
    clientId: string;
    tenantId: string;
    audience: string;
  };
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
} 