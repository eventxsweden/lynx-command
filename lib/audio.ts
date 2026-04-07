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

export const playKeyClick = ifNotMuted(() => playTone(1200, 0.04, "sine", 0.06));
export const playError = ifNotMuted(() =>
  [0, 120].forEach((d) => setTimeout(() => playTone(200, 0.2, "square", 0.15), d))
);
export const playIncoming = ifNotMuted(() =>
  [0, 100, 200].forEach((d) => setTimeout(() => playTone(660 + d * 2, 0.1, "sine", 0.12), d))
);
export const playAlert = ifNotMuted(() =>
  [0, 150, 300, 450].forEach((d, i) =>
    setTimeout(() => playTone(i % 2 === 0 ? 440 : 520, 0.15, "square", 0.13), d)
  )
);
export const playSuccess = ifNotMuted(() =>
  [0, 120, 240, 400].forEach((d, i) =>
    setTimeout(() => playTone(440 + i * 110, 0.18, "sine", 0.13), d)
  )
);
export const playBoot = ifNotMuted(() =>
  [0, 80, 160, 300, 500].forEach((d, i) =>
    setTimeout(() => playTone(200 + i * 100, 0.08 + i * 0.02, "sawtooth", 0.08), d)
  )
);
export const playComplete = ifNotMuted(() => {
  [523, 659, 784, 1047].forEach((f, i) =>
    setTimeout(() => playTone(f, 0.35, "sine", 0.14), i * 200)
  );
  setTimeout(
    () => [1047, 1175, 1319].forEach((f, i) => setTimeout(() => playTone(f, 0.5, "sine", 0.1), i * 150)),
    900
  );
});
export const playUnlock = ifNotMuted(() =>
  [0, 80, 160].forEach((d, i) => setTimeout(() => playTone(800 + i * 200, 0.12, "sine", 0.12), d))
);
export const playHintReveal = ifNotMuted(() =>
  [0, 60, 120, 180].forEach((d, i) => setTimeout(() => playTone(300 + i * 80, 0.06, "sine", 0.08), d))
);
export const playTick = ifNotMuted(() => playTone(600, 0.03, "sine", 0.04));
export const playTimerWarning = ifNotMuted(() =>
  [0, 200, 400].forEach((d) => setTimeout(() => playTone(880, 0.15, "square", 0.1), d))
);
