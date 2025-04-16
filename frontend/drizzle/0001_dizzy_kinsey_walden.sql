CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`name` text NOT NULL,
	`unit` text,
	`selling_price` real NOT NULL,
	`currency` text DEFAULT 'INR',
	`description` text
);
