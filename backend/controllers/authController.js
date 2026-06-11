const jwt = require('jsonwebtoken');
const axios = require('axios');
const { User, OTP } = require('../models');
require('dotenv').config();

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTPviaSMS = async (phone, otp) => {
  // DEV MODE: just log OTP to console
  if (process.env.OTP_DEV_MODE === 'true') {
    console.log(`\n🔐 [DEV OTP] Phone: ${phone} | OTP: ${otp}\n`);
    return true;
  }

  // Fast2SMS (free tier) - sign up at https://fast2sms.com
  try {
    const response = await axios.post(
      'https://www.fast2sms.com/dev/bulkV2',
      {
        route: 'otp',
        variables_values: otp,
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
        },
      }
    );
    return response.data.return === true;
  } catch (err) {
    console.error('SMS Error:', err.message);
    return false;
  }
};

// POST /api/auth/send-otp
exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Enter a valid 10-digit Indian mobile number' });
    }

    // Invalidate old OTPs for this phone
    await OTP.update({ isUsed: true }, { where: { phone, isUsed: false } });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await OTP.create({ phone, otp, expiresAt });

    const sent = await sendOTPviaSMS(phone, otp);

    if (!sent && process.env.OTP_DEV_MODE !== 'true') {
      return res.status(500).json({ success: false, message: 'Failed to send OTP. Please try again.' });
    }

    res.json({
      success: true,
      message: process.env.OTP_DEV_MODE === 'true'
        ? 'OTP sent (check server console in dev mode)'
        : 'OTP sent to your mobile number',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/verify-otp
exports.verifyOTP = async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone and OTP are required' });
    }

    const otpRecord = await OTP.findOne({
      where: { phone, otp, isUsed: false },
      order: [['createdAt', 'DESC']],
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    if (new Date() > otpRecord.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    // Mark OTP as used
    await otpRecord.update({ isUsed: true });

    // Find or create user
    let [user, created] = await User.findOrCreate({
      where: { phone },
      defaults: { phone, name: name || null, role: 'user' },
    });

    if (!created && name && !user.name) {
      await user.update({ name });
    }

    await user.update({ lastLogin: new Date() });

    const token = jwt.sign(
      { id: user.id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      message: created ? 'Account created successfully!' : 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// PUT /api/auth/update-profile
exports.updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    await req.user.update({ name });
    res.json({ success: true, message: 'Profile updated', user: req.user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
