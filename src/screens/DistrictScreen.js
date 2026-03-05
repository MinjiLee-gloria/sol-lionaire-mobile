/**
 * DistrictScreen — The District
 * Tab 3: Level-gated community hub (concept / coming soon)
 */
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { valueCalculator } from '../services/valueCalculator';
import { priceDataService } from '../services/pythPriceService';
import { P } from '../constants/theme';

const DISTRICTS = [
  {
    id: 'high_table',
    name: 'The High Table',
    eyebrow: 'VVIP · LEVEL 8 – 10',
    minLevel: 8,
    icon: '👑',
    description: 'Where the skyline meets sovereignty. The apex of the Solionaire world.',
    vibe: 'Central Park Penthouse  ·  Burj Khalifa District',
    accentColors: [P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep],
  },
  {
    id: 'avenue',
    name: 'The Avenue',
    eyebrow: 'PREMIUM · LEVEL 4 – 7',
    minLevel: 4,
    icon: '🏛️',
    description: 'Fifth Avenue meets Sheikh Zayed Road. Real holders, real conversations.',
    vibe: 'SoHo Loft  ·  Palm Jumeirah Frond',
    accentColors: ['#5A3A10', '#8A5820', P.gold, '#8A5820', '#5A3A10'],
  },
  {
    id: 'plaza',
    name: 'The Plaza',
    eyebrow: 'OPEN · LEVEL 1 – 3',
    minLevel: 1,
    icon: '🌆',
    description: 'The starting point of every empire. Share strategies and rise together.',
    vibe: 'Central Park  ·  Dubai Marina Walk',
    accentColors: ['#2A2A2A', '#444444', '#666666', '#444444', '#2A2A2A'],
  },
];

const getUserDistrictId = (level) => {
  if (level >= 8) return 'high_table';
  if (level >= 4) return 'avenue';
  return 'plaza';
};

// ── District Card ─────────────────────────────────────────────────────────────
const DistrictCard = ({ district, isLocked, isCurrent }) => (
  <View style={[dc.wrap, isCurrent && dc.wrapCurrent, isLocked && dc.wrapLocked]}>
    {/* Top accent line */}
    <LinearGradient
      colors={isLocked ? ['#1A1A1A', '#2A2A2A', '#1A1A1A'] : district.accentColors}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={dc.accent}
    />

    <View style={dc.body}>
      {/* Left: icon + info */}
      <View style={dc.left}>
        <Text style={[dc.icon, isLocked && { opacity: 0.3 }]}>{district.icon}</Text>
        <View style={dc.info}>
          <Text style={[dc.eyebrow, isLocked && dc.dim]}>{district.eyebrow}</Text>
          <Text style={[dc.name, isLocked && dc.dim]}>{district.name}</Text>
        </View>
      </View>

      {/* Right: status badge */}
      {isLocked ? (
        <View style={dc.lockBadge}>
          <Ionicons name="lock-closed" size={10} color="rgba(201,168,76,0.5)" />
          <Text style={dc.lockText}> {district.minLevel}+</Text>
        </View>
      ) : isCurrent ? (
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={dc.hereBadge}
        >
          <Text style={dc.hereText}>YOU ARE HERE</Text>
        </LinearGradient>
      ) : (
        <View style={dc.accessBadge}>
          <Text style={dc.accessText}>ACCESSIBLE</Text>
        </View>
      )}
    </View>

    {/* Description */}
    <Text style={[dc.desc, isLocked && dc.dim]}>{district.description}</Text>
    <Text style={[dc.vibe, isLocked && dc.dim]}>{district.vibe}</Text>

    {/* Footer */}
    <View style={dc.footer}>
      {isLocked ? (
        <>
          <Ionicons name="lock-closed-outline" size={12} color="rgba(201,168,76,0.4)" />
          <Text style={dc.footerLocked}>  Reach Level {district.minLevel} to unlock</Text>
        </>
      ) : (
        <>
          <Ionicons name="hourglass-outline" size={12} color={P.gray} />
          <Text style={dc.footerSoon}>  Community features coming soon</Text>
        </>
      )}
    </View>
  </View>
);

const dc = StyleSheet.create({
  wrap: {
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 18, borderWidth: 1, borderColor: P.border,
    backgroundColor: '#0D0D0D', overflow: 'hidden',
  },
  wrapCurrent: {
    borderColor: P.gold,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 12,
  },
  wrapLocked: { opacity: 0.45 },
  accent: { height: 2 },

  body:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 10 },
  left:  { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 },
  icon:  { fontSize: 26, marginRight: 12 },
  info:  { flex: 1 },
  eyebrow: { fontSize: 8, color: P.gold, letterSpacing: 3, fontWeight: '700', marginBottom: 3 },
  name:    { fontSize: 18, fontWeight: '700', color: P.offWhite, letterSpacing: 0.3 },
  dim:     { color: '#444' },

  lockBadge:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(201,168,76,0.3)', borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  lockText:   { fontSize: 11, color: 'rgba(201,168,76,0.5)', fontWeight: '700' },
  hereBadge:  { borderRadius: 8, paddingHorizontal: 11, paddingVertical: 6 },
  hereText:   { fontSize: 8, color: P.black, fontWeight: '900', letterSpacing: 1.5 },
  accessBadge:{ borderWidth: 1, borderColor: P.border, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 5 },
  accessText: { fontSize: 8, color: P.gray, fontWeight: '600', letterSpacing: 1 },

  desc:  { fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 20, paddingHorizontal: 16, marginBottom: 5 },
  vibe:  { fontSize: 10, color: P.border, paddingHorizontal: 16, marginBottom: 14, letterSpacing: 0.5, fontStyle: 'italic' },

  footer:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1A1A1A' },
  footerLocked: { fontSize: 11, color: 'rgba(201,168,76,0.4)', fontStyle: 'italic' },
  footerSoon:   { fontSize: 11, color: P.gray, fontStyle: 'italic' },
});

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <LinearGradient colors={[P.black, P.charcoal]} style={{ flex: 1 }}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <Text style={{ fontSize: 44, fontWeight: '100', color: P.gold, letterSpacing: 8, marginBottom: 20 }}>◈</Text>
      <Text style={{ fontSize: 22, fontWeight: '300', color: P.offWhite, letterSpacing: 3, marginBottom: 10 }}>
        THE DISTRICT
      </Text>
      <Text style={{ fontSize: 13, color: P.gray, textAlign: 'center', lineHeight: 22 }}>
        Connect your wallet to find your district.
      </Text>
    </View>
  </LinearGradient>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DistrictScreen() {
  const { balance, isConnected } = useWallet();

  // ── Async price fetch: cache read on cold start is 0 ─────────────────────
  const [solPrice, setSolPrice] = useState(() => priceDataService.cache.solPrice || 0);
  useEffect(() => {
    let cancelled = false;
    priceDataService.fetchSolPrice().then(p => {
      if (!cancelled) setSolPrice(p || 0);
    });
    return () => { cancelled = true; };
  }, []);

  if (!isConnected) return <EmptyState />;

  const tier           = valueCalculator.getTierForUSD((balance || 0) * solPrice);
  const userLevel      = tier.level;
  const userDistrictId = getUserDistrictId(userLevel);
  const userDistrict   = DISTRICTS.find(d => d.id === userDistrictId);

  return (
    <View style={s.root}>
      {/* ── Header ── */}
      <LinearGradient colors={[P.charcoal, P.black]} style={s.header}>
        <LinearGradient
          colors={['transparent', P.goldDeep, P.gold, P.goldDeep, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.headerRule}
        />
        <Text style={s.headerEye}>TERRITORY NETWORK</Text>
        <Text style={s.headerTitle}>The District</Text>
        <View style={s.myTierRow}>
          <LinearGradient
            colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={s.myTierBadge}
          >
            <Text style={s.myTierText}>
              {userDistrict?.name.toUpperCase()}  ·  LVL {userLevel}
            </Text>
          </LinearGradient>
        </View>
        <LinearGradient
          colors={['transparent', P.goldDeep, P.gold, P.goldDeep, 'transparent']}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.headerRule}
        />
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
      >
        {/* Coming soon notice */}
        <View style={s.notice}>
          <Text style={s.noticeEye}>COMING SOON</Text>
          <Text style={s.noticeBody}>
            Posts, photos, and real-time chat with holders in your district — arriving in a future update.
          </Text>
        </View>

        {DISTRICTS.map(district => (
          <DistrictCard
            key={district.id}
            district={district}
            isLocked={userLevel < district.minLevel}
            isCurrent={district.id === userDistrictId}
          />
        ))}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: P.black },

  header: {
    alignItems: 'center',
    paddingTop: 52,
    paddingBottom: 20,
    gap: 8,
  },
  headerRule:  { width: '70%', height: 1 },
  headerEye:   { fontSize: 9, color: 'rgba(201,168,76,0.5)', letterSpacing: 4, fontWeight: '600' },
  headerTitle: { fontSize: 24, fontWeight: '300', color: P.offWhite, letterSpacing: 3 },

  myTierRow:   { alignItems: 'center' },
  myTierBadge: { borderRadius: 8, paddingHorizontal: 18, paddingVertical: 7 },
  myTierText:  { fontSize: 10, color: P.black, fontWeight: '900', letterSpacing: 1.5 },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 20 },

  notice: {
    marginHorizontal: 16, marginBottom: 4,
    padding: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(201,168,76,0.15)',
    alignItems: 'center',
  },
  noticeEye:  { fontSize: 8, color: P.gold, letterSpacing: 4, fontWeight: '700', marginBottom: 6 },
  noticeBody: { fontSize: 12, color: P.gray, lineHeight: 18, textAlign: 'center' },
});
