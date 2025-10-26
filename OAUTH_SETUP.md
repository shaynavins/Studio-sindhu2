# Google Drive OAuth Setup for Production

This guide explains how to set up Google Drive authentication for deployment on Render (or any production environment).

## How It Works

The application supports three authentication modes:

1. **Local Development** - Uses `token.json` and `client_secret.json` files
2. **Replit** - Uses Replit Connectors (automatic)
3. **Production** - Uses PostgreSQL database to store OAuth tokens

## Setup Steps

### 1. Run Database Migration

First, apply the database migration to create the `oauth_tokens` table:

```bash
npx drizzle-kit push
```

Or if using migrations:

```bash
npx drizzle-kit migrate
```

### 2. Set Environment Variables

Make sure these environment variables are set in your Render dashboard:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
CALLBACK_URL=https://your-app.onrender.com/oauth2callback
DATABASE_URL=your_postgresql_url
```

**Important:** Update the `CALLBACK_URL` to match your production domain.

### 3. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add your production callback URL to **Authorized redirect URIs**:
   ```
   https://your-app.onrender.com/oauth2callback
   ```

### 4. Authorize the Application

Once deployed:

1. Visit: `https://your-app.onrender.com/api/auth/google`
2. Sign in with your Google account
3. Grant permissions for Drive and Sheets access
4. You'll be redirected back to a success page

The OAuth tokens will be stored in your PostgreSQL database and automatically refreshed when they expire.

### 5. Check Connection Status

You can check if the connection is working:

```bash
curl https://your-app.onrender.com/api/auth/status
```

## API Endpoints

### `GET /api/auth/google`
Initiates the OAuth flow. Redirects to Google's consent screen.

### `GET /oauth2callback`
OAuth callback endpoint. Handles the authorization code and stores tokens in the database.

### `GET /api/auth/status`
Returns the current OAuth connection status:
```json
{
  "connected": true,
  "expiresAt": "2025-12-25T12:00:00.000Z",
  "isExpired": false,
  "hasRefreshToken": true
}
```

## Token Refresh

The system automatically refreshes expired tokens using the refresh token stored in the database. This happens transparently when making API calls to Google Drive or Sheets.

## Troubleshooting

### "Google Drive not connected" error

1. Check if tokens exist in database:
   ```sql
   SELECT * FROM oauth_tokens WHERE service = 'google-drive';
   ```

2. If no tokens, visit `/api/auth/google` to authorize

3. Check if token is expired via `/api/auth/status`

### "Token refresh failed"

- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set correctly
- Verify the refresh token exists in the database
- Check application logs for detailed error messages

### Callback URL mismatch

Make sure:
- `CALLBACK_URL` environment variable matches your domain
- The URL is added to Google Cloud Console authorized redirect URIs
- Both use HTTPS in production

## Local Development

For local development, the system will continue using `token.json` if it exists. Run:

```bash
npm run generate-token
```

This keeps your local and production authentication separate.
