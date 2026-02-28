# Repository Guidelines

## Project Structure & Module Organization
- `backend/`: FastAPI service.
- `backend/main.py`: app bootstrap, CORS, router registration.
- `backend/routers/`: API domains (`igdb_routes.py`, `price_charting_routes.py`, `mongodb_routes.py`).
- `backend/auth.py`, `backend/mongodb.py`, `backend/config.py`: auth, DB connection, settings.
- `frontend/`: Next.js App Router client.
- `frontend/src/app/`: route pages (for example `game-info/page.tsx`).
- `frontend/src/lib/api/`: client API wrappers (`igdb.ts`, `db.ts`).
- `frontend/public/`: static assets (images/icons).
- `Notes/`: planning and working notes.

## Build, Test, and Development Commands
- Backend run:
  - `cd backend`
  - `source .venv/bin/activate`
  - `uvicorn main:app --reload`
- Backend docs:
  - `http://127.0.0.1:8000/docs`
- Frontend run:
  - `cd frontend && npm install`
  - `npm run dev` (local dev server)
  - `npm run build` (production build)
  - `npm run start` (serve production build)
  - `npm run lint` (ESLint)
- Backend Docker build (App Runner image):
  - `docker build -t gameover-backend ./backend`

## Deployment Notes (AWS)
- Current target setup:
  - Frontend on AWS Amplify.
  - Backend on AWS App Runner (from ECR image).
- ECR push flow:
  - Authenticate Docker to ECR with `aws ecr get-login-password ... | docker login ...`.
  - Build from `./backend`, tag with ECR URI, and `docker push`.
- Required local tools for ECR flow:
  - AWS CLI configured (`aws configure`, `aws sts get-caller-identity`).
  - Docker daemon running.
- Amplify/Auth0 env config:
  - Configure Auth0 values in Amplify environment settings.
  - Use Secrets for sensitive values; use Environment Variables for non-sensitive config.
- Known Next.js build caveat on Amplify:
  - `useSearchParams()` in App Router pages must be properly handled for build/prerender (for example client boundary with `Suspense` where required), or Amplify build can fail during prerender.

## Coding Style & Naming Conventions
- Python: PEP 8, 4-space indentation, explicit typing for route params/returns when practical.
- TypeScript/React: functional components, `camelCase` variables/functions, `PascalCase` components/types.
- API response shape should stay consistent (`{ data: ... }` for success; `detail: { code, message, status }` for errors).
- Keep route names and frontend env endpoint keys aligned (for example `/full-game-details`).

## Testing Guidelines
- No formal automated test suite is currently configured.
- Minimum validation before PR:
  - Run `npm run lint` in `frontend/`.
  - Manually test key flows: game search, game details load, save/check collection, auth-required endpoints.
- When adding tests, place frontend tests near feature files and backend tests under a new `backend/tests/`.

## Commit & Pull Request Guidelines
- Current history uses informal sentence-style commits. Prefer moving to concise imperative messages:
  - Example: `fix(mongodb): use upsert for /games/save`
- PRs should include:
  - What changed and why.
  - Files/routes affected.
  - Manual test steps and outcomes.
  - UI screenshots or short recordings for frontend changes.

## Security & Configuration Tips
- Never commit secrets; use `.env`, `.env.local`, and provided `.env.example` templates.
- Auth-protected backend routes require `Authorization: Bearer <token>` from frontend requests.
- `backend/.dockerignore` is configured to exclude local virtual envs, caches, editor files, and local secret env files from container context.
