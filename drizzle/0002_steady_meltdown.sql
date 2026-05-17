CREATE TABLE `orders` (
	`id` varchar(255) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`location` varchar(255) NOT NULL,
	`doorsCount` int,
	`orderDate` varchar(50) NOT NULL,
	`installationDate` varchar(50) NOT NULL,
	`downPayment` int,
	`isDownPaymentPaid` boolean NOT NULL DEFAULT false,
	`isInstalled` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
