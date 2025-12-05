import { Hono } from 'hono';
import { MetadataService } from '../services/metadata.service.js';
import { createMetadataSchema, updateMetadataSchema } from '../validations/schemas.js';
import { AuthContext } from '../middleware/auth.middleware.js';

export function createMetadataRoutes(metadataService: MetadataService) {
  const app = new Hono();

  app.get('/:documentId', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('documentId');
      const metadata = await metadataService.getDocumentMetadata(documentId, userId);
      return c.json(metadata, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to fetch metadata' }, 400);
    }
  });

  app.get('/:documentId/:key', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('documentId');
      const key = c.req.param('key');
      const metadata = await metadataService.getMetadataByKey(documentId, key, userId);
      
      if (!metadata) {
        return c.json({ error: 'Metadata not found' }, 404);
      }

      return c.json(metadata, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to fetch metadata' }, 400);
    }
  });

  app.post('/:documentId', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('documentId');
      const body = await c.req.json();
      const validated = createMetadataSchema.parse(body);

      const metadata = await metadataService.createMetadata(
        documentId,
        validated.key,
        validated.value,
        userId
      );

      return c.json(metadata, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to create metadata' }, 400);
    }
  });

  app.patch('/:documentId/:id', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('documentId');
      const id = c.req.param('id');
      const body = await c.req.json();
      const validated = updateMetadataSchema.parse(body);

      const metadata = await metadataService.updateMetadata(id, documentId, validated.value, userId);
      
      if (!metadata) {
        return c.json({ error: 'Metadata not found' }, 404);
      }

      return c.json(metadata, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to update metadata' }, 400);
    }
  });

  app.delete('/:documentId/:id', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('documentId');
      const id = c.req.param('id');
      const deleted = await metadataService.deleteMetadata(id, documentId, userId);
      
      if (!deleted) {
        return c.json({ error: 'Metadata not found' }, 404);
      }

      return c.json({ message: 'Metadata deleted successfully' }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to delete metadata' }, 400);
    }
  });

  return app;
}

