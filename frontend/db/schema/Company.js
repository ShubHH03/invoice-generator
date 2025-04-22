// src/db/schema.js
const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const companies = sqliteTable("companies", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  companyType: text("company_type").notNull(), // Manufacturer | Trader | Services
  companyName: text("company_name").notNull(),
  currency: text("currency").notNull(),

  gstApplicable: text("gst_applicable").notNull(), // Yes | No
  gstin: text("gstin"), // Optional, only if gstApplicable === 'Yes'
  stateCode: text("state_code"), // Optional, only if gstApplicable === 'Yes'

  country: text("country").notNull(),
  addressLine1: text("address_line_1").notNull(),
  addressLine2: text("address_line_2"),
  state: text("state").notNull(),
  city: text("city").notNull(),

  email: text("email").notNull(),
  contactNo: text("contact_no").notNull(),

  // Added fields for logo and signature file paths
  logoPath: text("logo_path"),
  signaturePath: text("signature_path"),
});

module.exports = { companies };
