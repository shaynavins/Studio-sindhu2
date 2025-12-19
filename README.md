
The link you need:

open https://studio-sindhu2.onrender.com/api/auth/google

This will:
1. Redirect you to Google login
2. Ask for permissions
3. Save the new token to your database
4. Fix the "No access, refresh token" error


Check if it worked:

curl https://studio-sindhu2.onrender.com/api/auth/status

After visiting that link, verify the token is refreshed:
bash
You should see:
json
