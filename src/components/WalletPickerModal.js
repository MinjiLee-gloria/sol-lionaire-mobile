/**
 * WalletPickerModal — bottom-sheet wallet selector.
 * Currently supports Seed Vault (Seeker built-in).
 */
import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Modal, TouchableOpacity } from 'react-native';
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { P } from '../constants/theme';

// Official Solana logo — gradient purple→green
const SolanaLogo = ({ size = 28 }) => (
  <Svg width={size} height={size * 311 / 397} viewBox="0 0 397 311">
    <Defs>
      <SvgLinearGradient id="solGrad" x1="0" y1="1" x2="1" y2="0">
        <Stop offset="0" stopColor="#9945FF" />
        <Stop offset="1" stopColor="#14F195" />
      </SvgLinearGradient>
    </Defs>
    <Path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" fill="url(#solGrad)" />
    <Path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" fill="url(#solGrad)" />
    <Path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" fill="url(#solGrad)" />
  </Svg>
);

const WalletPickerModal = ({ visible, onSelect, onClose }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    } else {
      fadeAnim.stopAnimation();
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
            <View style={wm.solanaIcon}><SolanaLogo size={30} /></View>
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
  solanaIcon: { width: 36, alignItems: 'center', justifyContent: 'center' },
  btnLabel:  { fontSize: 16, fontWeight: '600', color: P.offWhite, marginBottom: 2 },
  btnSub:    { fontSize: 12, color: P.gray },
  arrow:     { fontSize: 20, color: P.gold },
  cancelBtn: { alignItems: 'center', padding: 16, marginTop: 4 },
  cancelText:{ fontSize: 16, color: P.gray },
});

export default WalletPickerModal;
