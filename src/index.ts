import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { AuthService } from './services/auth.service.js';
import { DocumentService } from './services/document.service.js';
import { MetadataService } from './services/metadata.service.js';
import { PermissionService } from './services/permission.service.js';
import { DownloadLinkService } from './services/download-link.service.js';
import { UserRepository } from './repositories/user.repository.js';
import { DocumentRepository } from './repositories/document.repository.js';
import { DocumentMetadataRepository } from './repositories/document-metadata.repository.js';
import { PermissionRepository } from './repositories/permission.repository.js';
import { DownloadLinkRepository } from './repositories/download-link.repository.js';
import { authMiddleware, AuthContext } from './middleware/auth.middleware.js';
import { createAuthRoutes } from './routes/auth.routes.js';
import { createDocumentRoutes } from './routes/document.routes.js';
import { createMetadataRoutes } from './routes/metadata.routes.js';
import { createPermissionRoutes } from './routes/permission.routes.js';
import { createDownloadRoutes } from './routes/download.routes.js';

// Initialize repositories
const userRepository = new UserRepository();
const documentRepository = new DocumentRepository();
const metadataRepository = new DocumentMetadataRepository();
const permissionRepository = new PermissionRepository();
const downloadLinkRepository = new DownloadLinkRepository();

// Initialize services
const authService = new AuthService(userRepository);
const documentService = new DocumentService(documentRepository, metadataRepository, permissionRepository);
const metadataService = new MetadataService(metadataRepository, documentRepository, permissionRepository);
const permissionService = new PermissionService(permissionRepository, documentRepository);
const downloadLinkService = new DownloadLinkService(downloadLinkRepository, documentRepository, permissionRepository);

// Create Hono app
const app = new Hono<{ Variables: { user?: AuthContext['user'] } }>();

// Middleware
app.use('*', cors());

// Public routes (no auth required)
app.route('/api/auth', createAuthRoutes(authService));

// Download routes (generate requires auth, token download is public)
app.route('/api/download', createDownloadRoutes(downloadLinkService, authService));

// Protected routes (auth required)
app.use('/api/documents/*', authMiddleware(authService));
app.use('/api/metadata/*', authMiddleware(authService));
app.use('/api/permissions/*', authMiddleware(authService));

// Routes
app.route('/api/documents', createDocumentRoutes(documentService));
app.route('/api/metadata', createMetadataRoutes(metadataService));
app.route('/api/permissions', createPermissionRoutes(permissionService));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' }, 200);
});

// Start server
const port = parseInt(process.env.PORT || '3000', 10);

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`);
});

