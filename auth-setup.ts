import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import { URL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupAuth() {
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

  // Generate auth URL
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    prompt: 'consent' // Force consent to get refresh token
  });

  console.log('\n🔐 Setting up Google API authentication...\n');
  console.log('📋 Please visit this URL to authorize the app:\n');
  console.log(authUrl);
  console.log('\n⏳ Waiting for authorization...\n');

  // Start local server to capture the code
  const server = http.createServer(async (req, res) => {
    if (!req.url?.startsWith('/oauth2callback')) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    const url = new URL(req.url, `http://localhost:5000`);
    const code = url.searchParams.get('code');

    if (!code) {
      res.writeHead(400);
      res.end('No code provided');
      return;
    }

    try {
      // Exchange code for tokens
      const { tokens } = await oauth2Client.getToken(code);

      if (!tokens.refresh_token) {
        throw new Error('No refresh token received. Try revoking app access and re-running this script.');
      }

      // Save tokens
      const tokenPath = path.join(__dirname, 'token.json');
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));

      console.log('\n✅ Authentication successful!');
      console.log('🎉 Token saved to token.json with refresh token\n');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>✅ Authentication successful!</h1><p>You can close this window and return to the terminal.</p>');

      server.close();
      process.exit(0);
    } catch (error: any) {
      console.error('\n❌ Error:', error.message);
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>❌ Error</h1><p>${error.message}</p>`);
      server.close();
      process.exit(1);
    }
  });

  server.listen(5000);
}

setupAuth();
