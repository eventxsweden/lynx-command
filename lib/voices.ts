// Shared voice preset -> ElevenLabs voice ID mapping (used by client speech.ts and the /api/tts route)
import { VoicePreset } from "./speech";

// Chosen library voices. Library voices are API-blocked on the free ElevenLabs
// plan — until upgraded, the per-preset fallback below is used automatically.
const LIBRARY_VOICE_A = "cLAH1kXlkAivJHxCW601";
const LIBRARY_VOICE_B = "HqmZnnvy6tCQd8EGWKRT";

const DEFAULT_VOICE_IDS: Record<VoicePreset, string> = {
  robot: LIBRARY_VOICE_A,
  commander: LIBRARY_VOICE_B,
  agent: "EXAVITQu4vr4xnSDxMaL", // Bella — current voice, works on the free plan
};

const ENV_OVERRIDE: Record<VoicePreset, string | undefined> = {
  robot: process.env.ELEVENLABS_VOICE_ROBOT,
  commander: process.env.ELEVENLABS_VOICE_COMMANDER,
  agent: process.env.ELEVENLABS_VOICE_AGENT,
};

// Premade ElevenLabs voices — usable on the free plan, unlike library voices.
// Distinct per preset so the picker never plays the same voice twice.
const FALLBACK_VOICE_IDS: Record<VoicePreset, string> = {
  robot: "ErXwobaYiN019PkySvjV", // Antoni
  commander: "pNInz6obpgDQGcFmaJgB", // Adam
  agent: "EXAVITQu4vr4xnSDxMaL", // Bella
};

export function voiceIdForPreset(preset: VoicePreset): string {
  return ENV_OVERRIDE[preset] || DEFAULT_VOICE_IDS[preset];
}

export function fallbackVoiceForPreset(preset: VoicePreset): string {
  return FALLBACK_VOICE_IDS[preset];
}
