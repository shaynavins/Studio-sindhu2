import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").unique(),
  password: text("password"),
  role: text("role", { enum: ["admin", "tailor"] }).notNull().default("tailor"),
  name: text("name").notNull(),
  phone: text("phone"),
  userCode: text("user_code").unique(),
});

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address"),
  driveFolderId: text("drive_folder_id"),
  sheetId: text("sheet_id"),
  tailorId: varchar("tailor_id").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull(),
  customerId: varchar("customer_id").notNull(),
  customerPhone: text("customer_phone").notNull(),
  garmentType: text("garment_type").notNull(),
  status: text("status", { enum: ["new", "measuring", "cutting", "stitching", "ready", "delivered"] }).notNull().default("new"),
  notes: text("notes"),
  deliveryDate: timestamp("delivery_date"),
  measurementSetId: varchar("measurement_set_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const measurements = pgTable("measurements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull(),
  garmentType: text("garment_type").notNull(),
  chest: text("chest"),
  waist: text("waist"),
  hips: text("hips"),
  shoulder: text("shoulder"),
  sleeves: text("sleeves"),
  length: text("length"),
  inseam: text("inseam"),
  notes: text("notes"),
  sheetRowId: text("sheet_row_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  driveFolderId: true,
  sheetId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeasurementSchema = createInsertSchema(measurements).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Customer = typeof customers.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertMeasurement = z.infer<typeof insertMeasurementSchema>;
export type Measurement = typeof measurements.$inferSelect;
