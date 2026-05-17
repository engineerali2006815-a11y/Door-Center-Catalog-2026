import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, InsertOrder, Order, doors, InsertDoor, Door } from "../drizzle/schema.js";
import { ENV } from './_core/env.js';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDoors() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get doors: database not available");
    return [];
  }

  try {
    const result = await db.select().from(doors).orderBy(doors.createdAt);
    return result;
  } catch (error) {
    console.error("[Database] Failed to get doors:", error);
    return [];
  }
}

export async function addDoor(code: string, imageUrl: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.insert(doors).values({
      code,
      imageUrl,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to add door:", error);
    throw error;
  }
}

export async function updateDoor(id: number, code: string, imageUrl: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.update(doors).set({
      code,
      imageUrl,
    }).where(eq(doors.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to update door:", error);
    throw error;
  }
}

export async function deleteDoor(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    const result = await db.delete(doors).where(eq(doors.id, id));
    return result;
  } catch (error) {
    console.error("[Database] Failed to delete door:", error);
    throw error;
  }
}

// Orders queries
export async function getAllOrders(): Promise<Order[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get orders: database not available");
    return [];
  }
  try {
    return await db.select().from(orders).orderBy(orders.createdAt);
  } catch (error) {
    console.error("[Database] Failed to get orders:", error);
    return [];
  }
}

export async function addOrder(orderData: InsertOrder): Promise<Order | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add order: database not available");
    return null;
  }
  try {
    await db.insert(orders).values(orderData);
    // Get the last inserted order
    const allOrders = await db.select().from(orders).orderBy(orders.id);
    return allOrders.length > 0 ? allOrders[allOrders.length - 1] : null;
  } catch (error) {
    console.error("[Database] Failed to add order:", error);
    throw error;
  }
}

export async function updateOrder(id: number, orderData: Partial<InsertOrder>): Promise<Order | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update order: database not available");
    return null;
  }
  try {
    await db.update(orders).set(orderData).where(eq(orders.id, id));
    const updated = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return updated.length > 0 ? updated[0] : null;
  } catch (error) {
    console.error("[Database] Failed to update order:", error);
    throw error;
  }
}

export async function deleteOrder(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete order: database not available");
    return false;
  }
  try {
    await db.delete(orders).where(eq(orders.id, id));
    return true;
  } catch (error) {
    console.error("[Database] Failed to delete order:", error);
    throw error;
  }
}

// TODO: add feature queries here as your schema grows.
