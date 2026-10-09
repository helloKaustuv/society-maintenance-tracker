const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

let transporter = null;

const createTransporter = async () => {
  if (transporter) return transporter;

  const hasSmtpConfig = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasSmtpConfig) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    console.log(`[Email] Configured SMTP transporter for: ${process.env.SMTP_USER}`);
  } else {
    // In dev / demo mode without credentials, we create an ethereal test account or mock transport
    console.log('[Email] No SMTP credentials provided. Setting up mock/preview email handler.');
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('------------------------------------------------------------');
        console.log(`📨 [Email Simulated Dispatch]`);
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`Preview: ${mailOptions.text ? mailOptions.text.slice(0, 150) : 'HTML body attached'}`);
        console.log('------------------------------------------------------------');
        return { messageId: 'simulated-' + Date.now(), accepted: [mailOptions.to] };
      },
      verify: async () => true
    };
  }

  return transporter;
};

module.exports = {
  createTransporter
};
