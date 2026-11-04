import express from 'express';
import db from '../db/db.js';
import {
  RealMandiPriceProvider,
  calculateMandiComparison
} from '../providers/mandiProvider.js';

const router = express.Router();
const provider = new RealMandiPriceProvider(db);

// GET /mandi-prices?crop_id&district
router.get('/', async (req, res) => {
  try {
    const { crop_id, district = 'Nashik' } = req.query;

    if (crop_id && !Number.isInteger(Number(crop_id))) {
      return res.status(400).json({
        error: 'Invalid crop_id'
      });
    }

    if (crop_id) {
      const price = await provider.getPrice(
        Number(crop_id),
        district
      );

      if (!price) {
        return res.status(404).json({
          error: 'Mandi price not found'
        });
      }

      return res.json(price);
    }

    const allPrices = await provider.getAllPrices(district);
    return res.json(allPrices);

  } catch (error) {
    console.error('Mandi route error:', error.message);

    return res.status(502).json({
      error: 'Unable to fetch mandi prices'
    });
  }
});

// GET /mandi-prices/compare
router.get('/compare', (req, res) => {
  const { asking_price, modal_price } = req.query;

  if (
    asking_price === undefined ||
    modal_price === undefined ||
    !Number.isFinite(Number(asking_price)) ||
    !Number.isFinite(Number(modal_price)) ||
    Number(asking_price) < 0 ||
    Number(modal_price) < 0
  ) {
    return res.status(400).json({
      error: 'Valid asking_price and modal_price are required'
    });
  }

  const result = calculateMandiComparison(
    Number(asking_price),
    Number(modal_price)
  );

  res.json(result);
});

export default router;
