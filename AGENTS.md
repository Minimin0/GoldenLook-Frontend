<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# GoldenLook-Frontend Agents

## Role
Mobile-first Next.js frontend for Golden Look. It collects the missing-person photo and guardian-entered appearance sentence, shows Gemini-assisted results for user confirmation, and renders/share-links the final flyer UX.

## Editable Areas
Edit `app/`, `components/`, `lib/`, `public/`, and tests for frontend behavior only. Backend, Modal AI, Supabase service code, and integration evidence belong in the other repositories.

## Fixed Contracts
Do not change without team lead approval: appearance shape, `known` / `none` / `unknown` meanings, the 20 color ids, six API paths, original-photo pairing, no face/body/pose generation, Gemini user confirmation, AI failure fallback, and private storage principle.

## Secrets
Only `NEXT_PUBLIC_*` variables may appear here. Never add `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `MODAL_API_KEY`, or `CRON_SECRET` to frontend code, env files, or browser bundles. Commit `.env.example`, never real `.env*`.

## Branch Strategy
`main` is production-ready only. Work from `develop`; feature branches use `feat/*`, `fix/*`, `docs/*`, or `chore/*`.

## PR Principles
Keep PRs scoped, document product-contract impact, and include screenshots for visible UI changes.

## Tests
Run `npm run lint` and `npm run build` before merge. Add the smallest useful test when logic becomes non-trivial.

## Architecture
Do not invent login, voice, Firebase, Spring Boot, a fourth AI repo, or frontend-owned secrets. Integration contracts become the source of truth over time.
