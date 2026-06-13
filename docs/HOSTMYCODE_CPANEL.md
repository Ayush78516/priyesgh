# HostMyCode cPanel Deployment

This guide matches this repository and the target path:

`public_html/councilofvaluers.com`

## cPanel App Settings

Create the Node.js app in cPanel with these values:

- Application root: `public_html/councilofvaluers.com`
- Application URL: `councilofvaluers.com`
- Startup file: `app.js`
- Mode: `Production`
- Node.js version: `18.x` or `20.x`

## Local Preparation

Build the frontend before uploading:

```bash
npm run deploy:prepare
```

## Upload Layout

Upload the files so the server looks like this:

```text
public_html/
  councilofvaluers.com/
    .env
    app.js
    package.json
    package-lock.json
    front/
      dist/
        index.html
        assets/
    Internship-project/
      server.js
      package.json
      package-lock.json
      config/
      controllers/
      middleware/
      models/
      routes/
      uploads/
      ...
```

Do not upload `node_modules/`.

## Why This Layout Matters

- `app.js` bootstraps the backend from the cPanel app root.
- `Internship-project/server.js` serves `../front/dist` in production.
- `Internship-project/config/env.js` can load `.env` from `public_html/councilofvaluers.com/.env`.

## Install on HostMyCode

Open cPanel Terminal or SSH and run:

```bash
cd ~/public_html/councilofvaluers.com
npm install
npm install --prefix Internship-project
```

If you uploaded the repository root too and want to rebuild the frontend on the server:

```bash
cd ~/public_html/councilofvaluers.com
npm run deploy:prepare
```

## Required Environment Variables

Set these in cPanel or in `public_html/councilofvaluers.com/.env`:

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://councilofvaluers.com

JWT_SECRET=replace-me
JWT_REFRESH_SECRET=replace-me

MONGO_URL=replace-me
REDIS_URL=replace-me

EMAIL_HOST=replace-me
EMAIL_PORT=587
EMAIL_USER=replace-me
EMAIL_PASS=replace-me

CCAVENUE_ENV=production
CCAVENUE_MERCHANT_ID=replace-me
CCAVENUE_ACCESS_CODE=replace-me
CCAVENUE_WORKING_KEY=replace-me
CCAVENUE_ENCRYPTION_TYPE=AES-128

FEE_MONTHLY=500
FEE_QUARTERLY=1200
FEE_ANNUAL=3000
FEE_LIFE=10000
FEE_INSTITUTIONAL=25000
```

## After Upload

1. Restart the Node.js app from cPanel.
2. Open `https://councilofvaluers.com`.
3. Test:
   - homepage loads
   - `/api/public/...` routes respond
   - uploads resolve from `/uploads/...`
   - registration OTP flow
   - CCAvenue callback URLs

## Common Problems

### Blank site or 404 on refresh

Confirm `front/dist` exists under `public_html/councilofvaluers.com/front/dist`.

### CORS errors

Set:

```env
BASE_URL=https://councilofvaluers.com
```

### MongoDB connection failure

Allow the HostMyCode server IP in MongoDB Atlas network access.

### SMTP OTP failure

Shared hosting often restricts outbound Gmail SMTP. If Gmail fails, switch to a supported SMTP provider or transactional email service.

### App starts but crashes immediately

Check:

- `npm install` was run inside `public_html/councilofvaluers.com`
- `npm install --prefix Internship-project` was run
- `.env` exists or cPanel environment variables are set
- Node.js version is `18+`
