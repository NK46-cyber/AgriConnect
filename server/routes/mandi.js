import express from 'express';
import db from '../db/db.js';
import { MockMandiPriceProvider, calculateMandiComparison } from '../providers/mandiProvider.js';

const router = express.Router();
const provider = new MockMandiPriceProvider(db);

// GET /mandi-prices?crop_id&district
router.get('/', async (req, res) => {
  const { crop_id, district = 'Nashik' } = req.query;

  if (crop_id) {
    const price = await provider.getPrice(Number(crop_id), district);
    if (!price) {
      return res.status(404).json({ error: 'Mandi price not found for this crop' });
    }
    return res.json(price);
  }

  const allPrices = await provider.getAllPrices(district);
  return res.json(allPrices);
});

// Helper route to calculate price comparison on the fly
router.get('/compare', (req, res) => {
  const { asking_price, modal_price } = req.query;
  const result = calculateMandiComparison(Number(asking_price), Number(modal_price));
  res.json(result);
});

export default router;
