/**
 * Lustre UI components — BuffFlash, SparkParticles, LustreGauge
 * All three are co-located here because they exist solely to support the Lustre system.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { P } from '../constants/theme';

// ── Gold flash overlay when badge is buffed ───────────────────────────────────
export const BuffFlash = ({ visible }) => {
  const flash = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!visible) return;
    // Stop any in-progress fade before restarting — prevents yellow filter getting stuck
    flash.stopAnimation();
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

// ── Gold coins burst up and fall with gravity ──────────────────────────────────
// 7 coins spread horizontally: burst upward (easeOut), then fall (easeIn).
// animRef stops any running animation before resetting — prevents end-flash.
const COIN_SPREAD_X = [-72, -48, -24, 0, 24, 48, 72];
const COIN_PEAK_Y   = [-80, -95, -70, -100, -70, -95, -80]; // each coin peaks at diff height

export const SparkParticles = ({ trigger }) => {
  const animRef = useRef(null);
  const anims = useRef(
    Array.from({ length: 7 }, () => ({
      x:  new Animated.Value(0),
      y:  new Animated.Value(0),
      op: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!trigger) return;

    // Stop parent parallel first, then explicitly stop + reset each individual
    // Animated.Value. Relying on parent.stop() alone doesn't reliably cancel
    // pending Animated.delay() nodes, which can fire after reset and leave
    // coins frozen on screen.
    if (animRef.current) {
      animRef.current.stop();
      animRef.current = null;
    }
    anims.forEach(a => {
      a.x.stopAnimation();
      a.y.stopAnimation();
      a.op.stopAnimation();
      a.x.setValue(0);
      a.y.setValue(0);
      a.op.setValue(0);
    });

    const coinAnims = anims.map((a, i) => {
      const peakY  = COIN_PEAK_Y[i];
      const fallY  = peakY + 140; // fall below origin
      const stagger = i * 25;    // slight stagger so coins don't all fire at once

      return Animated.sequence([
        Animated.delay(stagger),
        Animated.parallel([
          // X: fan out to spread positions
          Animated.timing(a.x, {
            toValue: COIN_SPREAD_X[i], duration: 480,
            easing: Easing.out(Easing.quad), useNativeDriver: true,
          }),
          // Y: burst up fast (easeOut), then fall with gravity (easeIn)
          Animated.sequence([
            Animated.timing(a.y, {
              toValue: peakY, duration: 200,
              easing: Easing.out(Easing.quad), useNativeDriver: true,
            }),
            Animated.timing(a.y, {
              toValue: fallY, duration: 380,
              easing: Easing.in(Easing.quad), useNativeDriver: true,
            }),
          ]),
          // Opacity: pop in → hold → fade while falling
          Animated.sequence([
            Animated.timing(a.op, { toValue: 1, duration: 60, useNativeDriver: true }),
            Animated.delay(280),
            Animated.timing(a.op, { toValue: 0, duration: 240, useNativeDriver: true }),
          ]),
        ]),
      ]);
    });

    animRef.current = Animated.parallel(coinAnims);
    animRef.current.start(() => { animRef.current = null; });
  }, [trigger]);

  return (
    <View pointerEvents="none" style={{ position: 'absolute', alignSelf: 'center', top: '38%' }}>
      {anims.map((a, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute',
            width: 14, height: 14, borderRadius: 7,
            backgroundColor: '#FFD700',
            borderWidth: 1.5,
            borderColor: '#B8860B',
            marginLeft: -7, marginTop: -7,
            opacity: a.op,
            transform: [{ translateX: a.x }, { translateY: a.y }],
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 6,
          }}
        />
      ))}
    </View>
  );
};

// ── Flickering flame for streak display ───────────────────────────────────────
const FlickerFlame = ({ streak }) => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.25, duration: 160, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9,  duration: 100, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.15, duration: 130, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.0,  duration: 180, useNativeDriver: true }),
        Animated.delay(1200),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.Text style={[lg.streak, { transform: [{ scale }] }]}>
      🔥 {streak}d
    </Animated.Text>
  );
};

// ── Lustre gauge bar + streak / Midas indicator ───────────────────────────────
export const LustreGauge = ({ lustre, streak, isMidasTouch }) => {
  const barColor = isMidasTouch ? ['#B8860B', '#FFD700', '#FFFACD']
    : lustre > 60 ? [P.goldDeep, P.gold, P.goldLight]
    : lustre > 25 ? ['#6B5B1A', '#A07830', '#C9A84C']
    :               ['#3A3A3A', '#555',    '#777'];

  return (
    <View style={lg.wrap}>
      <View style={lg.barBg}>
        <LinearGradient
          colors={barColor}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={[lg.barFill, { width: `${lustre}%` }]}
        />
      </View>
      <View style={lg.row}>
        <Text style={lg.label}>LUSTRE</Text>
        <Text style={[lg.pct, {
          color: isMidasTouch ? '#FFD700' : lustre > 60 ? P.goldLight : lustre > 25 ? P.gold : '#666',
        }]}>{lustre}%</Text>
        {streak > 0 && !isMidasTouch && (
          <FlickerFlame streak={streak} />
        )}
        {isMidasTouch && (
          <Text style={lg.midas}>✨ MIDAS</Text>
        )}
      </View>
    </View>
  );
};

const lg = StyleSheet.create({
  wrap:   { alignItems: 'center', marginTop: 6, marginBottom: 4, width: '100%' },
  barBg:  { width: 140, height: 4, backgroundColor: P.border, borderRadius: 2, overflow: 'hidden', marginBottom: 5 },
  barFill:{ height: '100%', borderRadius: 2 },
  row:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label:  { fontSize: 8,  color: P.gray,     letterSpacing: 2, fontWeight: '600' },
  pct:    { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  streak: { fontSize: 10, color: P.gold },
  midas:  { fontSize: 10, color: '#FFD700',  fontWeight: '700', letterSpacing: 1 },
});
