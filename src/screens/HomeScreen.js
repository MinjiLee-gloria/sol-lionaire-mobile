import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, StatusBar, Alert, Modal, Animated,
} from 'react-native';
import { Linking } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWallet } from '../context/WalletContext';
import { valueCalculator, CityType } from '../services/valueCalculator';
import { priceDataService } from '../services/pythPriceService';
import CalculatingAnimation from '../components/CalculatingAnimation';
import ResultCard from '../components/ResultCard';
import { Colors, Typography, Spacing, BorderRadius } from '../styles/theme';
import HeroSection from '../components/HeroSection';

const CITIES = [
  { key: CityType.MANHATTAN, label: 'Manhattan', emoji: '🗽', country: 'USA' },
  { key: CityType.DUBAI, label: 'Dubai', emoji: '🏙️', country: 'UAE' },
];

// ── 지갑 선택 Modal ─────────────────────────────────────────────────────────
const WalletPickerModal = ({ visible, onSelect, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [visible]);

  const WALLETS = [
    
    { id: 'seedvault', emoji: '🔐', label: 'Seed Vault', sub: 'Seeker built-in secure wallet' },
  ];

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[mStyles.overlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} activeOpacity={1} />
        <View style={mStyles.sheet}>
          <View style={mStyles.handle} />
          <Text style={mStyles.title}>Connect Wallet</Text>
          <Text style={mStyles.subtitle}>Select your Solana wallet</Text>

          {WALLETS.map((w) => (
            <TouchableOpacity
              key={w.id}
              style={mStyles.walletBtn}
              onPress={() => onSelect(w.id)}
              activeOpacity={0.7}
            >
              <Text style={mStyles.walletEmoji}>{w.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={mStyles.walletLabel}>{w.label}</Text>
                <Text style={mStyles.walletSub}>{w.sub}</Text>
              </View>
              <Text style={mStyles.arrow}>›</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={mStyles.cancelBtn} onPress={onClose}>
            <Text style={mStyles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const {
    walletAddress, balance, isConnected, isLoading,
    walletName, connectWallet, disconnectWallet,
  } = useWallet();

  const [selectedCity,   setSelectedCity]   = useState(CityType.MANHATTAN);
  const [solPrice,       setSolPrice]       = useState(0);
  const [pricePerSqm,    setPricePerSqm]    = useState(0);
  const [mappingResult,  setMappingResult]  = useState(null);
  const [isCalculating,  setIsCalculating]  = useState(false);
  const [upgradeInfo,    setUpgradeInfo]    = useState(null);
  const [showPicker,     setShowPicker]     = useState(false);

  useEffect(() => { loadPrices(); }, [selectedCity]);
  useEffect(() => {
    if (isConnected && balance !== null) {
      handleCalculate();
    }
  }, [isConnected, selectedCity]);


  const loadPrices = async () => {
    try {
      const prices = await priceDataService.fetchAllPrices(selectedCity);
      setSolPrice(prices.solPrice);
      setPricePerSqm(prices.pricePerSqm);
    } catch (e) { console.error('Price load failed:', e); }
  };

  const handleWalletSelect = async (walletId) => {
    setShowPicker(false);
    await connectWallet(walletId);
  };

  const handleCalculate = async () => {
    if (!isConnected) {
      setShowPicker(true);
      return;
    }
    setIsCalculating(true);
    try {
      await loadPrices();
      const result = valueCalculator.determineMapping({
        solAmount: balance || 2,
        solPrice,
        cityPricePerSqm: pricePerSqm,
        cityType: selectedCity,
      });
      await new Promise(r => setTimeout(r, 1000));
      setMappingResult(result);

      const upgrade = valueCalculator.calculateUpgrade({
        solAmount: balance || 2,
        solPrice,
        cityPricePerSqm: pricePerSqm,
        cityType: selectedCity,
      });
      setUpgradeInfo(upgrade);
      await saveToHistory(result);
    } catch (e) {
      Alert.alert('Error', 'Calculation failed. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const saveToHistory = async (result) => {
    try {
      const key = `history_${walletAddress}`;
      const existing = await AsyncStorage.getItem(key);
      const history = existing ? JSON.parse(existing) : [];
      history.unshift({ ...result, timestamp: new Date().toISOString() });
      await AsyncStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
    } catch (e) { console.error('History save failed:', e); }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <HeroSection />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Wallet Section */}
        <View style={styles.section}>
          {!isConnected ? (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={() => setShowPicker(true)}
              disabled={isLoading}
            >
              <Text style={styles.connectButtonText}>
                {isLoading ? '⏳ Connecting...' : '🔗 Connect Wallet'}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.walletCard}>
              <View style={styles.walletRow}>
                <Text style={styles.walletLabel}>Wallet</Text>
                <Text style={styles.walletName}>{walletName}</Text>
              </View>
              <View style={styles.walletRow}>
                <Text style={styles.walletLabel}>Address</Text>
                <Text style={styles.walletAddress}>
                  {walletAddress?.slice(0, 6)}...{walletAddress?.slice(-6)}
                </Text>
              </View>
              <Text style={styles.balanceText}>{(balance || 0).toFixed(4)} SOL</Text>
              <Text style={styles.balanceUsd}>
                ≈ ${((balance || 0) * solPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Text>
              <TouchableOpacity onPress={() => { disconnectWallet(); setMappingResult(null); setUpgradeInfo(null); }} style={styles.disconnectButton}>
                <Text style={styles.disconnectText}>Disconnect</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Market Data */}
        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Live Market</Text>
            <View style={styles.marketCard}>
              <View style={styles.marketRow}>
                <Text style={styles.marketLabel}>SOL Price</Text>
                <Text style={styles.marketValue}>${solPrice.toFixed(2)}</Text>
              </View>
              <View style={styles.marketRow}>
                <Text style={styles.marketLabel}>{selectedCity} per m²</Text>
                <Text style={styles.marketValue}>${pricePerSqm.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        )}

        {/* City Selection */}
        {isConnected && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🌆 Select City</Text>
            <View style={styles.cityRow}>
              {CITIES.map(city => (
                <TouchableOpacity
                  key={city.key}
                  style={[styles.cityButton, selectedCity === city.key && styles.cityButtonActive]}
                  onPress={() => setSelectedCity(city.key)}
                >
                  <Text style={styles.cityEmoji}>{city.emoji}</Text>
                  <Text style={[styles.cityLabel, selectedCity === city.key && styles.cityLabelActive]}>
                    {city.label}
                  </Text>
                  <Text style={styles.cityCountry}>{city.country}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {mappingResult && !isCalculating && (
          <ResultCard mappingResult={mappingResult} />
        )}

        {/* Upgrade Simulator */}
        {upgradeInfo && !isCalculating && (
          <View style={styles.upgradeCard}>
            <Text style={styles.upgradeTitle}>📈 Upgrade Simulator</Text>
            <Text style={styles.upgradeText}>{upgradeInfo.message}</Text>
            <Text style={styles.upgradeNeeded}>
              Need {upgradeInfo.solNeeded?.toFixed(4)} more SOL
            </Text>
            <TouchableOpacity
              style={styles.jupiterButton}
              onPress={() => Linking.openURL('https://jup.ag/swap/USDC-SOL')}
            >
              <Text style={styles.jupiterButtonText}>⚡ Swap on Jupiter</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      <CalculatingAnimation visible={isCalculating} />

      {/* Wallet Picker Modal */}
      <WalletPickerModal
        visible={showPicker}
        onSelect={handleWalletSelect}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}

// ── Modal Styles ─────────────────────────────────────────────────────────────
const mStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1C1C1C',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: '#C9A84C',
  },
  handle: {
    width: 40, height: 4,
    backgroundColor: '#444',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F5F0E8',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 24,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
    gap: 12,
  },
  walletEmoji: { fontSize: 28 },
  walletLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F0E8',
    marginBottom: 2,
  },
  walletSub: { fontSize: 12, color: '#888' },
  arrow: { fontSize: 20, color: '#C9A84C' },
  cancelBtn: {
    alignItems: 'center',
    padding: 16,
    marginTop: 4,
  },
  cancelText: { fontSize: 16, color: '#888' },
});

// ── Screen Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.darkGray,
    borderBottomWidth: 1, borderBottomColor: Colors.gold,
    alignItems: 'center',
  },
  logo: { fontSize: Typography.xxxl, fontWeight: Typography.bold, color: Colors.gold },
  tagline: { fontSize: Typography.sm, color: Colors.lightGray, marginTop: 4 },
  scroll: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 40 },
  section: { marginBottom: Spacing.xl },
  sectionTitle: {
    fontSize: Typography.lg, fontWeight: Typography.semibold,
    color: Colors.white, marginBottom: Spacing.md,
  },
  connectButton: {
    backgroundColor: Colors.gold, padding: Spacing.lg,
    borderRadius: BorderRadius.lg, alignItems: 'center',
  },
  connectButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.black },
  walletCard: {
    backgroundColor: Colors.darkGray, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: '#333',
  },
  walletRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm,
  },
  walletLabel: { fontSize: Typography.sm, color: Colors.lightGray },
  walletName: { fontSize: Typography.sm, color: Colors.white, fontWeight: Typography.medium },
  walletAddress: { fontSize: Typography.sm, color: Colors.white, fontFamily: 'monospace' },
  balanceText: { fontSize: Typography.huge, fontWeight: Typography.bold, color: Colors.gold, marginTop: Spacing.md },
  balanceUsd: { fontSize: Typography.base, color: Colors.lightGray, marginBottom: Spacing.md },
  disconnectButton: {
    borderWidth: 1, borderColor: '#444', borderRadius: BorderRadius.md,
    padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.sm,
  },
  disconnectText: { fontSize: Typography.sm, color: Colors.lightGray },
  marketCard: {
    backgroundColor: Colors.darkGray, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 1, borderColor: '#333',
  },
  marketRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: Spacing.sm, borderBottomWidth: 1, borderBottomColor: '#333',
  },
  marketLabel: { fontSize: Typography.base, color: Colors.lightGray },
  marketValue: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.white },
  cityRow: { flexDirection: 'row', gap: Spacing.md },
  cityButton: {
    flex: 1, backgroundColor: Colors.darkGray, borderRadius: BorderRadius.xl,
    padding: Spacing.lg, alignItems: 'center', borderWidth: 2, borderColor: '#333',
  },
  cityButtonActive: { borderColor: Colors.gold, backgroundColor: '#1A1500' },
  cityEmoji: { fontSize: 32, marginBottom: Spacing.sm },
  cityLabel: { fontSize: Typography.md, fontWeight: Typography.bold, color: Colors.lightGray },
  cityLabelActive: { color: Colors.gold },
  cityCountry: { fontSize: Typography.xs, color: Colors.darkText, marginTop: 2 },
  calculateButton: {
    backgroundColor: Colors.gold, borderRadius: BorderRadius.lg,
    padding: Spacing.lg, alignItems: 'center', marginVertical: Spacing.xl,
  },
  calculateButtonText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.black },
  upgradeCard: {
    backgroundColor: '#0D1A0D', borderRadius: BorderRadius.xl,
    padding: Spacing.lg, borderWidth: 2, borderColor: Colors.success, marginTop: Spacing.lg,
  },
  upgradeTitle: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.success, marginBottom: Spacing.sm },
  upgradeText: { fontSize: Typography.base, color: Colors.white, marginBottom: Spacing.sm },
  upgradeNeeded: { fontSize: Typography.sm, color: Colors.lightGray, marginBottom: Spacing.md },
  jupiterButton: {
    backgroundColor: Colors.success, borderRadius: BorderRadius.md,
    padding: Spacing.md, alignItems: 'center',
  },
  jupiterButtonText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.white },
});
