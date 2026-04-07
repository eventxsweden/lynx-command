"use client";
import { useState, useEffect } from "react";
import { FONT } from "@/lib/styles";

export function useTypewriter(text: string | null, speed = 28) {
  const [display, setDisplay] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!text) { setDisplay(""); setDone(true); return; }
    setDisplay(""); setDone(false);
    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplay(text.slice(0, i));
      if (i >= text.length) { clearInterval(iv); setDone(true); }
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return [display, done] as const;
}

export default function TypedMsg({ text, color = "#85a0b5", speed = 26 }: { text: string; color?: string; speed?: number }) {
  const [t, d] = useTypewriter(text, speed);
  return (
    <div style={{ maxWidth: 620, fontSize: "clamp(0.75rem,1.4vw,1rem)", lineHeight: 1.8, textAlign: "center", color, minHeight: "3em", fontFamily: FONT }}>
      {t}
      {!d && <span style={{ color: "#00ffd5", animation: "blink 0.6s infinite" }}>▊</span>}
    </div>
  );
}
