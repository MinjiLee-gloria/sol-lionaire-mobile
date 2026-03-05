/**
 * Haptic Wealth Pulse — Sol-lionaire
 *
 * Two-pulse "heartbeat" pattern:  Heavy → gap → Medium
 *   Heavy  = systole  (the strong pump — wealth moves)
 *   Medium = diastole (the soft echo  — it lingers)
 *
 * Feels significantly richer than a single impact, and maps perfectly
 * to Solana Mobile Seeker's high-fidelity haptic actuator.
 */
import * as Haptics from 'expo-haptics';

/**
 * wealthHeartbeat(gapMs?)
 *  Fire-and-forget async — call without await if you don't need to block.
 *  gapMs: milliseconds between the two pulses (default 80ms ≈ natural heartbeat gap).
 */
export const wealthHeartbeat = async (gapMs = 80) => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await new Promise(r => setTimeout(r, gapMs));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

/**
 * lockHeartbeat()
 *  Slightly slower gap (95ms) for the District lock — feels more "refused",
 *  as if the door itself has a pulse you can't enter.
 */
export const lockHeartbeat = async () => {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  await new Promise(r => setTimeout(r, 95));
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};
