const sendEmail = async (options) => {
  // If API key is not provided, fallback to simulation (useful for testing/dev without env vars)
  if (!process.env.EMAIL_API_KEY) {
    console.log('\n=======================================');
    console.log(`📧 NEW EMAIL INTERCEPTED (Simulation Mode)`);
    console.log(`=======================================`);
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: ${options.message}`);
    console.log(`=======================================\n`);
    console.log('⚠️ Note: To send real emails, set EMAIL_API_KEY in Render and configure Netlify.\n');
    return;
  }

  try {
    // Instead of using Nodemailer directly (which gets blocked by Render's firewall),
    // we send a request to our Netlify Serverless Function which handles the SMTP delivery.
    const frontendUrl = process.env.FRONTEND_URL || 'https://sgulostandfound.netlify.app';
    const netlifyFunctionUrl = `${frontendUrl}/.netlify/functions/sendEmail`;

    const response = await fetch(netlifyFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.EMAIL_API_KEY
      },
      body: JSON.stringify({
        to: options.email,
        subject: options.subject,
        message: options.message,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Netlify function returned ${response.status}: ${errText}`);
    }

  } catch (error) {
    console.error("Failed to trigger Netlify Email Function:", error.message);
    throw new Error('Email sending failed due to delivery service error.');
  }
};

module.exports = sendEmail;
