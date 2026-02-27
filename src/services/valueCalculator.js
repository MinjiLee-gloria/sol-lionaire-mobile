/**
 * Value Calculator - Sol-lionaire v0.5
 * 10-Level Hyper-Real Ownership System
 */

export const CityType = {
  MANHATTAN: 'MANHATTAN',
  DUBAI: 'DUBAI',
};

// Real estate price data (Benchmark as of Feb 2024)
export const CITY_CONFIG = {
  MANHATTAN: {
    pricePerSqm: 22000,
    currency: 'USD',
    lastUpdated: '2024-02',
    source: 'Manhattan Market Report',
    label: 'New York',
    emoji: '🗽',
    tone: 'cold',
  },
  DUBAI: {
    pricePerSqm: 7500,
    currency: 'USD',
    lastUpdated: '2024-02',
    source: 'Dubai Land Department (DLD)',
    label: 'Dubai',
    emoji: '🏙️',
    tone: 'warm',
  },
};

// (KRW removed — all values in USD based on real-time Solana price)

// 10-Level Property System — aligned with spec KRW thresholds
export const PROPERTY_TIERS = [
  {
    id: 'level1',
    level: 1,
    minSOL: 0,
    maxSOL: 10,
    minUSD: 140,
    maxUSD: 1480,
    krwLabel: '~₩2M',
    color: '#4A4A4A',
    names: {
      MANHATTAN: 'The Urban Grid (Manhole)',
      DUBAI: 'The Paving Stone (Marina)',
    },
    descriptions: {
      MANHATTAN: 'A deeded manhole cover on the Lower Manhattan grid',
      DUBAI: 'Your name etched in Marina Walk paving stone',
    },
    locations: {
      MANHATTAN: 'Lower Manhattan Infrastructure',
      DUBAI: 'Dubai Marina Walk',
    },
    narratives: {
      MANHATTAN: 'Every empire begins beneath the surface.',
      DUBAI: 'The Marina waterfront — your first mark.',
    },
    imageKey: {
      MANHATTAN: 'ny_level1',
      DUBAI: 'db_level1',
    },
  },
  {
    id: 'level2',
    level: 2,
    minSOL: 10,
    maxSOL: 55,
    minUSD: 1480,
    maxUSD: 7400,
    krwLabel: '~₩10M',
    color: '#5A5A5A',
    names: {
      MANHATTAN: 'The Park Bench (Central Park)',
      DUBAI: 'The Golden Smart Lamp',
    },
    descriptions: {
      MANHATTAN: 'A deeded park bench in Central Park with a gold plaque',
      DUBAI: 'A sponsored smart lamp on the Marina promenade',
    },
    locations: {
      MANHATTAN: 'Central Park, Manhattan',
      DUBAI: 'Dubai Marina Promenade',
    },
    narratives: {
      MANHATTAN: 'A permanent mark in the city that never sleeps.',
      DUBAI: 'Your light shines on the waterfront.',
    },
    imageKey: {
      MANHATTAN: 'ny_level2',
      DUBAI: 'db_level2',
    },
  },
  {
    id: 'level3',
    level: 3,
    minSOL: 55,
    maxSOL: 270,
    minUSD: 7400,
    maxUSD: 37000,
    krwLabel: '~₩50M',
    color: '#6A6A6A',
    names: {
      MANHATTAN: 'The Storage Vault (Deeded)',
      DUBAI: 'The Private Parking Stall',
    },
    descriptions: {
      MANHATTAN: 'A deeded underground storage vault in the Financial District',
      DUBAI: 'A private deeded parking stall in Marina Bay',
    },
    locations: {
      MANHATTAN: 'Financial District',
      DUBAI: 'Marina Bay',
    },
    narratives: {
      MANHATTAN: 'Your assets are secured in the heart of finance.',
      DUBAI: 'Premium positioning in the new world.',
    },
    imageKey: {
      MANHATTAN: 'ny_level3',
      DUBAI: 'db_level3',
    },
  },
  {
    id: 'level4',
    level: 4,
    minSOL: 270,
    maxSOL: 1080,
    minUSD: 37000,
    maxUSD: 148000,
    krwLabel: '~₩200M',
    color: '#7D7D7D',
    names: {
      MANHATTAN: 'The Manhattan Parking Bay',
      DUBAI: 'The Yacht Mooring Berth',
    },
    descriptions: {
      MANHATTAN: 'A deeded indoor parking bay in Midtown Manhattan',
      DUBAI: 'A private yacht mooring berth at the Dubai Marina',
    },
    locations: {
      MANHATTAN: 'Midtown Manhattan',
      DUBAI: 'Dubai Marina',
    },
    narratives: {
      MANHATTAN: 'Your first real estate holding in the concrete jungle.',
      DUBAI: 'Where the waterway meets your ambition.',
    },
    imageKey: {
      MANHATTAN: 'ny_level4',
      DUBAI: 'db_level4',
    },
  },
  {
    id: 'level5',
    level: 5,
    minSOL: 1080,
    maxSOL: 3240,
    minUSD: 148000,
    maxUSD: 444000,
    krwLabel: '~₩600M',
    color: '#8F8F8F',
    names: {
      MANHATTAN: 'The Entry Studio',
      DUBAI: 'The Marina Sky Studio',
    },
    descriptions: {
      MANHATTAN: 'Compact luxury studio in Brooklyn Heights',
      DUBAI: 'High-floor minimalist studio with marina view',
    },
    locations: {
      MANHATTAN: 'Brooklyn Heights',
      DUBAI: 'Dubai Marina Sky',
    },
    narratives: {
      MANHATTAN: 'Your first real space in the skyline.',
      DUBAI: 'Modern living in the city of tomorrow.',
    },
    imageKey: {
      MANHATTAN: 'ny_level5',
      DUBAI: 'db_level5',
    },
  },
  {
    id: 'level6',
    level: 6,
    minSOL: 3240,
    maxSOL: 8100,
    minUSD: 444000,
    maxUSD: 1110000,
    krwLabel: '~₩1.5B',
    color: '#A8A8A8',
    names: {
      MANHATTAN: 'The Luxury 1-Bed Condo',
      DUBAI: 'The Palm Sky Residence',
    },
    descriptions: {
      MANHATTAN: 'Modern luxury 1-bedroom in Chelsea',
      DUBAI: 'Sky-high Palm Jumeirah 1-bedroom residence',
    },
    locations: {
      MANHATTAN: 'Chelsea, Manhattan',
      DUBAI: 'Palm Jumeirah Sky',
    },
    narratives: {
      MANHATTAN: 'You have arrived in the heart of culture.',
      DUBAI: 'Vertical luxury redefined.',
    },
    imageKey: {
      MANHATTAN: 'ny_level6',
      DUBAI: 'db_level6',
    },
  },
  {
    id: 'level7',
    level: 7,
    minSOL: 8100,
    maxSOL: 27000,
    minUSD: 1110000,
    maxUSD: 3700000,
    krwLabel: '~₩5B',
    color: '#C0C0C0',
    names: {
      MANHATTAN: 'The Prime 2-Bed Residence',
      DUBAI: 'The Palm Sea-view Suite',
    },
    descriptions: {
      MANHATTAN: 'Spacious 2-bedroom SoHo loft with classic brickwork',
      DUBAI: '2-bed suite with full Arabian Sea panorama on the Palm',
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
    minSOL: 27000,
    maxSOL: 81000,
    minUSD: 3700000,
    maxUSD: 11100000,
    krwLabel: '~₩15B',
    color: '#D4AF37',
    names: {
      MANHATTAN: 'The Central Park Penthouse',
      DUBAI: 'The Palm Frond Villa',
    },
    descriptions: {
      MANHATTAN: 'Full-floor penthouse overlooking Central Park',
      DUBAI: 'Private frond villa with infinity pool on the Palm',
    },
    locations: {
      MANHATTAN: 'Central Park South',
      DUBAI: 'Palm Jumeirah Private Frond',
    },
    narratives: {
      MANHATTAN: 'Old money elegance, new world power.',
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
    minSOL: 81000,
    maxSOL: 270000,
    minUSD: 11100000,
    maxUSD: 37000000,
    krwLabel: '~₩50B',
    color: '#E8C96A',
    names: {
      MANHATTAN: 'The UES Townhouse',
      DUBAI: 'The Emirates Hills Manor',
    },
    descriptions: {
      MANHATTAN: 'Historic multi-storey townhouse on the Upper East Side',
      DUBAI: 'Grand manor estate in the Emirates Hills gated community',
    },
    locations: {
      MANHATTAN: 'Upper East Side, Manhattan',
      DUBAI: 'Emirates Hills',
    },
    narratives: {
      MANHATTAN: 'You stand above the city, looking down on Central Park.',
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
    minSOL: 270000,
    maxSOL: Infinity,
    minUSD: 37000000,
    maxUSD: Infinity,
    krwLabel: '₩50B+',
    color: '#FFD700',
    names: {
      MANHATTAN: 'The Landmark Apex (Empire)',
      DUBAI: 'The Sovereign Apex (Burj)',
    },
    descriptions: {
      MANHATTAN: 'The pinnacle of Manhattan — your name on the skyline',
      DUBAI: 'The crown jewel of the Burj Khalifa district',
    },
    locations: {
      MANHATTAN: 'Manhattan Landmark',
      DUBAI: 'Burj Khalifa District',
    },
    narratives: {
      MANHATTAN: 'You are not just in New York. You ARE New York.',
      DUBAI: 'Sovereignty. The city bends to your will.',
    },
    imageKey: {
      MANHATTAN: 'ny_level10',
      DUBAI: 'db_level10',
    },
  },
];

class ValueCalculator {
  getTierForSOL(solAmount) {
    return (
      PROPERTY_TIERS.find(t => solAmount >= t.minSOL && solAmount < t.maxSOL) ||
      PROPERTY_TIERS[0]  // fallback: < 1 SOL → Level 1 (not Level 10)
    );
  }
  
  getPercentile(solAmount) {
    if (solAmount < 1) return "Newcomer";
    
    // Log scale continuous calculation
    const logSOL = Math.log10(solAmount);
    const logMax = Math.log10(500000); // Level 10 threshold
    const rawPercentile = (logSOL / logMax) * 100;
    
    const rank = Math.round(100 - rawPercentile);

    if (rank < 1) return "Top 0.1%";
    if (rank < 2) return "Top 1%";
    if (rank < 5) return "Top 5%";
    if (rank < 10) return "Top 10%";
    if (rank < 20) return "Top 20%";
    if (rank < 40) return "Top 40%";
    if (rank < 60) return "Top 60%";
    if (rank < 80) return "Top 80%";
    return "Top 90%";
  }
  calculateStarProgress(solAmount, tier) {
    const progress = ((solAmount - tier.minSOL) / (tier.maxSOL - tier.minSOL)) * 100;
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

  determineMapping({ solAmount, solPrice, cityType = 'MANHATTAN' }) {
    const tier = this.getTierForSOL(solAmount);
    const totalUSD = solAmount * solPrice;
    const city = CITY_CONFIG[cityType];
    const starInfo = this.calculateStarProgress(solAmount, tier);

    const percentile = this.getPercentile(solAmount);
    const upgrade    = this.calculateUpgrade({ solAmount, solPrice, cityType });
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

  calculateUpgrade({ solAmount, solPrice, cityType = 'MANHATTAN' }) {
    const currentTier = this.getTierForSOL(solAmount);
    const currentIndex = PROPERTY_TIERS.indexOf(currentTier);
    const nextTier = PROPERTY_TIERS[currentIndex + 1];

    if (!nextTier) {
      return {
        message: '👑 Maximum level reached.',
        solNeeded: 0,
        nextTier: null,
        currentTier,
        progress: 100,
      };
    }

    const solNeeded = nextTier.minSOL - solAmount;
    const usdNeeded = solNeeded * solPrice;
    const progress = ((solAmount - currentTier.minSOL) / (nextTier.minSOL - currentTier.minSOL)) * 100;

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
