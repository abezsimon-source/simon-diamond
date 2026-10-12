CREATE TABLE `page_views` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`visitor_id` text NOT NULL,
	`session_id` text NOT NULL,
	`path` text DEFAULT '/' NOT NULL,
	`source` text DEFAULT 'Direct' NOT NULL,
	`region` text DEFAULT 'Unknown' NOT NULL,
	`country` text DEFAULT 'Unknown' NOT NULL,
	`created_at` text NOT NULL
);
