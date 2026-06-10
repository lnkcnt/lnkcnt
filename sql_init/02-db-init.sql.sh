#!/usr/bin/env bash

# database definition and permission assignment

export PGPASSWORD=${POSTGRES_PASSWORD}
psql -U postgres -c "CREATE DATABASE lnkcnt;"
psql -U postgres -d lnkcnt -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON TABLES TO ${USER_NAME};"
psql -U postgres -d lnkcnt -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${USER_NAME};"