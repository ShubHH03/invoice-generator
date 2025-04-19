CREATE TABLE `company` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`company_type` text NOT NULL,
	`company_name` text NOT NULL,
	`currency` text NOT NULL,
	`logo_path` text,
	`gst_applicable` text NOT NULL,
	`country` text NOT NULL,
	`address_line_1` text,
	`address_line_2` text,
	`state` text,
	`city` text,
	`email` text,
	`contact_number` text
);
