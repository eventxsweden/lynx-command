import { NextRequest, NextResponse } from "next/server";
import { kvGet, kvSet } from "@/lib/store";
import { voiceIdForPreset } from "@/lib/voices";
import { VoicePreset } from "@/lib/speech";

export async function POST(req: NextRequest) {
  const { text, preset } = (await req.json()) as { text?: string; preset?: VoicePreset };
  if (!text) return NextResponse.json({ error: "Missing text" }, { status: 400 });

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "TTS not configured" }, { status: 503 });

  const voiceId = voiceIdForPreset(preset || "robot");
  const cacheKey = `tts:${voiceId}:${text}`;

  const cached = await kvGet<string>(cacheKey);
  if (cached) {
    return new NextResponse(Buffer.from(cached, "base64"), {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
    });
  }

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
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

  if (!res.ok) {
    const detail = await res.text();
    return NextResponse.json({ error: "ElevenLabs request failed", detail }, { status: 502 });
  }

  const audioBuffer = Buffer.from(await res.arrayBuffer());
  const b64 = audioBuffer.toString("base64");
  // Cache forever (scripted lines repeat across events). Skip oversized payloads —
  // Upstash caps request size, and a failed cache write must never break playback.
  if (b64.length < 900_000) {
    try { await kvSet(cacheKey, b64, null); } catch { /* serve uncached */ }
  }

  return new NextResponse(audioBuffer, {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
  });
}
