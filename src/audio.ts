// Audio engine using Web Audio API - procedurally generated, no external files needed
// Créateur : Hylst - Geoffroy

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let musicEnabled = true;
let sfxEnabled = true;
let musicInterval: number | null = null;

function ensureAudio(): { ctx: AudioContext; sfx: GainNode; music: GainNode } | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.6;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0.25;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.5;
    sfxGain.connect(masterGain);
  }
  if (!audioCtx || !sfxGain || !musicGain) return null;
  return { ctx: audioCtx, sfx: sfxGain, music: musicGain };
}

export async function initAudio(): Promise<void> {
  const audio = ensureAudio();
  if (!audio) return;
  if (audio.ctx.state === 'suspended') {
    await audio.ctx.resume();
  }
}

export function setMusicEnabled(enabled: boolean): void {
  musicEnabled = enabled;
  if (musicGain) {
    musicGain.gain.value = enabled ? 0.25 : 0;
  }
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
  if (sfxGain) {
    sfxGain.gain.value = enabled ? 0.5 : 0;
  }
}

// --- SFX ---

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol = 1, attack = 0.005) {
  const audio = ensureAudio();
  if (!audio || !sfxEnabled) return;
  const { ctx, sfx } = audio;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = freq;

  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(sfx);
  osc.start(now);
  osc.stop(now + duration + 0.1);
}

function playNoise(duration: number, vol = 0.3, filterFreq = 1000) {
  const audio = ensureAudio();
  if (!audio || !sfxEnabled) return;
  const { ctx, sfx } = audio;

  const bufferSize = Math.floor(ctx.sampleRate * duration);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = filterFreq;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.value = vol;

  noise.connect(filter);
  filter.connect(gain);
  gain.connect(sfx);
  noise.start();
}

export function playSwap() {
  const audio = ensureAudio();
  if (!audio || !sfxEnabled) return;
  const { ctx, sfx } = audio;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(800, now);
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
  osc.connect(gain);
  gain.connect(sfx);
  osc.start(now);
  osc.stop(now + 0.2);
}

export function playInvalid() {
  playTone(150, 0.15, 'sawtooth', 0.15);
  setTimeout(() => playTone(100, 0.15, 'sawtooth', 0.12), 80);
}

// Gamme pentatonique pour des matches harmonieux
const MATCH_NOTES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66];

export function playMatch(combo = 1) {
  const baseIdx = Math.min(combo - 1, MATCH_NOTES.length - 2);
  const freq = MATCH_NOTES[baseIdx];
  playTone(freq, 0.2, 'triangle', 0.3, 0.005);
  setTimeout(() => playTone(freq * 2, 0.15, 'sine', 0.15), 20);
}

export function playCascade(combo: number) {
  const baseFreq = 440 * Math.pow(2, Math.min(combo - 1, 8) / 12);
  const delays = [0, 60, 120, 180];
  delays.forEach((delay, i) => {
    setTimeout(() => {
      playTone(baseFreq * (1 + i * 0.25), 0.2, 'triangle', 0.25 - i * 0.03, 0.005);
    }, delay);
  });
}

export function playSpecialCreate() {
  const audio = ensureAudio();
  if (!audio || !sfxEnabled) return;
  const { ctx, sfx } = audio;
  const now = ctx.currentTime;

  [660, 880, 1100, 1320].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, now + i * 0.05);
    gain.gain.linearRampToValueAtTime(0.2, now + i * 0.05 + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.4);
    osc.connect(gain);
    gain.connect(sfx);
    osc.start(now + i * 0.05);
    osc.stop(now + i * 0.05 + 0.5);
  });
}

export function playBomb() {
  const audio = ensureAudio();
  if (!audio || !sfxEnabled) return;
  const { ctx, sfx } = audio;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  const now = ctx.currentTime;
  osc.frequency.setValueAtTime(120, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.5);
  gain.gain.setValueAtTime(0.5, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
  osc.connect(gain);
  gain.connect(sfx);
  osc.start(now);
  osc.stop(now + 0.6);

  playNoise(0.4, 0.4, 800);
}

export function playRainbow() {
  const audio = ensureAudio();
  if (!audio || !sfxEnabled) return;
  const { ctx, sfx } = audio;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, now);
  osc.frequency.exponentialRampToValueAtTime(2000, now + 0.6);
  gain.gain.setValueAtTime(0.15, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.exponentialRampToValueAtTime(4000, now + 0.6);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfx);
  osc.start(now);
  osc.stop(now + 0.7);
}

export function playLevelUp() {
  const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.3, 'triangle', 0.3, 0.01);
      playTone(freq * 2, 0.2, 'sine', 0.15, 0.01);
    }, i * 80);
  });
}

export function playGameOver() {
  const notes = [523.25, 466.16, 392, 349.23, 261.63];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.4, 'triangle', 0.25, 0.01);
    }, i * 150);
  });
}

export function playClick() {
  playTone(1200, 0.05, 'sine', 0.15);
}

// --- Musique d'ambiance ---
// Boucle procédurale avec arpèges ambient sur progression d'accords

const CHORD_PROGRESSION = [
  // [root, third, fifth] en Hz - gamme mineure de La
  [220, 261.63, 329.63],      // Am
  [174.61, 220, 261.63],      // F
  [196, 246.94, 293.66],      // G
  [220, 277.18, 329.63],      // E (majeur pour tension)
];

let chordIndex = 0;
let stepIndex = 0;

function playMusicStep() {
  const audio = ensureAudio();
  if (!audio || !musicEnabled) return;
  const { ctx, music } = audio;

  const chord = CHORD_PROGRESSION[chordIndex];
  const now = ctx.currentTime;

  // Note arpégée
  const noteFreq = chord[stepIndex % chord.length];
  const octaveShift = Math.floor(stepIndex / chord.length) % 2 === 0 ? 1 : 2;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = noteFreq * octaveShift;

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(music);
  osc.start(now);
  osc.stop(now + 0.9);

  // Basse profonde tous les 4 steps
  if (stepIndex % 4 === 0) {
    const bassOsc = ctx.createOscillator();
    const bassGain = ctx.createGain();
    bassOsc.type = 'sine';
    bassOsc.frequency.value = chord[0] / 2;
    bassGain.gain.setValueAtTime(0, now);
    bassGain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    bassGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    bassOsc.connect(bassGain);
    bassGain.connect(music);
    bassOsc.start(now);
    bassOsc.stop(now + 1.6);
  }

  // Pad atmosphérique qui change avec l'accord
  if (stepIndex % 8 === 0) {
    const pad = ctx.createOscillator();
    const padGain = ctx.createGain();
    pad.type = 'triangle';
    pad.frequency.value = chord[0] * 2;
    padGain.gain.setValueAtTime(0, now);
    padGain.gain.linearRampToValueAtTime(0.05, now + 0.3);
    padGain.gain.linearRampToValueAtTime(0.05, now + 1.5);
    padGain.gain.exponentialRampToValueAtTime(0.001, now + 2);
    pad.connect(padGain);
    padGain.connect(music);
    pad.start(now);
    pad.stop(now + 2.1);
  }

  stepIndex++;
  if (stepIndex >= 8) {
    stepIndex = 0;
    chordIndex = (chordIndex + 1) % CHORD_PROGRESSION.length;
  }
}

export function startMusic() {
  if (musicInterval !== null) return;
  ensureAudio();
  musicInterval = window.setInterval(playMusicStep, 220);
}

export function stopMusic() {
  if (musicInterval !== null) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

export function isMusicOn() {
  return musicEnabled;
}

export function isSfxOn() {
  return sfxEnabled;
}
