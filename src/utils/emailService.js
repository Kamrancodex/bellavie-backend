const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  // For development, use ethereal email
  if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST) {
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass',
      },
    });
  }

  return nodemailer.createTransporter(config);
};

// Email templates
const templates = {
  welcome: (data) => ({
    subject: 'Welcome to Bellavie CRM',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to Bellavie CRM, ${data.name}!</h1>
        <p>Your account has been created successfully. You can now access the CRM dashboard.</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p>
          <a href="${data.loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Login to Dashboard
          </a>
        </p>
        <p>If you have any questions, please contact our support team.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from Bellavie CRM System. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `Welcome to Bellavie CRM, ${data.name}! Your account has been created successfully. Login at: ${data.loginUrl}`,
  }),

  passwordReset: (data) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>Hello ${data.name},</p>
        <p>You requested a password reset for your Bellavie CRM account.</p>
        <p>Click the link below to reset your password (expires in ${data.expiresIn}):</p>
        <p>
          <a href="${data.resetUrl}" style="background-color: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p>If you didn't request this password reset, please ignore this email.</p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from Bellavie CRM System. Please do not reply to this email.
        </p>
      </div>
    `,
    text: `Hello ${data.name}, You requested a password reset. Reset your password at: ${data.resetUrl} (expires in ${data.expiresIn})`,
  }),

  inquiryNotification: (data) => ({
    subject: 'New Inquiry Received',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">New Inquiry Received</h1>
        <p>A new inquiry has been submitted:</p>
        <ul>
          <li><strong>Name:</strong> ${data.fullName}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.phone}</li>
          <li><strong>Event Type:</strong> ${data.eventType}</li>
          <li><strong>Event Date:</strong> ${data.eventDate}</li>
          <li><strong>Guest Count:</strong> ${data.guestCount}</li>
        </ul>
        ${data.message ? `<p><strong>Message:</strong><br>${data.message}</p>` : ''}
        <p>
          <a href="${data.dashboardUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View in Dashboard
          </a>
        </p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from Bellavie CRM System.
        </p>
      </div>
    `,
    text: `New inquiry from ${data.fullName} (${data.email}) for ${data.eventType} on ${data.eventDate}. View in dashboard: ${data.dashboardUrl}`,
  }),

  eventReminder: (data) => ({
    subject: `Event Reminder: ${data.eventTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Event Reminder</h1>
        <p>This is a reminder for the upcoming event:</p>
        <ul>
          <li><strong>Event:</strong> ${data.eventTitle}</li>
          <li><strong>Date:</strong> ${data.eventDate}</li>
          <li><strong>Time:</strong> ${data.startTime} - ${data.endTime}</li>
          <li><strong>Venue:</strong> ${data.venue}</li>
          <li><strong>Client:</strong> ${data.clientName}</li>
        </ul>
        <p>
          <a href="${data.eventUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Event Details
          </a>
        </p>
        <hr>
        <p style="color: #666; font-size: 12px;">
          This email was sent from Bellavie CRM System.
        </p>
      </div>
    `,
    text: `Event Reminder: ${data.eventTitle} on ${data.eventDate} at ${data.venue}. View details: ${data.eventUrl}`,
  }),
};

// Send email function
const sendEmail = async ({ to, subject, template, data, html, text }) => {
  try {
    const transporter = createTransporter();

    let emailContent = { subject, html, text };

    // Use template if provided
    if (template && templates[template]) {
      emailContent = templates[template](data);
    }

    // Override with custom content if provided
    if (subject) emailContent.subject = subject;
    if (html) emailContent.html = html;
    if (text) emailContent.text = text;

    const mailOptions = {
      from: `${process.env.FROM_NAME || 'Bellavie CRM'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent successfully:', info.messageId);
    
    // Log preview URL for development
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info) : null,
    };
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Send multiple emails
const sendBulkEmails = async (emails) => {
  const results = [];
  
  for (const email of emails) {
    try {
      const result = await sendEmail(email);
      results.push({ success: true, to: email.to, ...result });
    } catch (error) {
      results.push({ success: false, to: email.to, error: error.message });
    }
  }
  
  return results;
};

// Verify transporter configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email configuration verified');
    return true;
  } catch (error) {
    console.error('❌ Email configuration error:', error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendBulkEmails,
  verifyEmailConfig,
  templates,
};
