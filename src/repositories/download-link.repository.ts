import { eq, lt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { downloadLinks } from '../db/schema.js';
import { IDownloadLinkRepository, DownloadLink, DownloadLinkInsert } from './interfaces.js';

export class DownloadLinkRepository implements IDownloadLinkRepository {
  async findByToken(token: string): Promise<DownloadLink | null> {
    const result = await db.select().from(downloadLinks).where(eq(downloadLinks.token, token)).limit(1);
    return result[0] || null;
  }

  async findByDocumentId(documentId: string): Promise<DownloadLink[]> {
    return await db.select().from(downloadLinks).where(eq(downloadLinks.documentId, documentId));
  }

  async create(data: DownloadLinkInsert): Promise<DownloadLink> {
    const result = await db.insert(downloadLinks).values(data).returning();
    return result[0];
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(downloadLinks).where(eq(downloadLinks.id, id)).returning();
    return result.length > 0;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date();
    const result = await db.delete(downloadLinks).where(lt(downloadLinks.expiresAt, now)).returning();
    return result.length;
  }
}

