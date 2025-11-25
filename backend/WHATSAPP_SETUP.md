# WhatsApp Notification Integration Setup

This document explains how to set up and configure WhatsApp notifications for the Booking Kshetra application.

## Overview

The application now sends WhatsApp notifications for:
- ✅ Booking confirmations (customers)
- ✅ Payment confirmations (customers)
- ✅ Driver assignment notifications (customers and drivers)
- ✅ Agency booking notifications (with portal URL)
- ✅ Admin booking alerts
- ✅ Yoga booking confirmations

## Prerequisites

1. **Twilio Account**: You need a Twilio account with WhatsApp messaging enabled
2. **Twilio WhatsApp Number**: A verified WhatsApp number from Twilio
3. **Environment Variables**: Configure the following in your `.env` file

## Required Environment Variables

Add these to your `backend/.env` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890  # Your Twilio phone number (for SMS)
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886  # Your Twilio WhatsApp number (format: whatsapp:+countrycode+number)

# Frontend URL (for agency portal links in notifications)
FRONTEND_URL=http://localhost:3000  # Change to your production URL

# Admin Phone Number (optional, for admin booking alerts)
ADMIN_PHONE=+1234567890  # Format: +countrycode+number (e.g., +919876543210)
```

## Twilio WhatsApp Setup

### Step 1: Create a Twilio Account
1. Go to [https://www.twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Verify your account

### Step 2: Get Your Credentials
1. Go to Twilio Console Dashboard
2. Copy your **Account SID** and **Auth Token**
3. Add them to your `.env` file

### Step 3: Set Up WhatsApp Sandbox (Testing)
1. Go to **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Follow the instructions to join the WhatsApp sandbox
3. Copy the WhatsApp number format (usually `whatsapp:+14155238886`)
4. Add it to `TWILIO_WHATSAPP_NUMBER` in your `.env`

### Step 4: Upgrade to Production (Optional)
For production, you need to:
1. Apply for WhatsApp Business API access via Twilio
2. Complete Twilio's verification process
3. Get a production WhatsApp number

## Phone Number Format

All phone numbers should be in E.164 format:
- ✅ Correct: `+919876543210` (India)
- ✅ Correct: `+1234567890` (US)
- ❌ Wrong: `9876543210` (missing country code)
- ❌ Wrong: `919876543210` (missing +)

For WhatsApp, the service automatically adds the `whatsapp:` prefix if not present.

## Notification Types

### 1. Customer Booking Confirmation
- **When**: After successful payment
- **Sent to**: Customer phone number
- **Contains**: Booking details, check-in/out dates, room info, booking ID

### 2. Payment Confirmation
- **When**: After successful payment verification
- **Sent to**: Customer phone number
- **Contains**: Payment amount, transaction ID, booking summary

### 3. Agency Booking Notification
- **When**: New transport booking requires assignment
- **Sent to**: Agency phone number
- **Contains**: Booking details, customer info, transport requirements, **Agency Portal URL**

### 4. Driver Assignment Notification (Customer)
- **When**: Agency assigns a driver and vehicle
- **Sent to**: Customer phone number
- **Contains**: Driver details, vehicle info, pickup/drop times, contact info

### 5. Driver Assignment Notification (Driver)
- **When**: Agency assigns a driver and vehicle
- **Sent to**: Driver phone number
- **Contains**: Customer info, vehicle details, schedule, special instructions

### 6. Admin Booking Alert
- **When**: New booking received
- **Sent to**: Admin phone number (if `ADMIN_PHONE` is configured)
- **Contains**: Booking summary, guest info, amount, transport requirements

## Agency Portal URL

The agency booking notification includes a direct link to the agency portal login page:
- Format: `{FRONTEND_URL}/agency/login`
- Example: `https://yourdomain.com/agency/login`
- Agencies can click the link to quickly access the portal and assign vehicles/drivers

## Testing

### Test in Development Mode
1. Configure your `.env` file with Twilio credentials
2. Make a test booking
3. Check Twilio console logs for message status
4. Verify WhatsApp messages are received

### Test with Sandbox
1. Join Twilio WhatsApp sandbox by sending the join code to the sandbox number
2. Use your sandbox-joined number for testing
3. Send test notifications

## Troubleshooting

### Messages Not Sending
1. **Check Twilio credentials**: Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` are correct
2. **Check WhatsApp number format**: Should be `whatsapp:+countrycode+number`
3. **Check phone number format**: Must be in E.164 format with country code
4. **Check Twilio console**: Look for error messages in Twilio dashboard

### Sandbox Limitations
- Sandbox only works with pre-approved numbers
- You must join the sandbox first
- Limited to testing purposes only

### Production Issues
1. Ensure WhatsApp Business API is approved
2. Verify your production WhatsApp number
3. Check Twilio usage limits
4. Review Twilio logs for API errors

## Error Handling

The system handles errors gracefully:
- If WhatsApp fails, the booking/payment still succeeds
- Errors are logged to console for debugging
- Email notifications continue to work even if WhatsApp fails

## Cost Considerations

- Twilio WhatsApp messages are charged per message
- Check Twilio pricing for current rates
- Monitor usage in Twilio console
- Consider rate limiting for high-volume scenarios

## Security Notes

1. **Never commit `.env` file** to version control
2. **Store credentials securely** in production
3. **Use environment variables** for all sensitive data
4. **Rotate credentials** periodically

## Support

For Twilio-related issues:
- Twilio Documentation: [https://www.twilio.com/docs](https://www.twilio.com/docs)
- Twilio Support: [https://support.twilio.com](https://support.twilio.com)

For application-specific issues:
- Check application logs
- Review error messages in console
- Verify phone number formats and environment variables

