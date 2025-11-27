# How to Find Your Twilio WhatsApp Number for .env

This guide will help you find the correct phone number to use in your `TWILIO_WHATSAPP_NUMBER` environment variable.

## Quick Answer

For **testing/development**, use the **Twilio WhatsApp Sandbox number**:

```
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## Step-by-Step Instructions

### Option 1: Using Twilio WhatsApp Sandbox (Recommended for Testing)

This is the easiest way to get started and is **FREE** for testing.

#### Step 1: Log into Twilio Console

1. Go to [https://console.twilio.com](https://console.twilio.com)
2. Log in with your Twilio account

#### Step 2: Navigate to WhatsApp Sandbox

1. In the left sidebar, click on **Messaging**
2. Click on **Try it out**
3. Click on **Send a WhatsApp message**

#### Step 3: Find Your Sandbox Number

You'll see a section that says something like:

```
Send a WhatsApp message
From: whatsapp:+14155238886
```

**Copy this number** - it will be in the format: `whatsapp:+14155238886`

#### Step 4: Add to .env File

Add it to your `backend/.env` file:

```env
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Note:** You can use either format:

- `whatsapp:+14155238886` ✅ (Recommended - includes prefix)
- `+14155238886` ✅ (Also works - code adds prefix automatically)

#### Step 5: Join the Sandbox

**Important:** Before you can send messages, you need to join the sandbox:

1. On the same Twilio page, you'll see a message like:
   ```
   Join the sandbox by sending join <code-word> to +1 415 523 8886
   ```
2. Open WhatsApp on your phone
3. Send a message to `+1 415 523 8886` (or whatever number Twilio shows)
4. Send: `join <code-word>` (replace `<code-word>` with the actual word shown)
5. Wait for confirmation

6. **For each phone number you want to send messages TO**, they also need to join the sandbox the same way

### Option 2: Production WhatsApp Number (For Live Use)

For production, you need a verified WhatsApp Business API number.

#### Step 1: Apply for WhatsApp Business API

1. In Twilio Console, go to **Messaging** > **Settings** > **WhatsApp Senders**
2. Click **Get Started** or **Request WhatsApp Number**
3. Complete Twilio's verification process (this can take days/weeks)

#### Step 2: Get Your Production Number

Once approved, you'll receive a WhatsApp number in the format:

```
whatsapp:+1XXXXXXXXXX
```

#### Step 3: Add to .env File

```env
TWILIO_WHATSAPP_NUMBER=whatsapp:+1XXXXXXXXXX
```

## Common Formats

All of these formats will work (the code handles them automatically):

✅ **Recommended:**

```env
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

✅ **Also works:**

```env
TWILIO_WHATSAPP_NUMBER=+14155238886
```

✅ **Also works (not recommended):**

```env
TWILIO_WHATSAPP_NUMBER=14155238886
```

## Example .env Configuration

Here's a complete example of your `.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_character_auth_token_here

# For Testing (Sandbox)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# For Production (after approval)
# TWILIO_WHATSAPP_NUMBER=whatsapp:+1XXXXXXXXXX

# Regular SMS (optional)
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Admin Phone (optional)
ADMIN_PHONE=+919876543210
```

## How to Verify It's Working

1. **Check server startup logs:**
   When you start your server, you should see:

   ```
   ✅ WhatsApp configured: whatsapp:+14155238886
   ```

2. **If you see a warning:**

   ```
   ⚠️ TWILIO_WHATSAPP_NUMBER not set in .env - WhatsApp messages will not be sent
   ```

   This means the environment variable is not set correctly.

3. **Test by making a booking:**
   - Make a test booking
   - Check server logs for:
     ```
     📱 Attempting to send WhatsApp message:
        From: whatsapp:+14155238886
        To: whatsapp:+919876543210
     ```

## Troubleshooting

### Problem: Can't find the WhatsApp number in Twilio Console

**Solution:**

- Make sure you're logged into the correct Twilio account
- Navigate: Messaging → Try it out → Send a WhatsApp message
- If you don't see it, you may need to enable WhatsApp in your Twilio account

### Problem: Messages not sending

**Solution:**

- Make sure you (and recipients) have joined the WhatsApp sandbox
- Check that the number format is correct in `.env`
- Verify your `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
- Check server logs for error messages

### Problem: "Invalid From number" error

**Solution:**

- Verify the `TWILIO_WHATSAPP_NUMBER` in `.env` matches exactly what's in Twilio Console
- Make sure it includes the country code (e.g., `+1` for US)
- Restart your server after changing `.env`

## Summary

**For Testing (Quick Start):**

1. Go to Twilio Console → Messaging → Try it out → Send a WhatsApp message
2. Copy the number shown (usually `whatsapp:+14155238886`)
3. Add to `.env`: `TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886`
4. Join the sandbox from your phone
5. Test!

**For Production:**

1. Apply for WhatsApp Business API access
2. Get approved (can take time)
3. Use your production WhatsApp number
4. Update `.env` with production number

## Need Help?

- Twilio Console: [https://console.twilio.com](https://console.twilio.com)
- Twilio WhatsApp Docs: [https://www.twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- Check server logs for detailed error messages
