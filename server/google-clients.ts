import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { oauthTokens } from '@shared/schema';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let driveConnectionSettings: any;
let sheetsConnectionSettings: any;
let oauth2Client: any;

// Check environment type: local (dev with files), replit (with connectors), or production (with database)
function getEnvironmentType(): 'local' | 'replit' | 'production' {
  if (process.env.REPLIT_CONNECTORS_HOSTNAME || process.env.REPL_IDENTITY) {
    return 'replit';
  }
  // Check if we have local token files
  const tokenPath = path.join(__dirname, '..', 'token.json');
  if (fs.existsSync(tokenPath)) {
    return 'local';
  }
  return 'production';
}

// Get OAuth2 client for local development
function getLocalOAuth2Client() {
  if (oauth2Client) return oauth2Client;

  const clientSecretPath = path.join(__dirname, '..', 'client_secret.json');
  const tokenPath = path.join(__dirname, '..', 'token.json');

  if (!fs.existsSync(clientSecretPath) || !fs.existsSync(tokenPath)) {
    throw new Error('client_secret.json or token.json not found. Run setup-google-api.ts first.');
  }

  const credentials = JSON.parse(fs.readFileSync(clientSecretPath, 'utf8'));
  const tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
  const { client_id, client_secret, redirect_uris } = credentials.web;

  oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
  oauth2Client.setCredentials(tokens);

  // Auto-refresh token handler
  oauth2Client.on('tokens', (newTokens: any) => {
    if (newTokens.refresh_token) {
      tokens.refresh_token = newTokens.refresh_token;
    }
    tokens.access_token = newTokens.access_token;
    tokens.expiry_date = newTokens.expiry_date;
    fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
  });

  return oauth2Client;
}

// Get or refresh tokens from database
async function getTokenFromDatabase(service: string) {
  const [tokenRecord] = await db
    .select()
    .from(oauthTokens)
    .where(eq(oauthTokens.service, service))
    .limit(1);

  if (!tokenRecord) {
    return null;
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (tokenRecord.expiryDate && new Date(tokenRecord.expiryDate).getTime() < Date.now() + 5 * 60 * 1000) {
    // Token expired or expiring soon, refresh it
    if (tokenRecord.refreshToken) {
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.CALLBACK_URL
      );
      oauth2Client.setCredentials({
        refresh_token: tokenRecord.refreshToken,
      });

      try {
        const { credentials } = await oauth2Client.refreshAccessToken();
        
        // Update token in database
        await db
          .update(oauthTokens)
          .set({
            accessToken: credentials.access_token!,
            expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
            updatedAt: new Date(),
          })
          .where(eq(oauthTokens.id, tokenRecord.id));

        return credentials.access_token;
      } catch (error) {
        console.error('Error refreshing token:', error);
        return null;
      }
    }
    return null;
  }

  return tokenRecord.accessToken;
}

async function getDriveAccessToken() {
  const envType = getEnvironmentType();
  
  if (envType === 'local') {
    // Use local token.json
    return null; // Return null to use OAuth2Client directly
  }
  
  if (envType === 'production') {
    // Use database tokens
    return await getTokenFromDatabase('google-drive');
  }

  if (driveConnectionSettings && driveConnectionSettings.settings.expires_at && new Date(driveConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return driveConnectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  driveConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-drive',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = driveConnectionSettings?.settings?.access_token || driveConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!driveConnectionSettings || !accessToken) {
    throw new Error('Google Drive not connected');
  }
  return accessToken;
}

async function getSheetsAccessToken() {
  const envType = getEnvironmentType();
  
  if (envType === 'local') {
    // Use local token.json
    return null; // Return null to use OAuth2Client directly
  }
  
  if (envType === 'production') {
    // Use database tokens - same token works for both Drive and Sheets
    return await getTokenFromDatabase('google-drive');
  }

  if (sheetsConnectionSettings && sheetsConnectionSettings.settings.expires_at && new Date(sheetsConnectionSettings.settings.expires_at).getTime() > Date.now()) {
    return sheetsConnectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  sheetsConnectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-sheet',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = sheetsConnectionSettings?.settings?.access_token || sheetsConnectionSettings.settings?.oauth?.credentials?.access_token;

  if (!sheetsConnectionSettings || !accessToken) {
    throw new Error('Google Sheet not connected');
  }
  return accessToken;
}

export async function getGoogleDriveClient() {
  const envType = getEnvironmentType();
  
  if (envType === 'local') {
    const auth = getLocalOAuth2Client();
    return google.drive({ version: 'v3', auth });
  }

  const accessToken = await getDriveAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.drive({ version: 'v3', auth: oauth2Client });
}

export async function getGoogleSheetsClient() {
  const envType = getEnvironmentType();
  
  if (envType === 'local') {
    const auth = getLocalOAuth2Client();
    return google.sheets({ version: 'v4', auth });
  }

  const accessToken = await getSheetsAccessToken();
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.sheets({ version: 'v4', auth: oauth2Client });
}
