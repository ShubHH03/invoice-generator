CREATE TABLE `invoices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_id` integer NOT NULL,
	`customer_id` integer NOT NULL,
	`invoice_no` text NOT NULL,
	`invoice_date` text NOT NULL,
	`due_date` text NOT NULL,
	`terms` text NOT NULL,
	`ledger` text,
	`cgst_rate` real,
	`sgst_rate` real,
	`subtotal` real,
	`cgst_amount` real,
	`sgst_amount` real,
	`total_amount` real,
	`narration` text,
	`terms_and_conditions` text,
	FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invoices_invoice_no_unique` ON `invoices` (`invoice_no`);--> statement-breakpoint
CREATE TABLE `invoice_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`invoice_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`item_details` text NOT NULL,
	`quantity` real NOT NULL,
	`rate` real NOT NULL,
	`amount` real NOT NULL,
	FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON UPDATE no action ON DELETE CASCADE,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON UPDATE no action ON DELETE no action
);
