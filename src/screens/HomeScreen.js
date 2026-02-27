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
  TouchableOpacity, StatusBar, Animated, Modal, Image,
  Dimensions, PanResponder,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Polyline } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../context/WalletContext';
import { valueCalculator, CityType } from '../services/valueCalculator';
import { priceDataService } from '../services/pythPriceService';
import CalculatingAnimation from '../components/CalculatingAnimation';
import { useLustre } from '../hooks/useLustre';

const { width: SCREEN_W } = Dimensions.get('window');

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
  goldGlow: 'rgba(201,168,76,0.35)',
};

// Property images — NYC (ny_) and Dubai (db_)
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

const CITIES = [
  { key: CityType.MANHATTAN, label: '🗽 NYC' },
  { key: CityType.DUBAI,     label: '🏙️ Dubai' },
];

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

// ── Lustre: gold flash when badge is buffed ───────────────────────────────────
const BuffFlash = ({ visible }) => {
  const flash = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    flash.setValue(1);
    Animated.timing(flash, { toValue: 0, duration: 700, useNativeDriver: true }).start();
  }, [visible]);
  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 12,
        backgroundColor: 'rgba(255,215,0,0.45)',
        opacity: flash,
      }}
    />
  );
};

// ── Lustre: 6 gold sparks fly outward on buff ─────────────────────────────────
const SPARK_ANGLES = [0, 60, 120, 180, 240, 300];
const SparkParticles = ({ trigger }) => {
  const anims = useRef(
    Array.from({ length: 6 }, () => ({
      x:  new Animated.Value(0),
      y:  new Animated.Value(0),
      op: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!trigger) return;
    anims.forEach(a => { a.x.setValue(0); a.y.setValue(0); a.op.setValue(0); });
    Animated.parallel(
      anims.map((a, i) => {
        const rad  = (SPARK_ANGLES[i] * Math.PI) / 180;
        const dist = 58;
        return Animated.parallel([
          Animated.timing(a.x,  { toValue: Math.cos(rad) * dist, duration: 520, useNativeDriver: true }),
          Animated.timing(a.y,  { toValue: Math.sin(rad) * dist, duration: 520, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(a.op, { toValue: 1, duration: 80,  useNativeDriver: true }),
            Animated.timing(a.op, { toValue: 0, duration: 440, useNativeDriver: true }),
          ]),
        ]);
      })
    ).start();
  }, [trigger]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', alignSelf: 'center', top: '40%' }}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 7, height: 7, borderRadius: 4,
            backgroundColor: i % 2 === 0 ? '#FFD700' : '#FFFACD',
            marginLeft: -3.5, marginTop: -3.5,
            opacity: a.op,
            transform: [{ translateX: a.x }, { translateY: a.y }],
          }}
        />
      ))}
    </View>
  );
};

// ── Lustre: gauge bar + streak indicator shown below badge ────────────────────
const LustreGauge = ({ lustre, streak, isMidasTouch }) => {
  const barColor = isMidasTouch ? ['#B8860B', '#FFD700', '#FFFACD']
    : lustre > 60 ? [P.goldDeep, P.gold, P.goldLight]
    : lustre > 25 ? ['#6B5B1A', '#A07830', '#C9A84C']
    :               ['#3A3A3A', '#555',    '#777'];

  return (
    <View style={lg.wrap}>
      {/* Bar */}
      <View style={lg.barBg}>
        <LinearGradient
          colors={barColor}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[lg.barFill, { width: `${lustre}%` }]}
        />
      </View>
      {/* Labels row */}
      <View style={lg.row}>
        <Text style={lg.label}>LUSTRE</Text>
        <Text style={[lg.pct, {
          color: isMidasTouch ? '#FFD700' : lustre > 60 ? P.goldLight : lustre > 25 ? P.gold : '#666',
        }]}>{lustre}%</Text>
        {streak > 0 && !isMidasTouch && (
          <Text style={lg.streak}>🔥 {streak}d</Text>
        )}
        {isMidasTouch && (
          <Text style={lg.midas}>✨ MIDAS</Text>
        )}
      </View>
      {/* Hint when fading */}
      {lustre < 35 && (
        <Text style={lg.hint}>← 스와이프하여 광택 복구 →</Text>
      )}
    </View>
  );
};

// ── Wallet Picker Modal ───────────────────────────────────────────────────────
const WalletPickerModal = ({ visible, onSelect, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[wm.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={wm.sheet}>
          <View style={wm.handle} />
          <Text style={wm.title}>Connect Wallet</Text>
          <Text style={wm.sub}>Select your Solana wallet</Text>
          <TouchableOpacity style={wm.btn} onPress={() => onSelect('seedvault')} activeOpacity={0.7}>
            <Text style={wm.emoji}>🔐</Text>
            <View style={{ flex: 1 }}>
              <Text style={wm.btnLabel}>Seed Vault</Text>
              <Text style={wm.btnSub}>Seeker built-in secure wallet</Text>
            </View>
            <Text style={wm.arrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={wm.cancelBtn} onPress={onClose}>
            <Text style={wm.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ── Floating Badge ────────────────────────────────────────────────────────────
// nextImageKey: faint silhouette of the next level shown behind the current frame
// level: scales glow intensity (1 = subtle, 10 = blazing)
const FloatingBadge = ({ imageKey, nextImageKey, tierColor, level, isMidasTouch }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim  = useRef(new Animated.Value(0.6)).current;

  // Glow scales with level: opacity max 0.55 (lv1) → 1.0 (lv10)
  //                          shadowRadius    16   →  44
  const glowMax    = Math.min(0.5 + (level || 1) * 0.05, 1.0);
  const glowRadius = Math.min(16 + (level || 1) * 3, 46);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: glowMax,       duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: glowMax * 0.5, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const imageSource     = PROPERTY_IMAGES[imageKey] ?? PROPERTY_IMAGES['ny_level1'];
  const nextImageSource = nextImageKey ? PROPERTY_IMAGES[nextImageKey] : null;

  return (
    <Animated.View style={[s.badgeWrap, { transform: [{ translateY: floatAnim }] }]}>
      {/* Outer glow — intensity and radius scale with tier level */}
      <Animated.View style={[
        s.badgeGlow,
        { opacity: glowAnim, borderColor: tierColor || P.gold, shadowRadius: glowRadius },
      ]} />
      {/* Midas Touch extra aura — 7-day streak reward */}
      {isMidasTouch && (
        <Animated.View style={[s.midasAura, { opacity: glowAnim }]} />
      )}
      {/* Next-level silhouette — faint ghost of the next property */}
      {nextImageSource && (
        <Image
          source={nextImageSource}
          style={s.nextSilhouette}
          resizeMode="cover"
          blurRadius={6}
        />
      )}
      {/* Gold pixel border frame */}
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.badgeFrame}
      >
        <View style={s.badgeInner}>
          <Image source={imageSource} style={s.badgeImage} resizeMode="cover" />
          {/* Pixel art scanlines overlay */}
          <View style={s.scanlines} />
        </View>
      </LinearGradient>
      {/* Level pill */}
      <View style={[s.levelPill, { borderColor: tierColor || P.gold }]}>
        <Text style={[s.levelPillText, { color: tierColor || P.gold }]}>LEVEL {level || '?'}</Text>
      </View>
    </Animated.View>
  );
};

// ── Default (not connected) Badge ─────────────────────────────────────────────
const DefaultBadge = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1,   duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={s.badgeWrap}>
      <Animated.View style={[s.badgeGlow, { opacity: pulseAnim, borderColor: P.gold }]} />
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.badgeFrame}
      >
        <View style={[s.badgeInner, s.badgeInnerEmpty]}>
          <Text style={s.badgeQuestion}>?</Text>
        </View>
      </LinearGradient>
      <View style={s.levelPill}>
        <Text style={s.levelPillText}>LEVEL ?</Text>
      </View>
    </View>
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
  const [solPrice,       setSolPrice]       = useState(0);
  const [priceChange24h, setPriceChange24h] = useState(null);
  const [solSparkline,   setSolSparkline]   = useState([]);
  const [mappingResult,  setMappingResult]  = useState(null);
  const [isCalculating,  setIsCalculating]  = useState(false);
  const [showPicker,     setShowPicker]     = useState(false);

  // Lustre meter — 24h decay, swipe-to-buff, 7-day Midas streak
  const { lustre, streak, isMidasTouch, buff } = useLustre(walletAddress);

  // buffRef: stable reference so PanResponder (created once) always calls latest buff
  const buffRef = useRef(buff);
  useEffect(() => { buffRef.current = buff; }, [buff]);

  // PanResponder: horizontal swipe on badge → buff
  const lustrePan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder:       () => false,
      onMoveShouldSetPanResponder: (_, { dx, dy }) =>
        Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy),
      onPanResponderRelease: (_, { dx }) => {
        if (Math.abs(dx) > 35) {
          buffRef.current();
          setShowFlash(true);
          setBuffCount(c => c + 1);
          setTimeout(() => setShowFlash(false), 750);
        }
      },
    })
  ).current;

  // City transition fade — fades hero+balance out then back in on city switch
  const cityFade = useRef(new Animated.Value(1)).current;


  // Clear result immediately when wallet disconnects (also handles async race)
  useEffect(() => {
    if (!isConnected) setMappingResult(null);
  }, [isConnected]);

  // Auto-calculate on connect or city change
  useEffect(() => {
    if (isConnected && balance !== null) {
      handleCalculate();
    }
  }, [isConnected, balance, selectedCity]);

  useEffect(() => {
    loadPrices();
  }, [selectedCity]);

  const loadPrices = async () => {
    try {
      const prices = await priceDataService.fetchAllPrices(selectedCity);
      setSolPrice(prices.solPrice || 0);
      setPriceChange24h(prices.priceChange24h ?? null);
      setSolSparkline(prices.solSparkline || []);
    } catch (e) {
      console.error('Price load failed:', e);
    }
  };

  const handleWalletSelect = async (walletId) => {
    setShowPicker(false);
    await connectWallet(walletId);
  };

  const handleCalculate = async () => {
    if (!isConnected) { setShowPicker(true); return; }
    setIsCalculating(true);
    try {
      // Single fetch — result reused for both state update and calculation
      const prices = await priceDataService.fetchAllPrices(selectedCity);
      setSolPrice(prices.solPrice || 0);
      setPriceChange24h(prices.priceChange24h ?? null);
      setSolSparkline(prices.solSparkline || []);
      const result = valueCalculator.determineMapping({
        solAmount: balance || 0,
        solPrice:  prices.solPrice || 0,
        cityType:  selectedCity,
      });
      await new Promise(r => setTimeout(r, 800));
      setMappingResult(result);
      saveToHistory(result);
    } catch (e) {
      console.error('Calculate failed:', e);
    } finally {
      setIsCalculating(false);
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

  const saveToHistory = async (result) => {
    try {
      const key = `history_${walletAddress}`;
      const existing = await AsyncStorage.getItem(key);
      const history  = existing ? JSON.parse(existing) : [];
      history.unshift({ ...result, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
    } catch (e) { /* silent */ }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      // quality 0.9: ~30% faster than 1.0, visually indistinguishable at share sizes
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 0.9 });
      // 2. Share via expo-sharing (works on both iOS & Android)
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Share My Status',
          UTI: 'public.png',
        });
      } else {
        // Fallback: text share
        const usdVal = totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 });
        const percentileStr = (mappingResult?.percentile && mappingResult.percentile !== 'Newcomer')
          ? `🏆 ${mappingResult.percentile} of SOL Holders\n`
          : '';
        await Share.share({
          message:
            `🏛️ Sol-lionaire — Level ${levelNum}: ${mappingResult?.propertyName}\n` +
            `💰 ${solBalance.toFixed(4)} SOL ≈ $${usdVal}\n` +
            percentileStr +
            `Claim your piece of the Skyline 👑`,
        });
      }
    } catch (e) {
      console.log('Share failed', e);
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

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Logo ─────────────────────────────────────────────────────────── */}
        <LinearGradient
          colors={[P.charcoal, P.black]}
          style={s.logoArea}
        >
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.logoGrad}
          >
            <Text style={s.logoText}>SOL LIONAIRE</Text>
          </LinearGradient>
          <Text style={s.logoSub}>Luxury Status Layer · Solana</Text>
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
                />
                <BuffFlash visible={showFlash} />
                <SparkParticles trigger={buffCount} />
              </View>
            ) : (
              <DefaultBadge />
            )}

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

            {/* Percentile badge — hide for Newcomer */}
            {isConnected && mappingResult?.percentile && mappingResult.percentile !== 'Newcomer' && (
              <View style={s.percentileBadge}>
                <Text style={s.percentileText}>{mappingResult.percentile} of SOL Holders</Text>
              </View>
            )}
          </View>

          {/* Balance Display (only when connected) */}
          {isConnected && <View style={s.balanceCard}>
            <LinearGradient
              colors={['rgba(201,168,76,0.08)', 'rgba(0,0,0,0)']}
              style={s.balanceGradient}
            >
              <Text style={s.balanceSOL}>
                {solBalance.toFixed(4)} <Text style={s.balanceSOLUnit}>SOL</Text>
              </Text>
              <Text style={s.balanceUSD}>
                {solPrice > 0
                  ? `≈ $${totalUSD.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                  : '≈ ---'}
              </Text>
              {/* Wealth Pulse — 24h change % + sparkline */}
              {priceChange24h !== null && (
                <View style={s.wealthPulse}>
                  <Text style={[
                    s.wealthChange,
                    { color: priceChange24h >= 0 ? '#4DB36A' : '#E05555' },
                  ]}>
                    {priceChange24h >= 0 ? '▲' : '▼'} {Math.abs(priceChange24h).toFixed(2)}% (24h)
                  </Text>
                  <PriceSpark prices={solSparkline} positive={priceChange24h >= 0} />
                </View>
              )}
              {/* Wallet tag */}
              <View style={s.walletTag}>
                <Text style={s.walletTagText}>
                  {walletAddress?.slice(0, 4)}…{walletAddress?.slice(-4)}
                </Text>
              </View>
            </LinearGradient>
          </View>}

        </Animated.View>

        {/* ─── City Toggle (only when connected) ───────────────────────────── */}
        {isConnected && <View style={s.cityToggleRow}>
          {CITIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[s.cityBtn, selectedCity === c.key && s.cityBtnActive]}
              onPress={() => handleCityChange(c.key)}
            >
              <Text style={[s.cityBtnText, selectedCity === c.key && s.cityBtnTextActive]}>
                {c.label}
              </Text>
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
            <Text style={sc.logo}>SOL LIONAIRE</Text>
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
const BADGE_SIZE = Math.min(SCREEN_W * 0.62, 260);

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: P.black },
  scroll:  { flex: 1 },
  scrollContent: { paddingBottom: 20 },

  // Logo
  logoArea: { alignItems: 'center', paddingTop: 56, paddingBottom: 20 },
  logoGrad: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8, marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: '900', letterSpacing: 6, color: P.black },
  logoSub:  { fontSize: 11, color: P.gray, letterSpacing: 3 },

  // Hero
  heroArea: { alignItems: 'center', paddingVertical: 16, paddingHorizontal: 24 },

  // Floating badge
  badgeWrap: { alignItems: 'center', marginBottom: 20 },
  // Ghost silhouette of the next-level property behind the badge
  nextSilhouette: {
    position: 'absolute',
    width: BADGE_SIZE + 28,
    height: BADGE_SIZE + 28,
    borderRadius: 16,
    opacity: 0.18,
  },
  // Midas Touch: extra golden ring around badge (7-day streak reward)
  midasAura: {
    position: 'absolute',
    width: BADGE_SIZE + 52,
    height: BADGE_SIZE + 52,
    borderRadius: (BADGE_SIZE + 52) / 2,
    borderWidth: 2.5,
    borderColor: '#FFD700',
    top: -26,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 18,
  },
  badgeGlow: {
    position: 'absolute',
    width: BADGE_SIZE + 32,
    height: BADGE_SIZE + 32,
    borderRadius: (BADGE_SIZE + 32) / 2,
    borderWidth: 2,
    borderColor: P.gold,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 24,
    elevation: 20,
    top: -16,
  },
  badgeFrame: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: 12,
    padding: 4,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  badgeInner: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: P.dark,
  },
  badgeInnerEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage: { width: '100%', height: '100%' },
  badgeQuestion: { fontSize: 72, color: P.border },
  scanlines: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  levelPill: {
    position: 'absolute',
    bottom: -12,
    backgroundColor: P.black,
    borderWidth: 1,
    borderColor: P.gold,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  levelPillText: { fontSize: 10, fontWeight: '800', color: P.gold, letterSpacing: 3 },

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
  balanceSOL: {
    fontSize: 52,
    fontWeight: '900',
    color: P.gold,
    letterSpacing: -1,
  },
  balanceSOLUnit: { fontSize: 28, fontWeight: '400', color: P.goldLight },
  balanceUSD: { fontSize: 14, color: P.gray, marginTop: 4 },
  balanceEmpty: { fontSize: 52, fontWeight: '900', color: P.border, letterSpacing: -1 },

  // Wealth Pulse row — 24h change + sparkline
  wealthPulse: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  wealthChange: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  walletTag: {
    marginTop: 14,
    backgroundColor: P.mid,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  walletTagText: { fontSize: 11, color: P.gray, fontFamily: 'monospace' },

  // City toggle
  cityToggleRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: P.dark,
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: P.border,
  },
  cityBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  cityBtnActive: { backgroundColor: P.gold },
  cityBtnText: { fontSize: 13, fontWeight: '600', color: P.gray },
  cityBtnTextActive: { color: P.black, fontWeight: '800' },

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
  shareBtn:   { borderRadius: 14, overflow: 'hidden' },
  connectBtn: { borderRadius: 14, overflow: 'hidden' },
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

// ── Lustre Gauge Styles ───────────────────────────────────────────────────────
const lg = StyleSheet.create({
  wrap:   { alignItems: 'center', marginTop: 6, marginBottom: 4, width: '100%' },
  barBg:  { width: 140, height: 4, backgroundColor: P.border, borderRadius: 2, overflow: 'hidden', marginBottom: 5 },
  barFill:{ height: '100%', borderRadius: 2 },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label:  { fontSize: 8,  color: P.gray,      letterSpacing: 2, fontWeight: '600' },
  pct:    { fontSize: 10, fontWeight: '700',  letterSpacing: 0.5 },
  streak: { fontSize: 10, color: P.gold },
  midas:  { fontSize: 10, color: '#FFD700',   fontWeight: '700', letterSpacing: 1 },
  hint:   { fontSize: 9,  color: '#555',       marginTop: 4, letterSpacing: 0.5 },
});

// ── Wallet Modal Styles ───────────────────────────────────────────────────────
const wm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: P.mid,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 44,
    borderTopWidth: 1,
    borderColor: P.gold,
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: P.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title:  { fontSize: 22, fontWeight: '700', color: P.offWhite, marginBottom: 4, letterSpacing: 0.5 },
  sub:    { fontSize: 13, color: P.gray, marginBottom: 24 },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: P.dark,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: P.border,
    gap: 12,
  },
  emoji:    { fontSize: 28 },
  btnLabel: { fontSize: 16, fontWeight: '600', color: P.offWhite, marginBottom: 2 },
  btnSub:   { fontSize: 12, color: P.gray },
  arrow:    { fontSize: 20, color: P.gold },
  cancelBtn: { alignItems: 'center', padding: 16, marginTop: 4 },
  cancelText: { fontSize: 16, color: P.gray },
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
  accentTop: {
    height: 6,
    width: '100%',
  },
  accentBottom: {
    height: 6,
    width: '100%',
  },

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
    paddingBottom: 16,
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
