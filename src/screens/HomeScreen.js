/**
 * HomeScreen — Sol-lionaire
 * Tab 1: Status & Flex
 *
 * Layout:
 *  - Floating animated 8-bit gold badge (current level property image)
 *  - Identity label: Level X · Title in gold gradient
 *  - Real-time SOL balance + KRW equivalent
 *  - "Share My Status" CTA
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Animated, Image,
  Dimensions, PanResponder, Easing, Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import RNShare from 'react-native-share';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../context/WalletContext';
import { valueCalculator, CityType } from '../services/valueCalculator';
import { priceDataService } from '../services/pythPriceService';
import CalculatingAnimation from '../components/CalculatingAnimation';
import { useLustre } from '../hooks/useLustre';
import { P } from '../constants/theme';
import { PROPERTY_IMAGES } from '../constants/images';
import { FloatingBadge, DefaultBadge } from '../components/BadgeComponents';
import { BuffFlash, SparkParticles, LustreGauge } from '../components/LustreComponents';
import WalletPickerModal from '../components/WalletPickerModal';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const CITIES = [
  { key: CityType.MANHATTAN, label: '🗽 NEW YORK' },
  { key: CityType.DUBAI,     label: '🏙️ DUBAI' },
];

// ── Swipe narrative pool — random quote picked on each buff ───────────────────
const SWIPE_QUOTES = [
  'The market rewards the bold.',
  'Wealth is direction, not just balance.',
  'Your assets speak louder than words.',
  'Every SOL compounds your legacy.',
  'Power is patient. So is your portfolio.',
  'The skyline bends toward those who hold.',
  'Old money slept here. You own it now.',
  'This is not a number. It is a statement.',
  'Rare air. Rare holdings.',
  'Sovereignty is measured in real assets.',
  'The empire you build outlasts the noise.',
  'Kings don\'t check prices. They set them.',
  'Fortune favors the long-term holder.',
  'Prestige is not purchased. It is accumulated.',
];

// ── Ambient background particles — faint gold dots drifting upward ────────────
const PARTICLE_DATA = [
  { x: 0.08, size: 3,   duration: 7200,  delay: 0    },
  { x: 0.21, size: 2,   duration: 9400,  delay: 1800 },
  { x: 0.37, size: 4,   duration: 8100,  delay: 600  },
  { x: 0.55, size: 2.5, duration: 10200, delay: 3100 },
  { x: 0.68, size: 3,   duration: 7800,  delay: 4400 },
  { x: 0.80, size: 2,   duration: 9000,  delay: 2200 },
  { x: 0.90, size: 3.5, duration: 8600,  delay: 800  },
  { x: 0.14, size: 2,   duration: 11000, delay: 5500 },
];

const AmbientParticles = () => {
  const anims = useRef(PARTICLE_DATA.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    PARTICLE_DATA.forEach((p, i) => {
      const loop = () => {
        anims[i].setValue(0);
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(anims[i], {
            toValue: 1,
            duration: p.duration,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(({ finished }) => { if (finished) loop(); });
      };
      loop();
    });
  }, []);

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      {PARTICLE_DATA.map((p, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            left: p.x * SCREEN_W,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#C9A84C',
            opacity: anims[i].interpolate({
              inputRange:  [0, 0.1, 0.75, 1],
              outputRange: [0, 0.35, 0.18, 0],
            }),
            transform: [{
              translateY: anims[i].interpolate({
                inputRange:  [0, 1],
                outputRange: [SCREEN_H * 0.85, SCREEN_H * 0.05],
              }),
            }],
          }}
        />
      ))}
    </View>
  );
};

// ── Animated SWIPE gesture hint — appears below badge, slides left↔right ─────
const SwipeHint = ({ visible }) => {
  const slideX = useRef(new Animated.Value(0)).current;
  const leftOp  = useRef(new Animated.Value(1)).current;
  const rightOp = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (!visible) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(slideX,  { toValue: 14,  duration: 700, useNativeDriver: true }),
          Animated.timing(leftOp,  { toValue: 0.3, duration: 700, useNativeDriver: true }),
          Animated.timing(rightOp, { toValue: 1,   duration: 700, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(slideX,  { toValue: -14, duration: 700, useNativeDriver: true }),
          Animated.timing(leftOp,  { toValue: 1,   duration: 700, useNativeDriver: true }),
          Animated.timing(rightOp, { toValue: 0.3, duration: 700, useNativeDriver: true }),
        ]),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [visible]);

  if (!visible) return null;
  return (
    <View style={{ alignItems: 'center', marginTop: 2, marginBottom: 6 }}>
      <Animated.View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, transform: [{ translateX: slideX }] }}>
        <Animated.Text style={{ color: P.gold, fontSize: 22, fontWeight: '300', opacity: leftOp }}>‹</Animated.Text>
        <Text style={{ color: P.gold, fontSize: 18, fontWeight: '800', letterSpacing: 6 }}>SWIPE</Text>
        <Animated.Text style={{ color: P.gold, fontSize: 22, fontWeight: '300', opacity: rightOp }}>›</Animated.Text>
      </Animated.View>
    </View>
  );
};

// ── Gold bar surface sweep — "this button is a gold bar, tap it" ──────────────
// Wide triple-highlight sweeps horizontally every ~4s to simulate
// the reflective sheen of a physical gold bullion surface.
const GoldBarSweep = () => {
  const x = useRef(new Animated.Value(-130)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(3000),
        Animated.timing(x, { toValue: 460, duration: 1000, useNativeDriver: true }),
        Animated.timing(x, { toValue: -130, duration: 0,   useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, bottom: 0, width: 110, transform: [{ translateX: x }] }}
    >
      <LinearGradient
        colors={['transparent', 'rgba(255,215,0,0.22)', 'rgba(255,248,195,0.55)', 'rgba(255,215,0,0.22)', 'transparent']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
};

// ── 24h price sparkline (react-native-svg) ────────────────────────────────────
// Takes an array of ~12 sampled hourly SOL prices and draws a minimal line chart.
const PriceSpark = ({ prices, positive }) => {
  if (!prices || prices.length < 2) return null;
  const W = 72, H = 26;
  const min   = Math.min(...prices);
  const max   = Math.max(...prices);
  const range = max - min || 1;
  const pts   = prices.map((p, i) => {
    const px = ((i / (prices.length - 1)) * W).toFixed(1);
    const py = (H - ((p - min) / range) * (H - 4) - 2).toFixed(1);
    return `${px},${py}`;
  }).join(' ');
  return (
    <Svg width={W} height={H}>
      <Polyline
        points={pts}
        fill="none"
        stroke={positive ? '#4DB36A' : '#E05555'}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </Svg>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const {
    walletAddress, balance, isConnected, isLoading,
    walletName, connectWallet, disconnectWallet,
  } = useWallet();

  const [isSharing,      setIsSharing]      = useState(false);
  const [selectedCity,   setSelectedCity]   = useState(CityType.MANHATTAN);
  const [showFlash,      setShowFlash]      = useState(false);
  const [buffCount,      setBuffCount]      = useState(0);    // triggers SparkParticles
  const [flashText,      setFlashText]      = useState('');   // random quote per swipe
  const [solPrice,       setSolPrice]       = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(null);
  const [solSparkline,   setSolSparkline]   = useState([]);
  const [mappingResult,  setMappingResult]  = useState(null);
  const [isCalculating,  setIsCalculating]  = useState(false);
  const [showPicker,     setShowPicker]     = useState(false);
  const [copiedAddr,     setCopiedAddr]     = useState(false);

  // Lustre meter — 24h decay, swipe-to-buff, 7-day Midas streak
  const { lustre, streak, isMidasTouch, buff } = useLustre(walletAddress);

  // buffRef: stable reference so PanResponder (created once) always calls latest buff
  const buffRef        = useRef(buff);
  const lastQuoteRef   = useRef(-1);
  useEffect(() => { buffRef.current = buff; }, [buff]);

  // Pick a random swipe quote, never repeating the same one twice in a row
  const pickQuote = () => {
    let idx;
    do { idx = Math.floor(Math.random() * SWIPE_QUOTES.length); }
    while (idx === lastQuoteRef.current && SWIPE_QUOTES.length > 1);
    lastQuoteRef.current = idx;
    return SWIPE_QUOTES[idx];
  };

  // PanResponder: horizontal swipe on badge → buff + money explosion + random quote
  const lustrePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:       () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy),
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) > 35) {
          buffRef.current();
          setFlashText(pickQuote());
          setShowFlash(true);
          setBuffCount(c => c + 1);
          setTimeout(() => setShowFlash(false), 750);
        }
      },
    })
  ).current;

  // City transition fade — fades hero+balance out then back in on city switch
  const cityFade = useRef(new Animated.Value(1)).current;

  // Race-condition guard: only the most recent calculate call may commit state.
  const calcRequestRef = useRef(0);

  // 10% tier buffer: remembers last displayed level per city to prevent yo-yo
  const prevTierLevelRef = useRef({ MANHATTAN: null, DUBAI: null });

  // Clear result immediately when wallet disconnects (also handles async race)
  useEffect(() => {
    if (!isConnected) {
      setMappingResult(null);
      prevTierLevelRef.current = { MANHATTAN: null, DUBAI: null };
    }
  }, [isConnected]);

  // Auto-calculate on connect, balance change, or city change.
  // This also fetches and sets price data, so a separate loadPrices effect is not needed.
  useEffect(() => {
    if (isConnected && balance !== null) {
      handleCalculate();
    }
  }, [isConnected, balance, selectedCity]);

  // Silent 60s price refresh — no loading indicator, no animation delay
  useEffect(() => {
    if (!isConnected || balance === null) return;
    const id = setInterval(async () => {
      try {
        const prices = await priceDataService.fetchAllPrices(selectedCity);
        const price  = prices.solPrice || 0;
        setSolPrice(price);
        setPriceChange24h(prices.priceChange24h ?? null);
        setSolSparkline(prices.solSparkline || []);

        const totalUSD     = (balance || 0) * price;
        const bufferedTier = valueCalculator.getTierForUSDBuffered(
          totalUSD, prevTierLevelRef.current[selectedCity]
        );
        prevTierLevelRef.current[selectedCity] = bufferedTier.level;

        const result = valueCalculator.determineMapping({
          solAmount:     balance || 0,
          solPrice:      price,
          cityType:      selectedCity,
          _tierOverride: bufferedTier,
        });
        setMappingResult(result);
      } catch { /* silent — stale display fine until next tick */ }
    }, 60_000);
    return () => clearInterval(id);
  }, [isConnected, balance, selectedCity]);

  const handleCalculate = async () => {
    if (!isConnected) { setShowPicker(true); return; }

    const thisRequest = ++calcRequestRef.current;
    setIsCalculating(true);
    try {
      const prices = await priceDataService.fetchAllPrices(selectedCity);
      if (thisRequest !== calcRequestRef.current) return; // stale — a newer call is running

      setSolPrice(prices.solPrice || 0);
      setPriceChange24h(prices.priceChange24h ?? null);
      setSolSparkline(prices.solSparkline || []);

      const totalUSD     = (balance || 0) * (prices.solPrice || 0);
      const bufferedTier = valueCalculator.getTierForUSDBuffered(
        totalUSD,
        prevTierLevelRef.current[selectedCity]
      );
      prevTierLevelRef.current[selectedCity] = bufferedTier.level;

      const result = valueCalculator.determineMapping({
        solAmount:    balance || 0,
        solPrice:     prices.solPrice || 0,
        cityType:     selectedCity,
        _tierOverride: bufferedTier,
      });

      await new Promise(r => setTimeout(r, 800));
      if (thisRequest !== calcRequestRef.current) return;

      setMappingResult(result);
      saveToHistory(result);
    } catch (e) {
      if (thisRequest !== calcRequestRef.current) return;
      console.error('Calculate failed:', e);
    } finally {
      if (thisRequest === calcRequestRef.current) setIsCalculating(false);
    }
  };

  // City switch: fade hero+balance out → switch city → fade back in
  const handleCityChange = useCallback((cityKey) => {
    if (cityKey === selectedCity) return;
    Animated.timing(cityFade, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setSelectedCity(cityKey);
      Animated.timing(cityFade, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  }, [selectedCity, cityFade]);

  const handleWalletSelect = async (walletId) => {
    setShowPicker(false);
    await connectWallet(walletId);
  };

  const saveToHistory = async (result) => {
    try {
      const key = `history_${walletAddress}`;
      const existing = await AsyncStorage.getItem(key);
      const history  = existing ? JSON.parse(existing) : [];
      history.unshift({ ...result, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
    } catch (e) { /* history is non-critical, silent fail is acceptable */ }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      // Capture share card as a temp file (Android requires file:// URI, not data: URI)
      const tmpPath = await captureRef(shareCardRef, { format: 'png', quality: 0.9, result: 'tmpfile' });

      const caption = `Claim your empire: solionaire.com 🚀\n\n#Solionaire #Solana #SOL #Web3 #LuxuryStatusLayer`;

      await RNShare.open({
        url: `file://${tmpPath}`,
        type: 'image/png',
        message: caption,
        title: 'Share My Status',
        failOnCancel: false,
      });
    } catch (e) {
      if (e?.message !== 'User did not share') {
        console.log('Share failed:', e?.message ?? e);
      }
    } finally {
      setIsSharing(false);
    }
  };

  // Ref for the off-screen share card
  const shareCardRef = useRef(null);

  // Displayed values
  const solBalance = balance || 0;
  const totalUSD   = solBalance * solPrice;

  const tier          = (isConnected && mappingResult) ? mappingResult.tier : null;
  const imageKey      = tier?.imageKey?.[selectedCity] ?? 'ny_level1';
  const levelNum      = tier?.level ?? null;
  const nextTier      = mappingResult?.upgrade?.nextTier ?? null;
  const nextImageKey  = nextTier?.imageKey?.[selectedCity] ?? null;
  // titleText only ever rendered inside {isConnected && mappingResult && ...}
  const titleText = `Level ${levelNum}: ${mappingResult?.propertyName ?? ''}`;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />
      <AmbientParticles />

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Logo ─────────────────────────────────────────────────────────── */}
        <LinearGradient colors={[P.charcoal, P.black]} style={s.logoArea}>
          <LinearGradient
            colors={['transparent', P.goldDeep, P.gold, P.goldDeep, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.logoRule}
          />
          <Text style={s.logoText}>SOLIONAIRE</Text>
          <Text style={s.logoSub}>LUXURY STATUS LAYER  ·  SOLANA</Text>
          <LinearGradient
            colors={['transparent', P.goldDeep, P.gold, P.goldDeep, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.logoRule}
          />
        </LinearGradient>

        {/* ─── Hero Badge + Balance — wrapped for city-switch fade ──────────── */}
        <Animated.View style={{ opacity: cityFade }}>

          {/* Hero Badge */}
          <View style={s.heroArea}>
            {isConnected && mappingResult ? (
              <View {...lustrePan.panHandlers} style={{ alignItems: 'center' }}>
                <FloatingBadge
                  imageKey={imageKey}
                  nextImageKey={nextImageKey}
                  tierColor={tier?.color}
                  level={levelNum}
                  isMidasTouch={isMidasTouch}
                  flashText={flashText}
                  flashVisible={showFlash}
                />
                <BuffFlash visible={showFlash} />
                <SparkParticles trigger={buffCount} />
              </View>
            ) : (
              <DefaultBadge />
            )}

            {/* SWIPE gesture hint — visible when connected */}
            <SwipeHint visible={isConnected && !!mappingResult} />

            {/* Lustre gauge — only shown when connected */}
            {isConnected && mappingResult && (
              <LustreGauge lustre={lustre} streak={streak} isMidasTouch={isMidasTouch} />
            )}

            {/* Identity Label — only shown when connected and result available */}
            {isConnected && mappingResult && (
              <LinearGradient
                colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.identityGrad}
              >
                <Text style={s.identityText} numberOfLines={2}>{titleText}</Text>
              </LinearGradient>
            )}

          </View>

          {/* Balance Display (only when connected) */}
          {isConnected && <View style={s.balanceCard}>
            <LinearGradient
              colors={['rgba(201,168,76,0.08)', 'rgba(0,0,0,0)']}
              style={s.balanceGradient}
            >
              {/* Primary row: USD + SOL side by side */}
              <View style={s.balancePrimaryRow}>
                <Text style={s.balanceUSD}>
                  ${solPrice > 0
                    ? totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })
                    : '---'}
                  <Text style={s.balanceUSDunit}> USD</Text>
                </Text>
                <Text style={s.balanceSubDot}>  ·  </Text>
                <Text style={s.balanceSOL}>≈ {solBalance.toFixed(4)} SOL</Text>
              </View>

              {/* Secondary row: 24h change + sparkline */}
              {priceChange24h !== null && (
                <View style={s.balanceSubRow}>
                  <Text style={[
                    s.wealthChange,
                    { color: priceChange24h >= 0 ? '#4DB36A' : '#E05555' },
                  ]}>
                    {priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}% (24h)
                  </Text>
                  <PriceSpark prices={solSparkline} positive={priceChange24h >= 0} />
                </View>
              )}

              {/* Percentile — prominent, inside card */}
              {mappingResult?.percentile && mappingResult.percentile !== 'Newcomer' && (
                <View style={s.percentileRow}>
                  <Text style={s.percentileLabel}>🏆 {mappingResult.percentile} of SOL Holders</Text>
                </View>
              )}

              {/* Wallet tag */}
              <TouchableOpacity
                style={s.walletTag}
                onPress={() => {
                  Clipboard.setString(walletAddress);
                  setCopiedAddr(true);
                  setTimeout(() => setCopiedAddr(false), 2000);
                }}
                activeOpacity={0.7}
              >
                <Text style={s.walletTagText} numberOfLines={1}>
                  {walletAddress}
                </Text>
                <Text style={s.walletTagCopy}>{copiedAddr ? '✓' : '⎘'}</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>}

        </Animated.View>

        {/* ─── City Toggle (only when connected) ───────────────────────────── */}
        {isConnected && <View style={s.cityTabBar}>
          {CITIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={s.cityTab}
              onPress={() => handleCityChange(c.key)}
              activeOpacity={0.75}
            >
              <Text style={[s.cityTabText, selectedCity === c.key && s.cityTabTextActive]}>
                {c.label}
              </Text>
              {selectedCity === c.key && (
                <LinearGradient
                  colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.cityTabIndicator}
                />
              )}
            </TouchableOpacity>
          ))}
        </View>}

        {/* ─── CTA ──────────────────────────────────────────────────────────── */}
        {isConnected ? (
          <View style={s.ctaArea}>
            <View style={s.shareBtnGlow}>
              <TouchableOpacity
                style={[s.shareBtn, isSharing && { opacity: 0.75 }]}
                onPress={handleShare}
                disabled={isSharing}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.shareBtnGrad}
                >
                  <Text style={s.shareBtnText}>
                    {isSharing ? 'Preparing…' : 'Share My Status'}
                  </Text>
                </LinearGradient>
                {!isSharing && <GoldBarSweep />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={s.disconnectBtn}
              onPress={() => { disconnectWallet(); setMappingResult(null); }}
            >
              <Text style={s.disconnectText}>Disconnect Wallet</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.ctaArea}>
            <TouchableOpacity
              style={s.connectBtn}
              onPress={() => setShowPicker(true)}
              disabled={isLoading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                style={s.shareBtnGrad}
              >
                <Text style={s.shareBtnText}>
                  {isLoading ? 'Connecting…' : 'Connect Wallet'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
            <Text style={s.termsText}>
              By connecting, you acknowledge this app is for entertainment only.{'\n'}
              See Simulation Notice in More tab.
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      <CalculatingAnimation visible={isCalculating} />

      <WalletPickerModal
        visible={showPicker}
        onSelect={handleWalletSelect}
        onClose={() => setShowPicker(false)}
      />

      {/* ─── Off-screen Share Card (captured as PNG) ──────────────────────── */}
      <View style={s.offscreen}>
        <View ref={shareCardRef} collapsable={false} style={sc.card}>
          {/* Gold accent line top */}
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={sc.accentTop}
          />

          {/* Header row: logo + level pill */}
          <View style={sc.header}>
            <Text style={sc.logo}>SOLIONAIRE</Text>
            <View style={[sc.levelPill, { borderColor: tier?.color ?? P.gold }]}>
              <Text style={[sc.levelPillText, { color: tier?.color ?? P.gold }]}>
                LEVEL {levelNum}
              </Text>
            </View>
          </View>

          {/* Property image card (gold-framed) */}
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={sc.imgFrame}
          >
            <Image
              source={PROPERTY_IMAGES[imageKey] ?? PROPERTY_IMAGES['ny_level1']}
              style={sc.imgInner}
              resizeMode="cover"
            />
          </LinearGradient>

          {/* Info section below image */}
          <View style={sc.info}>
            <Text style={sc.propName} numberOfLines={2}>
              {mappingResult?.propertyName ?? '—'}
            </Text>
            <Text style={sc.location}>{mappingResult?.location ?? ''}</Text>

            <LinearGradient
              colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={sc.divider}
            />

            {mappingResult?.percentile ? (
              <View style={sc.percentilePill}>
                <Text style={sc.percentileText}>{mappingResult.percentile} of SOL Holders</Text>
              </View>
            ) : null}
          </View>

          {/* Gold accent line bottom */}
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={sc.accentBottom}
          />
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: P.black },
  scroll:  { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Logo — thin rule / clean text treatment (no filled box)
  logoArea: { alignItems: 'center', paddingTop: 52, paddingBottom: 20, gap: 8 },
  logoRule: { width: SCREEN_W - 80, height: 1 },
  logoText: { fontSize: 24, fontWeight: '700', letterSpacing: 5, color: P.gold },
  logoSub:  { fontSize: 9, color: 'rgba(201,168,76,0.45)', letterSpacing: 3.5 },

  // Hero
  heroArea: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },

  // Identity label
  identityGrad: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: SCREEN_W - 48,
  },
  identityText: {
    fontSize: 15,
    fontWeight: '700',
    color: P.black,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  percentileBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(201,168,76,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.3)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
  },
  percentileText: { fontSize: 12, color: P.goldLight, fontWeight: '600', letterSpacing: 0.5 },

  // Balance card
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
  },
  balanceGradient: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 24,
  },
  // Primary row: USD + SOL on same line
  balancePrimaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  balanceUSD:     { fontSize: 36, fontWeight: '900', color: P.gold, letterSpacing: -0.5 },
  balanceUSDunit: { fontSize: 18, fontWeight: '300', color: P.goldLight },
  // Secondary SOL amount
  balanceSOL:     { fontSize: 13, color: P.gray },
  // Row: 24h change + sparkline
  balanceSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  balanceSubDot: { fontSize: 13, color: P.border },
  wealthChange: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Percentile row — prominent inside balance card
  percentileRow: {
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,76,0.2)',
    width: '100%',
    alignItems: 'center',
  },
  percentileLabel: { fontSize: 14, color: P.gold, fontWeight: '700', letterSpacing: 0.5 },

  walletTag: {
    marginTop: 14,
    backgroundColor: P.mid,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    maxWidth: '100%',
  },
  walletTagText: { flex: 1, fontSize: 11, color: P.gray, fontFamily: 'monospace' },
  walletTagCopy: { fontSize: 11, color: P.gold, flexShrink: 0 },

  // City tab bar — underline indicator style
  cityTabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
  },
  cityTab: {
    flex: 1,
    paddingVertical: 11,
    paddingBottom: 13,
    alignItems: 'center',
    position: 'relative',
  },
  cityTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: P.gray,
    letterSpacing: 1.5,
  },
  cityTabTextActive: {
    color: P.gold,
    fontWeight: '800',
  },
  cityTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '15%',
    right: '15%',
    height: 2,
    borderRadius: 1,
  },

  // CTA
  ctaArea: { marginHorizontal: 20, gap: 12 },

  shareBtnGlow: {
    borderRadius: 14,
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.85,
    shadowRadius: 22,
    elevation: 14,
  },
  shareBtn:     { borderRadius: 14, overflow: 'hidden' },
  connectBtn:   { borderRadius: 14, overflow: 'hidden' },
  shareBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  shareBtnText: { fontSize: 17, fontWeight: '800', color: P.black, letterSpacing: 1 },

  disconnectBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: P.border,
    borderRadius: 12,
  },
  disconnectText: { fontSize: 13, color: P.gray },
  termsText: {
    fontSize: 11,
    color: P.border,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 17,
    letterSpacing: 0.3,
  },

  // Off-screen container for share card capture
  offscreen: {
    position: 'absolute',
    top: -2000,
    left: 0,
    opacity: 0,       // hidden but still rendered & measurable
    pointerEvents: 'none',
  },
});

// ── Share Card Styles (4:5 portrait — Instagram feed) ─────────────────────────
// Property images are 1024×1024 (square). Gold frame uses aspectRatio:1 so it
// wraps the image exactly with no letterbox bars.
const CARD_W = 1080;
const CARD_H = 1350;  // 4:5 portrait gives enough room for image + text
const IMG_W  = CARD_W - 96 - 8; // margins 48×2 + padding 4×2 = 976px square

const sc = StyleSheet.create({
  card: {
    width: CARD_W,
    height: CARD_H,
    backgroundColor: '#0A0A0A',
    borderWidth: 4,
    borderColor: P.gold,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  accentTop:    { height: 6, width: '100%' },
  accentBottom: { height: 6, width: '100%' },

  // Header: logo left, level pill right
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 56,
    paddingVertical: 32,
  },
  logo: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 10,
    color: P.gold,
  },
  levelPill: {
    borderWidth: 2,
    borderColor: P.gold,
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  levelPillText: {
    fontSize: 20,
    fontWeight: '800',
    color: P.gold,
    letterSpacing: 4,
  },

  // Gold frame wraps image tightly — square matches the 1024×1024 source images
  imgFrame: {
    marginHorizontal: 48,
    borderRadius: 20,
    padding: 4,
    alignSelf: 'stretch',
  },
  imgInner: {
    width: IMG_W,
    height: IMG_W,   // square container = no black bars for square images
    borderRadius: 16,
  },

  // Info below image
  info: {
    alignItems: 'center',
    paddingHorizontal: 60,
    paddingTop: 32,
    paddingBottom: 56,
    flex: 1,
  },
  propName: {
    fontSize: 42,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
    marginBottom: 10,
    lineHeight: 52,
  },
  location: {
    fontSize: 22,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 28,
  },
  divider: {
    width: 200,
    height: 2,
    marginBottom: 24,
    borderRadius: 1,
  },
  percentilePill: {
    backgroundColor: 'rgba(201,168,76,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.5)',
    borderRadius: 30,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  percentileText: {
    fontSize: 26,
    color: P.goldLight,
    fontWeight: '600',
  },
});
