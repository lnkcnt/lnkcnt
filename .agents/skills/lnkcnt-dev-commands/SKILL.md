---
name: lnkcnt-dev-commands
description: Package manager and run/format/lint commands for the lnkcnt project. Use when installing dependencies, starting the dev server, formatting or linting code, or setting up the local environment.
---

# lnkcnt dev commands

- This project uses pnpm. Replace `npm` with `pnpm` and `npx` with `pnpx`.
- Helpful commands:
  - `pnpm dev`: runs project in development (debug) mode.
  - `pnpm fmt`: runs prettier to format code.
  - `pnpm lint`: runs eslint to check potential issues.
  - `pnpm test --run`: runs vitest to run unit tests (see `lnkcnt-testing`).
- The database must be running before `pnpm dev` (see `lnkcnt-database`).
