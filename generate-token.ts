import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateToken() {
  // Read client secret
  const clientSecretPath = path.join(__dirname, 'client_secret.json');
  const content = fs.readFileSync(clientSecretPath, 'utf8');
  const credentials = JSON.parse(content);
  const { client_id, client_secret, redirect_uris } = credentials.web;

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Authorization code from user (URL decoded)
  const code = '4/0Ab32j935Zl2doM9d716BYDY47di5EFr5R2AdEn7hl1Wbg07toGEk7zAccYglMsVq6kfH5g';

  try {
    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save tokens to file
    const tokenPath = path.join(__dirname, 'token.json');
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
    
    console.log('✅ Token saved to token.json');
    console.log('Tokens:', tokens);
  } catch (error: any) {
    console.error('❌ Error exchanging code for tokens:');
    console.error(error.message);
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n⚠️  The authorization code has expired or been used.');
      console.log('Get a new code by visiting:');
      console.log(`\nhttps://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uris[0]}&response_type=code&scope=https://www.googleapis.com/auth/drive%20https://www.googleapis.com/auth/spreadsheets&access_type=offline&prompt=consent`);
    }
  }
}

generateToken();
