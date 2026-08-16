/**
 * Web Audio API Sound Engine
 * - Crisp tactile pop for tap/snap transitions
 * - Continuous organic wind / breeze synthesizer while dragging the slime orb
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Global active wind audio nodes
let windSource: AudioBufferSourceNode | null = null;
let windFilter: BiquadFilterNode | null = null;
let windGain: GainNode | null = null;
let windLfo: OscillatorNode | null = null;
let isWindPlaying = false;

/**
 * Generate 2 seconds of pink/soft noise buffer for the continuous breeze
 */
function createNoiseBuffer(ctx: AudioContext): AudioBuffer {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    // Pink noise filter approximation (Paul Kellet's algorithm)
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
    b6 = white * 0.115926;
  }
  return buffer;
}

/**
 * Start continuous realistic wind / airy breeze sound
 */
export function startWindSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (isWindPlaying) return;

    isWindPlaying = true;
    const now = ctx.currentTime;

    // Master wind gain
    windGain = ctx.createGain();
    windGain.gain.setValueAtTime(0.001, now);
    // Smooth fade in
    windGain.gain.linearRampToValueAtTime(0.24, now + 0.08);
    windGain.connect(ctx.destination);

    // Resonant bandpass filter (simulating wind whistling through air)
    windFilter = ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.setValueAtTime(650, now);
    windFilter.Q.setValueAtTime(3.2, now);
    windFilter.connect(windGain);

    // Subtle LFO for gentle swirling air gusts
    windLfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(3.5, now);
    lfoGain.gain.setValueAtTime(180, now);
    windLfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    windLfo.start(now);

    // Continuous looping noise source
    const noiseBuffer = createNoiseBuffer(ctx);
    windSource = ctx.createBufferSource();
    windSource.buffer = noiseBuffer;
    windSource.loop = true;
    windSource.connect(windFilter);
    windSource.start(now);
  } catch (err) {
    console.debug('Wind sound start error:', err);
  }
}

/**
 * Modulate wind pitch and resonance according to movement velocity
 */
export function updateWindSound(velocity: number) {
  try {
    const ctx = getAudioContext();
    if (!ctx || !windFilter || !windGain || !isWindPlaying) return;
    const now = ctx.currentTime;

    const absVel = Math.min(1200, Math.abs(velocity));
    const targetFreq = 500 + (absVel * 0.85);
    const targetGain = Math.min(0.38, 0.18 + (absVel * 0.0002));

    windFilter.frequency.setTargetAtTime(targetFreq, now, 0.04);
    windGain.gain.setTargetAtTime(targetGain, now, 0.04);
  } catch (err) {
    console.debug('Wind sound update error:', err);
  }
}

/**
 * Stop wind sound smoothly on finger / mouse release
 */
export function stopWindSound() {
  try {
    if (!isWindPlaying) return;
    const ctx = getAudioContext();
    if (ctx && windGain) {
      const now = ctx.currentTime;
      windGain.gain.linearRampToValueAtTime(0.0001, now + 0.06);
      setTimeout(() => {
        try {
          if (windSource) {
            windSource.stop();
            windSource.disconnect();
          }
          if (windLfo) {
            windLfo.stop();
            windLfo.disconnect();
          }
        } catch (e) {
          // ignore cleanup
        }
        windSource = null;
        windFilter = null;
        windGain = null;
        windLfo = null;
        isWindPlaying = false;
      }, 70);
    } else {
      isWindPlaying = false;
    }
  } catch (err) {
    isWindPlaying = false;
  }
}

/**
 * Crisp, snappy, modern tactile click / pop sound on tab switch or snap release
 */
export function playSnapPopSound(pitchOffset = 0) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.26, now);
    masterGain.connect(ctx.destination);

    // Fast high-pitch droplet impulse
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';

    const baseFreq = 580 + pitchOffset;
    osc.frequency.setValueAtTime(baseFreq * 1.8, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.8, now + 0.045);

    oscGain.gain.setValueAtTime(0.01, now);
    oscGain.gain.linearRampToValueAtTime(0.9, now + 0.005);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(oscGain);
    oscGain.connect(masterGain);

    // Warm sub thud
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(260 + pitchOffset * 0.5, now);
    subOsc.frequency.exponentialRampToValueAtTime(90, now + 0.05);

    subGain.gain.setValueAtTime(0.01, now);
    subGain.gain.linearRampToValueAtTime(0.6, now + 0.004);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    subOsc.connect(subGain);
    subGain.connect(masterGain);

    osc.start(now);
    subOsc.start(now);

    osc.stop(now + 0.07);
    subOsc.stop(now + 0.07);
  } catch (err) {
    console.debug('Snap sound issue:', err);
  }
}

// Alias for seamless compatibility across the app
export const playBubbleSound = playSnapPopSound;

