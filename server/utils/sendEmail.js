const nodemailer = require('nodemailer');

/**
 * Send an email via SMTP.
 * Requires env vars: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 * For Gmail: EMAIL_HOST=smtp.gmail.com  EMAIL_PORT=587
 * For Outlook: EMAIL_HOST=smtp.office365.com  EMAIL_PORT=587
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.gmail.com',
    port:   parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from:    process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
