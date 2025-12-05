import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Document schemas
export const uploadDocumentSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSize: z.coerce.number().int().positive(),
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const updateDocumentSchema = z.object({
  fileName: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
});

export const searchDocumentsSchema = z.object({
  tags: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
  fileName: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

// Metadata schemas
export const createMetadataSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

export const updateMetadataSchema = z.object({
  value: z.unknown(),
});

// Permission schemas
export const createPermissionSchema = z.object({
  userId: z.string().uuid(),
  canRead: z.boolean().default(true),
  canWrite: z.boolean().default(false),
  canDelete: z.boolean().default(false),
});

export const updatePermissionSchema = z.object({
  canRead: z.boolean().optional(),
  canWrite: z.boolean().optional(),
  canDelete: z.boolean().optional(),
});

// Download link schemas
export const generateDownloadLinkSchema = z.object({
  expiresInHours: z.coerce.number().int().positive().max(168).default(24), // Max 7 days
});

