import { AzureConfig } from '../types';

export const azureConfig: AzureConfig = {
  storage: {
    connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || '',
    containerName: process.env.AZURE_STORAGE_CONTAINER_NAME || 'pdf-files',
  },
  openai: {
    apiKey: process.env.AZURE_OPENAI_API_KEY || '',
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || '',
    deploymentName: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4',
  },
  speech: {
    key: process.env.AZURE_SPEECH_KEY || '',
    region: process.env.AZURE_SPEECH_REGION || '',
  },
  ad: {
    clientId: process.env.AZURE_AD_CLIENT_ID || '',
    tenantId: process.env.AZURE_AD_TENANT_ID || '',
    audience: process.env.AZURE_AD_AUDIENCE || '',
  },
};

export const validateConfig = (): void => {
  const requiredEnvVars = [
    'AZURE_STORAGE_CONNECTION_STRING',
    'AZURE_OPENAI_API_KEY',
    'AZURE_OPENAI_ENDPOINT',
    'AZURE_OPENAI_DEPLOYMENT_NAME',
    'AZURE_SPEECH_KEY',
    'AZURE_SPEECH_REGION',
    'AZURE_AD_CLIENT_ID',
    'AZURE_AD_TENANT_ID',
    'AZURE_AD_AUDIENCE',
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingEnvVars.join(', ')}`
    );
  }
};

export const getStorageConfig = () => azureConfig.storage;
export const getOpenAIConfig = () => azureConfig.openai;
export const getSpeechConfig = () => azureConfig.speech;
export const getADConfig = () => azureConfig.ad; 