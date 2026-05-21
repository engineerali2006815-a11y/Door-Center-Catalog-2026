CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`doorsCount` int NOT NULL DEFAULT 0,
	`orderDate` varchar(20) NOT NULL,
	`installationDate` varchar(20) NOT NULL,
	`downPayment` int NOT NULL DEFAULT 0,
	`isDownPaymentPaid` int NOT NULL DEFAULT 0,
	`isInstalled` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
