-- AgriConnect SQLite Database Schema

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  role TEXT CHECK(role IN ('farmer', 'buyer', 'admin')) NOT NULL DEFAULT 'farmer',
  buyer_type TEXT CHECK(buyer_type IN ('retailer', 'hotel', 'hostel', 'bulk', 'household') OR buyer_type IS NULL),
  language TEXT CHECK(language IN ('en', 'mr', 'hi')) NOT NULL DEFAULT 'mr',
  village TEXT,
  taluka TEXT,
  district TEXT DEFAULT 'Nashik',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name_en TEXT NOT NULL,
  name_mr TEXT NOT NULL,
  name_hi TEXT NOT NULL,
  unit_default TEXT CHECK(unit_default IN ('kg', 'quintal')) NOT NULL DEFAULT 'kg',
  category TEXT NOT NULL DEFAULT 'vegetable',
  icon_name TEXT DEFAULT 'sprout'
);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  crop_id INTEGER NOT NULL REFERENCES crops(id),
  quantity REAL NOT NULL,
  unit TEXT CHECK(unit IN ('kg', 'quintal')) NOT NULL DEFAULT 'kg',
  asking_price REAL NOT NULL,
  price_unit TEXT CHECK(price_unit IN ('kg', 'quintal')) NOT NULL DEFAULT 'kg',
  village TEXT NOT NULL,
  taluka TEXT NOT NULL,
  district TEXT DEFAULT 'Nashik',
  available_until DATE NOT NULL,
  photo_url TEXT,
  status TEXT CHECK(status IN ('active', 'sold', 'expired')) NOT NULL DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS enquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quantity_wanted REAL NOT NULL,
  message TEXT,
  status TEXT CHECK(status IN ('new', 'contacted', 'closed')) NOT NULL DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mandi_prices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_id INTEGER NOT NULL REFERENCES crops(id),
  market_name TEXT NOT NULL,
  district TEXT DEFAULT 'Nashik',
  min_price REAL NOT NULL,
  modal_price REAL NOT NULL,
  max_price REAL NOT NULL,
  unit TEXT DEFAULT 'kg',
  price_date DATE NOT NULL,
  source TEXT DEFAULT 'APMC Nashik / Lasalgaon (Sample data)'
);
