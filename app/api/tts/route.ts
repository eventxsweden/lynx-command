import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/store";
import { voiceIdForPreset, FALLBACK_VOICE } from "@/lib/voices";
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

  const voiceId = voiceIdForPreset(preset || "robot");

  const cached = await getCached(voiceId, text);
  if (cached) return audioResponse(cached);

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

  let res = await generate(voiceId);
  let usedVoice = voiceId;

  // Library voices require a paid ElevenLabs plan for API use. On free plans,
  // fall back to a premade voice so the natural voice still works. Once the
  // plan is upgraded, the requested voice succeeds and takes over automatically.
  if (!res.ok && voiceId !== FALLBACK_VOICE) {
    const detail = await res.text();
    if (!detail.includes("paid_plan_required") && !detail.includes("voice_not_found")) {
      return NextResponse.json({ error: "ElevenLabs request failed", detail }, { status: 502 });
    }
    const cachedFallback = await getCached(FALLBACK_VOICE, text);
    if (cachedFallback) return audioResponse(cachedFallback);
    res = await generate(FALLBACK_VOICE);
    usedVoice = FALLBACK_VOICE;
  }

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "ElevenLabs request failed", detail }, { status: 502 });
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
