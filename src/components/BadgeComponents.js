/**
 * Badge UI components — FloatingBadge (connected) and DefaultBadge (disconnected).
 *
 * Fix: Animated.loop instances are stored and stopped on unmount to prevent
 * memory leaks when the component leaves the tree.
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { P } from '../constants/theme';
import { PROPERTY_IMAGES } from '../constants/images';

const { width: SCREEN_W } = Dimensions.get('window');
export const BADGE_SIZE = Math.min(SCREEN_W * 0.62, 260);

// ── Connected badge — floating + glow scales with level ───────────────────────
// nextImageKey: faint silhouette of the next level shown behind the current frame
// flashText / flashVisible: narrative text overlay shown when badge is swiped
export const FloatingBadge = ({ imageKey, nextImageKey, tierColor, level, isMidasTouch, flashText, flashVisible }) => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim  = useRef(new Animated.Value(0.6)).current;
  const textOp    = useRef(new Animated.Value(0)).current;

  // Glow scales with level: opacity max 0.55 (lv1) → 1.0 (lv10)
  //                          shadowRadius    16   →  46
  const glowMax    = Math.min(0.5 + (level || 1) * 0.05, 1.0);
  const glowRadius = Math.min(16 + (level || 1) * 3, 46);

  // Float loop: runs once, never needs restart
  useEffect(() => {
    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0,   duration: 2200, useNativeDriver: true }),
      ])
    );
    floatLoop.start();
    return () => floatLoop.stop();
  }, []);

  // Glow loop: restarts when level changes so intensity reflects current tier
  useEffect(() => {
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: glowMax,       duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: glowMax * 0.5, duration: 1800, useNativeDriver: true }),
      ])
    );
    glowLoop.start();
    return () => glowLoop.stop();
  }, [glowMax]);

  // Narrative text: fade in → hold → fade out on each swipe
  useEffect(() => {
    if (!flashVisible) return;
    textOp.setValue(0);
    Animated.sequence([
      Animated.timing(textOp, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(1000),
      Animated.timing(textOp, { toValue: 0, duration: 450, useNativeDriver: true }),
    ]).start();
  }, [flashVisible]);

  const imageSource     = PROPERTY_IMAGES[imageKey] ?? PROPERTY_IMAGES['ny_level1'];
  const nextImageSource = nextImageKey ? PROPERTY_IMAGES[nextImageKey] : null;

  return (
    <Animated.View style={[bs.badgeWrap, { transform: [{ translateY: floatAnim }] }]}>
      {/* Outer glow — intensity and radius scale with tier level */}
      <Animated.View style={[
        bs.badgeGlow,
        { opacity: glowAnim, borderColor: tierColor || P.gold, shadowRadius: glowRadius },
      ]} />
      {/* Midas Touch extra aura — 7-day streak reward */}
      {isMidasTouch && (
        <Animated.View style={[bs.midasAura, { opacity: glowAnim }]} />
      )}
      {/* Next-level silhouette — faint ghost of the next property */}
      {nextImageSource && (
        <Image
          source={nextImageSource}
          style={bs.nextSilhouette}
          resizeMode="cover"
          blurRadius={6}
        />
      )}
      {/* Gold pixel border frame */}
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={bs.badgeFrame}
      >
        <View style={bs.badgeInner}>
          <Image source={imageSource} style={bs.badgeImage} resizeMode="cover" />
          {/* Pixel art scanlines overlay */}
          <View style={bs.scanlines} />
          {/* Narrative overlay — fades in on the card when badge is swiped */}
          {flashText && (
            <Animated.View pointerEvents="none" style={[bs.narrativeOverlay, { opacity: textOp }]}>
              <View style={bs.narrativeBox}>
                <Text style={bs.narrativeText}>{flashText}</Text>
              </View>
            </Animated.View>
          )}
        </View>
      </LinearGradient>
      {/* Level pill */}
      <View style={[bs.levelPill, { borderColor: tierColor || P.gold }]}>
        <Text style={[bs.levelPillText, { color: tierColor || P.gold }]}>LEVEL {level || '?'}</Text>
      </View>
    </Animated.View>
  );
};

// ── Not-connected placeholder badge ───────────────────────────────────────────
export const DefaultBadge = () => {
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1,   duration: 1500, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 1500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={bs.badgeWrap}>
      <Animated.View style={[bs.badgeGlow, { opacity: pulseAnim, borderColor: P.gold }]} />
      <LinearGradient
        colors={[P.goldDeep, P.gold, P.goldLight, P.gold, P.goldDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={bs.badgeFrame}
      >
        <View style={[bs.badgeInner, bs.badgeInnerEmpty]}>
          <Text style={bs.badgeQuestion}>?</Text>
        </View>
      </LinearGradient>
      <View style={bs.levelPill}>
        <Text style={bs.levelPillText}>LEVEL ?</Text>
      </View>
    </View>
  );
};

const bs = StyleSheet.create({
  badgeWrap: { alignItems: 'center', marginBottom: 20 },

  nextSilhouette: {
    position: 'absolute',
    width: BADGE_SIZE + 28,
    height: BADGE_SIZE + 28,
    borderRadius: 16,
    opacity: 0.18,
  },

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
    backgroundColor: P.black,
  },
  badgeInnerEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeImage:    { width: '100%', height: '100%' },
  badgeQuestion: { fontSize: 72, color: P.border },
  scanlines: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },

  // Narrative text shown on card when swiped
  narrativeOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    padding: 8,
  },
  narrativeBox: {
    backgroundColor: 'rgba(0,0,0,0.80)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,168,76,0.3)',
  },
  narrativeText: {
    color: '#E8C96A',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
    fontStyle: 'italic',
    letterSpacing: 0.3,
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
});
