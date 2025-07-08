ALTER TABLE `customers` ADD `billing_contact_no` text NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `billing_email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `billing_alternate_contact_no` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `shipping_contact_no` text NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `shipping_email` text NOT NULL;--> statement-breakpoint
ALTER TABLE `customers` ADD `shipping_alternate_contact_no` text;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `contact_no`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `alternate_contact_no`;--> statement-breakpoint
ALTER TABLE `customers` DROP COLUMN `email`;