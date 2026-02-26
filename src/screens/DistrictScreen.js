/**
 * DistrictScreen — The District
 * Tab 3: Level-gated community hub
 *
 * The Plaza      (Lvl 1–3)  — Open to all
 * The Avenue     (Lvl 4–7)  — Premium holders
 * The High Table (Lvl 8–10) — VVIP apex
 */
import React from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useWallet } from '../context/WalletContext';
import { valueCalculator } from '../services/valueCalculator';

const { width: W } = Dimensions.get('window');

const P = {
  black:    '#000000',
  charcoal: '#0A0A0A',
  dark:     '#141414',
  border:   '#2A2A2A',
  gray:     '#888888',
  offWhite: '#F5F0E8',
  gold:     '#C9A84C',
  goldLight:'#E8C96A',
  goldDeep: '#A07830',
};

// ── District definitions (displayed top → bottom: highest first) ──────────────
const DISTRICTS = [
  {
    id: 'high_table',
    name: 'The High Table',
    eyebrow: 'VVIP · LEVEL 8 – 10',
    minLevel: 8,
    description: 'Where the skyline meets sovereignty.\nThe apex of the Sol-lionaire world.',
    vibe: 'Central Park Penthouse · Burj Khalifa District',
    accentColors: [P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep],
    memberCount: '12',
    feed: [
      { addr: 'F3mP…xJ9K', action: 'claimed The Landmark Apex on Solana', time: '2h' },
      { addr: '9XhR…mN4L', action: 'entered The High Table', time: '5h' },
      { addr: 'KqW7…pB2Y', action: 'ascended to Level 9', time: '1d' },
    ],
  },
  {
    id: 'avenue',
    name: 'The Avenue',
    eyebrow: 'PREMIUM · LEVEL 4 – 7',
    minLevel: 4,
    description: 'Fifth Avenue meets Sheikh Zayed Road.\nReal holders, real conversations.',
    vibe: 'SoHo Loft · Palm Jumeirah Frond',
    accentColors: ['#5A3A10', '#8A5820', P.gold, '#8A5820', '#5A3A10'],
    memberCount: '89',
    feed: [
      { addr: '2mVs…rC6T', action: 'claimed The Prime 2-Bed on Solana', time: '30m' },
      { addr: 'NpXk…wA3D', action: 'switched to Dubai territory', time: '1h' },
      { addr: 'Hj4Z…bQ8E', action: 'ascended to Level 5', time: '3h' },
    ],
  },
  {
    id: 'plaza',
    name: 'The Plaza',
    eyebrow: 'OPEN · LEVEL 1 – 3',
    minLevel: 1,
    description: 'The starting point of every empire.\nShare strategies and rise together.',
    vibe: 'Central Park · Dubai Marina Walk',
    accentColors: ['#333333', '#555555', '#777777', '#555555', '#333333'],
    memberCount: '1,247',
    feed: [
      { addr: '7gh5…Q5LX', action: 'claimed Level 1 on Solana', time: '5m' },
      { addr: 'BvR3…yM7W', action: 'connected their wallet', time: '12m' },
      { addr: 'Lk9F…nS5P', action: 'ascended to Level 2', time: '45m' },
    ],
  },
];

const getUserDistrictId = (level) => {
  if (level >= 8) return 'high_table';
  if (level >= 4) return 'avenue';
  return 'plaza';
};

// ── Feed Entry ────────────────────────────────────────────────────────────────
const FeedEntry = ({ entry }) => (
  <View style={fe.row}>
    <View style={fe.dot} />
    <View style={fe.content}>
      <Text style={fe.addr}>{entry.addr}</Text>
      <Text style={fe.action}>{entry.action}</Text>
    </View>
    <Text style={fe.time}>{entry.time}</Text>
  </View>
);

const fe = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingBottom: 14 },
  dot:     { width: 5, height: 5, borderRadius: 2.5, backgroundColor: P.gold, marginTop: 5, marginRight: 10 },
  content: { flex: 1 },
  addr:    { fontSize: 11, color: P.goldLight, fontWeight: '700', marginBottom: 2 },
  action:  { fontSize: 12, color: P.gray },
  time:    { fontSize: 10, color: P.border, marginLeft: 8, marginTop: 2 },
});

// ── District Card ─────────────────────────────────────────────────────────────
const DistrictCard = ({ district, isLocked, isCurrent }) => (
  <View style={[dc.wrap, isCurrent && dc.wrapCurrent, isLocked && dc.wrapLocked]}>
    {/* Accent stripe */}
    <LinearGradient
      colors={isLocked ? ['#252525', '#333333', '#252525'] : district.accentColors}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
      style={dc.accent}
    />

    {/* Header */}
    <View style={dc.header}>
      <View style={dc.headerLeft}>
        <Text style={[dc.eyebrow, isLocked && dc.dimText]}>{district.eyebrow}</Text>
        <Text style={[dc.name, isLocked && dc.dimText]}>{district.name}</Text>
      </View>

      {isLocked ? (
        <View style={dc.lockBadge}>
          <Ionicons name="lock-closed" size={11} color={P.gold} />
          <Text style={dc.lockText}> Lvl {district.minLevel}+</Text>
        </View>
      ) : isCurrent ? (
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight]}
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
    <Text style={[dc.desc, isLocked && dc.dimText]}>{district.description}</Text>
    <Text style={[dc.vibe, isLocked ? dc.dimText : { color: P.border }]}>{district.vibe}</Text>

    <View style={dc.divider} />

    {isLocked ? (
      /* Locked state */
      <View style={dc.lockedFooter}>
        <Ionicons name="lock-closed-outline" size={13} color={P.gold} />
        <Text style={dc.lockedMsg}>  Reach Level {district.minLevel} to enter this district</Text>
      </View>
    ) : (
      /* Accessible state */
      <>
        <View style={dc.statsRow}>
          <Text style={dc.statNum}>{district.memberCount}</Text>
          <Text style={dc.statLabel}> Active Members</Text>
        </View>

        <Text style={dc.feedLabel}>RECENT ACTIVITY</Text>
        {district.feed.map((entry, i) => (
          <FeedEntry key={i} entry={entry} />
        ))}
      </>
    )}
  </View>
);

const dc = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: P.border,
    backgroundColor: P.dark,
    overflow: 'hidden',
  },
  wrapCurrent: {
    borderColor: P.gold,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 10,
  },
  wrapLocked: { opacity: 0.5 },
  accent: { height: 2 },

  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 16, paddingBottom: 10 },
  headerLeft: { flex: 1, marginRight: 12 },
  eyebrow:    { fontSize: 9, color: P.gold, letterSpacing: 3, fontWeight: '600', marginBottom: 4 },
  name:       { fontSize: 19, fontWeight: '700', color: P.offWhite },
  dimText:    { color: P.gray },

  lockBadge:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: P.gold, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  lockText:   { fontSize: 10, color: P.gold, fontWeight: '700' },
  hereBadge:  { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  hereText:   { fontSize: 9, color: P.black, fontWeight: '800', letterSpacing: 1 },
  accessBadge:{ borderWidth: 1, borderColor: P.border, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  accessText: { fontSize: 9, color: P.gray, fontWeight: '600', letterSpacing: 1 },

  desc:    { fontSize: 13, color: P.gray, lineHeight: 20, paddingHorizontal: 16, marginBottom: 6 },
  vibe:    { fontSize: 11, paddingHorizontal: 16, marginBottom: 16, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: P.border, marginHorizontal: 16, marginBottom: 14 },

  lockedFooter: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 16 },
  lockedMsg:    { fontSize: 12, color: P.gray, fontStyle: 'italic' },

  statsRow:  { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 16, marginBottom: 14 },
  statNum:   { fontSize: 22, fontWeight: '700', color: P.offWhite },
  statLabel: { fontSize: 12, color: P.gray },
  feedLabel: { fontSize: 9, color: P.gold, letterSpacing: 3, fontWeight: '600', paddingHorizontal: 16, marginBottom: 10 },
});

// ── Empty State ───────────────────────────────────────────────────────────────
const EmptyState = () => (
  <LinearGradient colors={[P.black, P.charcoal]} style={{ flex: 1 }}>
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <Text style={{ fontSize: 48, fontWeight: '100', color: P.gold, letterSpacing: 8, marginBottom: 20 }}>◈</Text>
      <Text style={{ fontSize: 28, fontWeight: '300', color: P.offWhite, letterSpacing: 2, marginBottom: 12 }}>
        The District
      </Text>
      <Text style={{ fontSize: 14, color: P.gray, textAlign: 'center', lineHeight: 22 }}>
        Connect your wallet to find your district.
      </Text>
    </View>
  </LinearGradient>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function DistrictScreen() {
  const { balance, isConnected } = useWallet();

  if (!isConnected) return <EmptyState />;

  const tier          = valueCalculator.getTierForSOL(balance || 0);
  const userLevel     = tier.level;
  const userDistrictId = getUserDistrictId(userLevel);
  const userDistrict  = DISTRICTS.find(d => d.id === userDistrictId);

  return (
    <View style={s.root}>
      {/* Header */}
      <LinearGradient colors={[P.charcoal, P.dark]} style={s.header}>
        <Text style={s.headerEye}>YOUR TERRITORY NETWORK</Text>
        <Text style={s.headerTitle}>The District</Text>
        <LinearGradient
          colors={[P.goldDeep, P.gold, P.goldLight]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={s.myBadge}
        >
          <Text style={s.myBadgeText}>
            {userDistrict?.name.toUpperCase()}  ·  LVL {userLevel}
          </Text>
        </LinearGradient>
      </LinearGradient>

      {/* District cards (High Table → Avenue → Plaza) */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
      >
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
  root:   { flex: 1, backgroundColor: P.black },
  header: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: P.gold,
  },
  headerEye:   { fontSize: 9, color: P.gold, letterSpacing: 4, fontWeight: '600', marginBottom: 4 },
  headerTitle: { fontSize: 26, color: P.offWhite, fontWeight: '300', letterSpacing: 2, marginBottom: 14 },
  myBadge:     { borderRadius: 8, paddingHorizontal: 18, paddingVertical: 7 },
  myBadgeText: { fontSize: 11, color: P.black, fontWeight: '800', letterSpacing: 1 },

  scroll:        { flex: 1 },
  scrollContent: { paddingTop: 16, paddingBottom: 20 },
});
