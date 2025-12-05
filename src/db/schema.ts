import { pgTable, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  filePath: text('file_path').notNull(),
  mimeType: text('mime_type').notNull(),
  fileSize: integer('file_size').notNull(),
  tags: text('tags').array(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const documentMetadata = pgTable('document_metadata', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  canRead: boolean('can_read').default(true).notNull(),
  canWrite: boolean('can_write').default(false).notNull(),
  canDelete: boolean('can_delete').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const downloadLinks = pgTable('download_links', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const documentsRelations = relations(documents, ({ one, many }) => ({
  user: one(users, {
    fields: [documents.userId],
    references: [users.id],
  }),
  metadata: many(documentMetadata),
  permissions: many(permissions),
  downloadLinks: many(downloadLinks),
}));

export const documentMetadataRelations = relations(documentMetadata, ({ one }) => ({
  document: one(documents, {
    fields: [documentMetadata.documentId],
    references: [documents.id],
  }),
}));

export const permissionsRelations = relations(permissions, ({ one }) => ({
  document: one(documents, {
    fields: [permissions.documentId],
    references: [documents.id],
  }),
  user: one(users, {
    fields: [permissions.userId],
    references: [users.id],
  }),
}));

export const downloadLinksRelations = relations(downloadLinks, ({ one }) => ({
  document: one(documents, {
    fields: [downloadLinks.documentId],
    references: [documents.id],
  }),
}));

