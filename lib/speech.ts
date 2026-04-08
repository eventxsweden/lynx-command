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
  { id: "robot", name: "🤖 Robotröst", description: "Androgyn, hög pitch, teknisk", pitch: 1.15, rate: 0.88, preferFemale: true },
  { id: "commander", name: "🎖 Befälhavare", description: "Djup, auktoritär, manlig", pitch: 0.55, rate: 0.78, preferFemale: false },
  { id: "agent", name: "🕵 Agent", description: "Neutral, lugn, professionell", pitch: 0.85, rate: 0.85, preferFemale: false },
];

let activePreset: VoicePreset = "robot";

export function setVoicePreset(preset: VoicePreset) { activePreset = preset; }
export function getVoicePreset(): VoicePreset { return activePreset; }

export function speak(text: string, rateOverride?: number) {
  if (!speechEnabled) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
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

  speechSynthesis.speak(u);
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
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
