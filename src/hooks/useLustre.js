/**
 * useLustre — Lustre Meter retention system
 *
 * Lustre decays 100% → 0% over 24 hours since last buff.
 * Buffing (horizontal swipe on badge) restores to 100%.
 * 7 consecutive days of buffing → Midas Touch (7-day golden aura).
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DECAY_HOURS = 24;

const todayStr = () => new Date().toISOString().slice(0, 10);      // 'YYYY-MM-DD'
const yesterdayStr = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
};

export const useLustre = (walletAddress) => {
  const [lustre,       setLustre]       = useState(100);
  const [streak,       setStreak]       = useState(0);
  const [isMidasTouch, setIsMidasTouch] = useState(false);

  const key = walletAddress ? `lustre_${walletAddress}` : null;

  // Recompute lustre from stored last-buff timestamp
  const refresh = useCallback(async () => {
    if (!key) { setLustre(100); setStreak(0); setIsMidasTouch(false); return; }
    try {
      const raw  = await AsyncStorage.getItem(key);
      if (!raw) { setLustre(100); return; }
      const data = JSON.parse(raw);

      const elapsedH = (Date.now() - new Date(data.lastBuff).getTime()) / 3_600_000;
      const current  = Math.max(0, Math.round(100 - (elapsedH / DECAY_HOURS) * 100));
      setLustre(current);
      setStreak(data.streak ?? 0);
      setIsMidasTouch(data.midasUntil ? new Date(data.midasUntil) > new Date() : false);
    } catch (e) {
      console.error('[useLustre] Failed to read lustre state:', e);
    }
  }, [key]);

  // Load on mount / wallet change; poll every 60 s so gauge updates in background
  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 60_000);
    return () => clearInterval(id);
  }, [refresh]);

  // Clear on disconnect
  useEffect(() => {
    if (!walletAddress) { setLustre(100); setStreak(0); setIsMidasTouch(false); }
  }, [walletAddress]);

  // Called when user swipes — restores lustre + updates streak
  const buff = useCallback(async () => {
    if (!key) return;
    try {
      const raw  = await AsyncStorage.getItem(key);
      const prev = raw ? JSON.parse(raw) : {};

      const today   = todayStr();
      const yester  = yesterdayStr();
      let newStreak  = prev.streak  ?? 0;
      let midasUntil = prev.midasUntil ?? null;

      if (prev.lastBuffDate === today) {
        // Already buffed today — refresh lustre only, no streak increment
      } else if (prev.lastBuffDate === yester) {
        newStreak += 1;                   // consecutive day ✅
      } else {
        newStreak = 1;                    // first buff ever, or streak broken
      }

      // 7-day milestone → grant Midas Touch for 7 days, reset counter
      let midasUnlocked = false;
      if (newStreak >= 7) {
        const midasEnd = new Date();
        midasEnd.setDate(midasEnd.getDate() + 7);
        midasUntil    = midasEnd.toISOString();
        newStreak     = 0;
        midasUnlocked = true;
      }

      const updated = {
        lastBuff:     new Date().toISOString(),
        lastBuffDate: today,
        streak:       newStreak,
        midasUntil,
      };
      await AsyncStorage.setItem(key, JSON.stringify(updated));

      setLustre(100);
      setStreak(newStreak);
      setIsMidasTouch(midasUntil ? new Date(midasUntil) > new Date() : false);
      return { midasUnlocked };
    } catch (e) {
      console.error('[useLustre] Failed to write lustre state:', e);
    }
  }, [key]);

  return { lustre, streak, isMidasTouch, buff };
};

export default useLustre;
