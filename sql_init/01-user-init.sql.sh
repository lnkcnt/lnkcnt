#!/usr/bin/env bash

# user definition

psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
    CREATE USER $DATABASE_USER WITH PASSWORD '$DATABASE_PASSWORD';
EOSQL