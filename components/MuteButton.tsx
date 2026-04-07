"use client";
import { useState } from "react";
import { setMuted, isMuted } from "@/lib/audio";
import { setSpeechEnabled } from "@/lib/speech";
import { FONT } from "@/lib/styles";

export default function MuteButton() {
  const [muted, setMutedState] = useState(isMuted());

  const toggle = () => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
    setSpeechEnabled(!next);
  };

  return (
    <button
      onClick={toggle}
      style={{
        position: "fixed", bottom: 12, right: 12, zIndex: 999,
        width: 40, height: 40, borderRadius: "50%",
        background: muted ? "rgba(255,50,50,0.15)" : "rgba(0,255,213,0.08)",
        border: `1px solid ${muted ? "#ff333340" : "#00ffd530"}`,
        color: muted ? "#ff5555" : "#00ffd5",
        fontSize: "1rem", cursor: "pointer",
        fontFamily: FONT, display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 0.6, transition: "opacity 0.2s",
      }}
      title={muted ? "Ljud av" : "Ljud på"}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
