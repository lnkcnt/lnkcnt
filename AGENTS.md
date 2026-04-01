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
3. [Prisma](https://github.com/prisma/prisma)
4. [ky](https://github.com/sindresorhus/ky)

## RULES

- **YOU SHOULDN'T DELETE A FILE WITHOUT USER'S EXPLICIT PERMISSION!**
- **YOU SHOULDN'T USE GIT'S FORCE PUSH AND HARD RESET FEATURE!**
- Use TypeScript(`.ts`/`.tsx`). DO NOT USE PLAIN JAVASCRIPT!
- DO NOT USE PLAIN SQL. instead, use Prisma ORM.
- If possible, use shadcn or TailwindCSS.
- Use ky instead of `fetch`.
- Write JSDoc on functions, and variables.

## Tips

- This project uses pnpm.
  you can replace `npm` to `pnpm`, `npx` to `pnpx`.
- `shadcn-ui` is deprecated. use `shadcn` instead.
- This project includes SKILLS. Refer to SKILLS for recent and accurate information.
- This project needs MariaDB server to run.
  - You can start mariadb server with `podman compose -f ./compose.db.yml up -d`.
- You can run project with `pnpm dev`.
