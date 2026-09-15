/**
 * sendEmail.js
 * Production-ready email dispatcher with Gmail SMTP and automatic Ethereal test inbox fallback.
 */

const nodemailer = require('nodemailer');

const isPlaceholder = (val) =>
  !val ||
  typeof val !== 'string' ||
  val.trim() === '' ||
  val.includes('your_email') ||
  val.includes('xxxx-xxxx') ||
  val.includes('your_');

const sendEmail = async ({ to, subject, htmlText, plainText }) => {
  const rawGmailUser = process.env.GMAIL_USER || process.env.SMTP_EMAIL;
  const rawGmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASSWORD;

  const hasGmailConfig =
    rawGmailUser &&
    rawGmailPass &&
    !isPlaceholder(rawGmailUser) &&
    !isPlaceholder(rawGmailPass);

  const hasSmtpConfig =
    process.env.SMTP_HOST &&
    process.env.SMTP_EMAIL &&
    process.env.SMTP_PASSWORD &&
    !isPlaceholder(process.env.SMTP_HOST);

  // Helper to send via Ethereal test inbox
  const sendViaEthereal = async () => {
    console.log(`[Email Service] EMAIL_PROVIDER=ETHEREAL (Development Test Mode)`);
    console.log(`[Email Service] Generating Ethereal test inbox message for: ${to}...`);

    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const mailOptions = {
      from: `"KisanSetu AI Security" <no-reply@kisansetu.in>`,
      to,
      subject,
      text: plainText,
      html: htmlText,
    };

    const info = await testTransporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    console.log(`=======================================================`);
    console.log(`  📧 EMAIL_PROVIDER=ETHEREAL (TEST PREVIEW)`);
    console.log(`  🔗 Open this URL to view the received OTP email:`);
    console.log(`  ${previewUrl}`);
    console.log(`=======================================================`);

    return {
      success: true,
      provider: 'ETHEREAL',
      messageId: info.messageId,
      previewUrl: previewUrl || undefined,
      isTestFallback: true,
    };
  };

  // 1. Try Gmail if real credentials configured
  if (hasGmailConfig) {
    try {
      console.log(`[Email Service] EMAIL_PROVIDER=GMAIL`);
      console.log(`[Email Service] Dispatching real email via Gmail SMTP to: ${to}`);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: rawGmailUser,
          pass: rawGmailPass.replace(/\s+/g, ''), // Support spaced Google App Passwords
        },
      });

      const mailOptions = {
        from: `"KisanSetu AI Security" <${rawGmailUser}>`,
        to,
        subject,
        text: plainText,
        html: htmlText,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Email successfully sent via Gmail (Message ID: ${info.messageId})`);
      return {
        success: true,
        provider: 'GMAIL',
        messageId: info.messageId,
        isTestFallback: false,
      };
    } catch (gmailErr) {
      console.warn(`[Email Service] Gmail SMTP dispatch failed (${gmailErr.message}). Gracefully routing to Ethereal test inbox...`);
      return await sendViaEthereal();
    }
  }

  // 2. Try Custom SMTP if configured
  if (hasSmtpConfig) {
    try {
      console.log(`[Email Service] EMAIL_PROVIDER=SMTP (${process.env.SMTP_HOST})`);
      console.log(`[Email Service] Dispatching real email via custom SMTP to: ${to}`);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });

      const mailOptions = {
        from: `"KisanSetu AI Security" <${process.env.SMTP_EMAIL}>`,
        to,
        subject,
        text: plainText,
        html: htmlText,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log(`[Email Service] Email successfully sent via SMTP (Message ID: ${info.messageId})`);
      return {
        success: true,
        provider: 'SMTP',
        messageId: info.messageId,
        isTestFallback: false,
      };
    } catch (smtpErr) {
      console.warn(`[Email Service] Custom SMTP dispatch failed (${smtpErr.message}). Gracefully routing to Ethereal test inbox...`);
      return await sendViaEthereal();
    }
  }

  // 3. Fallback to Ethereal
  return await sendViaEthereal();
};

module.exports = sendEmail;

