import express from 'express';
import db from '../db/db.js';
import { authenticate } from '../middleware/auth.js';
import { calculateMandiComparison } from '../providers/mandiProvider.js';

const router = express.Router();

// GET /me/profile
router.get('/profile', authenticate, (req, res) => {
  res.json(req.user);
});

// GET /me/listings (Farmer: my listings)
router.get('/listings', authenticate, (req, res) => {
  if (req.user.role !== 'farmer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only farmers can have produce listings' });
  }

  const rows = db.prepare(`
    SELECT 
      l.*,
      c.name_en AS crop_name_en,
      c.name_mr AS crop_name_mr,
      c.name_hi AS crop_name_hi,
      c.icon_name AS crop_icon,
      mp.modal_price AS mandi_modal_price,
      mp.min_price AS mandi_min_price,
      mp.max_price AS mandi_max_price,
      (SELECT COUNT(*) FROM enquiries e WHERE e.listing_id = l.id) AS enquiry_count
    FROM listings l
    JOIN crops c ON l.crop_id = c.id
    LEFT JOIN mandi_prices mp ON mp.crop_id = l.crop_id AND mp.district = l.district
    WHERE l.farmer_id = ?
    ORDER BY l.created_at DESC
  `).all(req.user.id);

  const results = rows.map((item) => ({
    ...item,
    mandi_comparison: calculateMandiComparison(item.asking_price, item.mandi_modal_price)
  }));

  res.json(results);
});

// GET /me/enquiries (Farmer: received enquiries; Buyer: sent enquiries)
router.get('/enquiries', authenticate, (req, res) => {
  if (req.user.role === 'farmer') {
    // Farmer received enquiries
    const enquiries = db.prepare(`
      SELECT 
        e.*,
        b.name AS buyer_name,
        b.mobile AS buyer_mobile,
        b.buyer_type,
        b.village AS buyer_village,
        b.taluka AS buyer_taluka,
        l.quantity AS listing_quantity,
        l.unit AS listing_unit,
        l.asking_price AS listing_price,
        l.price_unit AS listing_price_unit,
        c.name_en AS crop_name_en,
        c.name_mr AS crop_name_mr,
        c.name_hi AS crop_name_hi,
        c.icon_name AS crop_icon
      FROM enquiries e
      JOIN listings l ON e.listing_id = l.id
      JOIN users b ON e.buyer_id = b.id
      JOIN crops c ON l.crop_id = c.id
      WHERE l.farmer_id = ?
      ORDER BY e.created_at DESC
    `).all(req.user.id);

    return res.json(enquiries);
  } else if (req.user.role === 'buyer') {
    // Buyer sent enquiries
    const enquiries = db.prepare(`
      SELECT 
        e.*,
        f.name AS farmer_name,
        f.mobile AS farmer_mobile,
        f.village AS farmer_village,
        f.taluka AS farmer_taluka,
        l.quantity AS listing_quantity,
        l.unit AS listing_unit,
        l.asking_price AS listing_price,
        l.price_unit AS listing_price_unit,
        l.status AS listing_status,
        c.name_en AS crop_name_en,
        c.name_mr AS crop_name_mr,
        c.name_hi AS crop_name_hi,
        c.icon_name AS crop_icon
      FROM enquiries e
      JOIN listings l ON e.listing_id = l.id
      JOIN users f ON l.farmer_id = f.id
      JOIN crops c ON l.crop_id = c.id
      WHERE e.buyer_id = ?
      ORDER BY e.created_at DESC
    `).all(req.user.id);

    return res.json(enquiries);
  } else {
    // Admin: see all enquiries
    const enquiries = db.prepare(`
      SELECT e.*, b.name AS buyer_name, b.mobile AS buyer_mobile, f.name AS farmer_name, f.mobile AS farmer_mobile, c.name_en AS crop_name_en
      FROM enquiries e
      JOIN listings l ON e.listing_id = l.id
      JOIN users b ON e.buyer_id = b.id
      JOIN users f ON l.farmer_id = f.id
      JOIN crops c ON l.crop_id = c.id
      ORDER BY e.created_at DESC
    `).all();

    return res.json(enquiries);
  }
});

// PATCH /me/enquiries/:id/status
router.patch('/enquiries/:id/status', authenticate, (req, res) => {
  const enquiryId = Number(req.params.id);
  const { status } = req.body;

  if (!['new', 'contacted', 'closed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const enquiry = db.prepare(`
    SELECT e.*, l.farmer_id 
    FROM enquiries e 
    JOIN listings l ON e.listing_id = l.id 
    WHERE e.id = ?
  `).get(enquiryId);

  if (!enquiry) {
    return res.status(404).json({ error: 'Enquiry not found' });
  }

  // Must be farmer owner or enquiry buyer or admin
  if (enquiry.farmer_id !== req.user.id && enquiry.buyer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to change this enquiry' });
  }

  db.prepare('UPDATE enquiries SET status = ? WHERE id = ?').run(status, enquiryId);
  const updated = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(enquiryId);
  res.json(updated);
});

export default router;
