# PM2 Guide

This repository is set up to run under PM2 from the repository root.

PM2 should run the root entrypoint:

- `app.js`

That file bootstraps `Internship-project/server.js`, which serves the built frontend in production.

## Files Added for PM2

- `ecosystem.config.cjs` - PM2 app definition
- root `package.json` PM2 scripts

## Prerequisites

- Node.js `18+`
- `pm2` installed globally or otherwise available on your PATH
- valid `.env` values for MongoDB, Redis, JWT, SMTP, and any payment settings you use

Install PM2 globally if needed:

```bash
npm install -g pm2
```

If you are using PowerShell on Windows, prefer `npm.cmd` and `pm2.cmd` when running commands directly.

## 1. Install Dependencies

From the repository root:

```bash
npm run install:all
```

On Windows PowerShell:

```powershell
npm.cmd run install:all
```

## 2. Prepare Production Build

Build the frontend before starting PM2 in production:

```bash
npm run build:front
```

On Windows PowerShell:

```powershell
npm.cmd run build:front
```

## 3. Confirm `.env`

Typical production values:

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://your-domain.example
```

Important:

- `MONGO_URL` must be valid or the backend exits.
- `REDIS_URL` must be valid or Redis-dependent flows fail.
- `BASE_URL` should match the real public URL.

## 4. Start with PM2

From the repository root:

```bash
npm run pm2:start
```

On Windows PowerShell:

```powershell
npm.cmd run pm2:start
```

Equivalent direct command:

```bash
pm2 start ecosystem.config.cjs --env production
```

On Windows PowerShell:

```powershell
pm2.cmd start ecosystem.config.cjs --env production
```

## 5. Manage the App

Useful commands:

```bash
npm run pm2:logs
npm run pm2:restart
npm run pm2:reload
npm run pm2:stop
npm run pm2:delete
npm run pm2:save
```

On Windows PowerShell:

```powershell
npm.cmd run pm2:logs
npm.cmd run pm2:restart
npm.cmd run pm2:reload
npm.cmd run pm2:stop
npm.cmd run pm2:delete
npm.cmd run pm2:save
```

Direct PM2 equivalents:

```bash
pm2 status
pm2 logs covforum
pm2 restart covforum
pm2 reload covforum
pm2 stop covforum
pm2 delete covforum
pm2 save
```

## 6. Start PM2 on Server Reboot

On Linux:

```bash
pm2 startup
pm2 save
```

PM2 will print the exact command you need to run with elevated privileges for your server.

## Notes

- The PM2 app name is `covforum`.
- The ecosystem file uses `fork` mode with `1` instance. That is the safe default for this app.
- `NODE_ENV=production` makes the backend serve `front/dist`.
- PM2 should manage `app.js` directly, not `npm start`.
- The backend now handles `SIGINT` and `SIGTERM` so PM2 restarts can shut down HTTP, Redis, and MongoDB cleanly.
