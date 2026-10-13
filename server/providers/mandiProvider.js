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
