// Web Audio API sound effects — no external files needed
let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
}

function ensureAudio() {
  const ctx = getCtx();
  if (ctx?.state === "suspended") ctx.resume();
}

function playTone(f: number, d: number, t: OscillatorType = "square", v = 0.12) {
  const ctx = getCtx();
  if (!ctx) return;
  ensureAudio();
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = t;
  o.frequency.value = f;
  g.gain.setValueAtTime(v, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + d);
  o.connect(g).connect(ctx.destination);
  o.start();
  o.stop(ctx.currentTime + d);
}

let muted = false;
export function setMuted(m: boolean) { muted = m; }
export function isMuted() { return muted; }

function ifNotMuted(fn: () => void) {
  return () => { if (!muted) fn(); };
}

// ── Vibration helpers ──
export function vibrate(pattern: number | number[]) {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
}

// ── Basic sounds ──
export const playKeyClick = ifNotMuted(() => { playTone(1200, 0.04, "sine", 0.06); vibrate(30); });
export const playError = ifNotMuted(() => { [0, 120].forEach((d) => setTimeout(() => playTone(200, 0.2, "square", 0.15), d)); vibrate([50, 30, 50]); });
export const playIncoming = ifNotMuted(() => [0, 100, 200].forEach((d) => setTimeout(() => playTone(660 + d * 2, 0.1, "sine", 0.12), d)));
export const playAlert = ifNotMuted(() => [0, 150, 300, 450].forEach((d, i) => setTimeout(() => playTone(i % 2 === 0 ? 440 : 520, 0.15, "square", 0.13), d)));
export const playSuccess = ifNotMuted(() => { [0, 120, 240, 400].forEach((d, i) => setTimeout(() => playTone(440 + i * 110, 0.18, "sine", 0.13), d)); vibrate(100); });
export const playBoot = ifNotMuted(() => [0, 80, 160, 300, 500].forEach((d, i) => setTimeout(() => playTone(200 + i * 100, 0.08 + i * 0.02, "sawtooth", 0.08), d)));
export const playComplete = ifNotMuted(() => {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => playTone(f, 0.35, "sine", 0.14), i * 200));
  setTimeout(() => [1047, 1175, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.5, "sine", 0.1), i * 150)), 900);
});
export const playUnlock = ifNotMuted(() => [0, 80, 160].forEach((d, i) => setTimeout(() => playTone(800 + i * 200, 0.12, "sine", 0.12), d)));
export const playHintReveal = ifNotMuted(() => [0, 60, 120, 180].forEach((d, i) => setTimeout(() => playTone(300 + i * 80, 0.06, "sine", 0.08), d)));
export const playTick = ifNotMuted(() => playTone(600, 0.03, "sine", 0.04));
export const playTimerWarning = ifNotMuted(() => [0, 200, 400].forEach((d) => setTimeout(() => playTone(880, 0.15, "square", 0.1), d)));

// ── New dramatic sounds ──
export const playTransmission = ifNotMuted(() => {
  [0, 100, 200, 350, 500, 700].forEach((d, i) =>
    setTimeout(() => playTone(400 + i * 80, 0.12, "sine", 0.08 + i * 0.01), d)
  );
});
export const playStamp = ifNotMuted(() => {
  playTone(120, 0.15, "square", 0.2);
  setTimeout(() => playTone(180, 0.3, "triangle", 0.1), 50);
  vibrate(80);
});
export const playDotPling = ifNotMuted(() => playTone(1200, 0.15, "sine", 0.1));
export const playCrescendo = ifNotMuted(() => {
  [0, 150, 300, 500, 700, 900, 1100, 1300].forEach((d, i) =>
    setTimeout(() => playTone(300 + i * 100, 0.2, "sine", 0.06 + i * 0.015), d)
  );
});
export const playStaticBurst = ifNotMuted(() => {
  const ctx = getCtx();
  if (!ctx) return;
  ensureAudio();
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  source.connect(g).connect(ctx.destination);
  source.start();
});

// ── Ambient hum ──
let ambientNode: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;
export function startAmbient() {
  if (muted || ambientNode) return;
  const ctx = getCtx();
  if (!ctx) return;
  ensureAudio();
  ambientNode = ctx.createOscillator();
  ambientGain = ctx.createGain();
  ambientNode.type = "sine";
  ambientNode.frequency.value = 55;
  ambientGain.gain.value = 0.008;
  ambientNode.connect(ambientGain).connect(ctx.destination);
  ambientNode.start();
}
export function stopAmbient() {
  if (ambientNode) { ambientNode.stop(); ambientNode = null; ambientGain = null; }
}
