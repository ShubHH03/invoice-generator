const { sqliteTable, text, integer, real } = require("drizzle-orm/sqlite-core");
const { invoices } = require("../schema/Invoice"); // Importing the invoices table
const { items } = require("../schema/Item"); // Importing the items table

// Junction table for invoice items (handles multiple items per invoice)
const invoiceItems = sqliteTable("invoice_items", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  // Foreign keys
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id, { onDelete: "CASCADE" }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id),

  // Item details (some may be copied from items table for historical record)
  itemDetails: text("item_details").notNull(),
  quantity: real("quantity").notNull(),
  rate: real("rate").notNull(),
  amount: real("amount").notNull(),
});

module.exports = {
  invoiceItems,
};
