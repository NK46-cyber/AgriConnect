import express from 'express';
import db from '../db/db.js';
import { authenticate, optionalAuth, requireRole } from '../middleware/auth.js';
import { calculateMandiComparison } from '../providers/mandiProvider.js';

const router = express.Router();

// GET /listings?crop_id&taluka&sort
router.get('/', optionalAuth, (req, res) => {
  const { crop_id, taluka, sort = 'newest', search } = req.query;

  let query = `
    SELECT 
      l.*,
      c.name_en AS crop_name_en,
      c.name_mr AS crop_name_mr,
      c.name_hi AS crop_name_hi,
      c.category AS crop_category,
      c.icon_name AS crop_icon,
      u.name AS farmer_name,
      u.mobile AS farmer_mobile,
      mp.modal_price AS mandi_modal_price,
      mp.min_price AS mandi_min_price,
      mp.max_price AS mandi_max_price,
      mp.market_name AS mandi_market_name,
      mp.source AS mandi_source
    FROM listings l
    JOIN crops c ON l.crop_id = c.id
    JOIN users u ON l.farmer_id = u.id
    LEFT JOIN mandi_prices mp ON mp.crop_id = l.crop_id AND mp.district = l.district
    WHERE l.status = 'active'
  `;

  const params = [];

  if (crop_id && Number(crop_id)) {
    query += ` AND l.crop_id = ?`;
    params.push(Number(crop_id));
  }

  if (taluka && taluka.trim() && taluka !== 'all') {
    query += ` AND LOWER(l.taluka) = LOWER(?)`;
    params.push(taluka.trim());
  }

  if (search && search.trim()) {
    query += ` AND (LOWER(c.name_en) LIKE ? OR LOWER(c.name_mr) LIKE ? OR LOWER(c.name_hi) LIKE ? OR LOWER(l.village) LIKE ?)`;
    const searchParam = `%${search.trim().toLowerCase()}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      query += ` ORDER BY l.asking_price ASC`;
      break;
    case 'price_desc':
      query += ` ORDER BY l.asking_price DESC`;
      break;
    case 'quantity_desc':
      query += ` ORDER BY l.quantity DESC`;
      break;
    case 'newest':
    default:
      query += ` ORDER BY l.created_at DESC`;
      break;
  }

  const rows = db.prepare(query).all(...params);

  // Attach mandi comparison dynamically for every card
  const results = rows.map((item) => {
    const comparison = calculateMandiComparison(item.asking_price, item.mandi_modal_price);
    return {
      ...item,
      mandi_comparison: comparison
    };
  });

  res.json(results);
});

// GET /listings/:id
router.get('/:id', optionalAuth, (req, res) => {
  const listingId = Number(req.params.id);
  const item = db.prepare(`
    SELECT 
      l.*,
      c.name_en AS crop_name_en,
      c.name_mr AS crop_name_mr,
      c.name_hi AS crop_name_hi,
      c.category AS crop_category,
      c.icon_name AS crop_icon,
      u.name AS farmer_name,
      u.mobile AS farmer_mobile,
      mp.modal_price AS mandi_modal_price,
      mp.min_price AS mandi_min_price,
      mp.max_price AS mandi_max_price,
      mp.market_name AS mandi_market_name,
      mp.source AS mandi_source
    FROM listings l
    JOIN crops c ON l.crop_id = c.id
    JOIN users u ON l.farmer_id = u.id
    LEFT JOIN mandi_prices mp ON mp.crop_id = l.crop_id AND mp.district = l.district
    WHERE l.id = ?
  `).get(listingId);

  if (!item) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  const comparison = calculateMandiComparison(item.asking_price, item.mandi_modal_price);

  // Check enquiries count
  const enquiryCount = db.prepare('SELECT COUNT(*) as count FROM enquiries WHERE listing_id = ?').get(listingId).count;

  let enquiries = [];
  if (req.user && (req.user.id === item.farmer_id || req.user.role === 'admin')) {
    enquiries = db.prepare(`
      SELECT e.*, b.name AS buyer_name, b.mobile AS buyer_mobile, b.buyer_type
      FROM enquiries e
      JOIN users b ON e.buyer_id = b.id
      WHERE e.listing_id = ?
      ORDER BY e.created_at DESC
    `).all(listingId);
  }

  res.json({
    ...item,
    mandi_comparison: comparison,
    enquiry_count: enquiryCount,
    enquiries
  });
});

// POST /listings (Farmer create listing)
router.post('/', authenticate, requireRole('farmer'), (req, res) => {
  const { crop_id, quantity, unit = 'kg', asking_price, price_unit = 'kg', village, taluka, available_until, photo_url } = req.body;

  // Validation
  if (!crop_id || !Number(crop_id)) {
    return res.status(400).json({ error: 'Please select a crop' });
  }
  if (!quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: 'Quantity must be greater than 0' });
  }
  if (!asking_price || Number(asking_price) <= 0) {
    return res.status(400).json({ error: 'Asking price must be greater than 0' });
  }
  if (!taluka || !taluka.trim()) {
    return res.status(400).json({ error: 'Taluka is required' });
  }

  const cleanVillage = village && village.trim() ? village.trim() : (req.user.village || 'Village Center');
  const cleanTaluka = taluka.trim();
  const cleanDate = available_until || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const result = db.prepare(`
    INSERT INTO listings (farmer_id, crop_id, quantity, unit, asking_price, price_unit, village, taluka, district, available_until, photo_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Nashik', ?, ?, 'active')
  `).run(
    req.user.id,
    Number(crop_id),
    Number(quantity),
    unit,
    Number(asking_price),
    price_unit,
    cleanVillage,
    cleanTaluka,
    cleanDate,
    photo_url || null
  );

  const newListing = db.prepare('SELECT * FROM listings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newListing);
});

// PATCH /listings/:id (Farmer edit or update status)
router.patch('/:id', authenticate, (req, res) => {
  const listingId = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);

  if (!existing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  if (existing.farmer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only edit your own listings' });
  }

  const { quantity, asking_price, status, available_until, village, taluka } = req.body;

  const updatedQuantity = quantity !== undefined ? Number(quantity) : existing.quantity;
  const updatedPrice = asking_price !== undefined ? Number(asking_price) : existing.asking_price;
  const updatedStatus = status || existing.status;
  const updatedDate = available_until || existing.available_until;
  const updatedVillage = village || existing.village;
  const updatedTaluka = taluka || existing.taluka;

  db.prepare(`
    UPDATE listings
    SET quantity = ?, asking_price = ?, status = ?, available_until = ?, village = ?, taluka = ?
    WHERE id = ?
  `).run(updatedQuantity, updatedPrice, updatedStatus, updatedDate, updatedVillage, updatedTaluka, listingId);

  const updatedListing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);
  res.json(updatedListing);
});

// DELETE /listings/:id
router.delete('/:id', authenticate, (req, res) => {
  const listingId = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);

  if (!existing) {
    return res.status(404).json({ error: 'Listing not found' });
  }

  if (existing.farmer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You can only delete your own listings' });
  }

  db.prepare('DELETE FROM listings WHERE id = ?').run(listingId);
  res.json({ success: true, message: 'Listing deleted successfully' });
});

// POST /listings/:id/enquiries (Buyer enquiry)
router.post('/:id/enquiries', authenticate, requireRole('buyer'), (req, res) => {
  const listingId = Number(req.params.id);
  const { quantity_wanted, message } = req.body;

  const listing = db.prepare('SELECT * FROM listings WHERE id = ?').get(listingId);
  if (!listing) {
    return res.status(404).json({ error: 'Listing not found' });
  }
  if (listing.status !== 'active') {
    return res.status(400).json({ error: 'This listing is no longer active' });
  }

  if (!quantity_wanted || Number(quantity_wanted) <= 0) {
    return res.status(400).json({ error: 'Please enter a valid quantity wanted' });
  }

  const result = db.prepare(`
    INSERT INTO enquiries (listing_id, buyer_id, quantity_wanted, message, status)
    VALUES (?, ?, ?, ?, 'new')
  `).run(
    listingId,
    req.user.id,
    Number(quantity_wanted),
    message ? message.trim() : null
  );

  const enquiry = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(enquiry);
});

export default router;
