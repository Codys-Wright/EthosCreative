"use server";

import { db } from "@/lib/db";
import * as schema from "./schema";
import { eq, and, or, sql } from "drizzle-orm";

/**
 * Server-side database operations
 * These functions can be imported and called from client components
 */

/**
 * Find many records from a table
 */
export async function findMany<T>(
  tableName: keyof typeof schema, 
  options?: { 
    where?: any, 
    orderBy?: any,
    limit?: number,
    offset?: number
  }
): Promise<T[]> {
  try {
    // @ts-ignore - Dynamic access to db.query properties
    return await db.query[tableName].findMany(options);
  } catch (error) {
    console.error(`Database findMany error on ${String(tableName)}:`, error);
    throw new Error(`Failed to fetch ${String(tableName)}`);
  }
}

/**
 * Find a single record from a table
 */
export async function findFirst<T>(
  tableName: keyof typeof schema, 
  options?: { 
    where?: any,
    orderBy?: any
  }
): Promise<T | null> {
  try {
    // @ts-ignore - Dynamic access to db.query properties
    return await db.query[tableName].findFirst(options);
  } catch (error) {
    console.error(`Database findFirst error on ${String(tableName)}:`, error);
    throw new Error(`Failed to fetch ${String(tableName)}`);
  }
}

/**
 * Find a record by ID
 */
export async function findById<T>(
  tableName: keyof typeof schema, 
  id: string
): Promise<T | null> {
  try {
    // @ts-ignore - Dynamic access to db.query properties
    return await db.query[tableName].findFirst({
      where: eq(schema[tableName].id, id)
    });
  } catch (error) {
    console.error(`Database findById error on ${String(tableName)}:`, error);
    throw new Error(`Failed to fetch ${String(tableName)} with ID ${id}`);
  }
}

/**
 * Insert a record into a table
 */
export async function insert<T>(
  tableName: keyof typeof schema, 
  data: any
): Promise<T> {
  try {
    const result = await db.insert(schema[tableName])
      .values(data)
      .returning();
    return result[0] as T;
  } catch (error) {
    console.error(`Database insert error on ${String(tableName)}:`, error);
    throw new Error(`Failed to create ${String(tableName)}`);
  }
}

/**
 * Update a record in a table
 */
export async function update<T>(
  tableName: keyof typeof schema, 
  id: string, 
  data: any
): Promise<T> {
  try {
    const result = await db.update(schema[tableName])
      .set(data)
      .where(eq(schema[tableName].id, id))
      .returning();
    return result[0] as T;
  } catch (error) {
    console.error(`Database update error on ${String(tableName)}:`, error);
    throw new Error(`Failed to update ${String(tableName)} with ID ${id}`);
  }
}

/**
 * Delete a record from a table
 */
export async function deleteRecord<T>(
  tableName: keyof typeof schema, 
  id: string
): Promise<T> {
  try {
    const result = await db.delete(schema[tableName])
      .where(eq(schema[tableName].id, id))
      .returning();
    return result[0] as T;
  } catch (error) {
    console.error(`Database delete error on ${String(tableName)}:`, error);
    throw new Error(`Failed to delete ${String(tableName)} with ID ${id}`);
  }
}

/**
 * Execute a custom query
 */
export async function executeQuery<T>(
  queryFn: (dbInstance: typeof db) => Promise<T>
): Promise<T> {
  try {
    return await queryFn(db);
  } catch (error) {
    console.error(`Database execute error:`, error);
    throw new Error(`Failed to execute custom query`);
  }
} 