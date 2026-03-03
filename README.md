# GameOverVault

GameOverVault is a retro and modern game information platform with a Next.js frontend and a FastAPI backend.

## Project URLs

- Local frontend URL: `http://localhost:3000`
- Production frontend URL: `https://gameover.shadowcoder.org`
- Production FastAPI docs: `https://pfzcrggqfu.us-east-1.awsapprunner.com/docs`

## Architecture

### Frontend

- Next.js
- TypeScript
- shadcn/ui
- Hosted on AWS Amplify

### Backend

- FastAPI
- Python
- Auth0 for authentication
- Docker to build images
- Docker images pushed to AWS ECR (Elastic Container Registry)
- AWS App Runner hosts the latest image from ECR
- MongoDB as the NoSQL database
- External APIs:
  - IGDB (Internet Games Database): main API for video game and console data
  - PriceCharting: API used to gather game and console prices

## Local Backend Run

Navigate to the `backend/` directory and run:

```bash
source .venv/bin/activate
uvicorn main:app --reload
```

Once running, backend endpoints are available at:

```bash
http://127.0.0.1:8000/
```

FastAPI interactive docs (Swagger):

```bash
http://127.0.0.1:8000/docs#/
```

Alternative docs (ReDoc):

```bash
http://127.0.0.1:8000/redoc
```

## Deployment

### Frontend Deployment (AWS Amplify)

- Frontend changes deploy automatically when code is pushed to GitHub.
- `amplify.yml` is important because it defines monorepo build behavior and writes required environment variables into `.env.production` during build.
- This is especially critical for Auth0 in Next.js SSR/proxy routes. Without this setup, Auth0 runtime variables can be missing in production and `/auth/login` can fail.

### Backend Deployment (AWS App Runner + ECR)

- Backend changes are deployed by building a Docker image locally and pushing it to ECR.
- `backend/Dockerfile` is the source of truth for how the backend image is built and started. This keeps deployments reproducible across local, ECR, and App Runner.
- `backend/.dockerignore` prevents unnecessary or sensitive files (virtual envs, caches, local env files, editor files) from being included in Docker build context, improving security and build performance.

## Guides

- [Environment Variable File](https://www.geeksforgeeks.org/python/how-to-create-and-use-env-files-in-python/)

## Documentation

- [Tailwind](https://tailwindcss.com/docs/installation/using-postcss)
- [Shadcn](https://ui.shadcn.com/docs/components)
- [Embla Carousel](https://www.embla-carousel.com/get-started/)
- [Lucide Icons](https://lucide.dev/icons)
- [React Icons](https://react-icons.github.io/react-icons/)
- [NextJS](https://nextjs.org/docs/app/getting-started/installation)
- [FastAPI](https://fastapi.tiangolo.com/learn/)
- [Google Fonts](https://fonts.google.com/)
- [TheGamesDB API](https://api.thegamesdb.net/#/Platforms/Platforms)
- [InternetGamesDB API](https://api-docs.igdb.com/?python#getting-started)
- [ThePriceCharting API](https://www.pricecharting.com/api-documentation#overview)
- [Twitch API](https://dev.twitch.tv/docs/)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide)
- [TypeScript](https://www.typescriptlang.org/docs/handbook/2/basic-types.html)
- [W3Schools](https://www.w3schools.com/)
- [MongoDB](https://account.mongodb.com/account/login)
- [Auth0](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Unix Timestamp](https://www.unixtimestamp.com/) (Useful for checking current Unix timestamps for requests that require one.)
