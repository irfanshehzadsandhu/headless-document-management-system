import { documents, documentMetadata, permissions, downloadLinks, users } from '../db/schema.js';
import { PaginationOptions, PaginatedResponse } from '../types/index.js';

export type Document = typeof documents.$inferSelect;
export type DocumentInsert = typeof documents.$inferInsert;
export type DocumentMetadata = typeof documentMetadata.$inferSelect;
export type DocumentMetadataInsert = typeof documentMetadata.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type PermissionInsert = typeof permissions.$inferInsert;
export type DownloadLink = typeof downloadLinks.$inferSelect;
export type DownloadLinkInsert = typeof downloadLinks.$inferInsert;
export type User = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(data: UserInsert): Promise<User>;
}

export interface IDocumentRepository {
  findById(id: string): Promise<Document | null>;
  findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResponse<Document>>;
  create(data: DocumentInsert): Promise<Document>;
  update(id: string, data: Partial<DocumentInsert>): Promise<Document | null>;
  delete(id: string): Promise<boolean>;
  search(filters: DocumentSearchFilters, options?: PaginationOptions): Promise<PaginatedResponse<Document>>;
}

export interface DocumentSearchFilters {
  userId?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  fileName?: string;
}

export interface IDocumentMetadataRepository {
  findByDocumentId(documentId: string): Promise<DocumentMetadata[]>;
  findByKey(documentId: string, key: string): Promise<DocumentMetadata | null>;
  create(data: DocumentMetadataInsert): Promise<DocumentMetadata>;
  update(id: string, data: Partial<DocumentMetadataInsert>): Promise<DocumentMetadata | null>;
  delete(id: string): Promise<boolean>;
  deleteByDocumentId(documentId: string): Promise<boolean>;
}

export interface IPermissionRepository {
  findByDocumentId(documentId: string): Promise<Permission[]>;
  findByUserId(userId: string): Promise<Permission[]>;
  findByDocumentAndUser(documentId: string, userId: string): Promise<Permission | null>;
  create(data: PermissionInsert): Promise<Permission>;
  update(id: string, data: Partial<PermissionInsert>): Promise<Permission | null>;
  delete(id: string): Promise<boolean>;
}

export interface IDownloadLinkRepository {
  findByToken(token: string): Promise<DownloadLink | null>;
  findByDocumentId(documentId: string): Promise<DownloadLink[]>;
  create(data: DownloadLinkInsert): Promise<DownloadLink>;
  delete(id: string): Promise<boolean>;
  deleteExpired(): Promise<number>;
}

