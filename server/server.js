import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './db/db.js';
import authRoutes from './routes/auth.js';
import cropsRoutes from './routes/crops.js';
import mandiRoutes from './routes/mandi.js';
import listingsRoutes from './routes/listings.js';
import meRoutes from './routes/me.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize SQLite database
initDatabase();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/crops', cropsRoutes);
app.use('/api/mandi-prices', mandiRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api/me', meRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'AgriConnect API',
    region: 'Nashik, Maharashtra',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal server error: ' + err.message });
});

app.listen(PORT, () => {
  console.log(`🌾 AgriConnect API backend running on http://localhost:${PORT}`);
});
