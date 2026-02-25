import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

const P = {
  black: '#0A0A0A',
  gold: '#C9A84C',
  goldLight: '#E8C96A',
  offWhite: '#F5F0E8',
};

export const CalculatingAnimation = ({ visible }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Ripple animation
      const createRipple = (anim, delay) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(anim, {
                toValue: 1,
                duration: 2000,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim, {
              toValue: 0,
              duration: 0,
              useNativeDriver: true,
            }),
          ])
        );
      };

      createRipple(ripple1, 0).start();
      createRipple(ripple2, 666).start();
      createRipple(ripple3, 1333).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  const createRippleStyle = (anim) => ({
    opacity: anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.4, 0],
    }),
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2.5],
        }),
      },
    ],
  });

  return (
    <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
      <View style={s.container}>
        {/* Gold Ripples */}
        <View style={s.rippleContainer}>
          <Animated.View style={[s.ripple, createRippleStyle(ripple1)]} />
          <Animated.View style={[s.ripple, createRippleStyle(ripple2)]} />
          <Animated.View style={[s.ripple, createRippleStyle(ripple3)]} />
          <View style={s.centerDot} />
        </View>

        {/* Text */}
        <Text style={s.text}>Calculating your empire...</Text>
      </View>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,10,10,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  container: {
    alignItems: 'center',
  },
  rippleContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: P.gold,
  },
  centerDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: P.goldLight,
    shadowColor: P.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: P.goldLight,
    letterSpacing: 1,
  },
});

export default CalculatingAnimation;
