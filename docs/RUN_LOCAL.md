# Local Run Guide

This repository has three relevant parts:

- `front/` - React + Vite frontend
- `Internship-project/` - Node.js + Express backend
- repo root - wrapper scripts that install/build/start both pieces

If you are using PowerShell on Windows, replace `npm` with `npm.cmd` in the commands below. PowerShell often blocks the `npm.ps1` wrapper.

## Prerequisites

- Node.js `18+`
- a reachable MongoDB instance
- a reachable Redis instance
- SMTP credentials if you want to test OTP email flows
- CCAvenue credentials if you want to test payment flows

## 1. Create `.env`

Copy the example file and edit it for local use:

```powershell
copy .env.example .env
```

On macOS or Linux:

```bash
cp .env.example .env
```

Recommended local values:

```env
PORT=3000
NODE_ENV=production
BASE_URL=http://localhost:3000
CCAVENUE_ENV=test
```

Important notes:

- `MONGO_URL` must be valid. The backend exits if MongoDB connection fails.
- `REDIS_URL` must be valid. Redis is used by the auth and OTP flows.
- `JWT_SECRET` and `JWT_REFRESH_SECRET` should be set to real values.
- The sample `.env.example` uses a production domain for `BASE_URL`; change that for local work.

## 2. Install Dependencies

From the repository root:

```bash
npm run install:all
```

This installs:

- root dependencies
- frontend dependencies in `front/`
- backend dependencies in `Internship-project/`

## 3. Run the App

### Option A: Single-server local run

Use this if you want the backend to serve the built frontend on the same port.

Build the frontend:

```bash
npm run build:front
```

Start the app:

```bash
npm start
```

Open:

```text
http://localhost:3000
```

This is the simplest way to run the full app locally.

### Option B: Frontend dev server + backend

Use this if you want Vite's frontend dev server while the backend still runs on port `3000`.

Terminal 1:

```bash
npm start --prefix Internship-project
```

Terminal 2:

```bash
npm run dev --prefix front
```

Open:

```text
http://localhost:5173
```

The Vite dev server proxies these paths to the backend on `3000`:

- `/api`
- `/ccav`
- `/uploads`

### Option C: Run with nodemon

Use this if you want the Node server to restart automatically when backend files change.

1. Set local development mode in `.env`:

```env
NODE_ENV=development
BASE_URL=http://localhost:3000
```

2. Install `nodemon` in the repository root:

```bash
npm install --save-dev nodemon
```

3. Start the app from the repository root:

```bash
npx nodemon app.js
```

On Windows PowerShell:

```powershell
npm.cmd install --save-dev nodemon
npx.cmd nodemon app.js
```

Open:

```text
http://localhost:3000
```

Why this works:

- `app.js` starts `Internship-project/server.js`
- when `NODE_ENV` is not `production`, the backend starts Vite in middleware mode
- that means you do not need to build `front/` first for this mode

Notes:

- backend file changes trigger `nodemon` restarts
- frontend file changes are handled by Vite in development mode
- if you switch back to production-style local running, change `.env` back to `NODE_ENV=production`

## 4. Verify Startup

After the app starts, check:

- `http://localhost:3000` loads in Option A
- `http://localhost:5173` loads in Option B
- `http://localhost:3000/api/public/cms` responds
- uploaded files load from `/uploads/...` when present

## Common Problems

### `npm` is blocked in PowerShell

Use `npm.cmd` instead of `npm`.

Examples:

```powershell
npm.cmd run install:all
npm.cmd run build:front
npm.cmd start
```

### MongoDB connection error

Check:

- `MONGO_URL` is correct
- your MongoDB user credentials are valid
- your current machine or network is allowed by MongoDB Atlas

### Redis connection errors

Check:

- `REDIS_URL` is correct
- the Redis host is reachable from your machine
- TLS is supported by your Redis provider

### Blank page on `localhost:3000`

If you are using Option A, rebuild the frontend:

```bash
npm run build:front
```

### Port already in use

Change `PORT` in `.env` and restart the backend.

### OTP or payment flows fail

Startup can succeed even if these are not configured, but the related features need valid credentials:

- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`
- `CCAVENUE_MERCHANT_ID`, `CCAVENUE_ACCESS_CODE`, `CCAVENUE_WORKING_KEY`

## Notes

- `app.js` bootstraps `Internship-project/server.js`.
- For standard local startup, you do not need to run `Internship-project/ccavServer.js` separately because the main server already exposes the CCAvenue handlers.
