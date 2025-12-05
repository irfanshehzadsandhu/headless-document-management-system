import { Hono } from 'hono';
import { DownloadLinkService } from '../services/download-link.service.js';
import { AuthService } from '../services/auth.service.js';
import { generateDownloadLinkSchema } from '../validations/schemas.js';
import { getFile } from '../utils/file-storage.js';
import { AuthContext, authMiddleware } from '../middleware/auth.middleware.js';

export function createDownloadRoutes(downloadLinkService: DownloadLinkService, authService: AuthService) {
  const app = new Hono();

  // Generate endpoint requires auth
  app.post('/:documentId/generate', authMiddleware(authService), async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('documentId');
      const query = c.req.query();
      const validated = generateDownloadLinkSchema.parse(query);

      const result = await downloadLinkService.generateDownloadLink(
        documentId,
        userId,
        validated.expiresInHours
      );

      return c.json(result, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to generate download link' }, 400);
    }
  });

  app.get('/:token', async (c) => {
    try {
      const token = c.req.param('token');
      const result = await downloadLinkService.validateDownloadLink(token);
      
      if (!result) {
        return c.json({ error: 'Invalid or expired download link' }, 404);
      }

      const file = await getFile(result.filePath);
      if (!file) {
        return c.json({ error: 'File not found' }, 404);
      }

      return c.body(file, 200, {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="download"`,
      });
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Download failed' }, 400);
    }
  });

  return app;
}

