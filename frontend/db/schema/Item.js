// src/db/schema.js
const { sqliteTable, text, integer, real } = require("drizzle-orm/sqlite-core");

const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  type: text("type").notNull(), // 'Goods' or 'Service'
  name: text("name").notNull(),
  unit: text("unit"),           // e.g. 'g', 'kg', 'pcs'
  sellingPrice: real("selling_price").notNull(), // assuming price as a decimal number
  currency: text("currency").default("INR"),     // fixed to INR for now
  description: text("description"),              // optional field
});

module.exports = { items };
