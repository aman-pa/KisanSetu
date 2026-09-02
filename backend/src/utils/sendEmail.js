const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, htmlText, plainText }) => {
  try {
    let transporter;

    const gmailUser = process.env.GMAIL_USER || process.env.SMTP_EMAIL;
    const gmailPass = process.env.GMAIL_PASS || process.env.SMTP_PASSWORD;

    if (gmailUser && gmailPass) {
      console.log(`[Email Service] Sending real email via Gmail SMTP (${gmailUser}) to ${to}...`);
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPass,
        },
      });
    } else if (process.env.SMTP_HOST && process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_PORT == 465,
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD,
        },
      });
    } else {
      console.log('[Email Service] GMAIL_USER and GMAIL_PASS not found in backend/.env.');
      console.log('[Email Service] Using test SMTP fallback for local development...');
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
    console.log(`[Email Service] Email successfully sent to: ${to} (Message ID: ${info.messageId})`);

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`=======================================================`);
      console.log(`  📧 EMAIL DELIVERED TO ETHEREAL TEST INBOX:`);
      console.log(`  ${previewUrl}`);
      console.log(`=======================================================`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error('[Email Service Error]', err.message);
    throw err;
  }
};

module.exports = sendEmail;
