// src/db/schema.js
const {
  sqliteTable,
  text,
  integer,
  real
} = require("drizzle-orm/sqlite-core");
const { companies } = require("../schema/Company");
const { customers } = require("../schema/Customer");

// Main Invoice table
const invoices = sqliteTable("invoices", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  // Foreign keys to company and customer
  companyId: integer("company_id")
    .notNull()
    .references(() => companies.id),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),

  // Invoice details
  invoiceNo: text("invoice_no").notNull().unique(),
  invoiceDate: text("invoice_date").notNull(), // SQLite doesn't have a date type, use ISO string
  dueDate: text("due_date").notNull(),
  terms: text("terms").notNull(),
  ledger: text("ledger"),

  // Tax information
  cgstRate: real("cgst_rate"),
  sgstRate: real("sgst_rate"),

  // Totals
  subtotal: real("subtotal"),
  cgstAmount: real("cgst_amount"),
  sgstAmount: real("sgst_amount"),
  totalAmount: real("total_amount"),

  // Additional fields
  narration: text("narration"),
  termsAndConditions: text("terms_and_conditions"),
});

module.exports = {
  invoices,
};
