# table definition

mariadb -u root -p"${MARIADB_ROOT_PASSWORD}" -e \
	"USE \`${DATABASE_NAME}\`;
	CREATE TABLE links (
  		id varchar(32) NOT NULL,
  		redirect_url varchar(128) NOT NULL,
  		PRIMARY KEY (id)
	) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
	CREATE TABLE urlManagePage (
  		id varchar(32) NOT NULL,
  		managePage varchar(32) NOT NULL,
 		PRIMARY KEY (id),
  		UNIQUE KEY managePage (managePage)
	) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;
	CREATE TABLE linkClickCount (
		clickId INT AUTO_INCREMENT NOT NULL,
		id VARCHAR(32) NOT NULL,
		ip VARCHAR(38) NOT NULL,
		date DATETIME NOT NULL,
		PRIMARY KEY (clickId),
		KEY idx_id (id)
	) ENGINE = InnoDB;
	CREATE TABLE urlReport (
		reportId INT AUTO_INCREMENT NOT NULL,
		id VARCHAR(32) NOT NULL,
		reason VARCHAR(50) NOT NULL,
		message LONGTEXT NOT NULL,
		ip VARCHAR(38) NOT NULL,
		createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (reportId),
		KEY idx_report_id (id)
	) ENGINE = InnoDB;"