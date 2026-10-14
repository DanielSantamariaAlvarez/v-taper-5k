// Pure Web Audio API sound synthesizer for V-Taper 5K
// Generates all workout tempo cues (1s concentric, 3s eccentric, 20s rest bell & countdown)
// without any external audio files or Text-to-Speech.

let sharedAudioContext: AudioContext | null = null;

// Creates or returns the singleton browser AudioContext instance
export function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!sharedAudioContext) {
    const AudioCtxConstructor = window.AudioContext || window.webkitAudioContext;
    if (AudioCtxConstructor) {
      sharedAudioContext = new AudioCtxConstructor();
    }
  }
  return sharedAudioContext;
}

// Ensures the AudioContext is resumed after user interaction
export async function ensureAudioContextResumed(): Promise<void> {
  const ctx = getOrCreateAudioContext();
  if (ctx && ctx.state === 'suspended') {
    try {
      await ctx.resume();
    } catch {
      // Ignore autoplay errors until next user gesture
    }
  }
}

// Internal helper to schedule a synthesized tone with smooth attack and exponential release
export function scheduleSynthesizedTone(
  frequencyHz: number,
  durationMs: number,
  waveType: OscillatorType,
  peakGain: number = 0.22,
  delaySeconds: number = 0
): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) {
    return;
  }
  if (ctx.state === 'suspended') {
    void ctx.resume();
  }

  const startTime = ctx.currentTime + delaySeconds;
  const durationSeconds = durationMs / 1000;
  const endTime = startTime + durationSeconds;

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = waveType;
  oscillator.frequency.setValueAtTime(frequencyHz, startTime);

  // Smooth envelope to eliminate audio clicks
  gainNode.gain.setValueAtTime(0.0001, startTime);
  gainNode.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.015, durationSeconds * 0.2));
  gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.start(startTime);
  oscillator.stop(endTime + 0.01);
}

// Second 1 (Concentric Phase / Up): 1 clear high beep (880 Hz, 150ms, smooth triangle/sine wave)
export function playConcentricBeep(isMuted: boolean): void {
  if (isMuted) {
    return;
  }
  scheduleSynthesizedTone(880, 150, 'triangle', 0.26, 0);
  // Subtle harmonic overtone for clarity
  scheduleSynthesizedTone(1760, 120, 'sine', 0.07, 0);
}

// Seconds 2, 3, and 4 (Eccentric Phase / Down): 3 low beeps (440 Hz, 120ms each second)
export function playEccentricBeep(isMuted: boolean): void {
  if (isMuted) {
    return;
  }
  scheduleSynthesizedTone(440, 120, 'sine', 0.22, 0);
}

// Rest start (20 seconds): Soft harmonic bell tone when starting the rest period
export function playRestStartBell(isMuted: boolean): void {
  if (isMuted) {
    return;
  }
  // Dual-frequency soft bell chord (528 Hz + 792 Hz fifth)
  scheduleSynthesizedTone(528, 480, 'sine', 0.20, 0);
  scheduleSynthesizedTone(792, 360, 'triangle', 0.12, 0.04);
}

// Last 3 seconds of rest: Warning beeps before the next set begins
export function playRestWarningBeep(isMuted: boolean, secondsRemaining: number): void {
  if (isMuted) {
    return;
  }
  const pitch = secondsRemaining === 1 ? 660 : 587.33;
  scheduleSynthesizedTone(pitch, 110, 'sine', 0.18, 0);
}

// Initial 10-second preparation phase cues (exclusively before the 1st exercise of the routine)
export function playPreparationStartCue(isMuted: boolean): void {
  if (isMuted) {
    return;
  }
  scheduleSynthesizedTone(440, 180, 'sine', 0.18, 0);
  scheduleSynthesizedTone(659.25, 240, 'triangle', 0.16, 0.12);
}

// Tick beep during the 10s initial preparation countdown (louder/higher on the last 3 seconds)
export function playPreparationCountdownBeep(
  isMuted: boolean,
  secondsRemaining: number
): void {
  if (isMuted) {
    return;
  }
  if (secondsRemaining <= 3) {
    const pitch = secondsRemaining === 1 ? 783.99 : 587.33;
    scheduleSynthesizedTone(pitch, 120, 'triangle', 0.22, 0);
  } else {
    scheduleSynthesizedTone(493.88, 70, 'sine', 0.10, 0);
  }
}

// Completion chime when an entire workout routine is completed
export function playWorkoutCompleteChime(isMuted: boolean): void {
  if (isMuted) {
    return;
  }
  scheduleSynthesizedTone(523.25, 180, 'triangle', 0.2, 0);
  scheduleSynthesizedTone(659.25, 180, 'triangle', 0.2, 0.14);
  scheduleSynthesizedTone(783.99, 220, 'triangle', 0.22, 0.28);
  scheduleSynthesizedTone(1046.5, 450, 'sine', 0.25, 0.42);
}

// Camera countdown beep for the 5-second self-timer in the Progress photo studio
export function playCameraCountdownBeep(isMuted: boolean, isShutterRelease: boolean): void {
  if (isMuted) {
    return;
  }
  if (isShutterRelease) {
    scheduleSynthesizedTone(987.77, 160, 'triangle', 0.22, 0);
    scheduleSynthesizedTone(1318.51, 220, 'sine', 0.2, 0.08);
  } else {
    scheduleSynthesizedTone(640, 90, 'sine', 0.15, 0);
  }
}
