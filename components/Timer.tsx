"use client";
import { useState, useEffect, useRef } from "react";
import { playTick, playTimerWarning } from "@/lib/audio";
import { FONT } from "@/lib/styles";

interface TimerProps {
  minutes: number;
  accentColor?: string;
  onExpired?: () => void;
  running?: boolean;
}

export default function Timer({ minutes, accentColor = "#00ffd5", onExpired, running = true }: TimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const warned = useRef(false);

  useEffect(() => {
    setSecondsLeft(minutes * 60);
    warned.current = false;
  }, [minutes]);

  useEffect(() => {
    if (!running || secondsLeft <= 0) return;
    const iv = setInterval(() => {
      setSecondsLeft((s) => {
        const next = s - 1;
        if (next <= 60 && !warned.current) { warned.current = true; playTimerWarning(); }
        if (next <= 10 && next > 0) playTick();
        if (next <= 0) { onExpired?.(); clearInterval(iv); }
        return Math.max(0, next);
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [running, onExpired, secondsLeft]);

  const m = Math.floor(secondsLeft / 60);
  const s = secondsLeft % 60;
  const pct = (secondsLeft / (minutes * 60)) * 100;
  const isWarning = secondsLeft <= 60;
  const color = isWarning ? "#ff3300" : accentColor;

  return (
    <div style={{ textAlign: "center", fontFamily: FONT }}>
      <div style={{
        fontSize: "clamp(1.5rem,4vw,3rem)", fontWeight: 700, color,
        textShadow: `0 0 20px ${color}60`,
        animation: isWarning ? "blink 0.8s infinite" : "none",
        letterSpacing: "0.1em",
      }}>
        {String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
      </div>
      <div style={{ width: "clamp(120px,30vw,300px)", height: 4, background: "rgba(20,30,40,0.6)", borderRadius: 2, overflow: "hidden", margin: "8px auto 0" }}>
        <div style={{
          height: "100%", borderRadius: 2, background: color,
          width: `${pct}%`, transition: "width 1s linear",
          boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>
    </div>
  );
}
