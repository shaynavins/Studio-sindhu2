import { google } from 'googleapis';
import fs from 'fs';
import http from 'http';
import { parse } from 'url';

async function setup() {
  const credentials = JSON.parse(fs.readFileSync('client_secret.json', 'utf8'));
  const { client_id, client_secret } = credentials.web;

  const REDIRECT_URI = 'http://localhost:5000/oauth2callback';
  const oauth2Client = new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive', 'https://www.googleapis.com/auth/spreadsheets'],
  });

  console.log('🔗 Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n⏳ Waiting for authorization...\n');

  const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith('/oauth2callback?code=')) {
      const qs = parse(req.url, true).query;
      const code = qs.code as string;

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end('<h1>✅ Authorization successful!</h1><p>You can close this window.</p>');

      server.close();

      try {
        const { tokens } = await oauth2Client.getToken(code);
        fs.writeFileSync('token.json', JSON.stringify(tokens, null, 2));
        console.log('✅ token.json created successfully!');
      } catch (error: any) {
        console.error('❌ Error:', error.message);
      }
    }
  }).listen(5000);
}

setup();
