-- lnkcnt.links definition

CREATE TABLE lnkcnt.links (
	id varchar(32) NOT NULL,
	redirect_url varchar(128) NOT NULL,
	CONSTRAINT links_pk PRIMARY KEY (id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4;