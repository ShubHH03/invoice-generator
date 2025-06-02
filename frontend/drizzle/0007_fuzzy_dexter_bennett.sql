CREATE TABLE `cases` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`user_id` integer NOT NULL,
	`status` text NOT NULL,
	`pages` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `statements` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`case_id` integer NOT NULL,
	`account_number` text NOT NULL,
	`customer_name` text NOT NULL,
	`ifsc_code` text,
	`bank_name` text,
	`file_path` text DEFAULT 'downloads' NOT NULL,
	`created_at` integer NOT NULL,
	`start_date` integer,
	`end_date` integer,
	`password` text,
	FOREIGN KEY (`case_id`) REFERENCES `cases`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `tally_voucher` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`transaction_id` integer NOT NULL,
	`effective_date` integer,
	`bill_reference` text,
	`failed_reason` text,
	`bank_ledger` text NOT NULL,
	`result` integer,
	`created_at` integer DEFAULT 1746269512176 NOT NULL,
	FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`id`) ON UPDATE no action ON DELETE CASCADE
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tally_voucher_transaction_id_unique` ON `tally_voucher` (`transaction_id`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`statement_id` text NOT NULL,
	`date` integer NOT NULL,
	`description` text NOT NULL,
	`amount` real NOT NULL,
	`category` text NOT NULL,
	`type` text NOT NULL,
	`balance` real NOT NULL,
	`bank` text DEFAULT 'unknown' NOT NULL,
	`entity` text DEFAULT 'unknown' NOT NULL,
	`voucher_type` text DEFAULT 'unknown',
	`created_at` integer DEFAULT 1746269512176 NOT NULL,
	FOREIGN KEY (`statement_id`) REFERENCES `statements`(`id`) ON UPDATE no action ON DELETE CASCADE
);
