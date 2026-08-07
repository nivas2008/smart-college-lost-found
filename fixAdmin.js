require('dotenv').config({ path: './server/.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Lakshminivas@7781', salt);
    await User.updateOne({ role: 'admin' }, { 
      $set: { password: hashedPassword, loginAttempts: 0 },
      $unset: { lockUntil: "" }
    });
    console.log('Admin fixed');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
