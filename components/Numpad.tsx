"use client";
import { useCallback, useEffect } from "react";
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
  const handleKey = useCallback((k: string) => {
    if (disabled) return;
    if (k === "DEL") { playKeyClick(); onChange((p) => p.slice(0, -1)); }
    else if (k === "OK") { onSubmit(); }
    else { playKeyClick(); onChange((p) => (p.length < maxLen ? p + k : p)); }
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "clamp(8px,1.5vh,16px)" }}>
      <div style={{ display: "flex", gap: "clamp(6px,1.2vw,14px)", marginBottom: "clamp(2px,0.5vh,8px)" }}>
        {Array.from({ length: maxLen }).map((_, i) => (
          <div key={i} style={{
            width: "clamp(38px,6.5vw,60px)", height: "clamp(46px,7.5vw,68px)",
            border: `2px solid ${i < value.length ? accentColor : "#1a3a4a"}`, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "clamp(1.4rem,3.5vw,2.3rem)", fontFamily: FONT,
            color: accentColor, background: i < value.length ? `${accentColor}10` : "rgba(10,20,30,0.6)",
            textShadow: `0 0 15px ${accentColor}80`, transition: "all 0.15s ease",
          }}>
            {value[i] || ""}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(5px,0.8vw,10px)", width: "clamp(170px,28vw,260px)" }}>
        {keys.flat().map((k) => (
          <button key={k} onClick={() => handleKey(k)} disabled={disabled} style={{
            height: "clamp(42px,6.5vw,56px)",
            border: k === "OK" ? "2px solid #33ff88" : k === "DEL" ? "2px solid #ff6655" : "1px solid #1a3a4a",
            borderRadius: 8,
            background: k === "OK" ? "rgba(51,255,136,0.1)" : k === "DEL" ? "rgba(255,100,80,0.08)" : "rgba(15,25,35,0.8)",
            color: k === "OK" ? "#33ff88" : k === "DEL" ? "#ff6655" : "#8899aa",
            fontSize: k === "OK" || k === "DEL" ? "clamp(0.6rem,1.2vw,0.8rem)" : "clamp(1rem,2.2vw,1.4rem)",
            fontFamily: FONT, fontWeight: 700,
            cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.3 : 1,
            transition: "all 0.12s ease", touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
          }}>
            {k}
          </button>
        ))}
      </div>
    </div>
  );
}
