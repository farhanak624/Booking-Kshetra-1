# WhatsApp Notification Troubleshooting Guide

If WhatsApp messages are not sending, follow these steps to diagnose and fix the issue.

## Common Issues and Solutions

### 1. Check Environment Variables

Make sure these are set in your `backend/.env` file:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Important Notes:**

- `TWILIO_WHATSAPP_NUMBER` should include the `whatsapp:` prefix OR just the number (code handles both)
- Example formats that work:
  - `whatsapp:+14155238886`
  - `+14155238886`
  - `14155238886` (not recommended, but will work)

### 2. Twilio WhatsApp Sandbox Setup (For Testing)

If you're using Twilio's WhatsApp sandbox:

#### Step 1: Get Your Sandbox Number

1. Log in to Twilio Console
2. Go to **Messaging** > **Try it out** > **Send a WhatsApp message**
3. You'll see a WhatsApp number (usually `+1 415 523 8886`)
4. Copy this number and add to `.env`:
   ```
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

#### Step 2: Join the Sandbox

**Important:** For each phone number you want to send messages TO, they must join the sandbox first!

1. Send a WhatsApp message to your Twilio sandbox number (e.g., `+1 415 523 8886`)
2. Send the join code shown in Twilio console (usually something like `join <code>`)
3. Wait for confirmation that you've joined the sandbox
4. Now messages can be sent to that number

**Common Error:** If recipient hasn't joined sandbox, you'll get error: `The number +XXXXXXXXXX is not a valid WhatsApp-enabled number`

### 3. Phone Number Format

All phone numbers (both sender and recipient) must be in **E.164 format**:

✅ **Correct Formats:**

- `+919876543210` (India with country code)
- `+1234567890` (US with country code)
- `+441234567890` (UK with country code)

❌ **Wrong Formats:**

- `9876543210` (missing country code)
- `919876543210` (missing +)
- `09876543210` (has leading 0)

### 4. Check Server Logs

When you try to send a WhatsApp message, check your server console logs. You should see:

```
📱 Attempting to send WhatsApp message:
   From: whatsapp:+14155238886
   To: whatsapp:+919876543210
   Message length: 245 characters
```

If successful:

```
✅ WhatsApp message sent successfully! Message SID: SMxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

If there's an error:

```
❌ WhatsApp sending error: [error details]
   Error code: 21211
   Error message: The 'To' number is not a valid WhatsApp-enabled number
```

### 5. Common Twilio Error Codes

| Error Code | Meaning                 | Solution                                                |
| ---------- | ----------------------- | ------------------------------------------------------- |
| `21211`    | Invalid 'To' number     | Check phone number format, ensure it's WhatsApp-enabled |
| `21212`    | Invalid 'From' number   | Check TWILIO_WHATSAPP_NUMBER in .env                    |
| `21608`    | Unsubscribed recipient  | Recipient needs to join sandbox (for testing)           |
| `21408`    | Permission denied       | Check Twilio account permissions                        |
| `30003`    | Unreachable destination | Phone number might be invalid or not reachable          |
| `21610`    | Unsubscribed recipient  | Recipient hasn't joined the WhatsApp sandbox            |

### 6. Verify Twilio Credentials

Test your credentials are correct:

1. Check Twilio Console Dashboard
2. Verify Account SID and Auth Token match your `.env` file
3. Make sure your Twilio account is active (not suspended)

### 7. Check Phone Number in Database

Make sure the phone numbers stored in your database are in the correct format:

- **Customer phone**: Check `booking.primaryGuestInfo.phone`
- **Agency phone**: Check `agency.contactPhone`
- **Driver phone**: Check `driver.phone`
- **Admin phone**: Check `ADMIN_PHONE` in `.env`

All should be in E.164 format (starting with +).

### 8. Test WhatsApp Sending

You can test if WhatsApp is working by checking the server logs when a booking is made. Look for:

```
📱 Attempting to send WhatsApp message:
✅ WhatsApp message sent successfully!
```

Or error messages like:

```
❌ WhatsApp sending error: ...
```

### 9. Production vs Sandbox

**Sandbox (Testing):**

- Limited to numbers that have joined the sandbox
- Free for testing
- Limited functionality

**Production:**

- Requires WhatsApp Business API approval from Twilio
- Can send to any WhatsApp number
- Has costs per message
- More setup required

### 10. Debug Steps

1. **Check .env file:**

   ```bash
   # In backend directory
   cat .env | grep TWILIO
   ```

2. **Restart server** after changing .env:

   ```bash
   # Stop and restart your Node.js server
   ```

3. **Check Twilio Console:**

   - Go to Twilio Console > Monitor > Logs > Messages
   - See if messages are being attempted
   - Check error messages there

4. **Test with a simple message:**
   - Try sending a test booking
   - Check server logs for detailed error messages
   - Check Twilio console for message status

### 11. Enable Detailed Logging

The code now includes detailed logging. When a message is sent, you'll see:

- From number
- To number
- Message length
- Success or error details

If you see `⚠️ WhatsApp number not configured`, check your `.env` file.

### 12. Quick Checklist

- [ ] `TWILIO_ACCOUNT_SID` is set in `.env`
- [ ] `TWILIO_AUTH_TOKEN` is set in `.env`
- [ ] `TWILIO_WHATSAPP_NUMBER` is set in `.env` (with or without `whatsapp:` prefix)
- [ ] Phone numbers in database are in E.164 format (+countrycode+number)
- [ ] If using sandbox, recipient has joined the sandbox
- [ ] Server has been restarted after .env changes
- [ ] Check server logs for detailed error messages
- [ ] Check Twilio Console for message status

### 13. Still Not Working?

If messages still aren't sending:

1. **Check server logs** - detailed errors are now logged
2. **Check Twilio Console** - messages and errors appear there
3. **Verify phone format** - ensure all numbers are in E.164 format
4. **Test sandbox** - if using sandbox, ensure recipient joined
5. **Contact Twilio Support** - if production account, check with Twilio

## Example .env Configuration

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_32_character_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# Frontend URL (for agency portal links)
FRONTEND_URL=http://localhost:3000

# Admin Phone (optional)
ADMIN_PHONE=+919876543210
```

## Need More Help?

- Check Twilio Documentation: https://www.twilio.com/docs/whatsapp
- Twilio Support: https://support.twilio.com
- Check server logs for specific error messages
