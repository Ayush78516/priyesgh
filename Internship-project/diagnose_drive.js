import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function diagnose() {
  console.log("--- GOOGLE DRIVE DIAGNOSTIC ---");
  console.log("Client ID:", process.env.GOOGLE_DRIVE_CLIENT_ID);
  console.log("Client Secret:", process.env.GOOGLE_DRIVE_CLIENT_SECRET?.substring(0, 10) + "...");
  
  const cleanToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN?.replace(/['"]+/g, '').trim();
  console.log("Token Start:", cleanToken?.substring(0, 20));

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_DRIVE_CLIENT_ID,
    process.env.GOOGLE_DRIVE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({ refresh_token: cleanToken });

  try {
    console.log("\nAttempting to get Access Token...");
    const { token } = await oauth2Client.getAccessToken();
    console.log("✅ SUCCESS! Access token acquired.");
  } catch (err) {
    console.error("\n❌ FAILED!");
    console.error("Error Message:", err.message);
    if (err.response) {
      console.error("Full Google Response:", JSON.stringify(err.response.data, null, 2));
    }
    console.log("\nPossible Solutions:");
    console.log("1. Ensure your email is added to 'Test Users' in Google Console.");
    console.log("2. Ensure you used the 'https://developers.google.com/oauthplayground' Redirect URI in the Console.");
    console.log("3. Try generating the token again in the Playground, making sure you use YOUR OWN Client ID and Secret.");
  }
}

diagnose();
