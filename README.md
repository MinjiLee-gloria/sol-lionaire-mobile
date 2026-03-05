# SOLIONAIRE

**Luxury Status Layer on Solana**

> *Your SOL balance, reimagined as prime real estate.*

SOLIONAIRE maps your Solana wallet balance to iconic real estate tiers — from a Manhattan studio to a Dubai mega-penthouse. Connect your wallet, discover your empire rank, and claim your status on-chain.

---

## Features

- **Live SOL Price** — Real-time price feed via CoinGecko with 60s background refresh
- **Dual City Mode** — Compare your rank in Manhattan (NYC) and Dubai simultaneously
- **10-Tier Ranking** — From street level to penthouse, mapped to your SOL holdings
- **Percentile Badge** — See exactly where you stand among all SOL holders worldwide
- **On-chain Claim** — Record your territory tier to Solana mainnet via the Memo Program
- **Share Card** — Export a 4:5 Instagram-ready status card with caption + hashtags
- **Splash Screen** — Cinematic gold particle entrance animation
- **Lustre Meter** — Daily engagement streak with swipe-to-buff and 7-day Midas mode
- **10% Buffer** — Tier hold logic prevents rank flickering on minor price swings

---

## Screenshots

*Demo video coming soon.*

---

## Hackathon Submission

- Repository: https://github.com/IM-THAT/sol-lionaire-mobile
- Android APK (latest release asset): https://github.com/IM-THAT/sol-lionaire-mobile/releases/latest/download/app-release.apk
- Releases page (all APKs): https://github.com/IM-THAT/sol-lionaire-mobile/releases

If the direct APK link returns 404, create a GitHub Release and upload `app-release.apk` as an asset with the exact filename `app-release.apk`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native (Expo SDK 54) |
| Wallet | Solana Mobile Wallet Adapter v2 |
| Blockchain | Solana Mainnet — Memo Program |
| Price Data | CoinGecko REST API |
| Navigation | React Navigation (Bottom Tabs) |
| Animations | React Native Animated API |
| Charts | react-native-svg |
| Share | react-native-share |
| Build | EAS Build (Expo Application Services) |
| Target Device | Solana Mobile Seeker (Android) |

---

## Project Structure

```
sol-lionaire-mobile/
├── App.js                              # Root: SplashScreen → Tab Navigator
├── app.json                            # Expo config (EAS, package, plugins)
├── eas.json                            # EAS build profiles
│
├── assets/
│   ├── app_icon.png                    # App icon source
│   ├── splash-transparent.png          # Transparent splash image (Android)
│   └── images/properties/             # Property tier images (ny_1–10, db_1–10)
│
└── src/
    ├── screens/
    │   ├── HomeScreen.js               # Tab 1 — Status, balance, share
    │   ├── EmpireScreen.js             # Tab 2 — Tier progression, claim
    │   ├── DistrictScreen.js           # Tab 3 — District leaderboard
    │   ├── MoreScreen.js               # Tab 4 — Settings, legal
    │   └── SplashScreen.js             # Splash animation
    ├── components/
    │   ├── BadgeComponents.js          # FloatingBadge, DefaultBadge
    │   ├── CalculatingAnimation.js     # Loading animation
    │   ├── LustreComponents.js         # BuffFlash, SparkParticles, LustreGauge
    │   └── WalletPickerModal.js        # Phantom / Seed Vault selector
    ├── services/
    │   ├── valueCalculator.js          # Tier logic, percentile, upgrade calc
    │   ├── pythPriceService.js         # CoinGecko price fetch + 60s cache
    │   └── claimService.js             # Build & submit Memo transaction
    ├── hooks/
    │   ├── useRealWalletConnection.js  # MWA connect/disconnect, balance
    │   └── useLustre.js               # Lustre meter state & streak logic
    ├── context/
    │   └── WalletContext.js            # Global wallet state provider
    └── constants/
        ├── theme.js                    # Color palette
        └── images.js                   # Property image map
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- EAS CLI: `npm install -g eas-cli`
- Android device with Phantom or Seed Vault wallet installed

### Install & Run

```bash
git clone https://github.com/IM-THAT/sol-lionaire-mobile.git
cd sol-lionaire-mobile
npm install
npx expo start
```

### Build APK

```bash
eas login
eas build -p android --profile preview
```

---

## Tier System

| Level | Manhattan | Dubai | Min USD |
|---|---|---|---|
| 1 | Times Square Mini Neon Slot | Desert Oasis Gold Plot | $0 |
| 2 | Subway Ad Panel | Gold Souk Mini Stall | $500 |
| 3 | Wall Street Gold Vault Box | Dubai Marina Private Parking Stall | $3,000 |
| 4 | Hell's Kitchen Private Parking Spot | Dubai Marina Yacht Mooring Berth | $100,000 |
| 5 | Brooklyn Heights Gold Rooftop Studio | JBR Beachfront Gold Studio | $300,000 |
| 6 | Chelsea High-Rise Gold 1-Bed Condo | Palm Jumeirah Gold Sky 1-Bed | $750,000 |
| 7 | SoHo Artist Gold 2-Bed Loft | Palm Arabian Gold Sea-view 2-Bed Suite | $1,500,000 |
| 8 | Central Park South Gold Penthouse | Palm Frond Signature Gold Villa | $3,500,000 |
| 9 | Billionaires' Row Gold Trophy Penthouse | Emirates Hills Gold-Leaf Manor | $15,000,000 |
| 10 | Apex Empire Crown | Sovereign Burj Gold Sky Palace | $20,000,000 |

---

## Disclaimer

SOLIONAIRE is a **purely entertainment and visualization app**. All asset valuations and tier progressions are fictional simulations based on real-time SOL/USD price data from CoinGecko. They do not represent real ownership of any assets, nor do they constitute financial, investment, or real estate advice. Cryptocurrency values are highly volatile. Use at your own risk.

---

## License

MIT
