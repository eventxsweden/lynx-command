import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/store";
import { voiceIdForPreset, fallbackVoiceForPreset } from "@/lib/voices";
import { VoicePreset } from "@/lib/speech";

function audioResponse(buffer: Buffer) {
  return new NextResponse(new Uint8Array(buffer), {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
  });
}

async function getCached(voice: string, text: string): Promise<Buffer | null> {
  const cached = await kvGet<string>(`tts:${voice}:${text}`);
  return cached ? Buffer.from(cached, "base64") : null;
}

export async function POST(req: NextRequest) {
  const { text, preset } = (await req.json()) as { text?: string; preset?: VoicePreset };
  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TTS not configured" }, { status: 503 });

  const generate = (voice: string) =>
    fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

  // Try the preset's preferred voice first, then its fallback, then Adam (always
  // available). Library/legacy voices are plan-gated — once the ElevenLabs plan
  // is upgraded, the preferred voice starts succeeding and takes over.
  const ADAM = "pNInz6obpgDQGcFmaJgB";
  const candidates = [...new Set([
    voiceIdForPreset(preset || "robot"),
    fallbackVoiceForPreset(preset || "robot"),
    ADAM,
  ])];

  let res: Response | null = null;
  let usedVoice = "";
  let lastDetail = "";
  for (const voice of candidates) {
    const cached = await getCached(voice, text);
    if (cached) return audioResponse(cached);
    const attempt = await generate(voice);
    if (attempt.ok) { res = attempt; usedVoice = voice; break; }
    lastDetail = await attempt.text();
    // Only voice-availability errors move on to the next candidate
    if (!/paid_plan_required|voice_not_found|payment_required/.test(lastDetail)) break;
  }

  if (!res) {
    return NextResponse.json({ error: "ElevenLabs request failed", detail: lastDetail }, { status: 502 });
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  const b64 = audioBuffer.toString("base64");
  // Cache forever (scripted lines repeat across events). Skip oversized payloads —
  // Upstash caps request size, and a failed cache write must never break playback.
  if (b64.length < 900_000) {
    try { await kvSet(`tts:${usedVoice}:${text}`, b64, null); } catch { /* serve uncached */ }
  }

  return audioResponse(audioBuffer);
}
