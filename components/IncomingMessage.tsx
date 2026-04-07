"use client";
import { useEffect } from "react";
import { useTypewriter } from "./TypedMsg";
import { playIncoming } from "@/lib/audio";
import { speak } from "@/lib/speech";
import { AdminMessage } from "@/lib/types";
import { FONT } from "@/lib/styles";

interface Props {
  message: AdminMessage;
  onDismiss: () => void;
  teamColor: string;
}

export default function IncomingMessage({ message, onDismiss, teamColor }: Props) {
  const [typed, done] = useTypewriter(message.text, 22);

  useEffect(() => {
    playIncoming();
    if (message.speech) setTimeout(() => speak(message.speech), 400);
    const t = setTimeout(onDismiss, Math.max((message.text?.length || 0) * 25 + 5000, 8000));
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,5,10,0.92)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 900, padding: 24, animation: "fade-in 0.3s ease-out",
    }}>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: teamColor, opacity: 0.6, marginBottom: 12, fontFamily: FONT }}>
        INKOMMANDE MEDDELANDE
      </div>
      <div style={{ width: 60, height: 2, background: teamColor, marginBottom: 20, opacity: 0.4, boxShadow: `0 0 10px ${teamColor}60` }} />
      <div style={{ maxWidth: 500, fontSize: "clamp(0.85rem,1.6vw,1.1rem)", lineHeight: 1.8, textAlign: "center", color: "#a0b8c8", fontFamily: FONT }}>
        {typed}
        {!done && <span style={{ color: teamColor, animation: "blink 0.6s infinite" }}>▊</span>}
      </div>
      {done && (
        <button onClick={onDismiss} style={{
          marginTop: 24, padding: "8px 24px", background: "transparent",
          border: `1px solid ${teamColor}40`, borderRadius: 6,
          color: teamColor, fontSize: "clamp(0.5rem,0.9vw,0.7rem)",
          fontFamily: FONT, cursor: "pointer", opacity: 0.7, letterSpacing: "0.1em",
        }}>
          STÄNG ▸
        </button>
      )}
    </div>
  );
}
