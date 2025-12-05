import { v4 as uuidv4 } from 'uuid';
import { IDocumentRepository, IDocumentMetadataRepository, IPermissionRepository, DocumentSearchFilters } from '../repositories/interfaces.js';
import { PaginationOptions, PaginatedResponse } from '../types/index.js';
import { Document } from '../repositories/interfaces.js';

export class DocumentService {
  constructor(
    private documentRepository: IDocumentRepository,
    private metadataRepository: IDocumentMetadataRepository,
    private permissionRepository: IPermissionRepository
  ) {}

  async createDocument(
    userId: string,
    fileName: string,
    filePath: string,
    mimeType: string,
    fileSize: number,
    tags?: string[],
    metadata?: Record<string, unknown>
  ): Promise<Document> {
    const document = await this.documentRepository.create({
      id: uuidv4(),
      userId,
      fileName,
      filePath,
      mimeType,
      fileSize,
      tags: tags || [],
    });

    // Create default permission for document owner
    await this.permissionRepository.create({
      id: uuidv4(),
      documentId: document.id,
      userId,
      canRead: true,
      canWrite: true,
      canDelete: true,
    });

    // Create metadata if provided
    if (metadata) {
      for (const [key, value] of Object.entries(metadata)) {
        await this.metadataRepository.create({
          id: uuidv4(),
          documentId: document.id,
          key,
          value: value as any,
        });
      }
    }

    return document;
  }

  async getDocumentById(documentId: string, userId: string): Promise<Document | null> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return null;
    }

    // Check if user has permission to read
    const hasPermission = await this.checkReadPermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    return document;
  }

  async getUserDocuments(userId: string, options?: PaginationOptions): Promise<PaginatedResponse<Document>> {
    return await this.documentRepository.findByUserId(userId, options);
  }

  async updateDocument(
    documentId: string,
    userId: string,
    updates: { fileName?: string; tags?: string[] }
  ): Promise<Document | null> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return null;
    }

    // Check if user has permission to write
    const hasPermission = await this.checkWritePermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    return await this.documentRepository.update(documentId, updates);
  }

  async deleteDocument(documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return false;
    }

    // Check if user has permission to delete
    const hasPermission = await this.checkDeletePermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Delete metadata and permissions will be cascade deleted
    return await this.documentRepository.delete(documentId);
  }

  async searchDocuments(filters: DocumentSearchFilters, options?: PaginationOptions): Promise<PaginatedResponse<Document>> {
    return await this.documentRepository.search(filters, options);
  }

  private async checkReadPermission(documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return false;
    }

    // Owner always has read permission
    if (document.userId === userId) {
      return true;
    }

    const permission = await this.permissionRepository.findByDocumentAndUser(documentId, userId);
    return permission?.canRead || false;
  }

  private async checkWritePermission(documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return false;
    }

    // Owner always has write permission
    if (document.userId === userId) {
      return true;
    }

    const permission = await this.permissionRepository.findByDocumentAndUser(documentId, userId);
    return permission?.canWrite || false;
  }

  private async checkDeletePermission(documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return false;
    }

    // Owner always has delete permission
    if (document.userId === userId) {
      return true;
    }

    const permission = await this.permissionRepository.findByDocumentAndUser(documentId, userId);
    return permission?.canDelete || false;
  }
}

