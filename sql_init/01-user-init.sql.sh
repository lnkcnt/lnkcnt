#!/usr/bin/env bash

# user definition

mariadb -u root -p"${MARIADB_ROOT_PASSWORD}" -e \
    "CREATE USER \`${DATABASE_USER}\`@'%' IDENTIFIED BY '${DATABASE_PASSWORD}';"