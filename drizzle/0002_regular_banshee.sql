CREATE TABLE `inquiries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`tournament` text DEFAULT 'General question' NOT NULL,
	`message` text NOT NULL,
	`created_at` text NOT NULL
);
