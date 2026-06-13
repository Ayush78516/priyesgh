# COV - Council of Valuers Project

Full-stack project with a React frontend and a Node.js/Express backend, plus CCAvenue, MongoDB, Redis, and OTP email flows.

## Structure

- `front/` - React + Vite frontend
- `Internship-project/` - Express backend
- `.env` - shared runtime configuration file for production or local use

## Local Setup

1. Install dependencies:
   ```bash
   npm run install:all
   ```
2. Copy `.env.example` to `.env` and fill in real values.
3. Build the frontend:
   ```bash
   npm run build:front
   ```
4. Start the backend:
   ```bash
   npm start
   ```

For a step-by-step local guide, including Windows PowerShell notes and frontend dev-server mode, see [docs/RUN_LOCAL.md](docs/RUN_LOCAL.md).
For PM2 deployment and process management, see [docs/PM2.md](docs/PM2.md).

## Useful Scripts

- `npm run install:all` - install root, frontend, and backend dependencies
- `npm run build:front` - build the Vite frontend
- `npm run build` - install everything and build the frontend
- `npm run deploy:prepare` - frontend-only install + build for production upload
- `npm start` - start the backend from `Internship-project`

## Environment Loading

The backend tries these `.env` locations in order:

1. repo root `.env`
2. `Internship-project/.env`
3. current working directory `.env`

If no file exists, panel-defined environment variables still work.

## HostMyCode cPanel Deployment

Use the deployment guide in [docs/HOSTMYCODE_CPANEL.md](docs/HOSTMYCODE_CPANEL.md).
