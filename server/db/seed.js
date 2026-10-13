import db, { initDatabase } from './db.js';

export function runSeed() {
  console.log('--- Initializing database schema ---');
  initDatabase();

  console.log('--- Clearing existing data ---');
  // Disable foreign keys temporarily for clean reset
  db.exec('PRAGMA foreign_keys = OFF;');
  db.exec('DELETE FROM enquiries;');
  db.exec('DELETE FROM listings;');
  db.exec('DELETE FROM mandi_prices;');
  db.exec('DELETE FROM crops;');
  db.exec('DELETE FROM users;');
  db.exec('PRAGMA foreign_keys = ON;');

  console.log('--- Seeding Crops ---');
  const insertCrop = db.prepare(`
    INSERT INTO crops (id, name_en, name_mr, name_hi, unit_default, category, icon_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const crops = [
    [1, 'Onion', 'कांदा', 'प्याज', 'kg', 'vegetable', 'onion'],
    [2, 'Tomato', 'टोमॅटो', 'टमाटर', 'kg', 'vegetable', 'tomato'],
    [3, 'Grapes', 'द्राक्षे', 'अंगूर', 'kg', 'fruit', 'grapes'],
    [4, 'Pomegranate', 'डाळिंब', 'अनार', 'kg', 'fruit', 'pomegranate'],
    [5, 'Potato', 'बटाटा', 'आलू', 'kg', 'vegetable', 'potato'],
    [6, 'Cabbage', 'कोबी', 'पत्तागोभी', 'kg', 'vegetable', 'cabbage'],
    [7, 'Cauliflower', 'फ्लॉवर', 'फूलगोभी', 'kg', 'vegetable', 'cauliflower'],
    [8, 'Brinjal', 'वांगी', 'बैंगन', 'kg', 'vegetable', 'brinjal'],
    [9, 'Soybean', 'सोयाबीन', 'सोयाबीन', 'quintal', 'grain', 'soybean'],
    [10, 'Wheat', 'गहू', 'गेहूं', 'quintal', 'grain', 'wheat']
  ];

  const insertManyCrops = db.transaction((cropList) => {
    for (const c of cropList) {
      insertCrop.run(...c);
    }
  });
  insertManyCrops(crops);

  console.log('--- Seeding Mandi Prices (Sample Data) ---');
  const today = new Date().toISOString().split('T')[0];
  const insertMandi = db.prepare(`
    INSERT INTO mandi_prices (crop_id, market_name, district, min_price, modal_price, max_price, unit, price_date, source)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const mandiPrices = [
    [1, 'Lasalgaon APMC', 'Nashik', 14, 18, 22, 'kg', today, 'APMC Lasalgaon (Sample data)'],
    [2, 'Nashik APMC', 'Nashik', 16, 22, 28, 'kg', today, 'APMC Nashik (Sample data)'],
    [3, 'Pimpalgaon APMC', 'Nashik', 45, 60, 75, 'kg', today, 'APMC Pimpalgaon (Sample data)'],
    [4, 'Kalwan APMC', 'Nashik', 70, 95, 120, 'kg', today, 'APMC Kalwan (Sample data)'],
    [5, 'Nashik APMC', 'Nashik', 18, 24, 30, 'kg', today, 'APMC Nashik (Sample data)'],
    [6, 'Sinnar APMC', 'Nashik', 10, 14, 18, 'kg', today, 'APMC Sinnar (Sample data)'],
    [7, 'Niphad APMC', 'Nashik', 15, 20, 26, 'kg', today, 'APMC Niphad (Sample data)'],
    [8, 'Dindori APMC', 'Nashik', 18, 25, 32, 'kg', today, 'APMC Dindori (Sample data)'],
    [9, 'Yeola APMC', 'Nashik', 4200, 4600, 4950, 'quintal', today, 'APMC Yeola (Sample data)'],
    [10, 'Nashik APMC', 'Nashik', 2400, 2750, 3100, 'quintal', today, 'APMC Nashik (Sample data)']
  ];

  const insertManyMandi = db.transaction((list) => {
    for (const m of list) {
      insertMandi.run(...m);
    }
  });
  insertManyMandi(mandiPrices);

  console.log('--- Seeding Demo Users ---');
  const insertUser = db.prepare(`
    INSERT INTO users (id, name, mobile, role, buyer_type, language, village, taluka, district)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    // 3 Demo Farmers
    [1, 'Ramesh Patil', '9822011111', 'farmer', null, 'mr', 'Kundewadi', 'Niphad', 'Nashik'],
    [2, 'Sunita Shinde', '9822022222', 'farmer', null, 'mr', 'Musalgaon', 'Sinnar', 'Nashik'],
    [3, 'Dnyaneshwar Borde', '9822033333', 'farmer', null, 'mr', 'Vani', 'Dindori', 'Nashik'],
    // 3 Demo Buyers
    [4, 'Anand Mess & Hostel', '9822044444', 'buyer', 'hostel', 'en', 'Gangapur Road', 'Nashik', 'Nashik'],
    [5, 'Hotel Panchavati', '9822055555', 'buyer', 'hotel', 'en', 'Panchavati', 'Nashik', 'Nashik'],
    [6, 'Kisan Fresh Mart', '9822066666', 'buyer', 'retailer', 'mr', 'Pimpalgaon Baswant', 'Niphad', 'Nashik'],
    // Admin
    [7, 'Anushka Jadhav (Admin)', '9822077777', 'admin', null, 'en', 'Nashik City', 'Nashik', 'Nashik']
  ];

  const insertManyUsers = db.transaction((uList) => {
    for (const u of uList) {
      insertUser.run(...u);
    }
  });
  insertManyUsers(users);

  console.log('--- Seeding 12 Demo Listings Across Nashik Talukas ---');
  const insertListing = db.prepare(`
    INSERT INTO listings (id, farmer_id, crop_id, quantity, unit, asking_price, price_unit, village, taluka, district, available_until, photo_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, date('now', ?), ?, ?)
  `);

  const listings = [
    // 1. Onion Niphad - matches demo script! 18 Rs/kg vs 18 modal (Near mandi)
    [1, 1, 1, 500, 'kg', 18, 'kg', 'Kundewadi', 'Niphad', 'Nashik', '+7 days', '/crops/onion.svg', 'active'],
    // 2. Tomato Niphad - 19 Rs/kg vs 22 modal (Below mandi - saving for buyers!)
    [2, 1, 2, 300, 'kg', 19, 'kg', 'Kundewadi', 'Niphad', 'Nashik', '+4 days', '/crops/tomato.svg', 'active'],
    // 3. Grapes Niphad - 68 Rs/kg vs 60 modal (Above mandi - export grade)
    [3, 1, 3, 1000, 'kg', 68, 'kg', 'Pimpalgaon', 'Niphad', 'Nashik', '+10 days', '/crops/grapes.svg', 'active'],
    // 4. Pomegranate Sinnar - 85 Rs/kg vs 95 modal (Below mandi)
    [4, 2, 4, 400, 'kg', 85, 'kg', 'Musalgaon', 'Sinnar', 'Nashik', '+8 days', '/crops/pomegranate.svg', 'active'],
    // 5. Cabbage Sinnar - 14 Rs/kg vs 14 modal (Near mandi)
    [5, 2, 6, 800, 'kg', 14, 'kg', 'Musalgaon', 'Sinnar', 'Nashik', '+5 days', '/crops/cabbage.svg', 'active'],
    // 6. Soybean Sinnar - 4500 Rs/quintal vs 4600 modal (Near mandi)
    [6, 2, 9, 25, 'quintal', 4500, 'quintal', 'Panchale', 'Sinnar', 'Nashik', '+20 days', '/crops/soybean.svg', 'active'],
    // 7. Tomato Dindori - 21 Rs/kg vs 22 modal (Near mandi)
    [7, 3, 2, 600, 'kg', 21, 'kg', 'Vani', 'Dindori', 'Nashik', '+5 days', '/crops/tomato.svg', 'active'],
    // 8. Potato Dindori - 21 Rs/kg vs 24 modal (Below mandi - good saving)
    [8, 3, 5, 1200, 'kg', 21, 'kg', 'Mohadi', 'Dindori', 'Nashik', '+14 days', '/crops/potato.svg', 'active'],
    // 9. Cauliflower Dindori - 24 Rs/kg vs 20 modal (Above mandi)
    [9, 3, 7, 450, 'kg', 24, 'kg', 'Vani', 'Dindori', 'Nashik', '+4 days', '/crops/cauliflower.svg', 'active'],
    // 10. Brinjal Niphad - 22 Rs/kg vs 25 modal (Below mandi)
    [10, 1, 8, 250, 'kg', 22, 'kg', 'Ozar', 'Niphad', 'Nashik', '+5 days', '/crops/brinjal.svg', 'active'],
    // 11. Wheat Sinnar - 2700 Rs/quintal vs 2750 modal (Near mandi)
    [11, 2, 10, 40, 'quintal', 2700, 'quintal', 'Musalgaon', 'Sinnar', 'Nashik', '+30 days', '/crops/wheat.svg', 'active'],
    // 12. Onion Igatpuri - 16 Rs/kg vs 18 modal (Below mandi)
    [12, 3, 1, 1500, 'kg', 16, 'kg', 'Ghoti', 'Igatpuri', 'Nashik', '+9 days', '/crops/onion.svg', 'active']
  ];

  const insertManyListings = db.transaction((lList) => {
    for (const l of lList) {
      insertListing.run(...l);
    }
  });
  insertManyListings(listings);

  console.log('--- Seeding Demo Enquiries ---');
  const insertEnquiry = db.prepare(`
    INSERT INTO enquiries (id, listing_id, buyer_id, quantity_wanted, message, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const enquiries = [
    [1, 1, 4, 200, 'Need 200 kg high-quality onion for hostel kitchen mess this weekend. Can pick up.', 'new'],
    [2, 2, 5, 100, 'Fresh tomato requirement for hotel salad bar. Please confirm morning supply.', 'contacted'],
    [3, 4, 6, 150, 'Looking for Bhagwa pomegranate crate lot for our Pimpalgaon retail mart.', 'new']
  ];

  const insertManyEnquiries = db.transaction((eList) => {
    for (const e of eList) {
      insertEnquiry.run(...e);
    }
  });
  insertManyEnquiries(enquiries);

  console.log('--- Seed Completed Successfully! ---');
  console.log('Summary: 10 crops, 10 mandi prices, 7 users (3 farmers, 3 buyers, 1 admin), 12 listings, 3 enquiries.');
}

// Run directly if invoked via node
if (process.argv[1].endsWith('seed.js')) {
  runSeed();
}
