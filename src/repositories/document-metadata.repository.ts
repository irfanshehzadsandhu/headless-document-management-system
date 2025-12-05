import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { documentMetadata } from '../db/schema.js';
import { IDocumentMetadataRepository, DocumentMetadata, DocumentMetadataInsert } from './interfaces.js';

export class DocumentMetadataRepository implements IDocumentMetadataRepository {
  async findByDocumentId(documentId: string): Promise<DocumentMetadata[]> {
    return await db.select().from(documentMetadata).where(eq(documentMetadata.documentId, documentId));
  }

  async findByKey(documentId: string, key: string): Promise<DocumentMetadata | null> {
    const result = await db
      .select()
      .from(documentMetadata)
      .where(and(eq(documentMetadata.documentId, documentId), eq(documentMetadata.key, key)))
      .limit(1);
    return result[0] || null;
  }

  async create(data: DocumentMetadataInsert): Promise<DocumentMetadata> {
    const result = await db.insert(documentMetadata).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<DocumentMetadataInsert>): Promise<DocumentMetadata | null> {
    const result = await db
      .update(documentMetadata)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documentMetadata.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(documentMetadata).where(eq(documentMetadata.id, id)).returning();
    return result.length > 0;
  }

  async deleteByDocumentId(documentId: string): Promise<boolean> {
    const result = await db.delete(documentMetadata).where(eq(documentMetadata.documentId, documentId)).returning();
    return result.length > 0;
  }
}

