#!/usr/bin/env bash

# database definition and permission assignment

export PGPASSWORD=${POSTGRES_PASSWORD}
psql -U postgres -c "CREATE SCHEMA lnkcnt;"
psql -U postgres -c "GRANT SELECT, INSERT, UPDATE, DELETE, REFERENCES ON ALL TABLES IN SCHEMA lnkcnt TO ${USER_NAME};"