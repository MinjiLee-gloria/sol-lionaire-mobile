/**
 * Price Data Service - Sol-lionaire
 *
 * SOL/USD: CoinGecko public API (no key required, real-time)
 * Fallback: last known price → 0 (shows "--" in UI rather than wrong price)
 */

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd';

class PriceDataService {
  constructor() {
    this.cache = {
      solPrice: 0,
      lastUpdate: 0,
    };
    this.CACHE_DURATION = 30_000; // 30 seconds
  }

  async fetchSolPrice() {
    const now = Date.now();

    // Return cached price if still fresh
    if (this.cache.solPrice && now - this.cache.lastUpdate < this.CACHE_DURATION) {
      return this.cache.solPrice;
    }

    try {
      const response = await fetch(COINGECKO_URL, {
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error(`CoinGecko HTTP ${response.status}`);

      const data = await response.json();
      const price = data?.solana?.usd;

      if (!price || typeof price !== 'number') {
        throw new Error('Invalid price data from CoinGecko');
      }

      this.cache.solPrice = price;
      this.cache.lastUpdate = now;
      console.log('💰 SOL price (CoinGecko):', price);
      return price;
    } catch (error) {
      console.error('❌ CoinGecko fetch failed:', error);
      // Return last cached value if available, otherwise fallback
      return this.cache.solPrice || 0;
    }
  }

  async fetchPricePerSqm(cityType) {
    // Real estate benchmarks (premium residential, Q1 2026)
    // Manhattan: ~$23,000/m² (condo avg, Miller Samuel Q4 2025 ×10.764)
    // Dubai: ~$9,000/m² (premium areas avg, 2026)
    const basePrices = {
      MANHATTAN: 23000,
      DUBAI: 9000,
    };
    return basePrices[cityType] ?? 10000;
  }

  async fetchAllPrices(cityType) {
    const [solPrice, pricePerSqm] = await Promise.all([
      this.fetchSolPrice(),
      this.fetchPricePerSqm(cityType),
    ]);
    return { solPrice, pricePerSqm, timestamp: new Date().toISOString() };
  }
}

export const priceDataService = new PriceDataService();
export default priceDataService;
