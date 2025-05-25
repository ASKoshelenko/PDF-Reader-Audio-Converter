import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { StorageService } from '../services/storage.service';
import { OpenAIService } from '../services/openai.service';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { ErrorResponse } from '../types';
import { PDFFile } from '../types';

const httpTrigger: AzureFunction = async function (
  context: Context,
  req: HttpRequest
): Promise<void> {
  try {
    // Apply authentication middleware
    await new Promise<void>((resolve, reject) => {
      authMiddleware(req as AuthRequest, {} as any, (error?: any) => {
        if (error) reject(error);
        else resolve();
      });
    });

    const user = (req as AuthRequest).user;
    if (!user) {
      throw new ErrorResponse({
        code: 'AUTH_USER_NOT_FOUND',
        message: 'User not found in request',
        status: 401,
      });
    }

    // Validate file
    if (!req.files || !req.files.pdf) {
      throw new ErrorResponse({
        code: 'UPLOAD_NO_FILE',
        message: 'No PDF file provided',
        status: 400,
      });
    }

    const file = req.files.pdf;
    if (file.mimetype !== 'application/pdf') {
      throw new ErrorResponse({
        code: 'UPLOAD_INVALID_TYPE',
        message: 'File must be a PDF',
        status: 400,
      });
    }

    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new ErrorResponse({
        code: 'UPLOAD_FILE_TOO_LARGE',
        message: 'File size exceeds 50MB limit',
        status: 400,
      });
    }

    // Initialize services
    const storageService = new StorageService();
    const openAIService = new OpenAIService();

    // Generate unique blob name
    const timestamp = new Date().getTime();
    const blobName = `${user.id}/${timestamp}-${file.name}`;

    // Upload file to storage
    await storageService.uploadFile(blobName, file.data, file.mimetype);

    // Extract and analyze text
    const pdfText = file.data.toString('utf-8');
    const { language, summary, keywords } = await openAIService.analyzeText(pdfText);

    // Create file record
    const pdfFile: PDFFile = {
      id: `${user.id}-${timestamp}`,
      userId: user.id,
      name: file.name,
      size: file.size,
      status: 'uploaded',
      language,
      blobName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Save file record to database

    context.res = {
      status: 200,
      body: {
        file: pdfFile,
        analysis: {
          summary,
          keywords,
        },
      },
    };
  } catch (error) {
    context.res = {
      status: error.status || 500,
      body: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || 'An unexpected error occurred',
        ...(process.env.NODE_ENV === 'development' && { details: error.details }),
      },
    };
  }
};

export default httpTrigger; 