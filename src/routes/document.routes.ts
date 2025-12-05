import { Hono } from 'hono';
import { DocumentService } from '../services/document.service.js';
import { uploadDocumentSchema, updateDocumentSchema, searchDocumentsSchema } from '../validations/schemas.js';
import { saveFile, deleteFile } from '../utils/file-storage.js';
import { parsePaginationOptions } from '../utils/pagination.js';
import { AuthContext } from '../middleware/auth.middleware.js';

export function createDocumentRoutes(documentService: DocumentService) {
  const app = new Hono();

  app.post('/upload', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const formData = await c.req.formData();
      const file = formData.get('file') as File;
      const metadataJson = formData.get('metadata') as string | null;
      const tagsJson = formData.get('tags') as string | null;

      if (!file) {
        return c.json({ error: 'File is required' }, 400);
      }

      const metadata = metadataJson ? JSON.parse(metadataJson) : undefined;
      const tags = tagsJson ? JSON.parse(tagsJson) : undefined;

      const validated = uploadDocumentSchema.parse({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        tags,
        metadata,
      });

      const filePath = await saveFile(file, userId);
      
      const document = await documentService.createDocument(
        userId,
        validated.fileName,
        filePath,
        validated.mimeType,
        validated.fileSize,
        validated.tags,
        validated.metadata
      );

      return c.json(document, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Upload failed' }, 400);
    }
  });

  app.get('/', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const pagination = parsePaginationOptions(c.req.query());
      const result = await documentService.getUserDocuments(userId, pagination);
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to fetch documents' }, 400);
    }
  });

  app.get('/search', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const query = c.req.query();
      const validated = searchDocumentsSchema.parse(query);
      
      const result = await documentService.searchDocuments(
        {
          userId,
          tags: validated.tags,
          metadata: validated.metadata,
          fileName: validated.fileName,
        },
        {
          page: validated.page,
          limit: validated.limit,
        }
      );
      
      return c.json(result, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Search failed' }, 400);
    }
  });

  app.get('/:id', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('id');
      const document = await documentService.getDocumentById(documentId, userId);
      
      if (!document) {
        return c.json({ error: 'Document not found' }, 404);
      }

      return c.json(document, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to fetch document' }, 400);
    }
  });

  app.patch('/:id', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('id');
      const body = await c.req.json();
      const validated = updateDocumentSchema.parse(body);

      const document = await documentService.updateDocument(documentId, userId, validated);
      
      if (!document) {
        return c.json({ error: 'Document not found' }, 404);
      }

      return c.json(document, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Update failed' }, 400);
    }
  });

  app.delete('/:id', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('id');
      
      // Get document first to get file path
      const document = await documentService.getDocumentById(documentId, userId);
      if (!document) {
        return c.json({ error: 'Document not found' }, 404);
      }

      const deleted = await documentService.deleteDocument(documentId, userId);
      
      if (!deleted) {
        return c.json({ error: 'Failed to delete document' }, 400);
      }

      // Delete the physical file
      await deleteFile(document.filePath);

      return c.json({ message: 'Document deleted successfully' }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Delete failed' }, 400);
    }
  });

  return app;
}

