import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import readline from 'readline';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function run() {
  console.log("\n========================================================================");
  console.log("🔒 GOOGLE DRIVE AUTHENTICATION & REFRESH TOKEN GENERATOR");
  console.log("========================================================================\n");

  // Step 1: Detect client secret files
  const parentDir = path.join(__dirname, '..');
  const filesInParent = fs.readdirSync(parentDir);
  const secretFile = filesInParent.find(f => f.startsWith('client_secret_') && f.endsWith('.json'));

  let credentialsInfo = null;
  if (secretFile) {
    const filePath = path.join(parentDir, secretFile);
    try {
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const key = content.installed || content.web;
      if (key) {
        credentialsInfo = {
          clientId: key.client_id?.trim(),
          clientSecret: key.client_secret?.trim(),
          type: content.installed ? 'Desktop Application (Recommended)' : 'Web Application',
          filename: secretFile,
          filePath: filePath
        };
      }
    } catch (e) {
      // Ignore parse errors
    }
  }

  const envClientId = process.env.GOOGLE_DRIVE_CLIENT_ID?.trim();
  const envClientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET?.trim();

  console.log("🔍 Found Credentials Options:");
  if (credentialsInfo) {
    console.log(`[1] From JSON file (${credentialsInfo.filename}):`);
    console.log(`    - Client ID: ${credentialsInfo.clientId}`);
    console.log(`    - Client Secret: GOCSPX-...${credentialsInfo.clientSecret?.substring(credentialsInfo.clientSecret.length - 8)}`);
    console.log(`    - Type: ${credentialsInfo.type}`);
  } else {
    console.log(`[1] From JSON file: None found (place client_secret_*.json in the root folder to enable)`);
  }

  if (envClientId && envClientSecret) {
    console.log(`[2] From current .env file:`);
    console.log(`    - Client ID: ${envClientId}`);
    console.log(`    - Client Secret: GOCSPX-...${envClientSecret?.substring(envClientSecret.length - 8)}`);
  } else {
    console.log(`[2] From current .env file: Missing client ID or secret`);
  }

  console.log("\n------------------------------------------------------------------------");
  console.log("Choose the credentials to use:");
  console.log("1. Use credentials from the downloaded JSON file (Automatic Redirect Flow - Recommended)");
  console.log("2. Use credentials from the .env file (Manual Redirect Flow)");
  console.log("3. Exit");
  console.log("------------------------------------------------------------------------");

  rl.question('Select option (1, 2, or 3): ', async (choice) => {
    choice = choice.trim();
    if (choice === '3') {
      console.log("Exiting.");
      rl.close();
      return;
    }

    let clientId, clientSecret, isDesktop = false;

    if (choice === '1') {
      if (!credentialsInfo) {
        console.error("❌ Error: No client_secret_*.json file found in the root directory.");
        rl.close();
        return;
      }
      clientId = credentialsInfo.clientId;
      clientSecret = credentialsInfo.clientSecret;
      isDesktop = credentialsInfo.type.includes('Desktop');
    } else if (choice === '2') {
      if (!envClientId || !envClientSecret) {
        console.error("❌ Error: GOOGLE_DRIVE_CLIENT_ID or GOOGLE_DRIVE_CLIENT_SECRET is missing in .env.");
        rl.close();
        return;
      }
      clientId = envClientId;
      clientSecret = envClientSecret;
      // Web apps use playground usually
    } else {
      console.error("❌ Invalid option.");
      rl.close();
      return;
    }

    console.log(`\nInitializing OAuth2 client...`);
    console.log(`Client ID: ${clientId}`);

    if (choice === '1' && isDesktop) {
      // Option 1: Automated Localhost Flow (Desktop Client ID)
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'http://localhost' // Temporary fallback, will be overwritten by server port
      );

      // Start local server to listen for redirect
      const server = http.createServer(async (req, res) => {
        try {
          const urlParams = new URL(req.url, `http://${req.headers.host}`);
          const code = urlParams.searchParams.get('code');
          
          if (code) {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
              <html>
                <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; text-align: center; padding-top: 60px; background-color: #0b0f19; color: #e2e8f0; margin: 0;">
                  <div style="display: inline-block; background: #1e293b; padding: 40px; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3); max-width: 480px; border: 1px solid #334155;">
                    <div style="font-size: 50px; margin-bottom: 20px;">✅</div>
                    <h1 style="color: #10b981; margin: 0 0 10px 0; font-size: 24px;">Authorization Successful!</h1>
                    <p style="font-size: 16px; color: #94a3b8; line-height: 1.5; margin: 0 0 20px 0;">The authorization code was successfully received by the script.</p>
                    <p style="font-size: 14px; color: #64748b; background: #0f172a; padding: 12px; border-radius: 8px; margin: 0;">You can now close this browser tab and return to your terminal.</p>
                  </div>
                </body>
              </html>
            `);
            
            server.close();
            console.log('\n📥 Received authorization code! Exchanging for tokens...');
            
            const { tokens } = await oauth2Client.getToken(code);
            if (tokens.refresh_token) {
              await saveTokensToEnv(clientId, clientSecret, tokens.refresh_token);
            } else {
              console.error('\n❌ Error: Did not receive a refresh token.');
              console.log('Reason: Google only returns a refresh token the FIRST time you authorize.');
              console.log('Solution: Go to https://myaccount.google.com/connections, find your app ("cov-drive-storage"),');
              console.log('remove its permissions, and run this script again to force a new refresh token.');
            }
            rl.close();
          } else {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end('Authorization code not found in URL.');
          }
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end(`Error: ${err.message}`);
          server.close();
          console.error('❌ Local server error:', err.message);
          rl.close();
        }
      });

      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        const redirectUri = `http://localhost:${port}`;
        oauth2Client.redirectUri = redirectUri;

        const authUrl = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: ['https://www.googleapis.com/auth/drive'],
          prompt: 'select_account consent'
        });

        console.log('\n========================================================================');
        console.log('👉 ACTION REQUIRED: AUTHORIZE YOUR GOOGLE ACCOUNT');
        console.log('========================================================================');
        console.log('1. Click or copy-paste this URL in your browser:');
        console.log('\x1b[36m%s\x1b[0m', authUrl);
        console.log('\n2. On the Google screen:');
        console.log('   - You can SELECT which account to sign in with.');
        console.log('   - Choose your official account (e.g. covindiaforum@gmail.com).');
        console.log('   - If you see a "Google hasn\'t verified this app" warning:');
        console.log('     Click "Advanced" -> "Go to cov-drive-storage (unsafe)" to continue.');
        console.log('\n3. Once done, it will automatically redirect to your local server.');
        console.log('========================================================================\n');
        console.log('Waiting for authentication in browser...');
      });

    } else {
      // Option 2: Manual Playground/Redirect Flow (Web Client or manually provided Client ID)
      const redirectUri = 'https://developers.google.com/oauthplayground';
      const oauth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
      );

      const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: ['https://www.googleapis.com/auth/drive'],
        prompt: 'select_account consent'
      });

      console.log('\n========================================================================');
      console.log('👉 ACTION REQUIRED: AUTHORIZE YOUR GOOGLE ACCOUNT');
      console.log('========================================================================');
      console.log('1. Click or copy-paste this URL in your browser:');
      console.log('\x1b[36m%s\x1b[0m', authUrl);
      console.log('\n2. On the Google screen:');
      console.log('   - Select your official account (e.g. covindiaforum@gmail.com).');
      console.log('   - If you see a "Google hasn\'t verified this app" warning:');
      console.log('     Click "Advanced" -> "Go to [AppName] (unsafe)" to continue.');
      console.log('\n3. After authorization, your browser will redirect to a page starting with:');
      console.log('   https://developers.google.com/oauthplayground/?code=...');
      console.log('\n4. Copy the ENTIRE URL from your browser\'s address bar and paste it below.');
      console.log('========================================================================\n');

      rl.question('Paste the redirected URL here: ', async (input) => {
        try {
          let code = input.trim();
          if (code.includes('code=')) {
            if (code.includes('?')) {
              const queryString = code.split('?')[1];
              const urlParams = new URLSearchParams(queryString);
              code = urlParams.get('code');
            } else {
              const urlParams = new URLSearchParams(code);
              code = urlParams.get('code');
            }
          }

          if (!code) {
            console.error("❌ Error: Could not find the authorization code in your input.");
            rl.close();
            return;
          }

          console.log('\n📥 Received authorization code! Exchanging for tokens...');
          const { tokens } = await oauth2Client.getToken(code);
          
          if (tokens.refresh_token) {
            await saveTokensToEnv(clientId, clientSecret, tokens.refresh_token);
          } else {
            console.error('\n❌ Error: Did not receive a refresh token.');
            console.log('Reason: Google only returns a refresh token the FIRST time you authorize.');
            console.log('Solution: Go to https://myaccount.google.com/connections, find your app,');
            console.log('remove its permissions, and run this script again to force a new refresh token.');
          }
        } catch (err) {
          console.error('❌ Error during exchange:', err.message);
        } finally {
          rl.close();
        }
      });
    }
  });
}

async function saveTokensToEnv(clientId, clientSecret, refreshToken) {
  try {
    const envPath = path.join(__dirname, '../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Remove old values if they exist, to ensure we don't have duplicates
    envContent = envContent.replace(/GOOGLE_DRIVE_CLIENT_ID=.*/g, '');
    envContent = envContent.replace(/GOOGLE_DRIVE_CLIENT_SECRET=.*/g, '');
    envContent = envContent.replace(/GOOGLE_DRIVE_REFRESH_TOKEN=.*/g, '');

    // Trim trailing newlines and spaces
    envContent = envContent.trim();

    // Append updated values cleanly
    envContent += `\n\n# Google Drive Storage Config (Updated Automatically)
GOOGLE_DRIVE_CLIENT_ID=${clientId.trim()}
GOOGLE_DRIVE_CLIENT_SECRET=${clientSecret.trim()}
GOOGLE_DRIVE_REFRESH_TOKEN="${refreshToken.trim()}"`;

    fs.writeFileSync(envPath, envContent);
    
    console.log('\n========================================================================');
    console.log('🎉 SUCCESS! GOOGLE DRIVE REFRESH TOKEN GENERATED AND SAVED.');
    console.log('========================================================================');
    console.log(`- Client ID updated: ${clientId.trim()}`);
    console.log(`- Refresh Token saved: ${refreshToken.substring(0, 15)}...`);
    console.log(`- Saved location: ${envPath}`);
    console.log('\n👉 IMPORTANT: Please restart your server or PM2 process now:');
    console.log('   npm run pm2:restart');
    console.log('========================================================================\n');
  } catch (err) {
    console.error('❌ Error saving to .env:', err.message);
  }
}

run().catch(console.error);
