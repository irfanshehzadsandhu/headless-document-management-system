import { v4 as uuidv4 } from 'uuid';
import { IDocumentMetadataRepository, IDocumentRepository, IPermissionRepository } from '../repositories/interfaces.js';
import { DocumentMetadata } from '../repositories/interfaces.js';

export class MetadataService {
  constructor(
    private metadataRepository: IDocumentMetadataRepository,
    private documentRepository: IDocumentRepository,
    private permissionRepository: IPermissionRepository
  ) {}

  async getDocumentMetadata(documentId: string, userId: string): Promise<DocumentMetadata[]> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if user has permission to read
    const hasPermission = await this.checkReadPermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    return await this.metadataRepository.findByDocumentId(documentId);
  }

  async getMetadataByKey(documentId: string, key: string, userId: string): Promise<DocumentMetadata | null> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if user has permission to read
    const hasPermission = await this.checkReadPermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    return await this.metadataRepository.findByKey(documentId, key);
  }

  async createMetadata(
    documentId: string,
    key: string,
    value: unknown,
    userId: string
  ): Promise<DocumentMetadata> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if user has permission to write
    const hasPermission = await this.checkWritePermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    // Check if metadata with this key already exists
    const existing = await this.metadataRepository.findByKey(documentId, key);
    if (existing) {
      throw new Error('Metadata with this key already exists');
    }

    return await this.metadataRepository.create({
      id: uuidv4(),
      documentId,
      key,
      value: value as any,
    });
  }

  async updateMetadata(
    id: string,
    documentId: string,
    value: unknown,
    userId: string
  ): Promise<DocumentMetadata | null> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if user has permission to write
    const hasPermission = await this.checkWritePermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    return await this.metadataRepository.update(id, { value: value as any });
  }

  async deleteMetadata(id: string, documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if user has permission to write
    const hasPermission = await this.checkWritePermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    return await this.metadataRepository.delete(id);
  }

  private async checkReadPermission(documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      return false;
    }

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

    if (document.userId === userId) {
      return true;
    }

    const permission = await this.permissionRepository.findByDocumentAndUser(documentId, userId);
    return permission?.canWrite || false;
  }
}

