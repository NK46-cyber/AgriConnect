import express from 'express';
import db from '../db/db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const crops = db.prepare('SELECT * FROM crops ORDER BY id ASC').all();
  res.json(crops);
});

export default router;
