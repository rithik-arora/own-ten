import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send email using nodemailer
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email content
 * @returns {Promise<Object>} - Email send result
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error('Missing required email parameters: to, subject, or html');
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to,
      subject,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw error;
  }
};

export default sendEmail;
