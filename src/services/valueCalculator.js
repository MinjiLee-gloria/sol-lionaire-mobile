/**
 * Value Calculator - Sol-lionaire
 * 10-Level Hyper-Real Ownership System
 * Tier thresholds based on total USD value (SOL × price).
 */

export const CityType = {
  MANHATTAN: 'MANHATTAN',
  DUBAI: 'DUBAI',
};

export const CITY_CONFIG = {
  MANHATTAN: {
    pricePerSqm: 23000,      // Miller Samuel Q4 2025 avg condo ×10.764 ≈ $23k/m²
    currency: 'USD',
    lastUpdated: '2026-01',
    source: 'Manhattan Market Report (Miller Samuel Q4 2025)',
    label: 'New York',
    emoji: '🗽',
    tone: 'cold',
  },
  DUBAI: {
    pricePerSqm: 9000,       // Premium areas avg 2026, Dubai Land Department
    currency: 'USD',
    lastUpdated: '2026-01',
    source: 'Dubai Land Department (DLD) 2026',
    label: 'Dubai',
    emoji: '🏙️',
    tone: 'warm',
  },
};

// 10-Level Property System — thresholds in USD (SOL × live price)
export const PROPERTY_TIERS = [
  {
    id: 'level1',
    level: 1,
    minUSD: 0,
    maxUSD: 500,
    color: '#4A4A4A',
    names: {
      MANHATTAN: 'Times Square Mini Neon Slot',
      DUBAI: 'Desert Oasis Gold Plot',
    },
    descriptions: {
      MANHATTAN: 'Personal message on Times Square neon, 24-hour rental up to $500',
      DUBAI: 'Low-cost desert mini plot — simulated ownership',
    },
    locations: {
      MANHATTAN: 'Times Square, Manhattan',
      DUBAI: 'Dubai Desert',
    },
    narratives: {
      MANHATTAN: 'Your first pixel in the skyline.',
      DUBAI: 'A miracle starts in the sand.',
    },
    imageKey: {
      MANHATTAN: 'ny_level1',
      DUBAI: 'db_level1',
    },
  },
  {
    id: 'level2',
    level: 2,
    minUSD: 500,
    maxUSD: 3000,
    color: '#5A5A5A',
    names: {
      MANHATTAN: 'Subway Ad Panel',
      DUBAI: 'Gold Souk Mini Stall',
    },
    descriptions: {
      MANHATTAN: 'Premium subway ad panel, 1-month rental up to $3,000',
      DUBAI: 'Gold Souk mini stall rental, 1–3 months up to $3,000',
    },
    locations: {
      MANHATTAN: 'New York City Subway',
      DUBAI: 'Dubai Gold Souk',
    },
    narratives: {
      MANHATTAN: "Your message runs through NYC's veins.",
      DUBAI: 'Claim your corner in the City of Gold.',
    },
    imageKey: {
      MANHATTAN: 'ny_level2',
      DUBAI: 'db_level2',
    },
  },
  {
    id: 'level3',
    level: 3,
    minUSD: 3000,
    maxUSD: 100000,
    color: '#6A6A6A',
    names: {
      MANHATTAN: 'Wall Street Gold Vault Box',
      DUBAI: 'Dubai Marina Private Parking Stall',
    },
    descriptions: {
      MANHATTAN: 'Private vault box in the Financial District — annual lease up to $100k',
      DUBAI: 'Private deeded parking stall at Dubai Marina — up to $100k',
    },
    locations: {
      MANHATTAN: 'Wall Street, Financial District',
      DUBAI: 'Dubai Marina',
    },
    narratives: {
      MANHATTAN: "Wall Street's heartbeat, now yours.",
      DUBAI: 'Your anchor in the heart of the Marina.',
    },
    imageKey: {
      MANHATTAN: 'ny_level3',
      DUBAI: 'db_level3',
    },
  },
  {
    id: 'level4',
    level: 4,
    minUSD: 100000,
    maxUSD: 300000,
    color: '#7D7D7D',
    names: {
      MANHATTAN: "Hell's Kitchen Private Parking Spot",
      DUBAI: 'Dubai Marina Yacht Mooring Berth',
    },
    descriptions: {
      MANHATTAN: "Premium deeded parking spot in Hell's Kitchen — up to $300k",
      DUBAI: 'Private yacht mooring berth at Dubai Marina — up to $300k',
    },
    locations: {
      MANHATTAN: "Hell's Kitchen, Manhattan",
      DUBAI: 'Dubai Marina',
    },
    narratives: {
      MANHATTAN: 'Your private space in NYC.',
      DUBAI: 'The ocean is your new driveway.',
    },
    imageKey: {
      MANHATTAN: 'ny_level4',
      DUBAI: 'db_level4',
    },
  },
  {
    id: 'level5',
    level: 5,
    minUSD: 300000,
    maxUSD: 750000,
    color: '#8F8F8F',
    names: {
      MANHATTAN: 'Brooklyn Heights Gold Rooftop Studio',
      DUBAI: 'JBR Beachfront Gold Studio',
    },
    descriptions: {
      MANHATTAN: 'Premium rooftop studio in Brooklyn Heights — up to $750k',
      DUBAI: 'Beachfront gold studio at Jumeirah Beach Residence — up to $750k',
    },
    locations: {
      MANHATTAN: 'Brooklyn Heights',
      DUBAI: 'Jumeirah Beach Residence (JBR)',
    },
    narratives: {
      MANHATTAN: 'Own the Brooklyn sunset.',
      DUBAI: 'Sun, sea, and your own slice of the beach.',
    },
    imageKey: {
      MANHATTAN: 'ny_level5',
      DUBAI: 'db_level5',
    },
  },
  {
    id: 'level6',
    level: 6,
    minUSD: 750000,
    maxUSD: 1500000,
    color: '#A8A8A8',
    names: {
      MANHATTAN: 'Chelsea High-Rise Gold 1-Bed Condo',
      DUBAI: 'Palm Jumeirah Gold Sky 1-Bed',
    },
    descriptions: {
      MANHATTAN: 'Luxury high-rise 1-bedroom in Chelsea — up to $1.5M',
      DUBAI: 'Sky-high Palm Jumeirah 1-bedroom residence — up to $1.5M',
    },
    locations: {
      MANHATTAN: 'Chelsea, Manhattan',
      DUBAI: 'Palm Jumeirah',
    },
    narratives: {
      MANHATTAN: 'You have arrived in the heart of culture.',
      DUBAI: 'Living above the miracle of the Palm.',
    },
    imageKey: {
      MANHATTAN: 'ny_level6',
      DUBAI: 'db_level6',
    },
  },
  {
    id: 'level7',
    level: 7,
    minUSD: 1500000,
    maxUSD: 3500000,
    color: '#C0C0C0',
    names: {
      MANHATTAN: 'SoHo Artist Gold 2-Bed Loft',
      DUBAI: 'Palm Arabian Gold Sea-view 2-Bed Suite',
    },
    descriptions: {
      MANHATTAN: 'Spacious 2-bedroom SoHo artist loft — up to $3.5M',
      DUBAI: '2-bed suite with full Arabian Sea panorama on the Palm — up to $3.5M',
    },
    locations: {
      MANHATTAN: 'SoHo, Manhattan',
      DUBAI: 'Palm Jumeirah Frond',
    },
    narratives: {
      MANHATTAN: 'History and modernity converge under your ownership.',
      DUBAI: 'The iconic palm is yours to behold.',
    },
    imageKey: {
      MANHATTAN: 'ny_level7',
      DUBAI: 'db_level7',
    },
  },
  {
    id: 'level8',
    level: 8,
    minUSD: 3500000,
    maxUSD: 15000000,
    color: '#D4AF37',
    names: {
      MANHATTAN: 'Central Park South Gold Penthouse',
      DUBAI: 'Palm Frond Signature Gold Villa',
    },
    descriptions: {
      MANHATTAN: 'Full-floor penthouse overlooking Central Park — up to $15M',
      DUBAI: 'Private frond villa with infinity pool on the Palm — up to $15M',
    },
    locations: {
      MANHATTAN: 'Central Park South',
      DUBAI: 'Palm Jumeirah Private Frond',
    },
    narratives: {
      MANHATTAN: 'Central Park is your front yard.',
      DUBAI: 'Private paradise where sand meets sea.',
    },
    imageKey: {
      MANHATTAN: 'ny_level8',
      DUBAI: 'db_level8',
    },
  },
  {
    id: 'level9',
    level: 9,
    minUSD: 15000000,
    maxUSD: 20000000,
    color: '#E8C96A',
    names: {
      MANHATTAN: "Billionaires' Row Gold Trophy Penthouse",
      DUBAI: 'Emirates Hills Gold-Leaf Manor',
    },
    descriptions: {
      MANHATTAN: "Trophy penthouse on Billionaires' Row — up to $20M",
      DUBAI: 'Grand gold-leaf manor in Emirates Hills gated community — up to $20M',
    },
    locations: {
      MANHATTAN: "Billionaires' Row, Manhattan",
      DUBAI: 'Emirates Hills',
    },
    narratives: {
      MANHATTAN: 'The pinnacle of the 0.01%.',
      DUBAI: 'Royal treatment is your new standard.',
    },
    imageKey: {
      MANHATTAN: 'ny_level9',
      DUBAI: 'db_level9',
    },
  },
  {
    id: 'level10',
    level: 10,
    minUSD: 20000000,
    maxUSD: Infinity,
    color: '#FFD700',
    names: {
      MANHATTAN: 'Apex Empire Crown',
      DUBAI: 'Sovereign Burj Gold Sky Palace',
    },
    descriptions: {
      MANHATTAN: 'Empire State Gold Crown Landmark — simulated ownership, $20M+ reality basis',
      DUBAI: 'Burj Khalifa Sovereign Gold Sky Palace — simulated ownership, $20M+ reality basis',
    },
    locations: {
      MANHATTAN: 'Empire State Building, Manhattan',
      DUBAI: 'Burj Khalifa District',
    },
    narratives: {
      MANHATTAN: 'You are not just in New York. You ARE New York.',
      DUBAI: 'Beyond the limits. You are the Empire.',
    },
    imageKey: {
      MANHATTAN: 'ny_level10',
      DUBAI: 'db_level10',
    },
  },
];

class ValueCalculator {
  // Primary lookup — based on total USD value (SOL × live price)
  getTierForUSD(usdAmount) {
    const amount = (typeof usdAmount === 'number' && isFinite(usdAmount) && usdAmount >= 0)
      ? usdAmount : 0;
    return PROPERTY_TIERS.find(t => amount >= t.minUSD && amount < t.maxUSD) || PROPERTY_TIERS[0];
  }

  getTierByLevel(level) {
    return PROPERTY_TIERS.find(t => t.level === level) ?? PROPERTY_TIERS[0];
  }

  // 10% stability buffer — prevents rapid level yo-yo when USD value
  // hovers around a threshold. Only downgrades once value drops 10% below
  // the held tier's entry point.
  getTierForUSDBuffered(usdAmount, prevLevel = null) {
    const naturalTier = this.getTierForUSD(usdAmount);
    if (prevLevel === null || naturalTier.level >= prevLevel) {
      return naturalTier;
    }
    const heldTier   = this.getTierByLevel(prevLevel);
    const bufferLine = heldTier.minUSD * 0.9;
    return usdAmount >= bufferLine ? heldTier : naturalTier;
  }

  getPercentile(usdAmount) {
    if (!usdAmount || usdAmount < 1) return 'Newcomer';

    // 2026 Q1 SOL holder distribution — dust-excluded.
    // Comparison universe: wallets holding meaningful SOL (≥$1), excluding
    // empty accounts, airdrop-farm dust, and spam wallets (~300M+ addresses).
    // Among the ~15M non-dust holders, log-interpolated between anchor points.
    // Each point: { usd: threshold, topPercent: % of non-dust holders above that value }
    const DIST = [
      { usd: 1,        topPercent: 97.00 },  // $1: barely above dust floor
      { usd: 10,       topPercent: 85.00 },  // $10: ~0.1 SOL, entry-level holder
      { usd: 100,      topPercent: 60.00 },  // $100: ~1 SOL, casual holder
      { usd: 1000,     topPercent: 25.00 },  // $1K: ~11 SOL, committed holder
      { usd: 10000,    topPercent:  6.00 },  // $10K: ~110 SOL, serious holder
      { usd: 100000,   topPercent:  1.20 },  // $100K: ~1100 SOL
      { usd: 1000000,  topPercent:  0.20 },  // $1M: ~11K SOL
      { usd: 10000000, topPercent:  0.03 },  // $10M
      { usd: 50000000, topPercent:  0.01 },  // $50M
    ];

    if (usdAmount >= DIST[DIST.length - 1].usd) return `Top ${DIST[DIST.length - 1].topPercent}%`;

    for (let i = 0; i < DIST.length - 1; i++) {
      const lo = DIST[i];
      const hi = DIST[i + 1];
      if (usdAmount >= lo.usd && usdAmount < hi.usd) {
        const logLo  = Math.log(lo.usd);
        const logHi  = Math.log(hi.usd);
        const logVal = Math.log(usdAmount);
        const t      = (logVal - logLo) / (logHi - logLo);
        const pct    = lo.topPercent - t * (lo.topPercent - hi.topPercent);
        // Round to 1 decimal for display; hide trailing .0
        const rounded = Math.round(pct * 10) / 10;
        return `Top ${rounded % 1 === 0 ? rounded.toFixed(0) : rounded}%`;
      }
    }

    return 'Newcomer';
  }

  calculateStarProgress(usdAmount, tier) {
    const range = tier.maxUSD === Infinity ? tier.minUSD * 2 : tier.maxUSD - tier.minUSD;
    const progress = ((usdAmount - tier.minUSD) / range) * 100;
    const clampedProgress = Math.min(Math.max(progress, 0), 99.9);
    let stars = 0;
    if (clampedProgress >= 67) stars = 3;
    else if (clampedProgress >= 34) stars = 2;
    else stars = 1;
    return {
      progress: clampedProgress,
      stars,
      starsDisplay: '★'.repeat(stars) + '☆'.repeat(3 - stars),
    };
  }

  // _tierOverride: pre-computed buffered tier from getTierForUSDBuffered()
  determineMapping({ solAmount, solPrice, cityType = 'MANHATTAN', _tierOverride = null }) {
    const totalUSD = solAmount * solPrice;
    const tier     = _tierOverride ?? this.getTierForUSD(totalUSD);
    const city     = CITY_CONFIG[cityType];
    const starInfo = this.calculateStarProgress(totalUSD, tier);
    const percentile = this.getPercentile(totalUSD);
    const upgrade    = this.calculateUpgrade({ solAmount, solPrice, cityType, _tierOverride: tier });

    return {
      totalValue: totalUSD,
      cityType,
      tier,
      level: tier.level,
      propertyName: tier.names[cityType],
      location: tier.locations[cityType],
      narrative: tier.narratives[cityType],
      description: tier.descriptions[cityType],
      imageKey: tier.imageKey[cityType],
      sqm: (totalUSD / city.pricePerSqm).toFixed(2),
      starProgress: starInfo,
      percentile,
      upgrade,
    };
  }

  // _tierOverride: pass buffered tier so progress bar matches displayed tier
  calculateUpgrade({ solAmount, solPrice, cityType = 'MANHATTAN', _tierOverride = null }) {
    const totalUSD   = solAmount * solPrice;
    const currentTier = _tierOverride ?? this.getTierForUSD(totalUSD);
    const currentIndex = PROPERTY_TIERS.indexOf(currentTier);
    const nextTier     = PROPERTY_TIERS[currentIndex + 1];

    if (!nextTier) {
      return {
        message: '👑 Maximum level reached.',
        solNeeded: 0,
        usdNeeded: 0,
        nextTier: null,
        currentTier,
        progress: 100,
      };
    }

    const usdNeeded = Math.max(0, nextTier.minUSD - totalUSD);
    const solNeeded = solPrice > 0 ? usdNeeded / solPrice : 0;
    const progress  = ((totalUSD - currentTier.minUSD) / (nextTier.minUSD - currentTier.minUSD)) * 100;

    return {
      solNeeded,
      usdNeeded,
      nextTier,
      currentTier,
      progress: Math.min(Math.max(progress, 0), 99),
    };
  }
}

export const valueCalculator = new ValueCalculator();
export default valueCalculator;
