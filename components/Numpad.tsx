"use client";
import { useCallback, useEffect, useState } from "react";
import { playKeyClick } from "@/lib/audio";
import { FONT } from "@/lib/styles";

interface NumpadProps {
  value: string;
  onChange: (fn: (prev: string) => string) => void;
  onSubmit: () => void;
  maxLen?: number;
  disabled?: boolean;
  accentColor?: string;
}

export default function Numpad({ value, onChange, onSubmit, maxLen = 4, disabled, accentColor = "#00ffd5" }: NumpadProps) {
  const [flashIdx, setFlashIdx] = useState(-1);

  const handleKey = useCallback((k: string) => {
    if (disabled) return;
    if (k === "DEL") { playKeyClick(); onChange((p) => p.slice(0, -1)); }
    else if (k === "OK") { onSubmit(); }
    else {
      playKeyClick();
      onChange((p) => {
        if (p.length < maxLen) {
          setFlashIdx(p.length);
          setTimeout(() => setFlashIdx(-1), 150);
          return p + k;
        }
        return p;
      });
    }
  }, [disabled, maxLen, onChange, onSubmit]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (disabled || (e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key >= "0" && e.key <= "9") { e.preventDefault(); handleKey(e.key); }
      else if (e.key === "Backspace") { e.preventDefault(); handleKey("DEL"); }
      else if (e.key === "Enter") { e.preventDefault(); handleKey("OK"); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [disabled, handleKey]);

  const keys = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"], ["DEL", "0", "OK"]];

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(8px,1.5vh,16px)", position: "relative" }}>
      {/* Digit display with scanline flash */}
      <div style={{ display: "flex", gap: "clamp(6px,1.2vw,14px)", marginBottom: "clamp(2px,0.5vh,8px)" }}>
        {Array.from({ length: maxLen }).map((_, i) => (
          <div key={i} style={{
            width: "clamp(38px,6.5vw,60px)", height: "clamp(46px,7.5vw,68px)",
            border: `2px solid ${i < value.length ? accentColor : "#1a3a4a"}`, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(1.4rem,3.5vw,2.3rem)", fontFamily: FONT,
            color: accentColor, background: i < value.length ? `${accentColor}10` : "rgba(10,20,30,0.6)",
            textShadow: `0 0 15px ${accentColor}80`, transition: "all 0.15s ease",
            position: "relative", overflow: "hidden",
          }}>
            {value[i] || ""}
            {/* Scanline flash on digit entry */}
            {flashIdx === i && (
              <div style={{
                position: "absolute", inset: 0,
                background: `linear-gradient(180deg, transparent 0%, ${accentColor}30 50%, transparent 100%)`,
                animation: "numpad-scan 0.15s linear",
                pointerEvents: "none",
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Status text */}
      <div style={{
        fontSize: "clamp(0.35rem,0.6vw,0.45rem)", letterSpacing: "0.15em",
        color: accentColor, opacity: 0.4, fontFamily: FONT,
        animation: value.length === 0 ? "blink 2.5s infinite" : "none",
      }}>
        {value.length === 0 ? "AWAITING AGENT INPUT..." : `INPUT RECEIVED — ${value.length}/${maxLen}`}
      </div>

      {/* Keypad */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(5px,0.8vw,10px)", width: "clamp(180px,30vw,280px)" }}>
        {keys.flat().map((k) => (
          <button key={k} onClick={() => handleKey(k)} disabled={disabled} style={{
            height: "clamp(44px,7vw,60px)",
            border: k === "OK" ? "2px solid #33ff88" : k === "DEL" ? "2px solid #ff6655" : "1px solid #1a3a4a",
            borderRadius: 8,
            background: k === "OK" ? "rgba(51,255,136,0.1)" : k === "DEL" ? "rgba(255,100,80,0.08)" : "rgba(15,25,35,0.8)",
            color: k === "OK" ? "#33ff88" : k === "DEL" ? "#ff6655" : "#8899aa",
            fontSize: k === "OK" || k === "DEL" ? "clamp(0.65rem,1.3vw,0.85rem)" : "clamp(1.1rem,2.4vw,1.5rem)",
            fontFamily: FONT, fontWeight: 700,
            cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1,
            transition: "all 0.12s ease", touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
          }}>
            {k}
          </button>
        ))}
      </div>

      <style>{`@keyframes numpad-scan{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}`}</style>
    </div>
  );
}
