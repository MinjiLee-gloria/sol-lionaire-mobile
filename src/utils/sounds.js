import { Audio } from 'expo-av';

const soundFiles = {
  swipe_buff: require('../../assets/sounds/swipe_buff.mp3'),
  claim_success: require('../../assets/sounds/claim_success.mp3'),
  wallet_connect: require('../../assets/sounds/wallet_connect.mp3'),
  city_toggle: require('../../assets/sounds/city_toggle.mp3'),
  level_up: require('../../assets/sounds/level_up.mp3'),
  copy_click: require('../../assets/sounds/copy_click.mp3'),
  midas_fanfare: require('../../assets/sounds/midas_fanfare.mp3'),
};

const soundCache = {};

async function loadSound(name) {
  if (soundCache[name]) return soundCache[name];
  const { sound } = await Audio.Sound.createAsync(soundFiles[name]);
  soundCache[name] = sound;
  return sound;
}

export async function playSound(name) {
  try {
    const sound = await loadSound(name);
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (e) {
    // fail silently — sound is non-critical
  }
}

export async function preloadSounds() {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    await Promise.all(Object.keys(soundFiles).map(loadSound));
  } catch (e) {
    // fail silently
  }
}
