/**
 * More Screen — Sol-lionaire
 * Tab 3: Settings & Vault
 *
 *  - Wallet Management : address + disconnect
 *  - App Config        : Language (KO/EN), Currency display, notifications
 *  - Project Info      : Hackathon details, social links
 *  - Legal Disclaimer
 */
import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking, Clipboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../context/WalletContext';
import { P } from '../constants/theme';

// ── Reusable section wrapper ──────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <View style={s.section}>
    <Text style={s.eyebrow}>{title}</Text>
    <View style={s.card}>{children}</View>
  </View>
);

// ── Simple row ────────────────────────────────────────────────────────────────
const Row = ({ label, value, onPress, isLast, danger }) => (
  <TouchableOpacity
    style={[s.row, !isLast && s.rowBorder]}
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.6 : 1}
  >
    <Text style={[s.rowLabel, danger && { color: '#FF6B6B' }]}>{label}</Text>
    <Text style={[s.rowValue, onPress && !danger && { color: P.gold }]}>
      {value}
    </Text>
  </TouchableOpacity>
);


// ── Main Screen ───────────────────────────────────────────────────────────────
export default function MoreScreen() {
  const { walletAddress, isConnected, walletName, disconnectWallet } = useWallet();
  const [copiedAddr, setCopiedAddr] = useState(false);

  const handleCopyAddress = () => {
    Clipboard.setString(walletAddress);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  return (
    <LinearGradient colors={[P.black, P.charcoal]} style={s.flex}>

      {/* Header */}
      <LinearGradient colors={[P.charcoal, P.dark]} style={s.header}>
        <Text style={s.headerEye}>SETTINGS & VAULT</Text>
        <Text style={s.headerTitle}>More</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Wallet Management ─────────────────────────────────────────── */}
        <Section title="WALLET">
          {isConnected ? (
            <>
              <Row label="Provider"  value={walletName || 'Seed Vault'} isLast={false} />
              {/* Address row with full address + copy button */}
              <TouchableOpacity
                style={[s.row, s.rowBorder]}
                onPress={handleCopyAddress}
                activeOpacity={0.6}
              >
                <Text style={s.rowLabel}>Address</Text>
                <View style={s.addrRight}>
                  <Text style={s.addrText} numberOfLines={1}>{walletAddress}</Text>
                  <Text style={s.addrCopy}>{copiedAddr ? '✓' : '⎘'}</Text>
                </View>
              </TouchableOpacity>
              <Row
                label="Disconnect"
                value="→"
                danger
                onPress={disconnectWallet}
                isLast
              />
            </>
          ) : (
            <Row label="Status" value="Not connected" isLast />
          )}
        </Section>

        {/* ── App Info ─────────────────────────────────────────────────── */}
        <Section title="APPLICATION">
          <Row label="Version"       value="0.5.0 (Beta)" isLast={false} />
          <Row label="Network"       value="Solana Mainnet"  isLast={false} />
          <Row label="Price Oracle"  value="CoinGecko"      isLast={false} />
          <Row label="Swap Protocol" value="Jupiter v6"     isLast />
        </Section>

        {/* ── Project Info ─────────────────────────────────────────────── */}
        <Section title="PROJECT">
          <Row
            label="Solana Mobile Hackathon"
            value="View →"
            onPress={() => Linking.openURL('https://solanamobile.radiant.nexus/?panel=hackathon')}
            isLast
          />
        </Section>

        {/* ── Legal ────────────────────────────────────────────────────── */}
        <Section title="LEGAL">
          <View style={s.disclaimer}>
            <LinearGradient
              colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.accentLine}
            />
            <Text style={s.disclaimerTitle}>Simulation Notice</Text>
            <Text style={s.disclaimerBody}>
              {'Solionaire is purely an '}
              <Text style={s.bold}>entertainment and visualization app</Text>
              {'. All asset valuations and level progressions are '}
              <Text style={s.bold}>fictional simulations</Text>
              {' based on real-time SOL/USD price data from CoinGecko. They do '}
              <Text style={s.bold}>not represent real ownership</Text>
              {' of any assets, nor do they constitute '}
              <Text style={s.bold}>financial, investment, or real estate advice</Text>
              {'.\n\nThe displayed real estate equivalents (e.g., Manhattan penthouse, Dubai villa) are illustrative only and use approximate 2026 market reference values for entertainment purposes. Actual real estate prices vary significantly by location, condition, and market conditions. Sol-lionaire has no affiliation with any real estate entities.\n\nCryptocurrency values are highly volatile. This app does not offer investment opportunities, trading, or financial services. '}
              <Text style={s.bold}>Use at your own risk</Text>
              {' and for entertainment only.'}
            </Text>
          </View>
        </Section>

        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: P.gold,
  },
  headerEye:   { fontSize: 9, color: P.gold, letterSpacing: 4, fontWeight: '600', marginBottom: 4 },
  headerTitle: { fontSize: 26, color: P.offWhite, fontWeight: '300', letterSpacing: 2 },

  scroll: { padding: 16 },

  section:  { marginBottom: 24 },
  eyebrow:  { fontSize: 9, color: P.gold, letterSpacing: 4, fontWeight: '600', marginBottom: 8 },
  card: {
    backgroundColor: P.mid,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: P.border },
  rowLabel:  { fontSize: 14, color: P.offWhite, flex: 1 },
  rowValue:  { fontSize: 13, color: P.gray },

  addrRight: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'flex-end' },
  addrText:  { fontSize: 13, color: P.gray, fontFamily: 'monospace', flex: 1, textAlign: 'right' },
  addrCopy:  { fontSize: 13, color: P.gold, flexShrink: 0 },

  // Disclaimer
  disclaimer: {
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  accentLine:      { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  disclaimerTitle: {
    fontSize: 14,
    color: P.gold,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 6,
  },
  disclaimerBody:  { fontSize: 12, color: P.gray, lineHeight: 20 },
  bold:            { fontWeight: '700', color: P.offWhite },
});
