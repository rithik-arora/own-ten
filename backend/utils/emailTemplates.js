/**
 * Email templates for the application
 */

/**
 * Invite email template
 * @param {string} link - Invitation link
 * @returns {string} HTML email content
 */
export const inviteTemplate = (link) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Property Invitation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">Property Invitation</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px;">You have been invited to join a property on OwnTen platform.</p>
        <p style="font-size: 16px;">Click the button below to accept the invitation:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${link}" style="background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Accept Invitation</a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #9ca3af; word-break: break-all;">${link}</p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">This invitation will expire in 7 days.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} OwnTen. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Payment success email template
 * @param {number} amount - Payment amount
 * @param {Object} property - Property object with address
 * @returns {string} HTML email content
 */
export const paymentTemplate = (amount, property) => {
  const propertyAddress = property?.address || 'Property';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rent Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">💰 Rent Received</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px;">Great news! You have received a rent payment.</p>
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Property:</p>
          <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: bold; color: #111827;">${propertyAddress}</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Amount Received:</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #10b981;">₹${amount.toLocaleString('en-IN')}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">The payment has been successfully processed and recorded in your account.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} OwnTen. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Dispute created email template
 * @param {string} title - Dispute title
 * @returns {string} HTML email content
 */
export const disputeTemplate = (title) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Dispute Created</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">⚠️ New Dispute Created</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px;">A new dispute has been created that involves you.</p>
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Dispute Title:</p>
          <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #111827;">${title}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Please log in to your account to view the dispute details and respond accordingly.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/disputes" style="background-color: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">View Dispute</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} OwnTen. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

/**
 * Rent reminder email template
 * @param {Object} property - Property object with address
 * @param {number} amount - Rent amount
 * @returns {string} HTML email content
 */
export const rentReminderTemplate = (property, amount) => {
  const propertyAddress = property?.address || 'Property';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rent Reminder</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">📅 Rent Reminder</h1>
      </div>
      <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="font-size: 16px;">This is a friendly reminder that your monthly rent payment is due.</p>
        <div style="background-color: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Property:</p>
          <p style="margin: 5px 0 15px 0; font-size: 18px; font-weight: bold; color: #111827;">${propertyAddress}</p>
          <p style="margin: 0; font-size: 14px; color: #6b7280;">Monthly Rent Amount:</p>
          <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #f59e0b;">₹${amount.toLocaleString('en-IN')}</p>
        </div>
        <p style="font-size: 14px; color: #6b7280;">Your monthly rent of <strong>₹${amount.toLocaleString('en-IN')}</strong> for <strong>${propertyAddress}</strong> is due.</p>
        <p style="font-size: 14px; color: #6b7280;">Please make the payment at your earliest convenience.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/payments" style="background-color: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Pay Rent</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>© ${new Date().getFullYear()} OwnTen. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};
