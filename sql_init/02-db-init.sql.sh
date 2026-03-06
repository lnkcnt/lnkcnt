#!/usr/bin/env bash

# database definition and permission assignment

mariadb -u root -p"${MARIADB_ROOT_PASSWORD}" -e \
    "CREATE DATABASE \`${DATABASE_NAME}\`;
    GRANT CREATE VIEW, DELETE, INDEX, INSERT, SELECT, SHOW VIEW, UPDATE ON \`${DATABASE_NAME}\`.* TO \`${DATABASE_USER}\`@'%';"