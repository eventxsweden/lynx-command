// Speech synthesis — Director voice with 3 selectable presets

let speechEnabled = true;

export function setSpeechEnabled(v: boolean) { speechEnabled = v; }
export function isSpeechEnabled() { return speechEnabled; }

export type VoicePreset = "robot" | "commander" | "agent";

export interface VoiceConfig {
  id: VoicePreset;
  name: string;
  description: string;
  pitch: number;
  rate: number;
  preferFemale: boolean;
}

export const VOICE_PRESETS: VoiceConfig[] = [
  { id: "robot", name: "🎙 Bibliotek A", description: "Er valda röst (Antoni på gratisplan)", pitch: 1.15, rate: 0.88, preferFemale: true },
  { id: "commander", name: "🎙 Bibliotek B", description: "Er andra röst (Adam på gratisplan)", pitch: 0.55, rate: 0.78, preferFemale: false },
  { id: "agent", name: "🎙 Bella", description: "Nuvarande röst — funkar på gratisplan", pitch: 0.85, rate: 0.85, preferFemale: true },
];

let activePreset: VoicePreset = "robot";

export function setVoicePreset(preset: VoicePreset) { activePreset = preset; }
export function getVoicePreset(): VoicePreset { return activePreset; }

let currentAudio: HTMLAudioElement | null = null;

function speakWithBrowserFallback(text: string, rateOverride?: number): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve();
  window.speechSynthesis.cancel();

  const config = VOICE_PRESETS.find((v) => v.id === activePreset) || VOICE_PRESETS[0];
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "sv-SE";
  u.rate = rateOverride ?? config.rate;
  u.pitch = config.pitch;
  u.volume = 0.9;

  const voices = speechSynthesis.getVoices();
  if (config.preferFemale) {
    const svFemale = voices.find((v) => v.lang.startsWith("sv") && /female|astrid|sofie|alva|anna/i.test(v.name));
    if (svFemale) u.voice = svFemale;
    else {
      const svAny = voices.find((v) => v.lang.startsWith("sv"));
      if (svAny) u.voice = svAny;
    }
  } else {
    const svMale = voices.find((v) => v.lang.startsWith("sv") && /male|hedda|oskar/i.test(v.name) && !/female/i.test(v.name));
    if (svMale) u.voice = svMale;
    else {
      const svAny = voices.find((v) => v.lang.startsWith("sv"));
      if (svAny) u.voice = svAny;
    }
  }

  return new Promise<void>((resolve) => {
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

// Speaks via the server-side ElevenLabs TTS route when configured, falling back to the
// browser's built-in speechSynthesis (worse quality, but works offline/without an API key).
// Resolves when playback has finished, so callers can wait before switching screens.
export async function speak(text: string, rateOverride?: number): Promise<void> {
  if (!speechEnabled) return;
  if (typeof window === "undefined") return;

  if (currentAudio) { currentAudio.pause(); currentAudio = null; }

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, preset: activePreset }),
    });
    if (!res.ok) throw new Error("tts unavailable");

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = 0.9;
    audio.playbackRate = rateOverride ?? 1;
    currentAudio = audio;
    await audio.play();
    await new Promise<void>((resolve) => {
      audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
      // pause() (from a newer speak/stopSpeech) must also release waiting callers
      audio.onpause = () => resolve();
      audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    });
  } catch {
    await speakWithBrowserFallback(text, rateOverride);
  }
}

export function previewVoice(preset: VoicePreset) {
  const old = activePreset;
  activePreset = preset;
  speak("Jag är Direktören. Välkomna.");
  activePreset = old;
  // Actually set it after preview
  setTimeout(() => { activePreset = preset; }, 100);
}

export function stopSpeech() {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
