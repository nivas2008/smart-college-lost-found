const sendEmail = async (options) => {
  // SIMULATED EMAIL SERVICE
  // In a real production environment, you would use Nodemailer with SendGrid or Gmail.
  console.log('\n=======================================');
  console.log(`📧 NEW EMAIL INTERCEPTED`);
  console.log(`=======================================`);
  console.log(`To: ${options.email}`);
  console.log(`Subject: ${options.subject}`);
  console.log(`Message: ${options.message}`);
  console.log(`=======================================\n`);
};

module.exports = sendEmail;
