<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

<!-- END:nextjs-agent-rules -->

# Lnkcnt

## About this project

This project is a URL shortener with URL click counter feature.

### Used libraries & frameworks

1. [Next.js](https://github.com/vercel/next.js)
2. [shadcn](https://github.com/shadcn-ui/ui)
3. [Drizzle ORM](https://orm.drizzle.team/)
4. [ky](https://github.com/sindresorhus/ky)

## RULES

- **YOU SHOULDN'T DELETE A FILE WITHOUT USER'S EXPLICIT PERMISSION!**
- After each code change, run `pnpm lint`.
- **YOU SHOULDN'T USE GIT'S FORCE PUSH AND HARD RESET FEATURE!**

## Skills

This project includes project skills in `.claude/skills/` (linked to `.agents/skills/`). Load the matching skill before doing that kind of work.

| Skill | Load when |
| --- | --- |
| `lnkcnt-typescript` | Writing or editing TypeScript code |
| `lnkcnt-database` | Database schema, queries, PostgreSQL setup |
| `lnkcnt-http` | Writing HTTP requests |
| `lnkcnt-ui` | Building UI components or styling |
| `lnkcnt-testing` | Writing or running tests |
| `lnkcnt-dev-commands` | Running, formatting, linting, or setting up the project |
| `lnkcnt-git` | Git work, creating branches, starting a feature |
