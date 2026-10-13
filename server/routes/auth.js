import express from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/db.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'agriconnect_secret_nashik_2026';

// Request OTP - Mock OTP 123456
router.post('/request-otp', (req, res) => {
  const { mobile } = req.body;
  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    return res.status(400).json({ error: 'Valid 10-digit Indian mobile number required' });
  }

  const cleanMobile = String(mobile).trim();
  const existingUser = db.prepare('SELECT id, name, role, buyer_type FROM users WHERE mobile = ?').get(cleanMobile);

  return res.json({
    success: true,
    message: 'OTP sent successfully (Mock OTP: 123456)',
    mockOtp: '123456',
    isRegistered: !!existingUser,
    role: existingUser ? existingUser.role : null
  });
});

// Verify OTP & Sign In / Register
router.post('/verify-otp', (req, res) => {
  const { mobile, otp, role, name, buyer_type, language, taluka, village } = req.body;

  if (!mobile || !/^\d{10}$/.test(String(mobile).trim())) {
    return res.status(400).json({ error: 'Valid 10-digit mobile number required' });
  }

  const cleanMobile = String(mobile).trim();
  const cleanOtp = String(otp).trim();

  // Validate mock OTP
  if (cleanOtp !== '123456') {
    return res.status(400).json({ error: 'Invalid OTP. For prototype demo, please enter 123456' });
  }

  let user = db.prepare('SELECT * FROM users WHERE mobile = ?').get(cleanMobile);

  if (!user) {
    // Register new user
    const chosenRole = role === 'buyer' ? 'buyer' : 'farmer';
    const chosenName = name && name.trim() ? name.trim() : (chosenRole === 'farmer' ? `Farmer ${cleanMobile.slice(-4)}` : `Buyer ${cleanMobile.slice(-4)}`);
    const chosenLang = ['en', 'mr', 'hi'].includes(language) ? language : 'mr';
    const chosenTaluka = taluka || 'Nashik';
    const chosenVillage = village || '';
    const chosenBuyerType = chosenRole === 'buyer' ? (buyer_type || 'retailer') : null;

    const result = db.prepare(`
      INSERT INTO users (name, mobile, role, buyer_type, language, village, taluka, district)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'Nashik')
    `).run(chosenName, cleanMobile, chosenRole, chosenBuyerType, chosenLang, chosenVillage, chosenTaluka);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
  }

  // Generate JWT token (expires in 7 days)
  const token = jwt.sign(
    { id: user.id, mobile: user.mobile, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      mobile: user.mobile,
      role: user.role,
      buyer_type: user.buyer_type,
      language: user.language,
      village: user.village,
      taluka: user.taluka,
      district: user.district
    }
  });
});

export default router;
