// src/db/company.js
const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const company = sqliteTable("company", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),
  companyType: text("company_type").notNull(), // 'Manufacturer', 'Trader', 'Services'
  companyName: text("company_name").notNull(),
  currency: text("currency").notNull(), // e.g. 'INR', 'USD'
  logoPath: text("logo_path"), // Path or filename for uploaded logo
  gstApplicable: text("gst_applicable").notNull(), // 'Yes' or 'No'
  country: text("country").notNull(),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  state: text("state"),
  city: text("city"),
  email: text("email"),
  contactNumber: text("contact_number"),
});

module.exports = { company };
