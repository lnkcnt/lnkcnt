#!/usr/bin/env bash

# table definition

psql -v ON_ERROR_STOP=1 --username "$DATABASE_USER" --dbname "$DATABASE_NAME" <<-EOSQL
	SET search_path TO $DATABASE_NAME;
	CREATE TABLE tester (
		flag bool DEFAULT true NOT NULL,
		id varchar(8) DEFAULT SUBSTRING(md5(random()::text) FROM 1 FOR 8) NOT NULL,
		CONSTRAINT tester_pk PRIMARY KEY (id)
	);
	INSERT INTO tester (flag) VALUES (true);
	CREATE TABLE links (
		id varchar(32) NOT NULL,
		redirect_url varchar(128) NOT NULL,
		CONSTRAINT links_pk PRIMARY KEY (id)
	);
	CREATE TABLE urlmanagepage (
		id varchar(32) NOT NULL,
		managepage varchar(32) NOT NULL,
		CONSTRAINT urlmanagepage_pk PRIMARY KEY (id),
		CONSTRAINT urlmanagepage_unique UNIQUE (managepage)
	);
	CREATE TABLE linkclickcount (
		clickid serial NOT NULL,
		id varchar(32) NOT NULL,
		ip varchar(38) NOT NULL,
		"date" timestamp NOT NULL,
		CONSTRAINT linkclickcount_pk PRIMARY KEY (clickid),
		CONSTRAINT linkclickcount_unique UNIQUE (id)
	);
	CREATE TABLE urlreport (
		reportid serial NOT NULL,
		id varchar(32) NOT NULL,
		reason varchar(50) NOT NULL,
		message text NOT NULL,
		ip varchar(38) NOT NULL,
		createdat timestamp DEFAULT NOW() NOT NULL,
		CONSTRAINT urlreport_pk PRIMARY KEY (reportid),
		CONSTRAINT urlreport_unique UNIQUE (id)
	);
	CREATE TABLE urlblacklist (
		blacklistid serial NOT NULL,
		pattern varchar(255) NOT NULL,
		note varchar(255) NULL,
		createdat timestamp DEFAULT NOW() NOT NULL,
		CONSTRAINT urlblacklist_pk PRIMARY KEY (blacklistid),
		CONSTRAINT urlblacklist_unique UNIQUE (pattern)
	);
EOSQL