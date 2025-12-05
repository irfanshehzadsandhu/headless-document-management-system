import { v4 as uuidv4 } from 'uuid';
import { IPermissionRepository, IDocumentRepository, Permission } from '../repositories/interfaces.js';

export class PermissionService {
  constructor(
    private permissionRepository: IPermissionRepository,
    private documentRepository: IDocumentRepository
  ) {}

  async getDocumentPermissions(documentId: string, userId: string): Promise<Permission[]> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Only document owner can view permissions
    if (document.userId !== userId) {
      throw new Error('Permission denied');
    }

    return await this.permissionRepository.findByDocumentId(documentId);
  }

  async createPermission(
    documentId: string,
    targetUserId: string,
    permissions: { canRead: boolean; canWrite: boolean; canDelete: boolean },
    userId: string
  ): Promise<Permission> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Only document owner can create permissions
    if (document.userId !== userId) {
      throw new Error('Permission denied');
    }

    // Check if permission already exists
    const existing = await this.permissionRepository.findByDocumentAndUser(documentId, targetUserId);
    if (existing) {
      throw new Error('Permission already exists for this user');
    }

    return await this.permissionRepository.create({
      id: uuidv4(),
      documentId,
      userId: targetUserId,
      canRead: permissions.canRead,
      canWrite: permissions.canWrite,
      canDelete: permissions.canDelete,
    });
  }

  async updatePermission(
    permissionId: string,
    documentId: string,
    permissions: { canRead?: boolean; canWrite?: boolean; canDelete?: boolean },
    userId: string
  ): Promise<Permission | null> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Only document owner can update permissions
    if (document.userId !== userId) {
      throw new Error('Permission denied');
    }

    return await this.permissionRepository.update(permissionId, permissions);
  }

  async deletePermission(permissionId: string, documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Only document owner can delete permissions
    if (document.userId !== userId) {
      throw new Error('Permission denied');
    }

    return await this.permissionRepository.delete(permissionId);
  }
}

