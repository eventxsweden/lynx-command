// Shared voice preset -> ElevenLabs voice ID mapping (used by client speech.ts and the /api/tts route)
import { VoicePreset } from "./speech";

// Directors voice (chosen from the ElevenLabs voice library). Library voices are
// API-blocked on the free plan — until upgraded, the per-preset fallback below is used.
const DIRECTOR_VOICE = "cLAH1kXlkAivJHxCW601";

const DEFAULT_VOICE_IDS: Record<VoicePreset, string> = {
  robot: DIRECTOR_VOICE, // Direktören — the picked library voice
  commander: "pNInz6obpgDQGcFmaJgB", // Adam — deep, authoritative (premade)
  agent: "ErXwobaYiN019PkySvjV", // Antoni — calm, neutral (premade)
};

const ENV_OVERRIDE: Record<VoicePreset, string | undefined> = {
  robot: process.env.ELEVENLABS_VOICE_ROBOT,
  commander: process.env.ELEVENLABS_VOICE_COMMANDER,
  agent: process.env.ELEVENLABS_VOICE_AGENT,
};

// Premade ElevenLabs voices — usable on the free plan, unlike library voices.
// (Rachel is legacy/plan-gated nowadays; Bella is the free female premade.)
const FALLBACK_VOICE_IDS: Record<VoicePreset, string> = {
  robot: "EXAVITQu4vr4xnSDxMaL", // Bella — soft, clear
  commander: "pNInz6obpgDQGcFmaJgB", // Adam
  agent: "ErXwobaYiN019PkySvjV", // Antoni
};

export function voiceIdForPreset(preset: VoicePreset): string {
  return ENV_OVERRIDE[preset] || DEFAULT_VOICE_IDS[preset];
}

export function fallbackVoiceForPreset(preset: VoicePreset): string {
  return FALLBACK_VOICE_IDS[preset];
}
