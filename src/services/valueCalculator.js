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

// 10-Level Property System (1 SOL = $140 = ₩190,000)
export const PROPERTY_TIERS = [
  {
    id: 'level1',
    level: 1,
    minSOL: 1,
    maxSOL: 10,
    minUSD: 140,
    maxUSD: 1400,
    color: '#4A4A4A',
    names: {
      MANHATTAN: 'The Urban Grid',
      DUBAI: 'The Sand Plot',
    },
    descriptions: {
      MANHATTAN: 'Cybernetic golden manhole cover',
      DUBAI: 'Holographic land boundary in desert',
    },
    locations: {
      MANHATTAN: 'Lower Manhattan Infrastructure',
      DUBAI: 'Desert Outskirts',
    },
    narratives: {
      MANHATTAN: 'Every empire begins beneath the surface.',
      DUBAI: 'The desert holds infinite potential.',
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
    maxSOL: 50,
    minUSD: 1400,
    maxUSD: 7000,
    color: '#5A5A5A',
    names: {
      MANHATTAN: 'The Public Anchor',
      DUBAI: 'The Lamp Post',
    },
    descriptions: {
      MANHATTAN: 'Artistic park bench with dark metal and gold',
      DUBAI: 'Futuristic golden street lamp',
    },
    locations: {
      MANHATTAN: 'Central Park',
      DUBAI: 'Dubai Marina',
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
    minSOL: 50,
    maxSOL: 250,
    minUSD: 7000,
    maxUSD: 35000,
    color: '#6A6A6A',
    names: {
      MANHATTAN: 'The Secure Vault',
      DUBAI: 'The Prime Sector',
    },
    descriptions: {
      MANHATTAN: 'High-tech golden storage vault',
      DUBAI: 'Laser-marked premium parking zone',
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
    minSOL: 250,
    maxSOL: 1250,
    minUSD: 35000,
    maxUSD: 175000,
    color: '#7D7D7D',
    names: {
      MANHATTAN: 'The Entry Studio',
      DUBAI: 'The Smart Studio',
    },
    descriptions: {
      MANHATTAN: 'Compact dark luxury room',
      DUBAI: 'Minimalist smart studio',
    },
    locations: {
      MANHATTAN: 'Brooklyn Heights',
      DUBAI: 'Business Bay',
    },
    narratives: {
      MANHATTAN: 'Your first real space in the concrete jungle.',
      DUBAI: 'Modern living in the city of tomorrow.',
    },
    imageKey: {
      MANHATTAN: 'ny_level4',
      DUBAI: 'db_level4',
    },
  },
  {
    id: 'level5',
    level: 5,
    minSOL: 1250,
    maxSOL: 3500,
    minUSD: 175000,
    maxUSD: 490000,
    color: '#8F8F8F',
    names: {
      MANHATTAN: 'The Urban Suite',
      DUBAI: 'The Marina One',
    },
    descriptions: {
      MANHATTAN: 'Stylish midtown studio',
      DUBAI: 'White & gold concept room',
    },
    locations: {
      MANHATTAN: 'Midtown Manhattan',
      DUBAI: 'Dubai Marina',
    },
    narratives: {
      MANHATTAN: 'Refinement meets opportunity in the city center.',
      DUBAI: 'Where luxury meets the sea.',
    },
    imageKey: {
      MANHATTAN: 'ny_level5',
      DUBAI: 'db_level5',
    },
  },
  {
    id: 'level6',
    level: 6,
    minSOL: 3500,
    maxSOL: 10000,
    minUSD: 490000,
    maxUSD: 1400000,
    color: '#A8A8A8',
    names: {
      MANHATTAN: 'The Prime Residence',
      DUBAI: 'The High-rise Duo',
    },
    descriptions: {
      MANHATTAN: 'Modern Chelsea living room',
      DUBAI: 'Duplex high-rise with golden spiral',
    },
    locations: {
      MANHATTAN: 'Chelsea, Manhattan',
      DUBAI: 'Downtown Dubai',
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
    minSOL: 10000,
    maxSOL: 50000,
    minUSD: 1400000,
    maxUSD: 7000000,
    color: '#C0C0C0',
    names: {
      MANHATTAN: 'The Soho Legacy',
      DUBAI: 'The Palm View',
    },
    descriptions: {
      MANHATTAN: 'Classic red brick townhouse',
      DUBAI: 'High-floor terrace overlooking Palm',
    },
    locations: {
      MANHATTAN: 'SoHo, Manhattan',
      DUBAI: 'Palm Jumeirah',
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
    minSOL: 50000,
    maxSOL: 150000,
    minUSD: 7000000,
    maxUSD: 21000000,
    color: '#D4AF37',
    names: {
      MANHATTAN: 'The Townhouse',
      DUBAI: 'The Beach Villa',
    },
    descriptions: {
      MANHATTAN: 'Upper East Side mansion',
      DUBAI: 'Beachfront villa with infinity pool',
    },
    locations: {
      MANHATTAN: 'Upper East Side, Manhattan',
      DUBAI: 'Jumeirah Beach',
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
    minSOL: 150000,
    maxSOL: 500000,
    minUSD: 21000000,
    maxUSD: 70000000,
    color: '#E8C96A',
    names: {
      MANHATTAN: 'The Sky Mansion',
      DUBAI: 'The Royal Manor',
    },
    descriptions: {
      MANHATTAN: 'Ultra high-rise penthouse',
      DUBAI: 'Royal Atlantis-level sky mansion',
    },
    locations: {
      MANHATTAN: 'Billionaires Row, Manhattan',
      DUBAI: 'Royal Atlantis',
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
    minSOL: 500000,
    maxSOL: Infinity,
    minUSD: 70000000,
    maxUSD: Infinity,
    color: '#FFD700',
    names: {
      MANHATTAN: 'The Landmark',
      DUBAI: 'The Sovereign Estate',
    },
    descriptions: {
      MANHATTAN: 'Empire State Building peak',
      DUBAI: 'Royal palace commanding Dubai',
    },
    locations: {
      MANHATTAN: 'Manhattan Landmark',
      DUBAI: 'Dubai Royal District',
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
      PROPERTY_TIERS[PROPERTY_TIERS.length - 1]
    );
  }
  
  getPercentile(solAmount) {
    if (solAmount < 1) return "Newcomer";
    
    // Log scale continuous calculation
    const logSOL = Math.log10(solAmount);
    const logMax = Math.log10(500000); // Level 10 threshold
    const rawPercentile = (logSOL / logMax) * 100;
    
    const rank = Math.round(100 - rawPercentile);
    console.log("🔢 Debug - solAmount:", solAmount, "rank:", rank);
    
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
    console.log("Percentile:", percentile);
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
