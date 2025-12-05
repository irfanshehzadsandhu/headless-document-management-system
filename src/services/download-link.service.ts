import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { IDownloadLinkRepository, IDocumentRepository, IPermissionRepository } from '../repositories/interfaces.js';
import { DownloadLink } from '../repositories/interfaces.js';

export class DownloadLinkService {
  constructor(
    private downloadLinkRepository: IDownloadLinkRepository,
    private documentRepository: IDocumentRepository,
    private permissionRepository: IPermissionRepository
  ) {}

  async generateDownloadLink(
    documentId: string,
    userId: string,
    expiresInHours: number = 24
  ): Promise<{ link: DownloadLink; url: string }> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Check if user has permission to read
    const hasPermission = await this.checkReadPermission(documentId, userId);
    if (!hasPermission) {
      throw new Error('Permission denied');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    const link = await this.downloadLinkRepository.create({
      id: uuidv4(),
      documentId,
      token,
      expiresAt,
    });

    return {
      link,
      url: `/api/download/${token}`,
    };
  }

  async validateDownloadLink(token: string): Promise<{ documentId: string; filePath: string } | null> {
    const link = await this.downloadLinkRepository.findByToken(token);
    if (!link) {
      return null;
    }

    // Check if link has expired
    if (new Date() > link.expiresAt) {
      await this.downloadLinkRepository.delete(link.id);
      return null;
    }

    const document = await this.documentRepository.findById(link.documentId);
    if (!document) {
      return null;
    }

    return {
      documentId: document.id,
      filePath: document.filePath,
    };
  }

  async deleteDownloadLink(linkId: string, documentId: string, userId: string): Promise<boolean> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    // Only document owner can delete download links
    if (document.userId !== userId) {
      throw new Error('Permission denied');
    }

    return await this.downloadLinkRepository.delete(linkId);
  }

  async cleanupExpiredLinks(): Promise<number> {
    return await this.downloadLinkRepository.deleteExpired();
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
}

