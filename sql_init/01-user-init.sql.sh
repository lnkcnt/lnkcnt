#!/usr/bin/env bash

# user definition

export PGPASSWORD=${POSTGRES_PASSWORD}
psql -U postgres -c "CREATE USER ${USER_NAME} WITH PASSWORD '${USER_PASSWORD}';"