import { OpenAIClient, AzureKeyCredential } from '@azure/openai';
import { getOpenAIConfig } from '../config/azure';
import { ErrorResponse } from '../types';

export class OpenAIService {
  private client: OpenAIClient;

  constructor() {
    const { apiKey, endpoint } = getOpenAIConfig();
    this.client = new OpenAIClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );
  }

  async analyzeText(text: string): Promise<{
    language: string;
    summary: string;
    keywords: string[];
  }> {
    try {
      const deploymentName = getOpenAIConfig().deploymentName;
      const prompt = `Analyze the following text and provide:
1. The language it's written in (en/ru)
2. A brief summary (max 200 words)
3. Key topics and concepts (as a list)

Text: ${text}`;

      const response = await this.client.getChatCompletions(deploymentName, [
        {
          role: 'system',
          content:
            'You are a helpful assistant that analyzes text and provides structured information.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      // Parse the response
      const lines = result.split('\n');
      const language = lines.find((line) =>
        line.toLowerCase().includes('language')
      )?.split(':')[1]?.trim() || 'en';

      const summary = lines
        .find((line) => line.toLowerCase().includes('summary'))
        ?.split(':')
        .slice(1)
        .join(':')
        .trim() || '';

      const keywords = lines
        .find((line) => line.toLowerCase().includes('topics') || line.toLowerCase().includes('concepts'))
        ?.split(':')[1]
        ?.split(',')
        .map((k) => k.trim())
        .filter(Boolean) || [];

      return {
        language,
        summary,
        keywords,
      };
    } catch (error) {
      throw new ErrorResponse({
        code: 'OPENAI_ANALYSIS_ERROR',
        message: 'Failed to analyze text',
        details: error,
      });
    }
  }

  async extractTextFromPDF(pdfText: string): Promise<string> {
    try {
      const deploymentName = getOpenAIConfig().deploymentName;
      const prompt = `Extract and clean the main text content from the following PDF text, removing headers, footers, page numbers, and other non-content elements. Preserve the logical structure and formatting of the content.

PDF Text: ${pdfText}`;

      const response = await this.client.getChatCompletions(deploymentName, [
        {
          role: 'system',
          content:
            'You are a helpful assistant that extracts and cleans text from PDF documents.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      return result;
    } catch (error) {
      throw new ErrorResponse({
        code: 'OPENAI_EXTRACTION_ERROR',
        message: 'Failed to extract text from PDF',
        details: error,
      });
    }
  }

  async optimizeTextForSpeech(text: string): Promise<string> {
    try {
      const deploymentName = getOpenAIConfig().deploymentName;
      const prompt = `Optimize the following text for speech synthesis by:
1. Breaking long sentences into shorter ones
2. Adding appropriate punctuation
3. Converting abbreviations and symbols to full words
4. Maintaining natural flow and readability

Text: ${text}`;

      const response = await this.client.getChatCompletions(deploymentName, [
        {
          role: 'system',
          content:
            'You are a helpful assistant that optimizes text for speech synthesis.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ]);

      const result = response.choices[0]?.message?.content;
      if (!result) {
        throw new Error('No response from OpenAI');
      }

      return result;
    } catch (error) {
      throw new ErrorResponse({
        code: 'OPENAI_OPTIMIZATION_ERROR',
        message: 'Failed to optimize text for speech',
        details: error,
      });
    }
  }
} 