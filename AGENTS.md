# Repository Guidelines

## Project Structure & Module Organization
- `Backend/`: FastAPI service.
- `Backend/main.py`: app bootstrap, CORS, router registration.
- `Backend/routers/`: API domains (`igdb_routes.py`, `price_charting_routes.py`, `mongodb_routes.py`).
- `Backend/auth.py`, `Backend/mongodb.py`, `Backend/config.py`: auth, DB connection, settings.
- `frontend/`: Next.js App Router client.
- `frontend/src/app/`: route pages (for example `game-info/page.tsx`).
- `frontend/src/lib/api/`: client API wrappers (`igdb.ts`, `db.ts`).
- `frontend/public/`: static assets (images/icons).
- `Notes/`: planning and working notes.

## Build, Test, and Development Commands
- Backend run:
  - `cd Backend`
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
- When adding tests, place frontend tests near feature files and backend tests under a new `Backend/tests/`.

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
