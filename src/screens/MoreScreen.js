/**
 * More Screen — Sol-lionaire
 * Tab 3: Settings & Vault
 *
 *  - Wallet Management : address + disconnect
 *  - App Config        : Language (KO/EN), Currency display, notifications
 *  - Project Info      : Hackathon details, social links
 *  - Legal Disclaimer
 */
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  TouchableOpacity, Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useWallet } from '../context/WalletContext';

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

  const shortAddr = walletAddress
    ? `${walletAddress.slice(0, 6)}…${walletAddress.slice(-6)}`
    : null;

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
              <Row label="Address"   value={shortAddr}                   isLast={false} />
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
          <Row label="Network"       value="Solana Devnet"  isLast={false} />
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
              Sol-lionaire is an entertainment visualization tool. All valuations are simulations
              based on real-time SOL price and do not represent actual ownership or investment advice.
              Real estate benchmarks: Manhattan $23,000/m², Dubai $9,000/m² (Q1 2026).
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
});
