/**
 * sendEmail.js
 * Production-ready email dispatcher with Gmail SMTP and Ethereal test inbox fallback.
 */

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, htmlText, plainText }) => {
  try {
    let transporter;
    let provider = 'ETHEREAL';

    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_EMAIL;
    const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASSWORD;

    if (gmailUser && gmailPass) {
      provider = 'GMAIL';
      console.log(`[Email Service] EMAIL_PROVIDER=GMAIL`);
      console.log(`[Email Service] Dispatching real email via Gmail SMTP to: ${to}`);
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass.replace(/\s+/g, ''), // Support spaced Google App Passwords
        },
      });
    } else if (process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      provider = 'SMTP';
      console.log(`[Email Service] EMAIL_PROVIDER=SMTP (${process.env.SMTP_HOST})`);
      console.log(`[Email Service] Dispatching real email via custom SMTP to: ${to}`);
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      provider = 'ETHEREAL';
      console.log(`[Email Service] EMAIL_PROVIDER=ETHEREAL (Development Test Mode)`);
      console.log(`[Email Service] GMAIL_USER and GMAIL_PASS not configured in backend/.env.`);
      console.log(`[Email Service] Generating Ethereal test inbox message for: ${to}...`);

      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: `"KisanSetu AI Security" <${gmailUser || 'no-reply@kisansetu.in'}>`,
      to,
      subject,
      text: plainText,
      html: htmlText,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Email successfully sent (Message ID: ${info.messageId})`);

    let previewUrl = null;
    if (provider === 'ETHEREAL') {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`=======================================================`);
      console.log(`  📧 EMAIL_PROVIDER=ETHEREAL (TEST PREVIEW)`);
      console.log(`  🔗 Open this URL to view the received OTP email:`);
      console.log(`  ${previewUrl}`);
      console.log(`=======================================================`);
    }

    return {
      success: true,
      provider,
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
      isTestFallback: provider === 'ETHEREAL',
    };
  } catch (err) {
    console.error('[Email Service Error]', err.message);
    throw err;
  }
};

module.exports = sendEmail;
