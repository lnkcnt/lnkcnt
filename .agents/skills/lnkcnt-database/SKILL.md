---
name: lnkcnt-database
description: Database rules for the lnkcnt project (Drizzle ORM on PostgreSQL). Use when changing schema, writing queries, running migrations, or starting the database server.
---

# lnkcnt database rules

- DO NOT USE PLAIN SQL. Use Drizzle ORM.
- This project needs a PostgreSQL server to run. Start it with:
  `podman compose -f ./compose.db.yml up -d`
