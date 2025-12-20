# Twilio WhatsApp Setup Guide

This application uses Twilio's WhatsApp API to send scheduled messages to the workshop.

## Setup Steps

### 1. Create a Twilio Account

1. Go to [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up for a free account
3. Complete the verification process

### 2. Get Your Credentials

1. Log in to the [Twilio Console](https://console.twilio.com)
2. On the dashboard, you'll find:
   - **Account SID** - Copy this value
   - **Auth Token** - Click to reveal and copy this value

### 3. Set Up WhatsApp Sandbox (Free Tier)

1. In the Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow the instructions to join the WhatsApp Sandbox:
   - Send a WhatsApp message to the provided number (usually **+1 415 523 8886**)
   - Send the code provided (e.g., "join <your-code>")
3. Once joined, you can send and receive WhatsApp messages for testing

### 4. Configure Workshop Phone Number

The workshop phone number (**8867636725**) needs to join the Twilio WhatsApp sandbox:

1. From the workshop phone, send a WhatsApp message to **+1 415 523 8886**
2. Send the message: `join <your-sandbox-code>`
3. You'll receive a confirmation message

### 5. Update Environment Variables

Add the following to your `.env` file:

```env
TWILIO_ACCOUNT_SID=your_account_sid_from_step_2
TWILIO_AUTH_TOKEN=your_auth_token_from_step_2
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## How It Works

1. When you fill out the measurement form and select a "Scheduled Send to Workshop" date, the system creates a scheduled job in the database
2. A scheduler runs every hour and checks for pending jobs that are due
3. When a job's scheduled time arrives, the system:
   - Sends a WhatsApp message via Twilio to **+918867636725**
   - The message includes customer name, order number, and garment type
   - Marks the job as completed

## API Endpoints

- `GET /api/scheduled-jobs/pending` - Get all pending jobs that are due
- `GET /api/scheduled-jobs/upcoming` - Get upcoming jobs (next 7 days)
- `POST /api/scheduled-jobs/:id/execute` - Manually execute a scheduled job
- `PATCH /api/scheduled-jobs/:id/complete` - Mark a job as completed

## Upgrading to Production

For production use (beyond the free tier):

1. Apply for WhatsApp Business API approval in the Twilio Console
2. Get your own WhatsApp Business number
3. Update `TWILIO_WHATSAPP_NUMBER` in `.env` with your production number
4. No sandbox setup required for recipients - they can receive messages directly

## Troubleshooting

### Message not sending?
- Check that Twilio credentials are correct in `.env`
- Verify the workshop phone has joined the WhatsApp sandbox
- Check server logs for any error messages
- Ensure you have SMS/WhatsApp credits in your Twilio account

### Sandbox limitations?
- Twilio sandbox is free but has limitations:
  - Recipients must join the sandbox first
  - Messages expire after 24 hours of inactivity
  - For production, upgrade to WhatsApp Business API

## Cost

- **Free Tier**: $15 USD trial credit (enough for ~1000 WhatsApp messages)
- **Pay-as-you-go**: $0.005 per WhatsApp message
- **No monthly fees** for the free tier

## Support

For Twilio support: [https://support.twilio.com](https://support.twilio.com)
