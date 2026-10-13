import express from 'express';
import db from '../db/db.js';
import { runSeed } from '../db/seed.js';

const router = express.Router();

// GET /admin/users
router.get('/users', (req, res) => {
  const users = db.prepare('SELECT id, name, mobile, role, buyer_type, village, taluka, district, created_at FROM users ORDER BY id ASC').all();
  res.json(users);
});

// GET /admin/stats
router.get('/stats', (req, res) => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const listingCount = db.prepare('SELECT COUNT(*) as count FROM listings').get().count;
  const activeListingCount = db.prepare("SELECT COUNT(*) as count FROM listings WHERE status = 'active'").get().count;
  const enquiryCount = db.prepare('SELECT COUNT(*) as count FROM enquiries').get().count;

  res.json({
    users: userCount,
    listings: listingCount,
    active_listings: activeListingCount,
    enquiries: enquiryCount
  });
});

// POST /admin/reset-demo
router.post('/reset-demo', (req, res) => {
  try {
    runSeed();
    res.json({ success: true, message: 'Database reset to demo state successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset demo: ' + err.message });
  }
});

export default router;
