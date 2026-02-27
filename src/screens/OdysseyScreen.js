/**
 * Empire Screen — Sol-lionaire
 * Tab 2: The Vertical Progression
 *
 * Layout: 과거(Peek) → 현재(Sticky) → 미래(Scroll)
 *  - A. NYC / Dubai toggle
 *  - B. Legacy Peek   : previous level, partially visible at top (blurred/faded)
 *  - C. Current Hero  : sticky card with full detail
 *  - D. Progress      : gold progress bar + dynamic text
 *  - E. Future targets: next +1 (silhouette), next +2 (dark/mysterious)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Dimensions, Linking, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../context/WalletContext';
import { valueCalculator, PROPERTY_TIERS, CityType } from '../services/valueCalculator';
import { priceDataService } from '../services/pythPriceService';
import { buildClaimTransaction, getExplorerUrl, DEV_MODE } from '../services/claimService';

const { width: W, height: H } = Dimensions.get('window');

// ── Jupiter deep link: open app if installed, fall back to web ────────────────
const JUP_WEB_URL = 'https://jup.ag/swap/USDC-SOL';
const openJupiter = async () => {
  try {
    const canOpenApp = await Linking.canOpenURL('jup://');
    if (canOpenApp) {
      await Linking.openURL('jup://swap/USDC-SOL');
    } else {
      await Linking.openURL(JUP_WEB_URL);
    }
  } catch {
    await Linking.openURL(JUP_WEB_URL);
  }
};

const P = {
  black:    '#000000',
  charcoal: '#0A0A0A',
  dark:     '#141414',
  mid:      '#1C1C1C',
  border:   '#2A2A2A',
  gray:     '#888888',
  offWhite: '#F5F0E8',
  gold:     '#C9A84C',
  goldLight:'#E8C96A',
  goldDeep: '#A07830',
};

const PROPERTY_IMAGES = {
  ny_level1:  require('../../assets/images/properties/ny_level1.png'),
  ny_level2:  require('../../assets/images/properties/ny_level2.png'),
  ny_level3:  require('../../assets/images/properties/ny_level3.png'),
  ny_level4:  require('../../assets/images/properties/ny_level4.png'),
  ny_level5:  require('../../assets/images/properties/ny_level5.png'),
  ny_level6:  require('../../assets/images/properties/ny_level6.png'),
  ny_level7:  require('../../assets/images/properties/ny_level7.png'),
  ny_level8:  require('../../assets/images/properties/ny_level8.png'),
  ny_level9:  require('../../assets/images/properties/ny_level9.png'),
  ny_level10: require('../../assets/images/properties/ny_level10.png'),
  db_level1:  require('../../assets/images/properties/db_level1.png'),
  db_level2:  require('../../assets/images/properties/db_level2.png'),
  db_level3:  require('../../assets/images/properties/db_level3.png'),
  db_level4:  require('../../assets/images/properties/db_level4.png'),
  db_level5:  require('../../assets/images/properties/db_level5.png'),
  db_level6:  require('../../assets/images/properties/db_level6.png'),
  db_level7:  require('../../assets/images/properties/db_level7.png'),
  db_level8:  require('../../assets/images/properties/db_level8.png'),
  db_level9:  require('../../assets/images/properties/db_level9.png'),
  db_level10: require('../../assets/images/properties/db_level10.png'),
};

const getImage = (imageKey) => PROPERTY_IMAGES[imageKey] || PROPERTY_IMAGES['ny_level1'];

// ── Heights for scroll math ───────────────────────────────────────────────────
const PEEK_VISIBLE = 70;   // px of prev card visible above sticky current
const PREV_CARD_H  = 260;  // full height of previous (peek) card
const INITIAL_SCROLL = PREV_CARD_H - PEEK_VISIBLE;

// ── Previous Level Peek Card ──────────────────────────────────────────────────
const PrevCard = ({ tier, city }) => {
  if (!tier) return <View style={{ height: PREV_CARD_H }} />;
  const imgKey = tier.imageKey?.[city] ?? 'ny_level1';
  return (
    <View style={pc.wrap}>
      <View style={pc.arrowHint}>
        <Text style={pc.arrowText}>↑ View History</Text>
      </View>
      <View style={pc.card}>
        <Image source={getImage(imgKey)} style={pc.image} resizeMode="cover" blurRadius={4} />
        <View style={pc.overlay}>
          <Text style={pc.eyebrow}>PREVIOUS · LEVEL {tier.level}</Text>
          <Text style={pc.name}>{tier.names[city]}</Text>
          <Text style={pc.loc}>{tier.locations[city]}</Text>
        </View>
      </View>
    </View>
  );
};

const pc = StyleSheet.create({
  wrap:      { height: PREV_CARD_H, marginHorizontal: 16 },
  arrowHint: { alignItems: 'center', paddingVertical: 8 },
  arrowText: { fontSize: 10, color: P.gold, letterSpacing: 3, fontWeight: '600' },
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
    opacity: 0.4,
  },
  image:   { width: '100%', height: '100%', position: 'absolute' },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  eyebrow: { fontSize: 9, color: P.gold, letterSpacing: 3, marginBottom: 4 },
  name:    { fontSize: 17, fontWeight: '700', color: P.offWhite, marginBottom: 2 },
  loc:     { fontSize: 11, color: P.gray },
});

// ── Current Hero Card (becomes sticky) ───────────────────────────────────────
const CurrentCard = ({ tier, city, solBalance, solPrice }) => {
  if (!tier) return null;
  const imgKey    = tier.imageKey?.[city] ?? 'ny_level1';
  const totalUSD  = solBalance * solPrice;
  const percentile = valueCalculator.getPercentile(solBalance);

  return (
    <View style={cc.wrap}>
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={cc.accentTop}
      />
      {/* Hero image */}
      <Image source={getImage(imgKey)} style={cc.image} resizeMode="cover" />
      <LinearGradient
        colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.85)']}
        style={cc.imageOverlay}
      />
      {/* Content */}
      <View style={cc.content}>
        <Text style={cc.eyebrow}>CURRENT STATUS · LEVEL {tier.level}</Text>
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={cc.titleGrad}
        >
          <Text style={cc.title} numberOfLines={2}>{tier.names[city]}</Text>
        </LinearGradient>
        <Text style={cc.loc}>{tier.locations[city]}</Text>

        <View style={cc.statsRow}>
          <View style={cc.stat}>
            <Text style={cc.statLabel}>SOL</Text>
            <Text style={[cc.statVal, { color: tier.color }]}>
              {solBalance.toFixed(2)}
            </Text>
          </View>
          <View style={cc.statDiv} />
          <View style={cc.stat}>
            <Text style={cc.statLabel}>VALUE</Text>
            <Text style={cc.statVal}>
              {solPrice > 0
                ? `$${totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                : '---'}
            </Text>
          </View>
          <View style={cc.statDiv} />
          <View style={cc.stat}>
            <Text style={cc.statLabel}>RANK</Text>
            <Text style={[cc.statVal, { color: P.goldLight, fontSize: 13 }]}>{percentile}</Text>
          </View>
        </View>

        <Text style={cc.narrative}>{tier.narratives[city]}</Text>
      </View>
    </View>
  );
};

const cc = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: P.gold,
    overflow: 'hidden',
    backgroundColor: P.dark,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  accentTop: { height: 3, width: '100%' },
  image: { width: '100%', height: 200, position: 'absolute', top: 3 },
  imageOverlay: { height: 200, position: 'absolute', top: 3, left: 0, right: 0 },
  content: { marginTop: 3 + 200 - 40, padding: 20 },
  eyebrow: { fontSize: 9, color: P.gold, letterSpacing: 3, fontWeight: '600', marginBottom: 8 },
  titleGrad: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: P.black,
    letterSpacing: 0.3,
  },
  loc:  { fontSize: 12, color: P.gray, marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: P.border,
    paddingVertical: 14,
    marginBottom: 16,
  },
  stat:    { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 9, color: P.gray, letterSpacing: 2, marginBottom: 4 },
  statVal:   { fontSize: 17, fontWeight: '700', color: P.offWhite },
  statDiv:   { width: 1, backgroundColor: P.border },
  narrative: { fontSize: 13, color: P.gray, lineHeight: 20, textAlign: 'center', fontStyle: 'italic' },
});

// ── Progress Bar Section ──────────────────────────────────────────────────────
const ProgressSection = ({ upgrade, city }) => {
  // Still loading — show nothing rather than "Maximum Level Reached" incorrectly
  if (!upgrade) return null;

  if (!upgrade.nextTier) {
    return (
      <View style={pg.wrap}>
        <Text style={pg.maxText}>Maximum Level Reached 👑</Text>
      </View>
    );
  }
  const pct = Math.min(Math.max(upgrade.progress, 0), 99);
  return (
    <View style={pg.wrap}>
      <Text style={pg.eyebrow}>PROGRESS TO NEXT LEVEL</Text>
      <Text style={pg.nextName}>{upgrade.nextTier.names[city]}</Text>
      <View style={pg.barBg}>
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[pg.barFill, { width: `${pct}%` }]}
        />
      </View>
      <Text style={pg.pctText}>
        {pct.toFixed(0)}% — need{' '}
        {upgrade.solNeeded.toFixed(2)} more SOL (${upgrade.usdNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })})
      </Text>
      <TouchableOpacity style={pg.jupBtn} onPress={openJupiter}>
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={pg.jupGrad}
        >
          <Text style={pg.jupText}>Upgrade via Jupiter</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const pg = StyleSheet.create({
  wrap: { marginHorizontal: 16, marginTop: 16, padding: 20, backgroundColor: P.dark, borderRadius: 16, borderWidth: 1, borderColor: P.border },
  eyebrow: { fontSize: 9, color: P.gold, letterSpacing: 3, fontWeight: '600', marginBottom: 8 },
  nextName: { fontSize: 17, fontWeight: '600', color: P.offWhite, marginBottom: 14 },
  barBg:   { height: 8, backgroundColor: P.border, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  barFill: { height: '100%', borderRadius: 4 },
  pctText: { fontSize: 12, color: P.gray, marginBottom: 16 },
  maxText: { fontSize: 18, color: P.goldLight, textAlign: 'center', fontWeight: '700' },
  jupBtn:  { borderRadius: 12, overflow: 'hidden' },
  jupGrad: { paddingVertical: 14, alignItems: 'center' },
  jupText: { fontSize: 15, fontWeight: '800', color: P.black },
});

// ── Future Target Card (Next +1 and +2) ──────────────────────────────────────
const fmtUSD = (n) => {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M+`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K+`;
  return `$${n}+`;
};

const FutureCard = ({ tier, city, mystery = false }) => {
  if (!tier) return null;
  const imgKey = tier.imageKey?.[city] ?? 'ny_level1';
  return (
    <View style={[fc.wrap, mystery && fc.wrapMystery]}>
      <Image
        source={getImage(imgKey)}
        style={fc.image}
        resizeMode="cover"
        blurRadius={mystery ? 12 : 5}
      />
      <LinearGradient
        colors={mystery
          ? ['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']
          : ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.75)']}
        style={fc.overlay}
      >
        <Text style={fc.eyebrow}>
          {mystery ? 'FUTURE TARGET' : 'NEXT LEVEL'}
        </Text>
        <Text style={[fc.name, mystery && { color: P.gray }]}>
          {mystery ? '???  ' + tier.names[city].split(' ').slice(-2).join(' ') : tier.names[city]}
        </Text>
        <Text style={fc.loc}>
          {mystery ? 'Unlocks at ' + fmtUSD(tier.minUSD) : tier.locations[city]}
        </Text>
        {!mystery && (
          <View style={fc.reqRow}>
            <Text style={fc.req}>{tier.minSOL.toLocaleString()} SOL</Text>
            <Text style={fc.reqSep}> · </Text>
            <Text style={fc.req}>{fmtUSD(tier.minUSD)}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const fc = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 140,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
  },
  wrapMystery: { borderColor: '#1A1A1A', opacity: 0.7 },
  image: { width: '100%', height: '100%', position: 'absolute' },
  overlay: { flex: 1, justifyContent: 'flex-end', padding: 16 },
  eyebrow: { fontSize: 9, color: P.gold, letterSpacing: 3, marginBottom: 4 },
  name:    { fontSize: 16, fontWeight: '700', color: P.offWhite, marginBottom: 2 },
  loc:     { fontSize: 11, color: P.gray, marginBottom: 6 },
  reqRow:  { flexDirection: 'row' },
  req:     { fontSize: 11, color: P.goldLight, fontWeight: '600' },
  reqSep:  { fontSize: 11, color: P.gray },
});

// ── Claim My Territory ────────────────────────────────────────────────────────
const ClaimSection = ({ tier, city, walletAddress, signAndSendTransaction }) => {
  const [status, setStatus] = useState('idle'); // idle | claiming | success | error
  const [txSig,  setTxSig]  = useState(null);

  const handleClaim = async () => {
    setStatus('claiming');
    try {
      const tx  = buildClaimTransaction({ tier, city, walletAddress });
      const sig = await signAndSendTransaction(tx);
      setTxSig(sig);
      setStatus('success');
    } catch (e) {
      console.error('Claim failed:', e);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <View style={[cl.wrap, cl.wrapSuccess]}>
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={cl.accentLine}
        />
        {/* Checkmark icon */}
        <View style={cl.successIcon}>
          <Ionicons name="checkmark-circle" size={44} color={P.gold} />
        </View>
        <Text style={cl.successEye}>ON-CHAIN VERIFIED · {DEV_MODE ? 'DEVNET' : 'MAINNET'}</Text>
        <Text style={cl.successTitle}>Territory Claimed</Text>
        <Text style={cl.successSub}>
          Level {tier.level} · {tier.names[city]}{'\n'}
          recorded on Solana {DEV_MODE ? 'Devnet' : 'Mainnet'}
        </Text>
        {/* Styled explorer button */}
        <TouchableOpacity
          style={cl.explorerBtn}
          onPress={() => Linking.openURL(getExplorerUrl(txSig))}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={cl.explorerBtnGrad}
          >
            <Text style={cl.explorerBtnText}>View on Explorer →</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={cl.wrap}>
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={cl.accentLine}
      />
      <Text style={cl.eye}>BLOCKCHAIN PROOF</Text>
      <Text style={cl.title}>Claim My Territory</Text>
      <Text style={cl.sub}>
        Sign a transaction to record{'\n'}Level {tier.level} on Solana Mainnet
      </Text>
      <TouchableOpacity
        style={cl.btn}
        onPress={handleClaim}
        disabled={status === 'claiming'}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={cl.btnGrad}
        >
          <Text style={cl.btnText}>
            {status === 'claiming' ? 'Signing…' : 'Claim My Territory'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
      <Text style={cl.hint}>~0.000005 SOL network fee</Text>
      {status === 'error' && (
        <Text style={cl.errText}>Transaction failed — please try again</Text>
      )}
    </View>
  );
};

const cl = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    backgroundColor: P.dark,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
  },
  accentLine: { height: 2, borderRadius: 1, marginBottom: 16 },
  eye:  { fontSize: 9, color: P.gold, letterSpacing: 3, fontWeight: '600', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: '700', color: P.offWhite, marginBottom: 6 },
  sub:  { fontSize: 13, color: P.gray, lineHeight: 20, marginBottom: 20 },
  btn:  { borderRadius: 12, overflow: 'hidden' },
  btnGrad: { paddingVertical: 14, alignItems: 'center' },
  btnText: { fontSize: 15, fontWeight: '800', color: P.black, letterSpacing: 0.5 },
  hint:    { fontSize: 11, color: P.border, textAlign: 'center', marginTop: 10 },
  errText: { fontSize: 12, color: '#FF6B6B', textAlign: 'center', marginTop: 8 },
  // success state
  wrapSuccess:  { borderColor: P.gold },
  successIcon:  { alignItems: 'center', marginBottom: 10, marginTop: 4 },
  successEye:   { fontSize: 9, color: P.goldLight, letterSpacing: 3, fontWeight: '600', marginBottom: 8 },
  successTitle: { fontSize: 20, fontWeight: '700', color: P.goldLight, marginBottom: 8 },
  successSub:   { fontSize: 13, color: P.gray, lineHeight: 20, marginBottom: 16 },
  explorerBtn:      { borderRadius: 10, overflow: 'hidden' },
  explorerBtnGrad:  { paddingVertical: 12, alignItems: 'center' },
  explorerBtnText:  { fontSize: 14, fontWeight: '800', color: P.black, letterSpacing: 0.5 },
});

// ── Not Connected Placeholder ─────────────────────────────────────────────────
const EmptyState = () => (
  <LinearGradient colors={[P.black, P.charcoal]} style={{ flex: 1 }}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <Text style={{ fontSize: 48, fontWeight: '100', color: P.gold, letterSpacing: 8, marginBottom: 20 }}>◆</Text>
      <Text style={{ fontSize: 28, fontWeight: '300', color: P.offWhite, letterSpacing: 2, marginBottom: 12 }}>
        Empire
      </Text>
      <Text style={{ fontSize: 14, color: P.gray, textAlign: 'center', lineHeight: 22 }}>
        Connect your wallet to begin your vertical ascent.
      </Text>
    </View>
  </LinearGradient>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function OdysseyScreen() {
  const { walletAddress, balance, isConnected, signAndSendTransaction } = useWallet();

  const [city,        setCity]        = useState(CityType.MANHATTAN);
  const [solPrice,    setSolPrice]    = useState(0);
  const [currentTier, setCurrentTier] = useState(null);
  const [upgrade,     setUpgrade]     = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (isConnected) loadData();
  }, [isConnected, balance, city]);

  // Scroll to show peek of previous card on mount / data change
  useEffect(() => {
    if (currentTier && currentTier.level > 1) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ y: INITIAL_SCROLL, animated: false });
      }, 100);
    }
  }, [currentTier]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prices = await priceDataService.fetchAllPrices(city);
      const price  = prices.solPrice || 0;
      setSolPrice(price);

      const sol    = balance || 0;
      const result = valueCalculator.determineMapping({ solAmount: sol, solPrice: price, cityType: city });
      setCurrentTier(result.tier);

      const up = valueCalculator.calculateUpgrade({ solAmount: sol, solPrice: price, cityType: city });
      setUpgrade(up);
    } catch (e) {
      console.error('Empire load failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isConnected) return <EmptyState />;

  const solBalance = balance || 0;

  // Determine adjacent tiers
  const currentIdx  = PROPERTY_TIERS.findIndex(t => t.id === currentTier?.id);
  const prevTier    = currentIdx > 0 ? PROPERTY_TIERS[currentIdx - 1] : null;
  const nextTier1   = PROPERTY_TIERS[currentIdx + 1] ?? null;
  const nextTier2   = PROPERTY_TIERS[currentIdx + 2] ?? null;

  return (
    <View style={s.root}>
      {/* ─── Header + City Toggle ─────────────────────────────────────────── */}
      <LinearGradient colors={[P.charcoal, P.dark]} style={s.header}>
        <Text style={s.headerEye}>YOUR VERTICAL ASCENT</Text>
        <Text style={s.headerTitle}>Empire</Text>
        <View style={s.toggle}>
          {[CityType.MANHATTAN, CityType.DUBAI].map(c => (
            <TouchableOpacity
              key={c}
              style={[s.toggleBtn, city === c && s.toggleActive]}
              onPress={() => setCity(c)}
            >
              <Text style={[s.toggleText, city === c && s.toggleTextActive]}>
                {c === CityType.MANHATTAN ? '🗽 NYC' : '🏙️ Dubai'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ─── Vertical Scroll: Past → Current (sticky) → Future ───────────── */}
      <ScrollView
        ref={scrollRef}
        stickyHeaderIndices={prevTier ? [1] : [0]}
        showsVerticalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
      >
        {/* B. Legacy Peek (index 0 if prevTier exists, else skipped) */}
        {prevTier ? (
          <PrevCard tier={prevTier} city={city} />
        ) : (
          /* Spacer so stickyHeaderIndices still works */
          <View style={{ height: 8 }} />
        )}

        {/* C. Current Hero — sticky (index 1 when prevTier, index 0 when not) */}
        <View style={s.stickyWrap}>
          {isLoading && !currentTier ? (
            <View style={s.loadingCard}>
              <ActivityIndicator size="small" color={P.gold} />
              <Text style={s.loadingText}>Loading Empire…</Text>
            </View>
          ) : (
            <CurrentCard
              tier={currentTier}
              city={city}
              solBalance={solBalance}
              solPrice={solPrice}
            />
          )}
        </View>

        {/* D. Progress Section */}
        <ProgressSection upgrade={upgrade} city={city} />

        {/* D2. Claim My Territory — on-chain proof */}
        {currentTier && (
          <ClaimSection
            tier={currentTier}
            city={city}
            walletAddress={walletAddress}
            signAndSendTransaction={signAndSendTransaction}
          />
        )}

        {/* ── "Future Targets" label */}
        <View style={s.sectionLabel}>
          <Text style={s.sectionEye}>FUTURE TARGETS</Text>
        </View>

        {/* E. Next +1 */}
        {nextTier1 ? (
          <FutureCard tier={nextTier1} city={city} mystery={false} />
        ) : null}

        {/* E. Next +2 (mysterious) */}
        {nextTier2 ? (
          <FutureCard tier={nextTier2} city={city} mystery />
        ) : null}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: P.black },
  header: {
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: P.gold,
  },
  headerEye:   { fontSize: 9, color: P.gold, letterSpacing: 4, fontWeight: '600', marginBottom: 4 },
  headerTitle: { fontSize: 26, color: P.offWhite, fontWeight: '300', letterSpacing: 2, marginBottom: 14 },

  toggle: {
    flexDirection: 'row',
    backgroundColor: P.black,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: P.border,
  },
  toggleBtn:       { paddingVertical: 8, paddingHorizontal: 22, borderRadius: 10 },
  toggleActive:    { backgroundColor: P.gold },
  toggleText:      { fontSize: 13, color: P.gray, fontWeight: '500' },
  toggleTextActive:{ color: P.black, fontWeight: '800' },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 12, paddingBottom: 20 },

  stickyWrap: {
    backgroundColor: P.black,
    paddingVertical: 8,
    paddingTop: 2,
  },

  loadingCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: P.dark,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: { fontSize: 12, color: P.gray, letterSpacing: 2 },

  sectionLabel: { marginHorizontal: 16, marginTop: 28, marginBottom: 4 },
  sectionEye:   { fontSize: 9, color: P.gold, letterSpacing: 4, fontWeight: '600' },
});
