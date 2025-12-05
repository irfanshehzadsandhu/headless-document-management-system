import { eq, and, or, ilike, arrayContains } from 'drizzle-orm';
import { db } from '../db/index.js';
import { documents, documentMetadata } from '../db/schema.js';
import { IDocumentRepository, Document, DocumentInsert, DocumentSearchFilters, PaginationOptions, PaginatedResponse } from './interfaces.js';

export class DocumentRepository implements IDocumentRepository {
  async findById(id: string): Promise<Document | null> {
    const result = await db.select().from(documents).where(eq(documents.id, id)).limit(1);
    return result[0] || null;
  }

  async findByUserId(userId: string, options?: PaginationOptions): Promise<PaginatedResponse<Document>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const whereClause = eq(documents.userId, userId);
    
    const [data, totalResult] = await Promise.all([
      db.select().from(documents).where(whereClause).limit(limit).offset(offset),
      db.select({ count: documents.id }).from(documents).where(whereClause),
    ]);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }

  async create(data: DocumentInsert): Promise<Document> {
    const result = await db.insert(documents).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<DocumentInsert>): Promise<Document | null> {
    const result = await db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id)).returning();
    return result.length > 0;
  }

  async search(filters: DocumentSearchFilters, options?: PaginationOptions): Promise<PaginatedResponse<Document>> {
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (filters.userId) {
      conditions.push(eq(documents.userId, filters.userId));
    }

    if (filters.fileName) {
      conditions.push(ilike(documents.fileName, `%${filters.fileName}%`));
    }

    if (filters.tags && filters.tags.length > 0) {
      conditions.push(arrayContains(documents.tags, filters.tags));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // For metadata filtering, we need to join with documentMetadata
    let query = db.select().from(documents);
    
    if (filters.metadata && Object.keys(filters.metadata).length > 0) {
      // This is a simplified approach - for complex metadata queries, you might need a more sophisticated query
      query = db
        .select({ documents })
        .from(documents)
        .innerJoin(documentMetadata, eq(documents.id, documentMetadata.documentId))
        .where(whereClause) as any;
    } else {
      query = db.select().from(documents).where(whereClause);
    }

    const [data, totalResult] = await Promise.all([
      query.limit(limit).offset(offset),
      db.select({ count: documents.id }).from(documents).where(whereClause),
    ]);

    const total = totalResult.length;
    const totalPages = Math.ceil(total / limit);

    // If we joined with metadata, we need to extract just the documents
    const documentsData = Array.isArray(data) && data.length > 0 && 'documents' in data[0]
      ? data.map((row: any) => row.documents)
      : data;

    return {
      data: documentsData as Document[],
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}

