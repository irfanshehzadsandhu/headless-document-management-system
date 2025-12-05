import { Hono } from 'hono';
import { PermissionService } from '../services/permission.service.js';
import { createPermissionSchema, updatePermissionSchema } from '../validations/schemas.js';
import { AuthContext } from '../middleware/auth.middleware.js';

export function createPermissionRoutes(permissionService: PermissionService) {
  const app = new Hono();

  app.get('/:documentId', async (c: AuthContext) => {
    try {
      const userId = c.user?.userId;
      if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const documentId = c.req.param('documentId');
      const permissions = await permissionService.getDocumentPermissions(documentId, userId);
      return c.json(permissions, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to fetch permissions' }, 400);
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
      const validated = createPermissionSchema.parse(body);

      const permission = await permissionService.createPermission(
        documentId,
        validated.userId,
        {
          canRead: validated.canRead,
          canWrite: validated.canWrite,
          canDelete: validated.canDelete,
        },
        userId
      );

      return c.json(permission, 201);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to create permission' }, 400);
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
      const validated = updatePermissionSchema.parse(body);

      const permission = await permissionService.updatePermission(
        id,
        documentId,
        validated,
        userId
      );
      
      if (!permission) {
        return c.json({ error: 'Permission not found' }, 404);
      }

      return c.json(permission, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to update permission' }, 400);
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
      const deleted = await permissionService.deletePermission(id, documentId, userId);
      
      if (!deleted) {
        return c.json({ error: 'Permission not found' }, 404);
      }

      return c.json({ message: 'Permission deleted successfully' }, 200);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 400);
      }
      return c.json({ error: 'Failed to delete permission' }, 400);
    }
  });

  return app;
}

