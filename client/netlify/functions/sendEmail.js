import nodemailer from 'nodemailer';

export const handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // Security check to prevent unauthorized use of your email server
  const apiKey = event.headers['x-api-key'];
  if (!process.env.EMAIL_API_KEY || apiKey !== process.env.EMAIL_API_KEY) {
    return { statusCode: 401, body: 'Unauthorized: Invalid API Key' };
  }

  try {
    const { to, subject, message } = JSON.parse(event.body);

    // Create a transporter using Gmail
    // Netlify (AWS Lambda) does NOT block SMTP connections to Gmail!
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Smart College Lost & Found" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: subject,
      text: message,
    };

    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email sent successfully via Netlify' }),
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message }),
    };
  }
};
