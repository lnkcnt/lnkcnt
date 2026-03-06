#!/usr/bin/env bash

# table definition

mariadb -u root -p"${MARIADB_ROOT_PASSWORD}" -e \
	"
	USE \`${DATABASE_NAME}\`;
	CREATE TABLE `linkClickCount` (
		`clickId` int(11) NOT NULL AUTO_INCREMENT,
		`id` varchar(32) NOT NULL,
		`ip` varchar(38) NOT NULL,
		`date` datetime NOT NULL,
		PRIMARY KEY (`clickId`),
		KEY `linkClickCount_id` (`id`),
		CONSTRAINT `linkClickCount_id` FOREIGN KEY (`id`) REFERENCES `links` (`id`)
	);
	CREATE TABLE `links` (
		`id` varchar(32) NOT NULL,
		`redirect_url` varchar(128) NOT NULL,
		PRIMARY KEY (`id`)
	);
	CREATE TABLE `tester` (
		`num` int(11) NOT NULL AUTO_INCREMENT,
		`flag` tinyint(1) NOT NULL DEFAULT 1,
		PRIMARY KEY (`num`)
	);
	INSERT INTO `tester` VALUES (DEFAULT, DEFAULT);
	CREATE TABLE `urlBlacklist` (
		`blacklistId` int(11) NOT NULL AUTO_INCREMENT,
		`pattern` varchar(255) NOT NULL,
		`note` varchar(255) DEFAULT NULL,
		`createdAt` datetime NOT NULL DEFAULT current_timestamp(),
		PRIMARY KEY (`blacklistId`),
		UNIQUE KEY `uniq_pattern` (`pattern`)
	);
	CREATE TABLE `urlManagePage` (
		`id` varchar(32) NOT NULL,
		`managePage` varchar(32) NOT NULL,
		UNIQUE KEY `managePage` (`managePage`),
		KEY `urlManagePage_id` (`id`),
		CONSTRAINT `urlManagePage_id` FOREIGN KEY (`id`) REFERENCES `links` (`id`)
	);
	CREATE TABLE `urlReport` (
		`reportId` int(11) NOT NULL AUTO_INCREMENT,
		`id` varchar(32) NOT NULL,
		`reason` varchar(50) NOT NULL,
		`message` longtext NOT NULL,
		`ip` varchar(38) NOT NULL,
		`createdAt` datetime NOT NULL DEFAULT current_timestamp(),
		PRIMARY KEY (`reportId`),
		KEY `urlReport_id` (`id`),
		CONSTRAINT `urlReport_id` FOREIGN KEY (`id`) REFERENCES `links` (`id`)
	);
"