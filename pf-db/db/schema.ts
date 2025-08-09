import {
  pgTable,
  uuid,
  serial,
  integer,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// User table
export const user = pgTable("user", {
  uid: uuid("uid").primaryKey(),
  name: text("name").notNull(),
  hashedpassword: text("hashedpassword").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 }).$onUpdate(
    () => new Date()
  ),
});

// Item table — พร้อม foreign key constraints จริง
export const item = pgTable("item", {
  id: serial("id").primaryKey(),
  seller: uuid("seller")
    .notNull()
    .references(() => user.uid), // ✅ FK จริง
  customer: uuid("customer").references(() => user.uid), // ✅ nullable FK จริง
  name: text("name").notNull(),
  detail: text("detail"),
  image: text("image"),
  is_purchased: boolean("is_purchased").notNull(),
  is_active: boolean("is_active").notNull(),
  status: integer("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date", precision: 3 }).$onUpdate(
    () => new Date()
  ),
});

// Relations สำหรับ ORM (เหมือนเดิม)
export const itemRelations = relations(item, ({ one }) => ({
  sellerUser: one(user, {
    fields: [item.seller],
    references: [user.uid],
  }),
  customerUser: one(user, {
    fields: [item.customer],
    references: [user.uid],
    relationName: "customerUser",
  }),
}));
