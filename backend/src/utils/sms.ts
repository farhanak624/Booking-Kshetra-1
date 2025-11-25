import twilio from 'twilio';

export class SMSService {
  private client: twilio.Twilio;
  private twilioPhoneNumber: string;
  private whatsappNumber: string;

  constructor() {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN ||
      process.env.TWILIO_ACCOUNT_SID === 'your-twilio-account-sid') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Twilio credentials are not configured');
      }
      console.warn('⚠️ Twilio credentials not configured - using development mode');
    }

    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID || 'placeholder_account_sid',
      process.env.TWILIO_AUTH_TOKEN || 'placeholder_auth_token'
    );

    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '';
    this.whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || '';
    
    // Log WhatsApp configuration status
    if (this.whatsappNumber) {
      console.log(`✅ WhatsApp configured: ${this.whatsappNumber}`);
    } else {
      console.warn('⚠️ TWILIO_WHATSAPP_NUMBER not set in .env - WhatsApp messages will not be sent');
    }
  }

  async sendSMS(
    to: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.twilioPhoneNumber,
        to: to
      });

      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('SMS sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async sendWhatsApp(
    to: string,
    message: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check if WhatsApp is configured
      if (!this.whatsappNumber || this.whatsappNumber === '') {
        console.warn('⚠️ WhatsApp number not configured - skipping WhatsApp message');
        return {
          success: false,
          error: 'WhatsApp number not configured. Please set TWILIO_WHATSAPP_NUMBER in .env'
        };
      }

      // Ensure phone number is in E.164 format (starts with +)
      let cleanedTo = to.trim();
      if (!cleanedTo.startsWith('+') && !cleanedTo.startsWith('whatsapp:')) {
        console.warn(`⚠️ Phone number "${cleanedTo}" might not be in E.164 format (should start with +)`);
      }

      // Format phone number for WhatsApp (add whatsapp: prefix if not present)
      const formattedTo = cleanedTo.startsWith('whatsapp:') ? cleanedTo : `whatsapp:${cleanedTo}`;
      
      // Ensure from number has whatsapp: prefix
      const formattedFrom = this.whatsappNumber.startsWith('whatsapp:') 
        ? this.whatsappNumber 
        : `whatsapp:${this.whatsappNumber}`;

      console.log(`📱 Attempting to send WhatsApp message:`);
      console.log(`   From: ${formattedFrom}`);
      console.log(`   To: ${formattedTo}`);
      console.log(`   Message length: ${message.length} characters`);

      const result = await this.client.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo
      });

      console.log(`✅ WhatsApp message sent successfully! Message SID: ${result.sid}`);
      return {
        success: true,
        messageId: result.sid
      };
    } catch (error: any) {
      console.error('❌ WhatsApp sending error:', error);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Error message: ${error.message}`);
      console.error(`   More info: ${error.moreInfo || 'N/A'}`);
      
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }

  generateBookingConfirmationMessage(booking: any, user: any): string {
    // Check if this is a yoga booking
    if (booking.bookingType === 'yoga' || booking.yogaSessionId || booking.primaryService === 'Yoga Session') {
      return this.generateYogaBookingConfirmationMessage(booking, user);
    }

    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');

    return `🏨 *Kshetra Retreat Resort - Booking Confirmed!*

Dear ${user.name || 'Guest'},

Your booking is confirmed!

📅 *Check-in:* ${checkInDate}
📅 *Check-out:* ${checkOutDate}
🏠 *Room:* ${booking.roomId?.roomNumber || 'TBD'} (${booking.roomId?.roomType || 'Standard'})
👥 *Guests:* ${booking.totalGuests} (${booking.adults} Adults, ${booking.children} Children)
💰 *Total:* ₹${booking.totalAmount || booking.finalAmount}
🆔 *Booking ID:* ${booking._id}

${booking.transport && (booking.transport.pickup || booking.transport.drop) ?
        `🚗 *Transport:* ${booking.transport.pickup ? 'Pickup ✓' : ''} ${booking.transport.drop ? 'Drop ✓' : ''}` : ''}

We look forward to welcoming you!

📞 Contact: +91-XXXXXXXXXX
📧 Email: info@kshetraretreat.com`;
  }

  generateBookingCancellationMessage(booking: any, user: any): string {
    return `❌ Kshetra Retreat Resort - Booking Cancelled

Dear ${user.name},

Your booking ${booking._id} has been cancelled.

Room: ${booking.roomId.roomNumber}
Dates: ${new Date(booking.checkIn).toLocaleDateString('en-IN')} - ${new Date(booking.checkOut).toLocaleDateString('en-IN')}

Refund will be processed within 5-7 business days.

Thank you for choosing us. We hope to serve you in the future!`;
  }

  async sendBookingConfirmation(
    phoneNumber: string,
    booking: any,
    user: any,
    useWhatsApp: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    const message = this.generateBookingConfirmationMessage(booking, user);

    if (useWhatsApp) {
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      return this.sendSMS(phoneNumber, message);
    }
  }

  async sendBookingCancellation(
    phoneNumber: string,
    booking: any,
    user: any,
    useWhatsApp: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    const message = this.generateBookingCancellationMessage(booking, user);

    if (useWhatsApp) {
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      return this.sendSMS(phoneNumber, message);
    }
  }

  async sendCustomMessage(
    phoneNumber: string,
    message: string,
    useWhatsApp: boolean = true
  ): Promise<{ success: boolean; error?: string }> {
    if (useWhatsApp) {
      return this.sendWhatsApp(phoneNumber, message);
    } else {
      return this.sendSMS(phoneNumber, message);
    }
  }

  // Generate payment confirmation WhatsApp message
  generatePaymentConfirmationMessage(booking: any, paymentDetails: any, guestInfo: any): string {
    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');

    return `✅ *Payment Confirmed - Kshetra Retreat Resort*

Dear ${guestInfo.name || 'Guest'},

Your payment has been successfully processed!

💰 *Amount Paid:* ₹${paymentDetails.amount}
🆔 *Booking ID:* ${booking._id}
🔢 *Transaction ID:* ${paymentDetails.transactionId || paymentDetails.id}

📅 *Booking Details:*
• Check-in: ${checkInDate}
• Check-out: ${checkOutDate}
• Room: ${booking.roomId?.roomNumber || 'TBD'} (${booking.roomId?.roomType || 'Standard'})
• Guests: ${booking.totalGuests}

*What's Next?*
• You will receive a detailed booking confirmation shortly
• Our team will contact you 24 hours before your arrival
• Keep this payment confirmation for your records

Thank you for choosing Kshetra Retreat Resort!

📞 Contact: +91-XXXXXXXXXX
📧 Email: info@kshetraretreat.com`;
  }

  // Generate agency booking notification WhatsApp message
  generateAgencyBookingNotificationMessage(booking: any, agency: any): string {
    const customerName = booking.primaryGuestInfo?.name || booking.guests[0]?.name || 'Guest';
    const customerPhone = booking.primaryGuestInfo?.phone || booking.guests[0]?.phone || 'N/A';
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const agencyPortalUrl = `${frontendUrl}/agency/login`;

    const transportDetails = booking.transport ? `
🚗 *Transport Requirements:*
${booking.transport.pickup ? '• ✅ Airport Pickup Required' : ''}
${booking.transport.drop ? '• ✅ Airport Drop Required' : ''}
${booking.transport.flightNumber ? `• Flight: ${booking.transport.flightNumber}` : ''}
${booking.transport.flightArrivalTime ? `• Arrival: ${new Date(booking.transport.flightArrivalTime).toLocaleString('en-IN')}` : ''}
${booking.transport.flightDepartureTime ? `• Departure: ${new Date(booking.transport.flightDepartureTime).toLocaleString('en-IN')}` : ''}
${booking.transport.pickupTerminal ? `• Pickup Terminal: ${booking.transport.pickupTerminal}` : ''}
${booking.transport.dropTerminal ? `• Drop Terminal: ${booking.transport.dropTerminal}` : ''}
` : '';

    return `🚨 *NEW TRANSPORT BOOKING ASSIGNMENT*

Dear ${agency.name},

*Urgent:* A new booking with transport services requires immediate vehicle and driver assignment.

📋 *Booking Information:*
• Booking ID: ${booking._id}
• Check-in: ${new Date(booking.checkIn).toLocaleDateString('en-IN')}
• Check-out: ${new Date(booking.checkOut).toLocaleDateString('en-IN')}
• Total Guests: ${booking.totalGuests}
• Status: ${booking.status}

👤 *Customer Information:*
• Name: ${customerName}
• Phone: ${customerPhone}
${booking.primaryGuestInfo?.email ? `• Email: ${booking.primaryGuestInfo.email}` : ''}

${transportDetails}

*Next Steps:*
1️⃣ Login to your agency portal
2️⃣ Assign an available vehicle and driver
3️⃣ Confirm pickup/drop times
4️⃣ Customer will be automatically notified

🔗 *Agency Portal:* ${agencyPortalUrl}

Please log in to assign vehicle and driver for this booking.

Best regards,
Kshetra Retreat Resort Management`;
  }

  // Generate driver assignment notification for customer
  generateDriverAssignmentMessage(booking: any, driver: any, vehicle: any, assignment: any): string {
    const customerName = booking.primaryGuestInfo?.name || booking.guests[0]?.name || 'Guest';

    return `🚗 *Transport Assigned - Kshetra Retreat Resort*

Dear ${customerName},

Great news! We have assigned a professional driver and vehicle for your transport.

👨‍✈️ *Your Driver:*
• Name: ${driver.name}
• Phone: ${driver.phone}
• Experience: ${driver.experience} years
• Languages: ${driver.languages.join(', ')}
${driver.email ? `• Email: ${driver.email}` : ''}

🚙 *Your Vehicle:*
• ${vehicle.brand} ${vehicle.vehicleModel}
• Vehicle Number: *${vehicle.vehicleNumber}*
• Type: ${vehicle.vehicleType}
• Capacity: ${vehicle.capacity} passengers
${vehicle.color ? `• Color: ${vehicle.color}` : ''}

${assignment.pickupTime ? `📅 *Pickup Time:* ${new Date(assignment.pickupTime).toLocaleString('en-IN')}` : ''}
${assignment.dropTime ? `📅 *Drop Time:* ${new Date(assignment.dropTime).toLocaleString('en-IN')}` : ''}
${booking.transport?.pickupTerminal ? `📍 Pickup Terminal: ${booking.transport.pickupTerminal}` : ''}
${booking.transport?.dropTerminal ? `📍 Drop Terminal: ${booking.transport.dropTerminal}` : ''}
${booking.transport?.flightNumber ? `✈️ Flight: ${booking.transport.flightNumber}` : ''}

📱 *Important Notes:*
• Your driver will contact you 30 minutes before pickup
• Please keep your phone accessible
• Verify the vehicle number plate before boarding
• For any issues, contact resort immediately

${assignment.notes ? `\n📝 *Special Instructions:*\n${assignment.notes}\n` : ''}

Safe travels! 🎉

📞 Resort Contact: +91-XXXXXXXXXX
📧 Email: info@kshetraretreat.com`;
  }

  // Generate driver assignment notification for driver
  generateDriverAssignmentMessageForDriver(booking: any, driver: any, vehicle: any, assignment: any): string {
    const customerName = booking.primaryGuestInfo?.name || booking.guests[0]?.name || 'Guest';
    const customerPhone = booking.primaryGuestInfo?.phone || booking.guests[0]?.phone || 'N/A';
    const pickupLocation = booking.transport?.pickupTerminal || booking.transport?.pickupLocation || 'Airport/Terminal';
    const dropLocation = booking.transport?.dropTerminal || booking.transport?.dropLocation || 'Kshetra Retreat Resort';

    return `🚗 *NEW TRANSPORT ASSIGNMENT*

Dear ${driver.name},

You have been assigned a new transport booking. Please review the details below and prepare accordingly.

🆔 *Booking ID:* ${booking._id}

👤 *Customer Information:*
• Name: ${customerName}
• Phone: ${customerPhone}
${booking.primaryGuestInfo?.email ? `• Email: ${booking.primaryGuestInfo.email}` : ''}

🚙 *Vehicle Details:*
• Vehicle: ${vehicle.brand} ${vehicle.vehicleModel}
• Vehicle Number: *${vehicle.vehicleNumber}*
• Type: ${vehicle.vehicleType}
• Capacity: ${vehicle.capacity} passengers
${vehicle.color ? `• Color: ${vehicle.color}` : ''}

📅 *Schedule & Route:*
${assignment.pickupTime ? `• *Pickup Time:* ${new Date(assignment.pickupTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}` : ''}
${assignment.pickupTime ? `• Pickup Location: ${pickupLocation}` : ''}
${assignment.dropTime ? `• *Drop Time:* ${new Date(assignment.dropTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}` : ''}
${assignment.dropTime ? `• Drop Location: ${dropLocation}` : ''}
${booking.transport?.flightNumber ? `• Flight Number: ${booking.transport.flightNumber}` : ''}

⚠️ *Important Instructions:*
• Arrive at pickup location 15 minutes before scheduled time
• Confirm vehicle inspection and cleanliness
• Contact customer 30 minutes before pickup
• Display professional behavior and ensure customer safety
• Report any issues immediately to the agency

${assignment.notes ? `\n📝 *Special Instructions:*\n${assignment.notes}\n` : ''}

✅ *Pre-Trip Checklist:*
• Verify vehicle documents are valid
• Check fuel level and vehicle condition
• Ensure navigation system is working
• Confirm customer contact details
• Review route and estimated travel time
• Carry necessary identification

Safe travels and thank you for your service!

📞 Emergency Contact: ${driver.emergencyContact.name} - ${driver.emergencyContact.phone}`;
  }

  // Generate admin booking notification WhatsApp message
  generateAdminBookingNotificationMessage(booking: any, user?: any): string {
    const guestInfo = user || {
      name: booking.primaryGuestInfo?.name || 'Guest',
      email: booking.guestEmail || booking.primaryGuestInfo?.email,
      phone: booking.primaryGuestInfo?.phone
    };

    const transportInfo = booking.transport && (booking.transport.pickup || booking.transport.drop) ? `
🚗 *Transport Required:*
${booking.transport.pickup ? '• ✅ Airport Pickup Required' : ''}
${booking.transport.drop ? '• ✅ Airport Drop Required' : ''}
${booking.transport.flightNumber ? `• Flight: ${booking.transport.flightNumber}` : ''}
` : '';

    return `🏨 *NEW BOOKING ALERT*

⚡ *Action Required:* New booking received and requires your attention.

💰 *Total Amount:* ₹${booking.totalAmount}
🆔 *Booking ID:* ${booking._id}

👤 *Guest Information:*
• Name: ${guestInfo.name}
• Email: ${guestInfo.email || 'Not provided'}
• Phone: ${guestInfo.phone || 'Not provided'}

📋 *Booking Details:*
• Check-in: ${new Date(booking.checkIn).toLocaleDateString('en-IN')}
• Check-out: ${new Date(booking.checkOut).toLocaleDateString('en-IN')}
• Guests: ${booking.totalGuests} (${booking.adults} Adults, ${booking.children} Children)
• Room: ${booking.roomId?.roomNumber || 'TBD'} (${booking.roomId?.roomType || 'N/A'})
• Status: ${booking.status}
• Payment Status: ${booking.paymentStatus || 'Pending'}

${transportInfo}

*Quick Actions:*
1️⃣ Verify room availability
2️⃣ Confirm transport arrangements (if required)
3️⃣ Prepare welcome amenities
4️⃣ Update booking status in system

Please check the admin dashboard for more details.`;
  }

  // Generate yoga booking confirmation message
  generateYogaBookingConfirmationMessage(booking: any, user: any): string {
    const sessionDate = new Date(booking.checkIn).toLocaleDateString('en-IN');

    return `🧘‍♀️ *Yoga Booking Confirmed - Kshetra Retreat Resort*

Namaste ${user.name}! 🙏

Thank you for choosing Kshetra Retreat Resort for your yoga journey!

💰 *Total Paid:* ₹${booking.finalAmount || booking.totalAmount}
🆔 *Booking ID:* ${booking._id}

📅 *Session Details:*
• Date: ${sessionDate}
• Participants: ${booking.totalGuests} (${booking.adults} Adults, ${booking.children} Children)
• Status: *CONFIRMED*

🧘‍♀️ *Yoga Session Information:*
• Session Type: ${booking.primaryService || 'Yoga Session'}
• Instructor: ${booking.yogaSessionId?.instructor || 'Will be assigned'}
• Location: ${booking.yogaSessionId?.location || 'Kshetra Retreat Resort, Varkala'}

🎯 *Important Instructions:*
• Arrive 15 minutes before your session
• Bring comfortable yoga clothes and a water bottle
• We provide yoga mats, props, and refreshments
• Our team will contact you 24 hours before your session

We look forward to welcoming you for a rejuvenating yoga experience! 🧘‍♀️

📞 Resort Contact: +91-XXXXXXXXXX
📧 Email: info@kshetraretreat.com`;
  }

  // Send payment confirmation via WhatsApp
  async sendPaymentConfirmation(
    phoneNumber: string,
    booking: any,
    paymentDetails: any,
    guestInfo: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!phoneNumber) {
      return { success: false, error: 'Phone number not provided' };
    }

    try {
      const message = this.generatePaymentConfirmationMessage(booking, paymentDetails, guestInfo);
      return await this.sendWhatsApp(phoneNumber, message);
    } catch (error: any) {
      console.error('WhatsApp payment confirmation error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send agency booking notification via WhatsApp
  async sendAgencyBookingNotification(
    phoneNumber: string,
    booking: any,
    agency: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!phoneNumber) {
      return { success: false, error: 'Agency phone number not provided' };
    }

    try {
      const message = this.generateAgencyBookingNotificationMessage(booking, agency);
      return await this.sendWhatsApp(phoneNumber, message);
    } catch (error: any) {
      console.error('WhatsApp agency notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send driver assignment notification to customer via WhatsApp
  async sendDriverAssignmentNotification(
    phoneNumber: string,
    booking: any,
    driver: any,
    vehicle: any,
    assignment: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!phoneNumber) {
      return { success: false, error: 'Customer phone number not provided' };
    }

    try {
      const message = this.generateDriverAssignmentMessage(booking, driver, vehicle, assignment);
      return await this.sendWhatsApp(phoneNumber, message);
    } catch (error: any) {
      console.error('WhatsApp driver assignment notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send driver assignment notification to driver via WhatsApp
  async sendDriverAssignmentNotificationToDriver(
    phoneNumber: string,
    booking: any,
    driver: any,
    vehicle: any,
    assignment: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!phoneNumber) {
      return { success: false, error: 'Driver phone number not provided' };
    }

    try {
      const message = this.generateDriverAssignmentMessageForDriver(booking, driver, vehicle, assignment);
      return await this.sendWhatsApp(phoneNumber, message);
    } catch (error: any) {
      console.error('WhatsApp driver notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send admin booking notification via WhatsApp
  async sendAdminBookingNotification(
    phoneNumber: string,
    booking: any,
    user?: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!phoneNumber) {
      return { success: false, error: 'Admin phone number not provided' };
    }

    try {
      const message = this.generateAdminBookingNotificationMessage(booking, user);
      return await this.sendWhatsApp(phoneNumber, message);
    } catch (error: any) {
      console.error('WhatsApp admin notification error:', error);
      return { success: false, error: error.message };
    }
  }

  // Send yoga booking confirmation via WhatsApp
  async sendYogaBookingConfirmation(
    phoneNumber: string,
    booking: any,
    user: any
  ): Promise<{ success: boolean; error?: string }> {
    if (!phoneNumber) {
      return { success: false, error: 'Phone number not provided' };
    }

    try {
      const message = this.generateYogaBookingConfirmationMessage(booking, user);
      return await this.sendWhatsApp(phoneNumber, message);
    } catch (error: any) {
      console.error('WhatsApp yoga booking confirmation error:', error);
      return { success: false, error: error.message };
    }
  }
}

export const smsService = new SMSService();