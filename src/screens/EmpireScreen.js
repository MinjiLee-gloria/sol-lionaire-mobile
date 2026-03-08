/**
 * Empire Screen — Sol-lionaire
 * Tab 2: The Vertical Progression
 *
 * Layout: Past(Peek) → Present(Sticky) → Future(Scroll)
 *  - A. NYC / Dubai toggle
 *  - B. Legacy Peek   : previous level, partially visible at top (blurred/faded)
 *  - C. Current Hero  : sticky card with full detail
 *  - D. Progress      : gold progress bar + dynamic text
 *  - E. Future targets: next +1 (silhouette), next +2 (dark/mysterious)
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Image, Linking, ActivityIndicator, Animated, Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../context/WalletContext';
import { valueCalculator, PROPERTY_TIERS, CityType } from '../services/valueCalculator';
import { priceDataService } from '../services/pythPriceService';
import { buildClaimTransaction, getExplorerUrl, DEV_MODE } from '../services/claimService';
import { P } from '../constants/theme';
import { PROPERTY_IMAGES } from '../constants/images';
import { playSound } from '../utils/sounds';

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
  const percentile = valueCalculator.getPercentile(totalUSD);

  return (
    <View style={cc.wrap}>
      {/* Top gold accent bar */}
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={cc.accentTop}
      />
      {/* Property image — contain so pixel art is never clipped */}
      <View style={cc.imageWrap}>
        <Image source={getImage(imgKey)} style={cc.image} resizeMode="contain" />
      </View>
      {/* Gold gradient separator — connects image to text area */}
      <LinearGradient
        colors={['rgba(160,120,48,0.2)', P.gold, P.goldLight, P.gold, 'rgba(160,120,48,0.2)']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={cc.goldSep}
      />
      {/* Content */}
      <View style={cc.content}>
        <Text style={cc.eyebrow}>
          {city === 'MANHATTAN' ? 'NYC' : 'DUBAI'} CHAPTER  |  LEVEL {tier.level}
        </Text>
        <Text style={cc.title} numberOfLines={2}>{tier.names[city]}</Text>
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
            <Text style={[cc.statVal, { color: P.goldLight, fontSize: 13 }]}>▲ {percentile}</Text>
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
    marginBottom: 8,           // breathing room below card
    borderRadius: 20,
    borderWidth: 2,
    borderColor: P.gold,
    overflow: 'hidden',
    backgroundColor: '#000000',
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  accentTop:  { height: 3, width: '100%' },
  imageWrap:  { width: '100%', backgroundColor: 'transparent' },
  image:      { width: '100%', height: 220 },  // contain in JSX, full pixel art visible
  goldSep:    { height: 2, width: '100%' },    // gold shimmer line, not a fade-out
  content:    { padding: 20, paddingTop: 16, backgroundColor: P.dark },
  eyebrow:    { fontSize: 9, color: P.gold, letterSpacing: 4.5, fontWeight: '700', marginBottom: 10 },
  title:      { fontSize: 20, fontWeight: '800', color: P.goldLight, letterSpacing: 0.3, marginBottom: 6 },
  loc:        { fontSize: 12, color: P.gray, marginBottom: 16 },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: P.border,
    paddingVertical: 14,
    marginBottom: 16,
  },
  stat:      { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: 9, color: P.gray, letterSpacing: 2, marginBottom: 4 },
  statVal:   { fontSize: 17, fontWeight: '700', color: P.offWhite },
  statDiv:   { width: 1, backgroundColor: P.border },
  narrative: { fontSize: 15, color: P.gray, lineHeight: 24, textAlign: 'center', fontStyle: 'italic' },
});

// ── Diagonal gold sweep — "your assets are moving upward" ─────────────────────
// 12° tilted #FFD700 beam glides left→right every ~4.4s.
// Extended top/bottom so the rotated corners stay hidden by overflow:hidden.
const GoldSweep = () => {
  const x = useRef(new Animated.Value(-120)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(3500),
        Animated.timing(x, { toValue: 460, duration: 900, useNativeDriver: true }),
        Animated.timing(x, { toValue: -120, duration: 0,  useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: -20, bottom: -20,
        width: 70,
        transform: [{ translateX: x }, { rotate: '12deg' }],
      }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255,215,0,0.55)', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
};

// ── Percentile string → raw number (e.g. "Top 34.2%" → 34.2) ─────────────────
const parseTopPct = (str) => {
  if (!str || str === 'Newcomer') return null;
  const m = str.match(/Top ([\d.]+)%/);
  return m ? parseFloat(m[1]) : null;
};

// ── Progress Bar Section ──────────────────────────────────────────────────────
const ProgressSection = ({ upgrade, city, solBalance, solPrice }) => {
  // Pulse glow on Level Up button — hooks must come before any early return
  const pulseScale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, { toValue: 1.028, duration: 950, useNativeDriver: true }),
        Animated.timing(pulseScale, { toValue: 1.0,   duration: 950, useNativeDriver: true }),
        Animated.delay(2400),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);

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

  // Next rank percentile string
  const nextPct    = parseTopPct(valueCalculator.getPercentile(upgrade.nextTier.minUSD));
  const nextPctStr = nextPct !== null
    ? `Top ${nextPct % 1 === 0 ? nextPct.toFixed(0) : nextPct}%`
    : null;

  return (
    <View style={pg.wrap}>
      <Text style={pg.eyebrow}>PROGRESS TO NEXT LEVEL</Text>

      {/* ① Item name — prominent */}
      <Text style={pg.nextName}>{upgrade.nextTier.names[city]}</Text>

      {/* ② Progress bar + pct label */}
      <View style={pg.barRow}>
        <View style={pg.barBg}>
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={[pg.barFill, { width: `${pct}%` }]}
          />
        </View>
        <Text style={pg.barPct}>{pct.toFixed(0)}%</Text>
      </View>

      {/* ③ Need X SOL ($XXX) to unlock */}
      <Text style={pg.unlockText}>
        {'Need '}
        <Text style={pg.solHighlight}>{upgrade.solNeeded.toFixed(2)} SOL</Text>
        {` ($${upgrade.usdNeeded.toLocaleString(undefined, { maximumFractionDigits: 0 })}) to unlock`}
      </Text>

      {/* ④ Next Rank */}
      {nextPctStr && (
        <Text style={pg.rankText}>Next Rank: {nextPctStr} 🚀</Text>
      )}

      {/* ⑤ Italic narrative of next tier */}
      {upgrade.nextTier.narratives?.[city] ? (
        <Text style={pg.narrative}>"{upgrade.nextTier.narratives[city]}"</Text>
      ) : null}

      {/* ⑥ Level Up button — pulsing gold glow draws the eye */}
      <Animated.View style={[pg.jupOuter, { transform: [{ scale: pulseScale }] }]}>
        <TouchableOpacity style={pg.jupBtn} onPress={() => { playSound('level_up'); openJupiter(); }} activeOpacity={0.85}>
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={pg.jupGrad}
          >
            <Text style={pg.jupText}>Level Up via Jupiter</Text>
          </LinearGradient>
          <GoldSweep />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const pg = StyleSheet.create({
  wrap:     { marginHorizontal: 16, marginTop: 16, padding: 20, backgroundColor: P.dark, borderRadius: 16, borderWidth: 1, borderColor: P.border },
  eyebrow:  { fontSize: 9, color: P.gold, letterSpacing: 3, fontWeight: '600', marginBottom: 10 },
  nextName: { fontSize: 19, fontWeight: '700', color: P.offWhite, letterSpacing: 0.2, marginBottom: 14 },

  // Bar row: bar fills flex, percentage label on right
  barRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  barBg:   { flex: 1, height: 8, backgroundColor: P.border, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  barPct:  { fontSize: 12, color: P.gray, fontWeight: '600', width: 34, textAlign: 'right' },

  // "Need X.XX SOL ($XXX) to unlock"
  unlockText:   { fontSize: 13, color: P.gray, marginBottom: 8 },
  solHighlight: { fontSize: 14, color: P.goldLight, fontWeight: '700' },

  // "Next Rank: Top X.X% 🚀"
  rankText:  { fontSize: 13, color: P.gold, fontWeight: '600', marginBottom: 14 },

  // Italic narrative
  narrative: { fontSize: 13, color: P.gray, lineHeight: 20, fontStyle: 'italic', textAlign: 'center', marginBottom: 18 },

  maxText: { fontSize: 18, color: P.goldLight, textAlign: 'center', fontWeight: '700' },
  // Outer wrapper carries the shadow glow; inner btn carries overflow:hidden for gradient clip
  jupOuter: {
    borderRadius: 12,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 12,
  },
  jupBtn:  { borderRadius: 12, overflow: 'hidden' },
  jupGrad: { paddingVertical: 15, alignItems: 'center' },
  jupText: { fontSize: 15, fontWeight: '800', color: P.black, letterSpacing: 0.5 },
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
          {mystery ? '???' : tier.names[city]}
        </Text>
        <Text style={fc.loc}>
          {mystery ? 'Unlocks at ' + fmtUSD(tier.minUSD) : tier.locations[city]}
        </Text>
        {!mystery && (
          <View style={fc.reqRow}>
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
// claimedResult: { txSig, ts } from parent (per-city), null if not yet claimed
// onClaimed(sig, ts): called after successful claim — persists result in parent
// onReset(): clears claim result for this city (enables re-claim)
const ClaimSection = ({ tier, city, walletAddress, signAndSendTransaction, claimedResult, onClaimed, onReset }) => {
  const [status, setStatus] = useState('idle'); // idle | signing | confirming | error
  const [copied, setCopied] = useState(false);

  // Gold burst overlay + button bounce on press
  const flashAnim = useRef(new Animated.Value(0)).current;
  const btnScale  = useRef(new Animated.Value(1)).current;

  const triggerClaimAnim = () => {
    flashAnim.setValue(0.8);
    btnScale.setValue(0.96);
    Animated.parallel([
      Animated.timing(flashAnim, { toValue: 0, duration: 850, useNativeDriver: true }),
      Animated.spring(btnScale,  { toValue: 1, friction: 3, tension: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleClaim = async () => {
    triggerClaimAnim();
    setStatus('signing');
    try {
      const tx  = buildClaimTransaction({ tier, city, walletAddress });
      setStatus('confirming');
      const sig = await signAndSendTransaction(tx);
      onClaimed(sig, Date.now()); // lift result to parent (persists per city)
      playSound('claim_success');
      setStatus('idle');
    } catch (e) {
      console.error('Claim failed:', e);
      setStatus('error');
    }
  };

  // ── Success state — driven by parent's per-city claimedResult ──────────────
  if (claimedResult) {
    const { txSig, ts } = claimedResult;
    const claimedAt = new Date(ts).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZoneName: 'short', // show KST / UTC etc.
    });
    const memoObj = {
      app: 'Solionaire',
      level: tier.level,
      name: tier.names[city],
      city: city.toLowerCase(),
      ts: Math.floor(ts / 1000),
    };
    const handleCopy = () => {
      Clipboard.setString(JSON.stringify(memoObj, null, 2));
      playSound('copy_click');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <View style={[cl.wrap, cl.wrapSuccess]}>
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={cl.accentLine}
        />
        <View style={cl.successIcon}>
          <Ionicons name="checkmark-circle" size={44} color={P.gold} />
        </View>
        <Text style={cl.successEye}>ON-CHAIN VERIFIED · {DEV_MODE ? 'DEVNET' : 'MAINNET'}</Text>
        <Text style={cl.successTitle}>Territory Claimed</Text>

        {/* Memo card */}
        <View style={cl.memoCard}>
          <View style={cl.memoRow}>
            <Text style={cl.memoKey}>App</Text>
            <Text style={cl.memoVal}>Solionaire</Text>
          </View>
          <View style={cl.memoDivider} />
          <View style={cl.memoRow}>
            <Text style={cl.memoKey}>Level</Text>
            <Text style={cl.memoVal}>{tier.level}</Text>
          </View>
          <View style={cl.memoDivider} />
          <View style={cl.memoRow}>
            <Text style={cl.memoKey}>Property</Text>
            <Text style={[cl.memoVal, cl.memoValSmall]}>{tier.names[city]}</Text>
          </View>
          <View style={cl.memoDivider} />
          <View style={cl.memoRow}>
            <Text style={cl.memoKey}>City</Text>
            <Text style={cl.memoVal}>{city === 'MANHATTAN' ? 'New York' : 'Dubai'}</Text>
          </View>
          <View style={cl.memoDivider} />
          <View style={cl.memoRow}>
            <Text style={cl.memoKey}>Time</Text>
            <Text style={[cl.memoVal, cl.memoValSmall]}>{claimedAt}</Text>
          </View>
          <View style={cl.memoDivider} />
          <View style={cl.memoRow}>
            <Text style={cl.memoKey}>Tx</Text>
            <Text style={[cl.memoVal, cl.memoValTx]} numberOfLines={1} ellipsizeMode="middle">
              {txSig}
            </Text>
          </View>
          <TouchableOpacity style={cl.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
            <Text style={cl.copyBtnText}>{copied ? '✓ Copied' : 'Copy Memo JSON'}</Text>
          </TouchableOpacity>
        </View>

        {/* Explorer button */}
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

        {/* Claim Again — resets this city's claim so user can re-claim */}
        <TouchableOpacity style={cl.claimAgainBtn} onPress={onReset} activeOpacity={0.7}>
          <Text style={cl.claimAgainText}>Claim Again</Text>
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
      <Text style={cl.eye}>BLOCKCHAIN PROOF · PERMANENT RECORD</Text>
      <Text style={cl.title}>Record Legacy on Solana</Text>
      <Text style={cl.sub}>
        Permanently inscribe Level {tier.level} on-chain.{'\n'}Your legacy lives on Solana Mainnet forever.
      </Text>

      {/* Premium Claim button — outer glow + bounce scale */}
      <Animated.View style={[cl.btnOuter, { transform: [{ scale: btnScale }] }]}>
        <TouchableOpacity
          style={cl.btn}
          onPress={handleClaim}
          disabled={status === 'signing' || status === 'confirming'}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={cl.btnGrad}
          >
            <Text style={cl.btnText}>
              {status === 'signing'    ? 'Signing…'
             : status === 'confirming' ? 'Confirming…'
             : 'Claim My Territory'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>

      {(status === 'signing' || status === 'confirming') && (
        <Text style={cl.hint}>
          {status === 'signing' ? 'Opening wallet…' : 'Broadcasting to Solana…'}
        </Text>
      )}
      {status === 'idle' && <Text style={cl.hint}>~0.000005 SOL network fee</Text>}
      {status === 'error' && (
        <>
          <Text style={cl.errText}>Transaction failed. Please try again.</Text>
          <TouchableOpacity style={cl.retryBtn} onPress={handleClaim}>
            <Text style={cl.retryText}>↩ Try Again</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Gold burst overlay — renders on top, fades in/out on claim press */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          borderRadius: 16,
          backgroundColor: 'rgba(255,215,0,0.55)',
          opacity: flashAnim,
        }}
      />
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
  // Outer wrapper: shadow glow without clipping; inner btn: overflow:hidden for gradient
  btnOuter: {
    borderRadius: 12,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 14,
  },
  btn:     { borderRadius: 12, overflow: 'hidden' },
  btnGrad: { paddingVertical: 16, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '800', color: '#1A0800', letterSpacing: 1.2 },
  hint:     { fontSize: 11, color: P.border, textAlign: 'center', marginTop: 10 },
  errText:  { fontSize: 12, color: '#FF6B6B', textAlign: 'center', marginTop: 8 },
  retryBtn: { alignSelf: 'center', marginTop: 10, paddingVertical: 8, paddingHorizontal: 20,
              borderWidth: 1, borderColor: '#FF6B6B', borderRadius: 8 },
  retryText:{ fontSize: 13, color: '#FF6B6B', fontWeight: '600' },
  // success state
  wrapSuccess:  { borderColor: P.gold },
  successIcon:  { alignItems: 'center', marginBottom: 10, marginTop: 4 },
  successEye:   { fontSize: 9, color: P.goldLight, letterSpacing: 3, fontWeight: '600', marginBottom: 8 },
  successTitle: { fontSize: 20, fontWeight: '700', color: P.goldLight, marginBottom: 8 },
  successSub:   { fontSize: 13, color: P.gray, lineHeight: 20, marginBottom: 16 },
  // memo card
  memoCard:       { width: '100%', backgroundColor: '#111', borderRadius: 10, borderWidth: 1, borderColor: '#2a2a2a', paddingHorizontal: 14, paddingVertical: 8, marginBottom: 14 },
  memoRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  memoDivider:    { height: 1, backgroundColor: '#222' },
  memoKey:        { fontSize: 11, color: '#666', fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase', width: 58 },
  memoVal:        { fontSize: 13, color: P.goldLight, fontWeight: '600', flex: 1, textAlign: 'right' },
  memoValSmall:   { fontSize: 11 },
  memoValTx:      { fontSize: 10, color: '#888', fontFamily: 'monospace' },
  copyBtn:        { marginTop: 10, paddingVertical: 7, alignItems: 'center', borderRadius: 6, borderWidth: 1, borderColor: '#333' },
  copyBtnText:    { fontSize: 12, color: '#666', fontWeight: '600', letterSpacing: 0.5 },
  claimAgainBtn:  { marginTop: 10, paddingVertical: 8, alignItems: 'center' },
  claimAgainText: { fontSize: 12, color: '#555', textDecorationLine: 'underline' },
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
export default function EmpireScreen() {
  const { walletAddress, balance, isConnected, signAndSendTransaction } = useWallet();

  const [city,          setCity]          = useState(CityType.MANHATTAN);
  const [solPrice,      setSolPrice]      = useState(0);
  const [currentTier,   setCurrentTier]   = useState(null);
  const [upgrade,       setUpgrade]       = useState(null);
  const [isLoading,     setIsLoading]     = useState(false);
  // Per-city claim results — { MANHATTAN: { txSig, ts } | null, DUBAI: ... }
  const [claimedByCity, setClaimedByCity] = useState({});

  const scrollRef = useRef(null);

  // 10% tier buffer: remembers last displayed level per city to prevent yo-yo
  const prevTierLevelRef = useRef({ MANHATTAN: null, DUBAI: null });

  // Clear stale state immediately on disconnect so reconnect doesn't flash old data
  useEffect(() => {
    if (!isConnected) {
      setCurrentTier(null);
      setUpgrade(null);
      setSolPrice(0);
      prevTierLevelRef.current = { MANHATTAN: null, DUBAI: null };
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) loadData();
  }, [isConnected, balance, city]);

  // Silent 60s price refresh — no loading spinner
  useEffect(() => {
    if (!isConnected) return;
    const id = setInterval(async () => {
      try {
        const prices = await priceDataService.fetchAllPrices(city);
        const price  = prices.solPrice || 0;
        setSolPrice(price);

        const sol          = balance || 0;
        const bufferedTier = valueCalculator.getTierForUSDBuffered(
          sol * price, prevTierLevelRef.current[city]
        );
        prevTierLevelRef.current[city] = bufferedTier.level;

        const result = valueCalculator.determineMapping({
          solAmount:     sol,
          solPrice:      price,
          cityType:      city,
          _tierOverride: bufferedTier,
        });
        setCurrentTier(result.tier);

        const up = valueCalculator.calculateUpgrade({ solAmount: sol, solPrice: price, cityType: city });
        setUpgrade(up);
      } catch { /* silent */ }
    }, 60_000);
    return () => clearInterval(id);
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

      const sol          = balance || 0;
      const bufferedTier = valueCalculator.getTierForUSDBuffered(
        sol * price,
        prevTierLevelRef.current[city]
      );
      prevTierLevelRef.current[city] = bufferedTier.level;

      const result = valueCalculator.determineMapping({
        solAmount:     sol,
        solPrice:      price,
        cityType:      city,
        _tierOverride: bufferedTier,
      });
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
              onPress={() => { playSound('city_toggle'); setCity(c); }}
            >
              <Text style={[s.toggleText, city === c && s.toggleTextActive]}>
                {c === CityType.MANHATTAN ? '🗽 NYC' : '🏙️ Dubai'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* ─── Vertical Scroll: Past → Current → Future ───────────── */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
      >
        {/* B. Legacy Peek */}
        {prevTier && <PrevCard tier={prevTier} city={city} />}

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
        <ProgressSection upgrade={upgrade} city={city} solBalance={solBalance} solPrice={solPrice} />

        {/* D2. Claim My Territory — on-chain proof */}
        {currentTier && (
          <ClaimSection
            tier={currentTier}
            city={city}
            walletAddress={walletAddress}
            signAndSendTransaction={signAndSendTransaction}
            claimedResult={claimedByCity[city] ?? null}
            onClaimed={(sig, ts) => setClaimedByCity(prev => ({ ...prev, [city]: { txSig: sig, ts } }))}
            onReset={() => setClaimedByCity(prev => ({ ...prev, [city]: null }))}
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
    paddingTop: 6,
    paddingBottom: 16,
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
