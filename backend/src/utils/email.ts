import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions & { cc?: string; bcc?: string }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // Check if email configuration is available
      if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
        console.log('📧 Email not configured - would send email to:', options.to);
        console.log('   Subject:', options.subject);
        console.log('   Note: Configure EMAIL_USER and EMAIL_PASS in .env to enable email sending');

        return {
          success: true,
          messageId: 'dev-mode-' + Date.now()
        };
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${options.to} - Subject: ${options.subject}`);
      return {
        success: true,
        messageId: result.messageId
      };
    } catch (error: any) {
      console.error('Email sending error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  generateYogaBookingConfirmationEmail(booking: any, user: any): string {
    const sessionDate = new Date(booking.checkIn).toLocaleDateString('en-IN');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; }
          .container { max-width: 700px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .yoga-session { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .booking-details { background-color: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 5px solid #ff6b35; }
          .participants { background-color: #e3f2fd; padding: 15px; margin: 15px 0; border-radius: 8px; }
          .footer { background-color: #f8f9fa; padding: 25px; text-align: center; }
          .highlight { color: #ff6b35; font-weight: bold; }
          .amount { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; padding: 15px; background-color: #e8f5e9; border-radius: 8px; margin: 15px 0; }
          .important-info { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧘‍♀️ Yoga Booking Confirmed!</h1>
            <h2>Kshetra Retreat Resort</h2>
            <p>Your journey to wellness begins here</p>
          </div>

          <div class="content">
            <h3>Namaste ${user.name}! 🙏</h3>
            <p>Thank you for choosing Kshetra Retreat Resort for your yoga journey! Your yoga session booking has been confirmed.</p>

            <div class="amount">
              🎯 Total Paid: ₹${booking.finalAmount || booking.totalAmount}
            </div>

            <div class="booking-details">
              <h4>📋 Booking Information:</h4>
              <p><strong>Booking ID:</strong> <span class="highlight">${booking._id}</span></p>
              <p><strong>Session Date:</strong> ${sessionDate}</p>
              <p><strong>Participants:</strong> ${booking.totalGuests} (${booking.adults} Adults, ${booking.children} Children)</p>
              <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">CONFIRMED</span></p>
              ${booking.paymentId ? `<p><strong>Payment ID:</strong> ${booking.paymentId}</p>` : ''}
            </div>

            ${booking.guests && booking.guests.length > 0 ? `
            <div class="participants">
              <h4>👥 Participant Details:</h4>
              ${booking.guests.map((guest: any, index: number) => `
                <p><strong>${index + 1}. ${guest.name}</strong> (Age: ${guest.age}${guest.gender ? `, ${guest.gender}` : ''})</p>
              `).join('')}
            </div>
            ` : ''}

            <div class="yoga-session">
              <h3>🧘‍♀️ Your Yoga Session Details</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px;">
                  <strong>Session Type:</strong><br>
                  ${booking.primaryService || 'Yoga Session'}
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px;">
                  <strong>Date:</strong><br>
                  ${sessionDate}
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px;">
                  <strong>Instructor:</strong><br>
                  ${booking.yogaSessionId?.instructor || 'Will be assigned'}
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 5px;">
                  <strong>Location:</strong><br>
                  ${booking.yogaSessionId?.location || 'Kshetra Retreat Resort, Varkala'}
                </div>
              </div>
            </div>

            ${booking.specialRequests ? `
            <div class="booking-details">
              <h4>📝 Special Requests:</h4>
              <p>${booking.specialRequests}</p>
            </div>
            ` : ''}

            <div class="important-info">
              <h4>🎯 Important Instructions:</h4>
              <ul>
                <li><strong>Arrival:</strong> Please arrive 15 minutes before your session</li>
                <li><strong>What to Bring:</strong> Comfortable yoga clothes and a water bottle</li>
                <li><strong>What We Provide:</strong> Yoga mats, props, and refreshments</li>
                <li><strong>Contact:</strong> Our team will contact you 24 hours before your session</li>
                ${booking.yogaSessionId?.specialization ? `<li><strong>Specialization:</strong> ${booking.yogaSessionId.specialization}</li>` : ''}
              </ul>
            </div>

            <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="color: #28a745; margin-top: 0;">🌟 What to Expect:</h4>
              <p>Our experienced instructors will guide you through a transformative yoga experience in the serene atmosphere of Kshetra Retreat Resort. Whether you're a beginner or advanced practitioner, our sessions are designed to enhance your physical and mental well-being.</p>
            </div>

            <div class="booking-details">
              <h4>📞 Contact Information:</h4>
              <p><strong>Resort Phone:</strong> +91-XXXXXXXXXX</p>
              <p><strong>Email:</strong> info@kshetraretreat.com</p>
              <p><strong>Address:</strong> Kshetra Retreat Resort, Varkala, Kerala</p>
            </div>

            <p style="text-align: center; font-size: 16px; color: #28a745; font-weight: bold;">
              🙏 We look forward to welcoming you for a rejuvenating yoga experience! 🧘‍♀️
            </p>
          </div>

          <div class="footer">
            <p>🌟 <strong>Namaste!</strong> 🌟</p>
            <p>This is an automated confirmation email. Please save this for your records.</p>
            <p>&copy; 2025 Kshetra Retreat Resort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateBookingConfirmationEmail(booking: any, user: any): string {
    // Check if this is a yoga booking and use specialized template
    if (booking.bookingType === 'yoga' || booking.yogaSessionId || booking.primaryService === 'Yoga Session') {
      return this.generateYogaBookingConfirmationEmail(booking, user);
    }

    const checkInDate = new Date(booking.checkIn).toLocaleDateString('en-IN');
    const checkOutDate = new Date(booking.checkOut).toLocaleDateString('en-IN');
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5aa0; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .booking-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
          .highlight { color: #2c5aa0; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <h2>Kshetra Retreat Resort</h2>
          </div>
          
          <div class="content">
            <h3>Dear ${user.name},</h3>
            <p>Thank you for choosing Kshetra Retreat Resort! Your booking has been confirmed.</p>
            
            <div class="booking-details">
              <h4>Booking Details:</h4>
              <p><strong>Booking ID:</strong> <span class="highlight">${booking._id}</span></p>
              <p><strong>Room:</strong> ${booking.roomId.roomNumber} (${booking.roomId.roomType})</p>
              <p><strong>Check-in:</strong> ${checkInDate}</p>
              <p><strong>Check-out:</strong> ${checkOutDate}</p>
              <p><strong>Guests:</strong> ${booking.totalGuests} (${booking.adults} Adults, ${booking.children} Children)</p>
              <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
            </div>

            ${booking.transport && (booking.transport.pickup || booking.transport.drop) ? `
            <div class="booking-details">
              <h4>Transport Details:</h4>
              ${booking.transport.pickup ? `<p><strong>Airport Pickup:</strong> Yes</p>` : ''}
              ${booking.transport.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.transport.flightNumber}</p>` : ''}
              ${booking.transport.drop ? `<p><strong>Airport Drop:</strong> Yes</p>` : ''}
            </div>
            ` : ''}

            ${booking.selectedServices && booking.selectedServices.length > 0 ? `
            <div class="booking-details">
              <h4>Additional Services:</h4>
              ${booking.selectedServices.map((service: any) => `
                <p>• ${service.serviceId.name} (Qty: ${service.quantity}) - ₹${service.totalPrice}</p>
              `).join('')}
            </div>
            ` : ''}

            ${booking.yogaSessionId ? `
            <div class="booking-details">
              <h4>Yoga Session:</h4>
              <p><strong>Type:</strong> ${booking.yogaSessionId.type}</p>
              <p><strong>Batch:</strong> ${booking.yogaSessionId.batchName}</p>
              <p><strong>Start Date:</strong> ${new Date(booking.yogaSessionId.startDate).toLocaleDateString('en-IN')}</p>
            </div>
            ` : ''}

            <p>We look forward to welcoming you to our resort!</p>
            
            <p><strong>Contact Information:</strong><br>
            Phone: +91-XXXXXXXXXX<br>
            Email: info@kshetraretreat.com</p>
          </div>
          
          <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>&copy; 2025 Kshetra Retreat Resort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  generateBookingCancellationEmail(booking: any, user: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #d32f2f; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .booking-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancellation</h1>
            <h2>Kshetra Retreat Resort</h2>
          </div>
          
          <div class="content">
            <h3>Dear ${user.name},</h3>
            <p>Your booking has been cancelled as requested.</p>
            
            <div class="booking-details">
              <h4>Cancelled Booking Details:</h4>
              <p><strong>Booking ID:</strong> ${booking._id}</p>
              <p><strong>Room:</strong> ${booking.roomId.roomNumber} (${booking.roomId.roomType})</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('en-IN')}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('en-IN')}</p>
              <p><strong>Total Amount:</strong> ₹${booking.totalAmount}</p>
            </div>

            <p>If you made a payment, our team will process the refund within 5-7 business days.</p>
            <p>We hope to serve you in the future!</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2025 Kshetra Retreat Resort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendBookingConfirmation(booking: any, user?: any): Promise<{ success: boolean; error?: string }> {
    // Handle both user account and public bookings
    const guestInfo = user || {
      name: booking.primaryGuestInfo?.name || 'Guest',
      email: booking.guestEmail || booking.primaryGuestInfo?.email
    };

    if (!guestInfo.email) {
      return {
        success: false,
        error: 'No email address available for booking confirmation'
      };
    }

    const html = this.generateBookingConfirmationEmail(booking, guestInfo);

    // Send to customer with CC to admin
    return this.sendEmail({
      to: guestInfo.email,
      cc: process.env.ADMIN_EMAIL,
      subject: 'Booking Confirmation - Kshetra Retreat Resort',
      html,
      text: `Your booking ${booking._id} at Kshetra Retreat Resort has been confirmed.`
    });
  }

  async sendBookingCancellation(booking: any, user: any): Promise<{ success: boolean; error?: string }> {
    const html = this.generateBookingCancellationEmail(booking, user);

    return this.sendEmail({
      to: user.email,
      cc: process.env.ADMIN_EMAIL,
      subject: 'Booking Cancellation - Kshetra Retreat Resort',
      html,
      text: `Your booking ${booking._id} at Kshetra Retreat Resort has been cancelled.`
    });
  }

  async sendAgencyBookingNotification(booking: any, agency: any): Promise<{ success: boolean; error?: string }> {
    const html = this.generateAgencyBookingNotificationEmail(booking, agency);

    return this.sendEmail({
      to: agency.email,
      subject: 'New Transport Booking Assignment - Kshetra Retreat Resort',
      html,
      text: `New transport booking ${booking._id} requires vehicle and driver assignment.`
    });
  }

  private generateAgencyBookingNotificationEmail(booking: any, agency: any): string {
    // Get customer information
    const customerName = booking.primaryGuestInfo?.name || booking.guests[0]?.name || 'Guest';
    const customerEmail = booking.guestEmail || booking.userId?.email || booking.primaryGuestInfo?.email;
    const customerPhone = booking.primaryGuestInfo?.phone || booking.guests[0]?.phone;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c5530; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .booking-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
          .footer { background-color: #eee; padding: 15px; text-align: center; font-size: 12px; }
          .urgent { background-color: #ffebcc; border-left: 4px solid #ff9800; padding: 10px; margin: 15px 0; }
          .transport-info { background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Transport Booking Assignment</h1>
            <p>Kshetra Retreat Resort</p>
          </div>

          <div class="content">
            <p>Dear ${agency.name},</p>

            <div class="urgent">
              <h3>🚨 Urgent: New Transport Booking Requires Assignment</h3>
              <p>A new booking with transport services has been created and requires immediate vehicle and driver assignment.</p>
            </div>

            <div class="booking-details">
              <h3>Booking Information</h3>
              <p><strong>Booking ID:</strong> ${booking._id}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('en-IN')}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('en-IN')}</p>
              <p><strong>Total Guests:</strong> ${booking.totalGuests}</p>
              <p><strong>Status:</strong> ${booking.status}</p>
            </div>

            <div class="booking-details">
              <h3>Customer Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
              ${customerPhone ? `<p><strong>Phone:</strong> ${customerPhone}</p>` : ''}
              ${booking.primaryGuestInfo?.address ? `<p><strong>Address:</strong> ${booking.primaryGuestInfo.address}</p>` : ''}
            </div>

            ${booking.transport ? `
            <div class="transport-info">
              <h3>🚗 Transport Requirements</h3>
              ${booking.transport.pickup ? `<p><strong>✅ Airport Pickup Required</strong></p>` : ''}
              ${booking.transport.drop ? `<p><strong>✅ Airport Drop Required</strong></p>` : ''}
              ${booking.transport.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.transport.flightNumber}</p>` : ''}
              ${booking.transport.pickupTerminal ? `<p><strong>Pickup Terminal:</strong> ${booking.transport.pickupTerminal}</p>` : ''}
              ${booking.transport.dropTerminal ? `<p><strong>Drop Terminal:</strong> ${booking.transport.dropTerminal}</p>` : ''}
              ${booking.transport.airportFrom ? `<p><strong>Airport From:</strong> ${booking.transport.airportFrom}</p>` : ''}
              ${booking.transport.airportTo ? `<p><strong>Airport To:</strong> ${booking.transport.airportTo}</p>` : ''}
              ${booking.transport.flightArrivalTime ? `<p><strong>Flight Arrival:</strong> ${new Date(booking.transport.flightArrivalTime).toLocaleString('en-IN')}</p>` : ''}
              ${booking.transport.flightDepartureTime ? `<p><strong>Flight Departure:</strong> ${new Date(booking.transport.flightDepartureTime).toLocaleString('en-IN')}</p>` : ''}
              ${booking.transport.specialInstructions ? `<p><strong>Special Instructions:</strong> ${booking.transport.specialInstructions}</p>` : ''}
            </div>
            ` : ''}

            ${booking.specialRequests ? `
            <div class="booking-details">
              <h3>Special Requests</h3>
              <p>${booking.specialRequests}</p>
            </div>
            ` : ''}

            <div class="urgent">
              <h3>Next Steps</h3>
              <p>1. Login to your agency dashboard</p>
              <p>2. Assign an available vehicle and driver</p>
              <p>3. Confirm pickup/drop times</p>
              <p>4. Customer will be automatically notified</p>
            </div>

            <p><strong>Login to your agency portal to assign vehicle and driver for this booking.</strong></p>

            <p>Best regards,<br>Kshetra Retreat Resort Management</p>
          </div>

          <div class="footer">
            <p>This is an automated notification. Please do not reply to this email.</p>
            <p>&copy; 2025 Kshetra Retreat Resort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Enhanced driver assignment notification with photos and details
  async sendDriverAssignmentNotification(booking: any, driver: any, vehicle: any, assignment: any): Promise<{ success: boolean; error?: string }> {
    const customerEmail = booking.guestEmail || (booking.userId as any)?.email || booking.primaryGuestInfo?.email;

    if (!customerEmail) {
      return {
        success: false,
        error: 'No customer email available for driver assignment notification'
      };
    }

    const html = this.generateDriverAssignmentEmail(booking, driver, vehicle, assignment);

    // Send to customer with CC to admin
    return this.sendEmail({
      to: customerEmail,
      cc: process.env.ADMIN_EMAIL,
      subject: 'Driver & Vehicle Assigned - Transport Details',
      html,
      text: `Your transport has been assigned. Driver: ${driver.name}, Vehicle: ${vehicle.brand} ${vehicle.vehicleModel}`
    });
  }

  // Send assignment notification to driver
  async sendDriverAssignmentNotificationToDriver(booking: any, driver: any, vehicle: any, assignment: any): Promise<{ success: boolean; error?: string }> {
    if (!driver.email) {
      return {
        success: false,
        error: 'No driver email available for notification'
      };
    }

    const html = this.generateDriverAssignmentEmailForDriver(booking, driver, vehicle, assignment);

    return this.sendEmail({
      to: driver.email,
      cc: process.env.ADMIN_EMAIL,
      subject: '🚗 New Transport Assignment - Kshetra Retreat Resort',
      html,
      text: `You have been assigned a new transport booking. Booking ID: ${booking._id}, Vehicle: ${vehicle.brand} ${vehicle.vehicleModel}`
    });
  }

  // Generate enhanced driver assignment email template
  private generateDriverAssignmentEmail(booking: any, driver: any, vehicle: any, assignment: any): string {
    const customerName = booking.primaryGuestInfo?.name || booking.guests[0]?.name || 'Guest';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
          .container { max-width: 700px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #2c5530, #4a7c59); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .driver-card, .vehicle-card { background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 5px solid #2c5530; }
          .profile-section { display: flex; align-items: center; margin-bottom: 20px; }
          .profile-photo { width: 80px; height: 80px; border-radius: 50%; margin-right: 20px; object-fit: cover; border: 3px solid #2c5530; }
          .contact-info { background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .schedule-info { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .emergency-info { background-color: #f8d7da; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { background-color: #2c5530; color: white; padding: 20px; text-align: center; }
          .highlight { color: #2c5530; font-weight: bold; }
          .vehicle-image { width: 200px; height: 150px; object-fit: cover; border-radius: 8px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 Transport Assigned!</h1>
            <p>Your driver and vehicle details for Kshetra Retreat Resort</p>
          </div>

          <div class="content">
            <h2>Dear ${customerName},</h2>
            <p>Great news! We have assigned a professional driver and vehicle for your transport to/from Kshetra Retreat Resort.</p>

            <div class="driver-card">
              <h3>👨‍✈️ Your Driver</h3>
              <div class="profile-section">
                ${driver.profilePhoto ? `<img src="${driver.profilePhoto}" alt="Driver Photo" class="profile-photo">` : '<div style="width: 80px; height: 80px; background-color: #ccc; border-radius: 50%; margin-right: 20px; display: flex; align-items: center; justify-content: center; font-size: 24px;">👤</div>'}
                <div>
                  <h4 style="margin: 0; color: #2c5530;">${driver.name}</h4>
                  <p style="margin: 5px 0; color: #666;">Professional Driver</p>
                  <p style="margin: 5px 0;"><strong>Experience:</strong> ${driver.experience} years</p>
                  <p style="margin: 5px 0;"><strong>Languages:</strong> ${driver.languages.join(', ')}</p>
                </div>
              </div>

              <div class="contact-info">
                <h4>📞 Contact Information</h4>
                <p><strong>Phone:</strong> <a href="tel:${driver.phone}" style="color: #2c5530;">${driver.phone}</a></p>
                ${driver.email ? `<p><strong>Email:</strong> <a href="mailto:${driver.email}" style="color: #2c5530;">${driver.email}</a></p>` : ''}
              </div>

              <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0;">
                <h4>🆔 License Information</h4>
                <p><strong>License Number:</strong> ${driver.licenseNumber}</p>
                <p><strong>License Type:</strong> ${driver.licenseType.replace('_', ' ').toUpperCase()}</p>
                <p><strong>Valid Until:</strong> ${new Date(driver.licenseExpiryDate).toLocaleDateString('en-IN')}</p>
                ${driver.licenseImage ? `
                  <p><strong>License Copy:</strong></p>
                  <img src="${driver.licenseImage}" alt="Driver License" style="max-width: 300px; border-radius: 8px; margin: 10px 0;">
                ` : ''}
              </div>
            </div>

            <div class="vehicle-card">
              <h3>🚙 Your Vehicle</h3>
              <div style="display: flex; align-items: flex-start; gap: 20px;">
                <div style="flex: 1;">
                  <h4 style="color: #2c5530; margin: 0;">${vehicle.brand} ${vehicle.vehicleModel}</h4>
                  <p style="font-size: 18px; font-weight: bold; color: #2c5530; margin: 5px 0;">${vehicle.vehicleNumber}</p>
                  <p><strong>Type:</strong> ${vehicle.vehicleType}</p>
                  <p><strong>Capacity:</strong> ${vehicle.capacity} passengers</p>
                  <p><strong>Year:</strong> ${vehicle.year || 'N/A'}</p>
                  <p><strong>Color:</strong> ${vehicle.color || 'N/A'}</p>
                </div>
                ${vehicle.images && vehicle.images.length > 0 ? `
                  <div>
                    <img src="${vehicle.images[0]}" alt="Vehicle Photo" class="vehicle-image">
                  </div>
                ` : ''}
              </div>
            </div>

            ${assignment.pickupTime || assignment.dropTime ? `
            <div class="schedule-info">
              <h3>📅 Schedule Information</h3>
              ${assignment.pickupTime ? `<p><strong>Pickup Time:</strong> ${new Date(assignment.pickupTime).toLocaleString('en-IN')}</p>` : ''}
              ${assignment.dropTime ? `<p><strong>Drop Time:</strong> ${new Date(assignment.dropTime).toLocaleString('en-IN')}</p>` : ''}
              ${booking.transport?.pickupTerminal ? `<p><strong>Pickup Terminal:</strong> ${booking.transport.pickupTerminal}</p>` : ''}
              ${booking.transport?.dropTerminal ? `<p><strong>Drop Terminal:</strong> ${booking.transport.dropTerminal}</p>` : ''}
              ${booking.transport?.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.transport.flightNumber}</p>` : ''}
            </div>
            ` : ''}

            ${assignment.notes ? `
            <div style="background-color: #f0f8ff; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <h4>📝 Special Instructions</h4>
              <p>${assignment.notes}</p>
            </div>
            ` : ''}

            <div class="emergency-info">
              <h4>🚨 Emergency Contact</h4>
              <p><strong>Driver's Emergency Contact:</strong></p>
              <p>${driver.emergencyContact.name} (${driver.emergencyContact.relationship})</p>
              <p>Phone: <a href="tel:${driver.emergencyContact.phone}" style="color: #2c5530;">${driver.emergencyContact.phone}</a></p>
            </div>

            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
              <h4 style="color: #155724; margin-top: 0;">📱 Important Notes:</h4>
              <ul style="color: #155724; margin: 0;">
                <li>Your driver will contact you 30 minutes before pickup</li>
                <li>Please keep your phone accessible</li>
                <li>Verify the vehicle number plate before boarding</li>
                <li>For any issues, contact resort immediately</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <h3>Kshetra Retreat Resort</h3>
            <p>📞 Resort Contact: +91-XXXXXXXXXX</p>
            <p>📧 Email: info@kshetraretreat.com</p>
            <p style="margin-top: 20px; font-size: 12px;">This is an automated notification. Safe travels!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Generate driver assignment email template for driver
  private generateDriverAssignmentEmailForDriver(booking: any, driver: any, vehicle: any, assignment: any): string {
    const customerName = booking.primaryGuestInfo?.name || booking.guests[0]?.name || 'Guest';
    const customerPhone = booking.primaryGuestInfo?.phone || booking.guests[0]?.phone || 'N/A';
    const customerEmail = booking.guestEmail || (booking.userId as any)?.email || booking.primaryGuestInfo?.email || 'N/A';
    const pickupLocation = booking.transport?.pickupTerminal || booking.transport?.pickupLocation || 'Airport/Terminal';
    const dropLocation = booking.transport?.dropTerminal || booking.transport?.dropLocation || 'Kshetra Retreat Resort';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; }
          .container { max-width: 700px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #B23092, #d446a8); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-card { background-color: #f8f9fa; border-radius: 10px; padding: 20px; margin: 20px 0; border-left: 5px solid #B23092; }
          .highlight-box { background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid #ffc107; }
          .schedule-box { background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .customer-box { background-color: #e8f5e8; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .footer { background-color: #B23092; color: white; padding: 20px; text-align: center; }
          .highlight { color: #B23092; font-weight: bold; }
          .button { display: inline-block; padding: 12px 24px; background-color: #B23092; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚗 NEW TRANSPORT ASSIGNMENT</h1>
            <p>You have been assigned a new booking</p>
            <p style="font-size: 14px; margin: 5px 0;">Booking ID: ${booking._id}</p>
          </div>

          <div class="content">
            <h2>Dear ${driver.name},</h2>
            <p>You have been assigned a new transport booking. Please review the details below and prepare accordingly.</p>

            <div class="highlight-box">
              <h3 style="margin-top: 0; color: #856404;">⚠️ Important Instructions</h3>
              <ul style="margin: 0; padding-left: 20px;">
                <li>Arrive at the pickup location 15 minutes before scheduled time</li>
                <li>Confirm vehicle inspection and cleanliness</li>
                <li>Contact the customer 30 minutes before pickup</li>
                <li>Display professional behavior and ensure customer safety</li>
                <li>Report any issues immediately to the agency</li>
              </ul>
            </div>

            <div class="customer-box">
              <h3>👤 Customer Information</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Phone:</strong> <a href="tel:${customerPhone}" style="color: #B23092;">${customerPhone}</a></p>
              ${customerEmail !== 'N/A' ? `<p><strong>Email:</strong> <a href="mailto:${customerEmail}" style="color: #B23092;">${customerEmail}</a></p>` : ''}
            </div>

            <div class="info-card">
              <h3>🚙 Vehicle Details</h3>
              <p><strong>Vehicle:</strong> ${vehicle.brand} ${vehicle.vehicleModel}</p>
              <p><strong>Vehicle Number:</strong> <span class="highlight">${vehicle.vehicleNumber}</span></p>
              <p><strong>Type:</strong> ${vehicle.vehicleType}</p>
              <p><strong>Capacity:</strong> ${vehicle.capacity} passengers</p>
              ${vehicle.color ? `<p><strong>Color:</strong> ${vehicle.color}</p>` : ''}
              ${vehicle.images && vehicle.images.length > 0 ? `
                <p><strong>Vehicle Photo:</strong></p>
                <img src="${vehicle.images[0]}" alt="Vehicle" style="max-width: 300px; border-radius: 8px; margin: 10px 0;">
              ` : ''}
            </div>

            <div class="schedule-box">
              <h3>📅 Schedule & Route</h3>
              ${assignment.pickupTime ? `
                <p><strong>Pickup Time:</strong> <span class="highlight">${new Date(assignment.pickupTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span></p>
                <p><strong>Pickup Location:</strong> ${pickupLocation}</p>
              ` : ''}
              ${assignment.dropTime ? `
                <p><strong>Drop Time:</strong> <span class="highlight">${new Date(assignment.dropTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</span></p>
                <p><strong>Drop Location:</strong> ${dropLocation}</p>
              ` : ''}
              ${booking.transport?.flightNumber ? `<p><strong>Flight Number:</strong> ${booking.transport.flightNumber}</p>` : ''}
              ${booking.transport?.pickupDate ? `<p><strong>Pickup Date:</strong> ${new Date(booking.transport.pickupDate).toLocaleDateString('en-IN')}</p>` : ''}
              ${booking.transport?.dropDate ? `<p><strong>Drop Date:</strong> ${new Date(booking.transport.dropDate).toLocaleDateString('en-IN')}</p>` : ''}
            </div>

            ${assignment.notes ? `
            <div class="info-card">
              <h3>📝 Special Instructions</h3>
              <p>${assignment.notes}</p>
            </div>
            ` : ''}

            <div class="info-card">
              <h3>📞 Contact & Support</h3>
              <p><strong>Agency Contact:</strong> Please contact your agency for any queries or support.</p>
              <p><strong>Emergency Contact:</strong> Your emergency contact (${driver.emergencyContact.name}) can be reached at ${driver.emergencyContact.phone}</p>
            </div>

            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
              <h4 style="color: #155724; margin-top: 0;">✅ Pre-Trip Checklist:</h4>
              <ul style="color: #155724; margin: 0; padding-left: 20px;">
                <li>Verify vehicle documents are valid</li>
                <li>Check fuel level and vehicle condition</li>
                <li>Ensure navigation system is working</li>
                <li>Confirm customer contact details</li>
                <li>Review route and estimated travel time</li>
                <li>Carry necessary identification</li>
              </ul>
            </div>

            <p style="text-align: center; margin-top: 30px;">
              <strong>Safe travels and thank you for your service!</strong>
            </p>
          </div>

          <div class="footer">
            <h3>Kshetra Retreat Resort</h3>
            <p>Transport Management System</p>
            <p style="margin-top: 20px; font-size: 12px;">This is an automated notification. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send admin notification for new bookings
  async sendAdminBookingNotification(booking: any, user?: any): Promise<{ success: boolean; error?: string }> {
    const html = this.generateAdminBookingNotificationEmail(booking, user);

    return this.sendEmail({
      to: process.env.ADMIN_EMAIL!,
      subject: `🏨 New Booking Alert - ${booking._id}`,
      html,
      text: `New booking received: ${booking._id} - Amount: ₹${booking.totalAmount}`
    });
  }

  // Generate admin booking notification email
  private generateAdminBookingNotificationEmail(booking: any, user?: any): string {
    const guestInfo = user || {
      name: booking.primaryGuestInfo?.name || 'Guest',
      email: booking.guestEmail || booking.primaryGuestInfo?.email,
      phone: booking.primaryGuestInfo?.phone
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 700px; margin: 0 auto; padding: 20px; }
          .header { background-color: #1976d2; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9f9f9; padding: 20px; }
          .booking-card { background-color: white; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 5px solid #1976d2; }
          .alert { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #2e7d32; text-align: center; padding: 15px; background-color: #e8f5e9; border-radius: 8px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏨 NEW BOOKING ALERT</h1>
            <p>Kshetra Retreat Resort - Admin Dashboard</p>
            <p style="font-size: 14px; margin: 0;">Booking ID: ${booking._id}</p>
          </div>

          <div class="content">
            <div class="alert">
              <strong>⚡ Action Required:</strong> New booking received and requires your attention for processing.
            </div>

            <div class="amount">
              💰 Total Amount: ₹${booking.totalAmount}
            </div>

            <div class="booking-card">
              <h3>Guest Information</h3>
              <p><strong>Name:</strong> ${guestInfo.name}</p>
              <p><strong>Email:</strong> ${guestInfo.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${guestInfo.phone || 'Not provided'}</p>
              ${booking.primaryGuestInfo?.address ? `<p><strong>Address:</strong> ${booking.primaryGuestInfo.address}</p>` : ''}
            </div>

            <div class="booking-card">
              <h3>Booking Details</h3>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('en-IN')}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('en-IN')}</p>
              <p><strong>Guests:</strong> ${booking.totalGuests} (${booking.adults} Adults, ${booking.children} Children)</p>
              <p><strong>Room:</strong> ${booking.roomId?.roomNumber || 'TBD'} (${booking.roomId?.roomType || 'N/A'})</p>
              <p><strong>Status:</strong> ${booking.status}</p>
              <p><strong>Payment Status:</strong> ${booking.paymentStatus || 'Pending'}</p>
            </div>

            ${booking.transport && (booking.transport.pickup || booking.transport.drop) ? `
            <div class="booking-card" style="border-left-color: #ff9800;">
              <h3>🚗 Transport Required</h3>
              ${booking.transport.pickup ? `<p>✅ <strong>Airport Pickup Required</strong></p>` : ''}
              ${booking.transport.drop ? `<p>✅ <strong>Airport Drop Required</strong></p>` : ''}
              ${booking.transport.flightNumber ? `<p><strong>Flight:</strong> ${booking.transport.flightNumber}</p>` : ''}
              ${booking.transport.flightArrivalTime ? `<p><strong>Arrival:</strong> ${new Date(booking.transport.flightArrivalTime).toLocaleString('en-IN')}</p>` : ''}
              ${booking.transport.flightDepartureTime ? `<p><strong>Departure:</strong> ${new Date(booking.transport.flightDepartureTime).toLocaleString('en-IN')}</p>` : ''}
            </div>
            ` : ''}

            ${booking.selectedServices && booking.selectedServices.length > 0 ? `
            <div class="booking-card">
              <h3>Additional Services</h3>
              ${booking.selectedServices.map((service: any) => `
                <p>• ${service.serviceId?.name || 'Unknown Service'} (Qty: ${service.quantity}) - ₹${service.totalPrice}</p>
              `).join('')}
            </div>
            ` : ''}

            ${booking.specialRequests ? `
            <div class="booking-card">
              <h3>Special Requests</h3>
              <p>${booking.specialRequests}</p>
            </div>
            ` : ''}

            <div class="booking-card" style="background-color: #e3f2fd;">
              <h3>📊 Quick Actions</h3>
              <p>1. Verify room availability</p>
              <p>2. Confirm transport arrangements (if required)</p>
              <p>3. Prepare welcome amenities</p>
              <p>4. Update booking status in system</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(booking: any, paymentDetails: any, user?: any): Promise<{ success: boolean; error?: string }> {
    const guestInfo = user || {
      name: booking.primaryGuestInfo?.name || 'Guest',
      email: booking.guestEmail || booking.primaryGuestInfo?.email
    };

    if (!guestInfo.email) {
      return {
        success: false,
        error: 'No email address available for payment confirmation'
      };
    }

    const html = this.generatePaymentConfirmationEmail(booking, paymentDetails, guestInfo);

    // Send to customer with CC to admin
    return this.sendEmail({
      to: guestInfo.email,
      cc: process.env.ADMIN_EMAIL,
      subject: '💳 Payment Confirmed - Kshetra Retreat Resort',
      html,
      text: `Payment of ₹${paymentDetails.amount} confirmed for booking ${booking._id}.`
    });
  }

  // Generate payment confirmation email
  private generatePaymentConfirmationEmail(booking: any, paymentDetails: any, guestInfo: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4caf50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .payment-details { background-color: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 5px solid #4caf50; }
          .amount { font-size: 24px; font-weight: bold; color: #4caf50; text-align: center; padding: 20px; background-color: #e8f5e9; margin: 15px 0; border-radius: 8px; }
          .footer { text-align: center; padding: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Payment Confirmed!</h1>
            <h2>Kshetra Retreat Resort</h2>
          </div>

          <div class="content">
            <h3>Dear ${guestInfo.name},</h3>
            <p>Great news! Your payment has been successfully processed.</p>

            <div class="amount">
              💰 ₹${paymentDetails.amount} PAID
            </div>

            <div class="payment-details">
              <h4>Payment Details:</h4>
              <p><strong>Booking ID:</strong> ${booking._id}</p>
              <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId || paymentDetails.id}</p>
              <p><strong>Payment Method:</strong> ${paymentDetails.method || 'Online'}</p>
              <p><strong>Payment Date:</strong> ${new Date().toLocaleString('en-IN')}</p>
              <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">SUCCESSFUL</span></p>
            </div>

            <div class="payment-details">
              <h4>Booking Summary:</h4>
              <p><strong>Check-in:</strong> ${new Date(booking.checkIn).toLocaleDateString('en-IN')}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOut).toLocaleDateString('en-IN')}</p>
              <p><strong>Room:</strong> ${booking.roomId?.roomNumber || 'TBD'} (${booking.roomId?.roomType || 'Standard'})</p>
              <p><strong>Guests:</strong> ${booking.totalGuests}</p>
            </div>

            <p style="background-color: #e3f2fd; padding: 15px; border-radius: 5px;">
              <strong>What's Next?</strong><br>
              • You will receive a detailed booking confirmation shortly<br>
              • Our team will contact you 24 hours before your arrival<br>
              • Keep this payment confirmation for your records
            </p>

            <p>Thank you for choosing Kshetra Retreat Resort!</p>
          </div>

          <div class="footer">
            <p>&copy; 2025 Kshetra Retreat Resort. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();