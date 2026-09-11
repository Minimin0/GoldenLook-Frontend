# GoldenLook-Frontend

## Project Overview
Golden Look helps guardians create a mobile missing-person flyer from one original photo and one natural-language clothing description. The frontend must always show the original photo with any AI-assisted reference image and require the guardian to confirm Gemini-parsed appearance data.

## Repository Responsibility
This repository owns the public web UX only: upload flow, appearance confirmation screens, flyer presentation, and share views. Backend APIs, Supabase, Gemini, Modal AI, E2E evidence, and release tracking live in separate Golden Look repositories.

## Architecture
Frontend calls `GoldenLook-Backend` over HTTPS. Shared contracts are mirrored locally now; `GoldenLook-Integration` may become the source of truth later.

## Tech Stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- Node 22 LTS target; current scaffold also builds on newer Node

## Directory Structure
- `app/`: routes for home, new case, case describe/result, and shared flyer
- `components/`: upload, appearance, flyer, share, and UI components
- `lib/`: API helpers, appearance types, schemas, generated color contract
- `tests/`: frontend tests

## Local Setup
```bash
npm install
npm run lint
npm run build
```

## Environment Variables
Copy `.env.example` locally and fill only public frontend values:
```text
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_KAKAO_JS_KEY=
NEXT_PUBLIC_BASE_URL=
```
Never put backend secrets in this repository.

## Branch Strategy
`main` is production-ready. `develop` is the base for active work. Use `feat/*`, `fix/*`, `docs/*`, and `chore/*` branches.

## Development Workflow
Implement against the six fixed backend API paths, keep Gemini output user-confirmed, and preserve original-image fallback behavior when AI fails.

## Security Rules
No real `.env*` files, no API keys, no private personal data in commits, and no browser exposure of backend secrets.

## Current Status
Initial buildable frontend skeleton for Wanted AI Championship 2026.
