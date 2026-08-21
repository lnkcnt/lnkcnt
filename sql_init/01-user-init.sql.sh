#!/usr/bin/env bash

# user definition

export PGPASSWORD=${POSTGRES_PASSWORD}
psql -U postgres -c "CREATE USER ${DB_USERNAME} WITH PASSWORD '${DB_PASSWORD}';"