"use client";
import { useState, useEffect } from "react";
import { playHintReveal } from "@/lib/audio";
import { Hint } from "@/lib/types";
import { FONT } from "@/lib/styles";

interface HintSystemProps {
  hints: Hint[];
  teamColor: string;
  missionId: string;
}

export default function HintSystem({ hints, teamColor, missionId }: HintSystemProps) {
  const [revealedCount, setRevealedCount] = useState(0);
  const [decrypting, setDecrypting] = useState(false);
  const [scrambleText, setScrambleText] = useState("");

  useEffect(() => { setRevealedCount(0); setDecrypting(false); }, [missionId]);

  const revealNext = () => {
    if (revealedCount >= hints.length || decrypting) return;
    setDecrypting(true);
    playHintReveal();
    const target = hints[revealedCount].text;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&";
    let frame = 0;
    const iv = setInterval(() => {
      frame++;
      const progress = Math.min(frame / 20, 1);
      const revealed = Math.floor(progress * target.length);
      let s = "";
      for (let i = 0; i < target.length; i++) {
        if (i < revealed) s += target[i];
        else s += chars[Math.floor(Math.random() * chars.length)];
      }
      setScrambleText(s);
      if (frame >= 20) {
        clearInterval(iv);
        setScrambleText("");
        setRevealedCount((c) => c + 1);
        setDecrypting(false);
      }
    }, 50);
  };

  const levelLabels: Record<string, string> = { mild: "LEDTRÅD NIVÅ 1", medium: "LEDTRÅD NIVÅ 2", strong: "LEDTRÅD NIVÅ 3" };
  const levelColors: Record<string, string> = { mild: "#4a8a6a", medium: "#8a8a4a", strong: "#8a5a4a" };

  return (
    <div style={{ width: "100%", maxWidth: 480, marginTop: 6 }}>
      {hints.slice(0, revealedCount).map((h, i) => (
        <div key={i} style={{
          background: "rgba(15,25,35,0.7)", border: `1px solid ${levelColors[h.level]}40`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 6, animation: "fade-in 0.4s ease-out",
        }}>
          <div style={{ fontSize: "clamp(0.4rem,0.7vw,0.5rem)", color: levelColors[h.level], letterSpacing: "0.15em", marginBottom: 4, opacity: 0.7 }}>
            {levelLabels[h.level]} — DEKRYPTERAD
          </div>
          <div style={{ fontSize: "clamp(0.65rem,1.1vw,0.85rem)", color: "#8aa0b0", lineHeight: 1.6, fontFamily: FONT }}>
            {h.text}
          </div>
        </div>
      ))}

      {decrypting && (
        <div style={{
          background: "rgba(15,25,35,0.7)", border: `1px solid ${teamColor}30`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 6,
        }}>
          <div style={{ fontSize: "clamp(0.4rem,0.7vw,0.5rem)", color: teamColor, letterSpacing: "0.15em", marginBottom: 4, animation: "blink 0.4s infinite" }}>
            DEKRYPTERAR LEDTRÅD...
          </div>
          <div style={{ fontSize: "clamp(0.65rem,1.1vw,0.85rem)", color: teamColor, lineHeight: 1.6, fontFamily: FONT, opacity: 0.7 }}>
            {scrambleText}
          </div>
        </div>
      )}

      {revealedCount < hints.length && !decrypting && (
        <button onClick={revealNext} style={{
          width: "100%", padding: "10px 16px", marginTop: 2,
          background: revealedCount === 0 ? "rgba(0,255,213,0.04)" : revealedCount === 1 ? "rgba(255,200,50,0.04)" : "rgba(255,100,50,0.04)",
          border: `1px solid ${revealedCount === 0 ? "#2a4a4a" : revealedCount === 1 ? "#4a4a2a" : "#4a2a2a"}`,
          borderRadius: 8, cursor: "pointer", textAlign: "center",
          fontFamily: FONT, transition: "all 0.2s ease",
        }}>
          <div style={{ fontSize: "clamp(0.55rem,1vw,0.75rem)", color: revealedCount === 0 ? "#5a9a8a" : revealedCount === 1 ? "#9a9a5a" : "#9a6a5a", letterSpacing: "0.1em" }}>
            {revealedCount === 0 ? "🔓 BEGÄR LEDTRÅD FRÅN HQ" : revealedCount === 1 ? "🔓 BEGÄR STARKARE LEDTRÅD" : "🔓 BEGÄR SISTA LEDTRÅDEN"}
          </div>
          <div style={{ fontSize: "clamp(0.4rem,0.7vw,0.55rem)", color: "#3a4a5a", marginTop: 3 }}>
            {revealedCount === 0 ? "En liten knuff i rätt riktning" : revealedCount === 1 ? "Mer specifik hjälp" : "Nästan hela svaret avslöjas"}
          </div>
        </button>
      )}
    </div>
  );
}
