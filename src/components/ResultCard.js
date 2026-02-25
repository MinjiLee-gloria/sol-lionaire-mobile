/**
 * ResultCard - Sol-lionaire v0.4
 * 5-Tier Result Display
 */
import React, { useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import Share from 'react-native-share';
import { LinearGradient } from 'expo-linear-gradient';

const P = {
  black:    '#0A0A0A',
  charcoal: '#141414',
  dark:     '#1C1C1C',
  mid:      '#2A2A2A',
  gray:     '#888888',
  offWhite: '#F5F0E8',
  gold:     '#C9A84C',
  goldLight:'#E8C96A',
  goldDeep: '#A07830',
};

// Image mapping
const PROPERTY_IMAGES = {
  ny_level1: require("../../assets/images/properties/ny_level1.png"),
  ny_level2: require("../../assets/images/properties/ny_level2.png"),
  ny_level3: require("../../assets/images/properties/ny_level3.png"),
  ny_level4: require("../../assets/images/properties/ny_level4.png"),
  ny_level5: require("../../assets/images/properties/ny_level5.png"),
  ny_level6: require("../../assets/images/properties/ny_level6.png"),
  ny_level7: require("../../assets/images/properties/ny_level7.png"),
  ny_level8: require("../../assets/images/properties/ny_level8.png"),
  ny_level9: require("../../assets/images/properties/ny_level9.png"),
  ny_level10: require("../../assets/images/properties/ny_level10.png"),
};


const ResultCard = ({ mappingResult }) => {
  if (!mappingResult) return null;

  const viewRef = useRef();
  
  const handleShare = async () => {
    try {
      const uri = await captureRef(viewRef, { format: 'png', quality: 1 });
      await Share.open({ url: `file://${uri}` });
    } catch (e) {
      console.log('Share failed', e);
    }
  };
  

  if (!mappingResult) return null;
  const { tier, level, propertyName, location, totalValue, sqm, narrative, starProgress, percentile } = mappingResult;
  const imageSource = tier.imageKey ? PROPERTY_IMAGES[tier.imageKey.MANHATTAN] : null;
  return (
    <View ref={viewRef} collapsable={false}>
      <LinearGradient
        colors={[P.dark, P.charcoal]}
        style={[s.card, { borderColor: tier.color }]}
    >
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={s.accentLine}
      />

      {imageSource && (
        <Image
          source={imageSource}
          style={s.propertyImage}
          resizeMode="contain"
        />
      )}

      <View style={s.header}>
        <Text style={s.eyebrow}>LEVEL {level || tier.level} • {starProgress?.starsDisplay || "★☆☆"}</Text>
        <Text style={s.propertyName}>{propertyName}</Text>
        <Text style={s.location}>📍 {location}</Text>
        <Text style={s.percentile}>🏆 {percentile} SOL Holders</Text>
      </View>

      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statLabel}>TIER</Text>
          <Text style={s.statValue}>{tier.level}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>VALUE</Text>
          <Text style={s.statValue}>${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</Text>
        </View>
        <View style={s.divider} />
        <View style={s.statItem}>
          <Text style={s.statLabel}>AREA</Text>
          <Text style={s.statValue}>{sqm} m²</Text>
        </View>
      </View>

      <View style={s.narrativeWrap}>
        <Text style={s.narrative}>{narrative}</Text>
    </View>
    <TouchableOpacity style={s.shareButton} onPress={handleShare}>
      <Text style={s.shareText}>📤 Share My Status</Text>
    </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const s = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 2, padding: 24, marginTop: 24, overflow: 'hidden' },
  accentLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2 },
  header: { alignItems: 'center', marginBottom: 20 },
  propertyImage: { width: '100%', height: 250, borderRadius: 12, marginBottom: 16 },
  eyebrow: { fontSize: 10, color: P.gold, letterSpacing: 4, fontWeight: '600', marginBottom: 8 },
  propertyName: { fontSize: 24, fontWeight: '700', color: P.offWhite, letterSpacing: 0.5, marginBottom: 8, textAlign: 'center' },
  location: { fontSize: 13, color: P.gray, letterSpacing: 0.5 },
  percentile: { fontSize: 14, color: P.goldLight, fontWeight: '600', letterSpacing: 0.5, marginTop: 8, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: P.mid },
  statItem: { alignItems: 'center', flex: 1 },
  statLabel: { fontSize: 10, color: P.gray, letterSpacing: 2, fontWeight: '600', marginBottom: 6 },
  statValue: { fontSize: 18, fontWeight: '700', color: P.offWhite },
  divider: { width: 1, backgroundColor: P.mid },
  narrativeWrap: { marginTop: 20 },
  narrative: { fontSize: 14, color: P.gray, lineHeight: 22, textAlign: 'center', letterSpacing: 0.3, fontStyle: 'italic' },
  shareButton: { marginTop: 20, backgroundColor: P.gold, paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center' },
  shareText: { fontSize: 16, fontWeight: '700', color: P.black, letterSpacing: 0.5 },

});

export default ResultCard;
