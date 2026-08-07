const nodemailer = require('nodemailer');
const dns = require('dns');

// Force IPv4 for DNS resolution to prevent ENETUNREACH errors on cloud providers that lack IPv6 routing
dns.setDefaultResultOrder('ipv4first');

const sendEmail = async (options) => {
  // If email credentials are not provided, fallback to simulation (useful for testing/dev without env vars)
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('\n=======================================');
    console.log(`📧 NEW EMAIL INTERCEPTED (Simulation Mode)`);
    console.log(`=======================================`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log(`=======================================\n`);
    console.log('⚠️ Note: To send real emails, set EMAIL_USER and EMAIL_PASS in your .env or Render environment.\n');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    requireTLS: true,
    family: 4, // Force IPv4 to prevent ENETUNREACH errors on cloud providers that lack IPv6 routing
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  const mailOptions = {
    from: `"Smart College Lost & Found" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
