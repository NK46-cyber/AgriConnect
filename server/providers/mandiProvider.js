/**
 * MandiPriceProvider Interface and Implementations
 * Provides benchmark APMC market prices for Nashik district crops.
 */

export class MandiPriceProvider {
  /**
   * @param {number} cropId
   * @param {string} [district='Nashik']
   * @returns {Promise<{min_price: number, modal_price: number, max_price: number, unit: string, price_date: string, market_name: string, source: string} | null>}
   */
  async getPrice(cropId, district = 'Nashik') {
    throw new Error('Method getPrice() must be implemented');
  }

  /**
   * @param {string} [district='Nashik']
   * @returns {Promise<Array>}
   */
  async getAllPrices(district = 'Nashik') {
    throw new Error('Method getAllPrices() must be implemented');
  }
}

/**
 * MockMandiPriceProvider
 * Uses seeded realistic APMC price benchmarks for Nashik region markets.
 * Explicitly labeled as "Sample data" per project specification.
 */
export class MockMandiPriceProvider extends MandiPriceProvider {
  constructor(db) {
    super();
    this.db = db;
  }

  async getPrice(cropId, district = 'Nashik') {
    const row = this.db.prepare(`
      SELECT mp.*, c.name_en, c.name_mr, c.name_hi
      FROM mandi_prices mp
      JOIN crops c ON mp.crop_id = c.id
      WHERE mp.crop_id = ? AND mp.district = ?
      ORDER BY mp.price_date DESC
      LIMIT 1
    `).get(cropId, district);
    return row || null;
  }

  async getAllPrices(district = 'Nashik') {
    return this.db.prepare(`
      SELECT mp.*, c.name_en, c.name_mr, c.name_hi, c.category
      FROM mandi_prices mp
      JOIN crops c ON mp.crop_id = c.id
      WHERE mp.district = ?
      ORDER BY c.name_en ASC
    `).all(district);
  }
}

/**
 * RealMandiPriceProvider
 * Fetches actual reported prices from Nashik Mandi API.
 */
export class RealMandiPriceProvider extends MandiPriceProvider {
  constructor(db) {
    super();
    this.db = db;
    this.apiUrl =
      "https://mandi-api.onrender.com/v1/prices/history";
    this.commodityMap = {
  "onion": "Onion",
  "tomato": "Tomato",
  "potato": "Potato",
  "grapes": "Grapes",
  "green grapes": "Grapes",
  "wheat": "Wheat",
  "soybean": "Soybean",
  "maize": "Maize",
  "pomegranate": "Pomegranate",
  "garlic": "Garlic"
};
  }

  async fetchHistory(commodity, market = "APMC Nasik ") {
    const params = new URLSearchParams({
      state: "Maharashtra",
      commodity,
      market
    });

    const response = await fetch(
      `${this.apiUrl}?${params.toString()}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(45000)
      }
    );

    if (!response.ok) {
      throw new Error(`Mandi API error: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success || !Array.isArray(result.data)) {
      throw new Error("Invalid mandi API response");
    }

    return result.data
      .sort((a, b) =>
        new Date(b.arrival_date) - new Date(a.arrival_date)
      );
  }

  async getPrice(cropId, district = "Nashik") {
    if (district.toLowerCase() !== "nashik") return null;

    const crop = this.db.prepare(
      "SELECT * FROM crops WHERE id = ?"
    ).get(cropId);

    if (!crop) return null;

    const commodity =
  this.commodityMap[crop.name_en.trim().toLowerCase()];

if (!commodity) {
  return null;
}

const records = await this.fetchHistory(commodity);
    if (!records.length) return null;

    const latest = records[0];

    

const divisor = crop.unit_default === "kg" ? 100 : 1;

return {
  crop_id: cropId,
  commodity: latest.commodity,

  // Prices in the crop's default unit
  min_price: latest.min_price / divisor,
  modal_price: latest.modal_price / divisor,
  max_price: latest.max_price / divisor,

  unit: crop.unit_default,

  // Original API prices in quintals
  min_price_per_quintal: latest.min_price,
  modal_price_per_quintal: latest.modal_price,
  max_price_per_quintal: latest.max_price,

  price_per_kg: latest.modal_price / 100,

  price_date: latest.arrival_date,
  market_name: latest.market,
  variety: latest.variety,
  source: "Nashik Mandi API"
};


  }

  async getAllPrices(district = "Nashik") {
    if (district.toLowerCase() !== "nashik") return [];

    const crops = this.db.prepare(
      "SELECT * FROM crops ORDER BY name_en ASC"
    ).all();

    const prices = [];

    for (const crop of crops) {
      try {
        const price = await this.getPrice(crop.id, district);
        if (price) {
          prices.push({
            ...price,
            name_en: crop.name_en,
            name_mr: crop.name_mr,
            name_hi: crop.name_hi
          });
        }
      } catch (error) {
        console.error(
          `Price unavailable for ${crop.name_en}:`,
          error.message
        );
      }
    }

    return prices;
  }
}


/**
 * Helper to compute price comparison badge and difference percentage
 * @param {number} askingPrice 
 * @param {number} modalPrice 
 * @returns {{ comparison: 'below'|'near'|'above', diffPercent: number, label: string, savingOrPremium: number }}
 */
export function calculateMandiComparison(askingPrice, modalPrice) {
  if (!modalPrice || modalPrice <= 0) {
    return { comparison: 'unknown', diffPercent: 0, label: 'No benchmark', savingOrPremium: 0 };
  }
  
  const diffPercent = ((askingPrice - modalPrice) / modalPrice) * 100;
  const savingOrPremium = Math.abs(askingPrice - modalPrice);

  if (diffPercent < -5) {
    return {
      comparison: 'below',
      diffPercent: Math.round(diffPercent * 10) / 10,
      label: 'Below mandi price',
      savingOrPremium: Math.round(savingOrPremium * 10) / 10
    };
  } else if (diffPercent > 5) {
    return {
      comparison: 'above',
      diffPercent: Math.round(diffPercent * 10) / 10,
      label: 'Above mandi price',
      savingOrPremium: Math.round(savingOrPremium * 10) / 10
    };
  } else {
    return {
      comparison: 'near',
      diffPercent: Math.round(diffPercent * 10) / 10,
      label: 'Near mandi price',
      savingOrPremium: Math.round(savingOrPremium * 10) / 10
    };
  }
}
