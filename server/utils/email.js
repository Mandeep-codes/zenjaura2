import nodemailer from 'nodemailer';

let transporter;

try {
  transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
} catch (error) {
  console.warn('Email transporter not configured:', error.message);
}

export const sendEmail = async (options) => {
  if (!transporter) {
    console.warn('Email service not configured - email not sent');
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'noreply@zenjaura.com',
    to: options.to,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', options.to);
  } catch (error) {
    console.error('Email send error:', error.message);
    // Don't throw error in development to prevent app crashes
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email could not be sent');
    }
  }
};
