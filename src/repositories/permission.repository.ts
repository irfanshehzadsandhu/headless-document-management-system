import { eq, and } from 'drizzle-orm';
import { db } from '../db/index.js';
import { permissions } from '../db/schema.js';
import { IPermissionRepository, Permission, PermissionInsert } from './interfaces.js';

export class PermissionRepository implements IPermissionRepository {
  async findByDocumentId(documentId: string): Promise<Permission[]> {
    return await db.select().from(permissions).where(eq(permissions.documentId, documentId));
  }

  async findByUserId(userId: string): Promise<Permission[]> {
    return await db.select().from(permissions).where(eq(permissions.userId, userId));
  }

  async findByDocumentAndUser(documentId: string, userId: string): Promise<Permission | null> {
    const result = await db
      .select()
      .from(permissions)
      .where(and(eq(permissions.documentId, documentId), eq(permissions.userId, userId)))
      .limit(1);
    return result[0] || null;
  }

  async create(data: PermissionInsert): Promise<Permission> {
    const result = await db.insert(permissions).values(data).returning();
    return result[0];
  }

  async update(id: string, data: Partial<PermissionInsert>): Promise<Permission | null> {
    const result = await db
      .update(permissions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(permissions.id, id))
      .returning();
    return result[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await db.delete(permissions).where(eq(permissions.id, id)).returning();
    return result.length > 0;
  }
}

