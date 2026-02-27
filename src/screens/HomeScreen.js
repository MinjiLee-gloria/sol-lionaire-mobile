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
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Animated, Modal, Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { Share } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../context/WalletContext';
import { valueCalculator, CityType, PROPERTY_TIERS } from '../services/valueCalculator';
import { priceDataService } from '../services/pythPriceService';
import CalculatingAnimation from '../components/CalculatingAnimation';

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

// Property images (NYC only for now)
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
const FloatingBadge = ({ imageKey, tierColor, level }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim  = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 2200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1,   duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const imageSource = imageKey ? PROPERTY_IMAGES[imageKey] : PROPERTY_IMAGES['ny_level1'];

  return (
    <Animated.View style={[s.badgeWrap, { transform: [{ translateY: floatAnim }] }]}>
      {/* Outer glow */}
      <Animated.View style={[s.badgeGlow, { opacity: glowAnim, borderColor: tierColor || P.gold }]} />
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

  const [selectedCity,  setSelectedCity]  = useState(CityType.MANHATTAN);
  const [solPrice,      setSolPrice]      = useState(0);
  const [mappingResult, setMappingResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showPicker,    setShowPicker]    = useState(false);


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
    try {
      // 1. Capture the off-screen share card as PNG
      const uri = await captureRef(shareCardRef, { format: 'png', quality: 1 });
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
        await Share.share({
          message:
            `🏛️ Sol-lionaire — Level ${levelNum}: ${mappingResult?.propertyName}\n` +
            `💰 ${solBalance.toFixed(4)} SOL ≈ $${usdVal}\n` +
            `🏆 ${mappingResult?.percentile ?? ''} of SOL Holders\n` +
            `Claim your piece of the Skyline 👑`,
        });
      }
    } catch (e) {
      console.log('Share failed', e);
    }
  };

  // Ref for the off-screen share card
  const shareCardRef = useRef(null);

  // Displayed values
  const solBalance = balance || 0;
  const totalUSD   = solBalance * solPrice;

  const tier      = (isConnected && mappingResult) ? mappingResult.tier : null;
  const imageKey  = tier?.imageKey?.[selectedCity] ?? 'ny_level1';
  const levelNum  = tier?.level ?? null;
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

        {/* ─── Hero Badge ───────────────────────────────────────────────────── */}
        <View style={s.heroArea}>
          {isConnected && mappingResult ? (
            <FloatingBadge
              imageKey={imageKey}
              tierColor={tier?.color}
              level={levelNum}
            />
          ) : (
            <DefaultBadge />
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

          {/* Percentile badge — hide for Newcomer (text doesn't read well) */}
          {isConnected && mappingResult?.percentile && mappingResult.percentile !== 'Newcomer' && (
            <View style={s.percentileBadge}>
              <Text style={s.percentileText}>{mappingResult.percentile} of SOL Holders</Text>
            </View>
          )}
        </View>

        {/* ─── Balance Display (only when connected) ────────────────────────── */}
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
              {/* Wallet tag */}
              <View style={s.walletTag}>
                <Text style={s.walletTagText}>
                  {walletAddress?.slice(0, 4)}…{walletAddress?.slice(-4)}
                </Text>
              </View>
          </LinearGradient>
        </View>}

        {/* ─── City Toggle (only when connected) ───────────────────────────── */}
        {isConnected && <View style={s.cityToggleRow}>
          {CITIES.map(c => (
            <TouchableOpacity
              key={c.key}
              style={[s.cityBtn, selectedCity === c.key && s.cityBtnActive]}
              onPress={() => setSelectedCity(c.key)}
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
                style={s.shareBtn}
                onPress={handleShare}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={s.shareBtnGrad}
                >
                  <Text style={s.shareBtnText}>Share My Status</Text>
                </LinearGradient>
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
