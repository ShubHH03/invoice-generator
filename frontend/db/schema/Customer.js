// src/db/schema.js
const { sqliteTable, text, integer } = require("drizzle-orm/sqlite-core");

const customers = sqliteTable("customers", {
  id: integer("id").primaryKey({ autoIncrement: true }).notNull(),

  customerType: text("customer_type").notNull(),    // 'Business' | 'Individual'
  salutation: text("salutation"),                   // Mr. | Mrs. | Ms. etc.
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  panNumber: text("pan_number"),                    // Optional

  companyName: text("company_name").notNull(),       
  currency: text("currency").notNull(),

  gstApplicable: text("gst_applicable").notNull(),  // 'Yes' | 'No'
  gstin: text("gstin"),                             // Required if gstApplicable === 'Yes'
  stateCode: text("state_code"),                    // Required if gstApplicable === 'Yes'

  // Billing Address
  billingCountry: text("billing_country").notNull(),
  billingState: text("billing_state").notNull(),
  billingCity: text("billing_city").notNull(),
  billingAddressLine1: text("billing_address_line_1").notNull(),
  billingAddressLine2: text("billing_address_line_2"),
  billingContactNo: text("billing_contact_no").notNull(),
  billingEmail: text("billing_email").notNull(),
  billingAlternateContactNo: text("billing_alternate_contact_no"),

  // Shipping Address
  shippingCountry: text("shipping_country").notNull(),
  shippingState: text("shipping_state").notNull(),
  shippingCity: text("shipping_city").notNull(),
  shippingAddressLine1: text("shipping_address_line_1").notNull(),
  shippingAddressLine2: text("shipping_address_line_2"),
  shippingContactNo: text("shipping_contact_no").notNull(),
  shippingEmail: text("shipping_email").notNull(),
  shippingAlternateContactNo: text("shipping_alternate_contact_no"),
});

module.exports = { customers };
