// services/email.service.js

const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
    if (transporter) return transporter;

    const host = process.env.EMAIL_HOST;
    const port = process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587;
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

    if (host && user && pass) {
        transporter = nodemailer.createTransport({
            host,
            port,
            secure: port === 465,
            auth: { user, pass }
        });
    }

    return transporter;
}

/**
 * Send password reset OTP email
 * @param {string} to - Recipient email
 * @param {string} otp - 5-digit OTP
 * @param {string} recipientName - Optional recipient name
 */
async function sendPasswordResetOtpEmail({ to, otp, recipientName = 'Valued User' }) {
    const fromAddress = process.env.EMAIL_FROM || '"CabGo Security" <no-reply@cabgo.app>';
    const emailTransporter = getTransporter();

    const subject = `Your CabGo Password Reset Code: ${otp}`;
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CabGo Password Reset</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 560px; margin: 30px auto; background-color: #0f172a; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; }
        .header { background: linear-gradient(135deg, #1e293b, #0f172a); padding: 32px; text-align: center; border-bottom: 1px solid #334155; }
        .logo { font-size: 28px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
        .logo span { color: #f59e0b; }
        .content { padding: 36px 32px; }
        .title { font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 0; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #94a3b8; margin-bottom: 24px; }
        .otp-box { background-color: #1e293b; border: 2px dashed #f59e0b; border-radius: 16px; padding: 20px; text-align: center; margin: 28px 0; }
        .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 900; letter-spacing: 12px; color: #f59e0b; }
        .expiry-note { font-size: 12px; color: #cbd5e1; margin-top: 8px; font-weight: 500; }
        .footer { padding: 24px 32px; background-color: #090d16; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Cab<span>Go</span></div>
          <p style="margin: 6px 0 0 0; color: #94a3b8; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Security & Account Recovery</p>
        </div>
        <div class="content">
          <h2 class="title">Password Reset Request</h2>
          <p class="text">Hello ${recipientName},</p>
          <p class="text">We received a request to reset the password for your CabGo account. Use the following 5-digit verification code to complete the process:</p>
          
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="expiry-note">⏱ Code valid for 10 minutes &bull; Single-use only</div>
          </div>
          
          <p class="text" style="font-size: 13px; color: #94a3b8;">If you did not request this password reset, no action is needed. Your account remains secure.</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} CabGo Technologies Inc. All rights reserved.<br>
          This is an automated security message. Please do not reply directly to this email.
        </div>
      </div>
    </body>
    </html>
    `;

    if (emailTransporter) {
        try {
            await emailTransporter.sendMail({
                from: fromAddress,
                to,
                subject,
                html: htmlContent,
                text: `CabGo Password Reset Code: ${otp}. This code is valid for 10 minutes. If you did not request this, please ignore this email.`
            });
            console.log(`✅ [CabGo Mailer] Password reset OTP sent to ${to}`);
            return true;
        } catch (err) {
            console.error(`❌ [CabGo Mailer Error] Failed to send email to ${to}:`, err.message);
            // Fallback log so dev testing isn't blocked
            console.log(`📨 [CabGo Fallback] OTP for ${to}: [ ${otp} ]`);
            return false;
        }
    } else {
        // Development mode fallback when SMTP is not configured in .env
        console.log(`📨 [CabGo Dev Mailer] (No SMTP credentials configured)`);
        console.log(`📨 [CabGo Dev Mailer] To: ${to} | 5-Digit OTP: >>> ${otp} <<<`);
        return true;
    }
}

module.exports = {
    sendPasswordResetOtpEmail
};
