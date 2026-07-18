// Shared voice preset -> ElevenLabs voice ID mapping (used by client speech.ts and the /api/tts route)
import { VoicePreset } from "./speech";

// Directors voice (chosen from the ElevenLabs voice library); override per-preset via env vars.
const DIRECTOR_VOICE = "cLAH1kXlkAivJHxCW601";

const DEFAULT_VOICE_IDS: Record<VoicePreset, string> = {
  robot: DIRECTOR_VOICE,
  commander: DIRECTOR_VOICE,
  agent: DIRECTOR_VOICE,
};

const ENV_OVERRIDE: Record<VoicePreset, string | undefined> = {
  robot: process.env.ELEVENLABS_VOICE_ROBOT,
  commander: process.env.ELEVENLABS_VOICE_COMMANDER,
  agent: process.env.ELEVENLABS_VOICE_AGENT,
};

// Premade ElevenLabs voice (Adam) — usable on the free plan, unlike library voices
export const FALLBACK_VOICE = "pNInz6obpgDQGcFmaJgB";

export function voiceIdForPreset(preset: VoicePreset): string {
  return ENV_OVERRIDE[preset] || DEFAULT_VOICE_IDS[preset];
}
