CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tournament_id` integer NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`tournament_id`) REFERENCES `tournaments`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tournaments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_date` text NOT NULL,
	`sport` text NOT NULL,
	`division` text NOT NULL,
	`status` text DEFAULT 'Open registration' NOT NULL,
	`format` text DEFAULT '3-game guarantee · Round robin' NOT NULL,
	`entry_fee` integer DEFAULT 350 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
INSERT INTO `tournaments` (`id`,`event_date`,`sport`,`division`,`status`,`format`,`entry_fee`,`sort_order`) VALUES
(1,'2026-08-30','Softball','9U · B Level','1 team needed','3-game guarantee · Round robin',350,1),
(2,'2026-09-12','Baseball','12U · AA/AAA','Open registration','3-game guarantee · Round robin',350,2),
(3,'2026-09-13','Baseball','9U','Open registration','3-game guarantee · Round robin',350,3),
(4,'2026-09-20','Baseball','8U · Coach Pitch','Open registration','3-game guarantee · Round robin',350,4),
(5,'2026-10-11','Softball','10U · C Level','Full','3-game guarantee · Round robin',350,5);
--> statement-breakpoint
INSERT INTO `teams` (`tournament_id`,`name`) VALUES
(1,'CPU Storm 9U B'),
(1,'Lady Expos of Dubuque 9U B'),
(1,'Iowa Kraken 9U B'),
(2,'West Delaware'),
(5,'Springville 10U C'),
(5,'Lincoln Highway Devil Dawgs 10U C'),
(5,'Monticello Panther Prospects 10U C'),
(5,'CPU Storm 10U C');
