const User = require('../models/User');
const Otp = require('../models/Otp');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// @desc    Generate a math captcha
// @route   GET /api/auth/captcha
// @access  Public
const generateCaptcha = (req, res) => {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operator = Math.random() > 0.5 ? '+' : '*';
  
  const question = `What is ${num1} ${operator} ${num2}?`;
  const answer = operator === '+' ? num1 + num2 : num1 * num2;
  
  const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
  const hash = jwt.sign({ answer }, secret, { expiresIn: '5m' });
  
  res.json({ question, hash });
};

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'Email is already registered' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits

    await Otp.create({ email, otp });

    await sendEmail({
      email,
      subject: 'Smart College Lost & Found - Verification OTP',
      message: `Your verification code is: ${otp}. It will expire in 10 minutes.`
    });

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  console.log("Registration request received with body:", { ...req.body, password: '[HIDDEN]' });
  try {
    const { name, email, password, department, collegeId, mobile, otp, captchaAnswer, captchaHash } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 1. CAPTCHA VERIFICATION
    if (!captchaAnswer || !captchaHash) {
      return res.status(400).json({ message: 'Captcha is required' });
    }
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
      const decoded = jwt.verify(captchaHash, secret);
      if (decoded.answer.toString() !== captchaAnswer.toString()) {
        return res.status(400).json({ message: 'Incorrect Captcha answer' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired Captcha' });
    }

    // 2. OTP VERIFICATION
    if (!otp) {
      return res.status(400).json({ message: 'OTP is required' });
    }
    const storedOtp = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!storedOtp || storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const user = await User.create({
      name,
      email,
      password,
      department,
      collegeId,
      mobile,
      role: 'student'
    });

    // Delete used OTPs for this email
    await Otp.deleteMany({ email });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, captchaAnswer, captchaHash } = req.body;

    // 1. CAPTCHA VERIFICATION
    if (!captchaAnswer || !captchaHash) {
      return res.status(400).json({ message: 'Captcha is required' });
    }
    try {
      const secret = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';
      const decoded = jwt.verify(captchaHash, secret);
      if (decoded.answer.toString() !== captchaAnswer.toString()) {
        return res.status(400).json({ message: 'Incorrect Captcha answer' });
      }
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired Captcha' });
    }

    const user = await User.findOne({ email });

    // Check if account is locked
    if (user && user.lockUntil && user.lockUntil > Date.now()) {
      const minutesRemaining = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res.status(401).json({ message: `Account locked due to multiple failed attempts. Try again in ${minutesRemaining} minutes.` });
    }

    if (user && (await user.matchPassword(password))) {
      if (user.status !== 'active') {
        return res.status(401).json({ message: 'Account is not active. Please contact admin.' });
      }

      // Reset login attempts on successful login
      if (user.loginAttempts > 0 || user.lockUntil) {
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      if (user) {
        user.loginAttempts = (user.loginAttempts || 0) + 1;
        if (user.loginAttempts >= 3) {
          user.lockUntil = Date.now() + 10 * 60 * 1000; // 10 minutes from now
          await user.save();
          return res.status(401).json({ message: 'Account locked due to multiple failed attempts. Try again in 10 minutes.' });
        }
        await user.save();
      }
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        department: user.department,
        collegeId: user.collegeId,
        mobile: user.mobile,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.department = req.body.department || user.department;
      user.mobile = req.body.mobile || user.mobile;
      
      if (req.body.password) {
        if (!req.body.oldPassword) {
          return res.status(400).json({ message: 'Please provide your current password to set a new one.' });
        }
        
        // Verify old password
        const isMatch = await user.matchPassword(req.body.oldPassword);
        if (!isMatch) {
          return res.status(401).json({ message: 'Incorrect current password.' });
        }

        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        department: updatedUser.department,
        mobile: updatedUser.mobile,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  sendOtp,
  generateCaptcha
};
