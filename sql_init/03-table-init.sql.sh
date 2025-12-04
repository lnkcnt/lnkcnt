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
	) ENGINE=InnoDB CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;"