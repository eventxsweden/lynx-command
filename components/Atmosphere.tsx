"use client";
import { useState, useEffect, useRef } from "react";
import { FONT } from "@/lib/styles";

// ═══════════════════════════════════════════════════════════════
// ATMOSPHERE COMPONENTS — "Command Center" decorative elements
// Pure CSS/SVG animations, no performance impact
// ═══════════════════════════════════════════════════════════════

export function MilitaryClock({ color = "#00ffd520" }: { color?: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      setTime(`${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "fixed", top: 8, right: 12, fontSize: "clamp(0.5rem,0.9vw,0.7rem)", fontFamily: FONT, color, letterSpacing: "0.15em", zIndex: 10, pointerEvents: "none" }}>
      <div style={{ fontSize: "0.3rem", opacity: 0.5, letterSpacing: "0.2em" }}>LOCAL TIME</div>
      {time}
    </div>
  );
}

export function HeartbeatLine({ color = "#00ffd5", alert = false }: { color?: string; alert?: boolean }) {
  const c = alert ? "#ff3300" : color;
  const speed = alert ? "0.8s" : "1.5s";
  return (
    <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 30, overflow: "hidden", zIndex: 5, pointerEvents: "none", opacity: 0.3 }}>
      <svg width="100%" height="30" viewBox="0 0 400 30" preserveAspectRatio="none">
        <path
          d="M0,15 L80,15 L90,5 L100,25 L110,10 L120,20 L130,15 L200,15 L210,5 L220,25 L230,10 L240,20 L250,15 L320,15 L330,5 L340,25 L350,10 L360,20 L370,15 L400,15"
          fill="none" stroke={c} strokeWidth="1.5" opacity="0.6"
          style={{ animation: `heartbeat-scroll ${speed} linear infinite` }}
        />
      </svg>
      <style>{`@keyframes heartbeat-scroll{0%{transform:translateX(0)}100%{transform:translateX(-200px)}}`}</style>
    </div>
  );
}

export function DataStream({ opacity = 0.04 }: { opacity?: number }) {
  const chars = useRef(
    Array.from({ length: 12 }, () =>
      Array.from({ length: 40 }, () =>
        Math.random() > 0.5 ? Math.floor(Math.random() * 16).toString(16).toUpperCase() : String.fromCharCode(0x30 + Math.floor(Math.random() * 10))
      ).join(" ")
    )
  );
  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1, opacity }}>
      {chars.current.map((line, i) => (
        <div key={i} style={{
          position: "absolute", left: `${(i * 8.3) % 100}%`, top: 0,
          fontSize: "0.45rem", fontFamily: FONT, color: "#00ffd5",
          whiteSpace: "nowrap", writingMode: "vertical-rl",
          animation: `data-fall ${15 + i * 2}s linear infinite`,
          animationDelay: `${-i * 1.3}s`,
        }}>
          {line}
        </div>
      ))}
      <style>{`@keyframes data-fall{0%{transform:translateY(-100%)}100%{transform:translateY(100vh)}}`}</style>
    </div>
  );
}

export function SignalIndicator({ color = "#00ffd5" }: { color?: string }) {
  const [strength, setStrength] = useState(97);
  useEffect(() => {
    const iv = setInterval(() => setStrength(92 + Math.floor(Math.random() * 8)), 5000);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "fixed", top: 8, left: 12, fontSize: "clamp(0.35rem,0.6vw,0.45rem)", fontFamily: FONT, color, opacity: 0.3, zIndex: 10, pointerEvents: "none", letterSpacing: "0.1em" }}>
      <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: color, marginRight: 4, animation: "blink 3s infinite" }} />
      ENCRYPTED CHANNEL — SIGNAL: {strength}%
    </div>
  );
}

export function MiniRadar({ color = "#00ffd5" }: { color?: string }) {
  const [blips, setBlips] = useState<{ x: number; y: number; id: number }[]>([]);
  useEffect(() => {
    const iv = setInterval(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 0.3 + Math.random() * 0.6;
      setBlips((prev) => [
        ...prev.slice(-4),
        { x: 50 + Math.cos(angle) * dist * 40, y: 50 + Math.sin(angle) * dist * 40, id: Date.now() },
      ]);
    }, 3500);
    return () => clearInterval(iv);
  }, []);
  return (
    <div style={{ position: "fixed", bottom: 40, right: 12, width: 60, height: 60, zIndex: 10, pointerEvents: "none", opacity: 0.2 }}>
      <svg viewBox="0 0 100 100" width="60" height="60">
        <circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="0.5" opacity="0.4" />
        <circle cx="50" cy="50" r="25" fill="none" stroke={color} strokeWidth="0.3" opacity="0.3" />
        <circle cx="50" cy="50" r="10" fill="none" stroke={color} strokeWidth="0.3" opacity="0.2" />
        <line x1="50" y1="10" x2="50" y2="90" stroke={color} strokeWidth="0.2" opacity="0.2" />
        <line x1="10" y1="50" x2="90" y2="50" stroke={color} strokeWidth="0.2" opacity="0.2" />
        {/* Sweep */}
        <line x1="50" y1="50" x2="50" y2="10" stroke={color} strokeWidth="1" opacity="0.6"
          style={{ transformOrigin: "50px 50px", animation: "radar-sweep 4s linear infinite" }}
        />
        {/* Blips */}
        {blips.map((b) => (
          <circle key={b.id} cx={b.x} cy={b.y} r="2" fill={color} opacity="0.8"
            style={{ animation: "radar-blip 3s ease-out forwards" }}
          />
        ))}
      </svg>
      <style>{`
        @keyframes radar-sweep{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        @keyframes radar-blip{0%{opacity:0.8;r:2}100%{opacity:0;r:1}}
      `}</style>
    </div>
  );
}

export function SystemStatus({ color = "#00ffd5" }: { color?: string }) {
  const messages = [
    "PERIMETER: SECURE", "FREQUENCY SCAN: NOMINAL", "AGENT BIOMETRICS: ACTIVE",
    "SATELLITE UPLINK: LOCKED", "DECRYPTION MODULE: STANDBY", "SURVEILLANCE: ONLINE",
    "DATA INTEGRITY: VERIFIED", "COMM CHANNEL: ENCRYPTED", "THREAT ASSESSMENT: LOW",
  ];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setIdx((i) => (i + 1) % messages.length), 8000);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ position: "fixed", bottom: 4, left: 12, fontSize: "clamp(0.3rem,0.5vw,0.4rem)", fontFamily: FONT, color, opacity: 0.15, zIndex: 10, pointerEvents: "none", letterSpacing: "0.15em", transition: "opacity 0.5s" }}>
      SYS: {messages[idx]}
    </div>
  );
}

export function TargetingFrame({ color = "#00ffd5", children }: { color?: string; children: React.ReactNode }) {
  const cornerStyle = (top: boolean, left: boolean): React.CSSProperties => ({
    position: "absolute",
    [top ? "top" : "bottom"]: -4,
    [left ? "left" : "right"]: -4,
    width: 16, height: 16,
    borderColor: color,
    borderStyle: "solid",
    borderWidth: 0,
    ...(top && left ? { borderTopWidth: 2, borderLeftWidth: 2 } : {}),
    ...(top && !left ? { borderTopWidth: 2, borderRightWidth: 2 } : {}),
    ...(!top && left ? { borderBottomWidth: 2, borderLeftWidth: 2 } : {}),
    ...(!top && !left ? { borderBottomWidth: 2, borderRightWidth: 2 } : {}),
    opacity: 0.5,
  });

  return (
    <div style={{ position: "relative", padding: "12px 16px" }}>
      <div style={cornerStyle(true, true)} />
      <div style={cornerStyle(true, false)} />
      <div style={cornerStyle(false, true)} />
      <div style={cornerStyle(false, false)} />
      <div style={{ fontSize: "clamp(0.35rem,0.55vw,0.4rem)", color, opacity: 0.5, letterSpacing: "0.2em", marginBottom: 6, fontFamily: FONT, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: color, animation: "blink 2s infinite" }} />
        SECURE INPUT
      </div>
      {children}
      <div style={{ fontSize: "clamp(0.3rem,0.5vw,0.38rem)", color, opacity: 0.3, letterSpacing: "0.15em", marginTop: 6, fontFamily: FONT, animation: "blink 2.5s infinite" }}>
        AWAITING AGENT INPUT...
      </div>
    </div>
  );
}

export function MissionLoadSequence({ title, onComplete, color = "#00ffd5" }: { title: string; onComplete: () => void; color?: string }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [scramble, setScramble] = useState("");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    // Step 0: Incoming
    timers.push(setTimeout(() => setStep(1), 500));
    // Step 1: Download progress
    const progressIv = setInterval(() => setProgress((p) => Math.min(p + 7, 100)), 60);
    timers.push(setTimeout(() => { clearInterval(progressIv); setProgress(100); setStep(2); }, 1200));
    // Step 2: Scramble to title
    timers.push(setTimeout(() => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#@$%&";
      let frame = 0;
      const iv = setInterval(() => {
        frame++;
        const p = Math.min(frame / 15, 1);
        const revealed = Math.floor(p * title.length);
        let s = "";
        for (let i = 0; i < title.length; i++) {
          s += i < revealed ? title[i] : chars[Math.floor(Math.random() * chars.length)];
        }
        setScramble(s);
        if (frame >= 15) { clearInterval(iv); setStep(3); }
      }, 50);
    }, 1400));
    // Step 3: Complete
    timers.push(setTimeout(onComplete, 2500));
    return () => { timers.forEach(clearTimeout); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  const bar = "█".repeat(Math.floor(progress / 5)) + "░".repeat(20 - Math.floor(progress / 5));

  return (
    <div style={{ textAlign: "center", fontFamily: FONT, animation: "fade-in 0.3s" }}>
      {step === 0 && <div style={{ color, opacity: 0.6, letterSpacing: "0.2em", fontSize: "clamp(0.5rem,1vw,0.7rem)", animation: "blink 0.6s infinite" }}>INCOMING TRANSMISSION...</div>}
      {step === 1 && (
        <div style={{ color, opacity: 0.5, fontSize: "clamp(0.45rem,0.8vw,0.6rem)" }}>
          DOWNLOADING MISSION BRIEF {bar} {progress}%
        </div>
      )}
      {step === 2 && <div style={{ color, fontSize: "clamp(0.8rem,2vw,1.4rem)", fontWeight: 700, letterSpacing: "0.1em" }}>{scramble}</div>}
      {step === 3 && (
        <div>
          <div style={{ color: "#33ff88", fontSize: "clamp(0.4rem,0.7vw,0.5rem)", letterSpacing: "0.2em", marginBottom: 4 }}>████████████████████ 100% — DECRYPTED</div>
          <div style={{ color, fontSize: "clamp(0.8rem,2vw,1.4rem)", fontWeight: 700, letterSpacing: "0.1em" }}>{title}</div>
        </div>
      )}
    </div>
  );
}

export function TransmissionAnimation({ color = "#00ffd5", active = false }: { color?: string; active?: boolean }) {
  if (!active) return null;
  return (
    <div style={{ position: "relative", width: "100%", height: 60, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${40 + Math.random() * 20}%`,
          bottom: 0,
          width: 3, height: 3, borderRadius: "50%",
          background: color,
          animation: `transmit-particle 1s ease-out forwards`,
          animationDelay: `${i * 0.1}s`,
          opacity: 0.8,
        }} />
      ))}
      <style>{`@keyframes transmit-particle{0%{transform:translateY(0);opacity:0.8}100%{transform:translateY(-60px);opacity:0}}`}</style>
    </div>
  );
}

export function CodeReveal({ digit, color, onDone }: { digit: string; color: string; onDone?: () => void }) {
  const [phase, setPhase] = useState(0);
  const [scramble, setScramble] = useState("?");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 500);
    const t2 = setTimeout(() => {
      let frame = 0;
      const iv = setInterval(() => {
        frame++;
        setScramble(String(Math.floor(Math.random() * 10)));
        if (frame >= 12) { clearInterval(iv); setScramble(digit); setPhase(2); }
      }, 80);
    }, 1000);
    const t3 = setTimeout(() => { setPhase(3); onDone?.(); }, 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [digit]);

  return (
    <div style={{ textAlign: "center", fontFamily: FONT }}>
      {phase < 2 && (
        <div style={{ fontSize: "clamp(0.5rem,1vw,0.7rem)", color, opacity: 0.5, letterSpacing: "0.2em", animation: "blink 0.5s infinite" }}>
          GENERERAR KODSIFFRA...
        </div>
      )}
      <div style={{
        fontSize: "clamp(5rem,15vw,10rem)", fontWeight: 700, color,
        textShadow: phase >= 2 ? `0 0 40px ${color}80, 0 0 80px ${color}40, 0 0 120px ${color}20` : "none",
        transition: "text-shadow 0.5s",
        animation: phase >= 2 ? "glow-pulse 2s infinite" : "none",
      }}>
        {scramble}
      </div>
      {phase >= 2 && (
        <div style={{ fontSize: "clamp(0.6rem,1.2vw,0.85rem)", color, opacity: 0.6, letterSpacing: "0.15em", marginTop: 8, animation: "fade-in 0.5s" }}>
          MEMORERA DENNA SIFFRA — ÅTERVÄND TILL HQ
        </div>
      )}
    </div>
  );
}

// Bundle all atmosphere for easy usage
export function TeamAtmosphere({ color = "#00ffd5" }: { color?: string }) {
  return (
    <>
      <MilitaryClock color={`${color}30`} />
      <HeartbeatLine color={color} />
      <DataStream opacity={0.03} />
      <SignalIndicator color={color} />
      <MiniRadar color={color} />
      <SystemStatus color={color} />
    </>
  );
}

export function HQAtmosphere({ color = "#00ffd5", timerWarning = false }: { color?: string; timerWarning?: boolean }) {
  return (
    <>
      <MilitaryClock color={`${color}30`} />
      <HeartbeatLine color={color} alert={timerWarning} />
      <DataStream opacity={0.02} />
      <MiniRadar color={color} />
      <SystemStatus color={color} />
    </>
  );
}
