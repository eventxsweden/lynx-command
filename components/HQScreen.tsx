"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { sSet, sGet } from "@/lib/storage";
import { playBoot, playIncoming, playAlert, playUnlock, playError, playComplete } from "@/lib/audio";
import { speak } from "@/lib/speech";
import { LynxEvent, TeamProgress } from "@/lib/types";
import { hqBase, cBtn, FONT } from "@/lib/styles";
import { useTypewriter } from "./TypedMsg";
import TypedMsg from "./TypedMsg";
import Numpad from "./Numpad";
import ScanLines from "./ScanLines";
import Timer from "./Timer";
import MuteButton from "./MuteButton";
import { HQAtmosphere } from "./Atmosphere";

interface Props {
  event: LynxEvent;
}

export default function HQScreen({ event }: Props) {
  const [phase, setPhase] = useState("boot");
  const [booted, setBooted] = useState(false);
  const [showCont, setShowCont] = useState(false);
  const [tp, setTp] = useState<Record<string, TeamProgress>>({});
  const [codeIn, setCodeIn] = useState("");
  const [fb, setFb] = useState<{ type: string } | null>(null);
  const fbT = useRef<ReturnType<typeof setTimeout> | null>(null);

  const theme = event.theme;
  const v = theme.vocabulary;

  useEffect(() => { sSet("lynx-hq-state", { phase, timestamp: Date.now() }); }, [phase]);

  useEffect(() => {
    const poll = async () => {
      const p: Record<string, TeamProgress> = {};
      for (const t of event.teams) {
        p[t.id] = await sGet<TeamProgress>(`lynx-team-${t.id}`, { teamId: t.id, missionIndex: 0, currentMission: "", totalMissions: t.missions.length, allDone: false, finalDigit: t.finalDigit, timestamp: 0 });
      }
      setTp(p);
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [event.teams]);

  useEffect(() => {
    if (phase === "boot" && !booted) {
      playBoot();
      const t = setTimeout(() => { setBooted(true); setPhase("intro"); }, 3500);
      return () => clearTimeout(t);
    }
  }, [phase, booted]);

  useEffect(() => {
    setShowCont(false); setCodeIn(""); setFb(null);
    if (phase === "intro") { playIncoming(); setTimeout(() => speak(theme.introSpeech), 800); }
    else if (phase === "dispatch") { playAlert(); setTimeout(() => speak(`Gå till era ${v.station.toLowerCase()}er. Varje ${v.mission.toLowerCase()} ger en ledtråd. Klockan tickar.`), 800); }
    else if (phase === "converge") { playIncoming(); setTimeout(() => speak(`Alla team har rapporterat in. Kombinera era siffror. Ange slutkoden.`), 800); }
    else if (phase === "complete") { playComplete(); setTimeout(() => speak(theme.completeSpeech), 800); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (["intro", "dispatch", "converge"].includes(phase)) {
      const t = setTimeout(() => setShowCont(true), 8000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (phase === "activate" || phase === "final_code") return;
      if (e.code === "Space" || e.code === "ArrowRight") { e.preventDefault(); advPhase(); }
      else if (e.code === "KeyR" && e.shiftKey) { setPhase("boot"); setBooted(false); }
      else if (e.code === "KeyF" && e.shiftKey) {
        document.documentElement.requestFullscreen?.();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const advPhase = () => {
    const flow = ["boot", "intro", "activate", "dispatch", "active", "converge", "final_code", "complete"];
    const i = flow.indexOf(phase);
    if (i < flow.length - 1) setPhase(flow[i + 1]);
  };

  const handleAct = useCallback(() => {
    if (codeIn === event.activationCode) {
      playUnlock(); setFb({ type: "success" });
      setTimeout(() => speak("Aktiveringskod bekräftad."), 300);
      if (fbT.current) clearTimeout(fbT.current);
      fbT.current = setTimeout(() => { setFb(null); setPhase("dispatch"); }, 3000);
    } else {
      playError(); setFb({ type: "error" }); setCodeIn("");
      if (fbT.current) clearTimeout(fbT.current);
      fbT.current = setTimeout(() => setFb(null), 2000);
    }
  }, [codeIn, event.activationCode]);

  const handleFinal = useCallback(() => {
    if (codeIn === event.finalCode) {
      playUnlock(); setFb({ type: "success" });
      if (fbT.current) clearTimeout(fbT.current);
      fbT.current = setTimeout(() => { setFb(null); setPhase("complete"); }, 3000);
    } else {
      playError(); setFb({ type: "error" }); setCodeIn("");
      if (fbT.current) clearTimeout(fbT.current);
      fbT.current = setTimeout(() => setFb(null), 2200);
    }
  }, [codeIn, event.finalCode]);

  const allDone = event.teams.every((t) => tp[t.id]?.allDone);
  const H = hqBase(theme.bgGradient);

  // ── BOOT ──
  if (phase === "boot") return (
    <div style={H}>
      <div style={{ animation: "fade-in 0.5s", textAlign: "center" }}>
        <div style={{ fontSize: "clamp(2rem,5vw,4rem)", letterSpacing: "0.35em", color: theme.accentColor, fontWeight: 700, marginBottom: 24 }}>{theme.orgName}</div>
        <div style={{ fontSize: "clamp(0.6rem,1.2vw,0.9rem)", opacity: 0.4, lineHeight: 2.4, color: theme.accentColor }}>
          <div>COMMAND CENTER v4.0</div>
          <div>INITIALIZING...</div>
          <div style={{ animation: "blink 0.8s infinite" }}>▊</div>
        </div>
      </div>
      <ScanLines /><MuteButton />
    </div>
  );

  // ── INTRO ──
  if (phase === "intro") {
    return <IntroPhase theme={theme} event={event} showCont={showCont} onNext={() => setPhase("activate")} />;
  }

  // ── ACTIVATE ──
  if (phase === "activate") return (
    <div style={H}>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: theme.accentColor, opacity: 0.45, fontFamily: FONT }}>SÄKERHETSKONTROLL</div>
      <h1 style={{ fontSize: "clamp(1.3rem,3vw,2.5rem)", fontWeight: 700, color: fb?.type === "success" ? theme.successColor : fb?.type === "error" ? "#ff4444" : theme.accentColor, textShadow: fb?.type === "success" ? `0 0 30px ${theme.successColor}60` : `0 0 25px ${theme.accentColor}40`, margin: 0, textAlign: "center", animation: fb?.type === "error" ? "shake 0.4s" : "none", fontFamily: FONT }}>
        {fb?.type === "success" ? "✓ VERIFIERAD" : fb?.type === "error" ? "⚠ FEL KOD" : "ANGE AKTIVERINGSKOD"}
      </h1>
      {fb?.type !== "success" && <Numpad value={codeIn} onChange={(fn) => setCodeIn(fn)} onSubmit={handleAct} maxLen={event.activationCode.length} disabled={!!fb} accentColor={theme.accentColor} />}
      <ScanLines /><MuteButton />
    </div>
  );

  // ── DISPATCH ──
  if (phase === "dispatch") {
    return <DispatchPhase theme={theme} event={event} showCont={showCont} onNext={() => setPhase("active")} />;
  }

  // ── ACTIVE ──
  if (phase === "active") return (
    <div style={H}>
      {/* Top status bar */}
      <div style={{ position: "absolute", top: 12, left: 20, right: 20, display: "flex", justifyContent: "space-between", alignItems: "center", zIndex: 10 }}>
        <div style={{ fontSize: "clamp(0.4rem,0.7vw,0.55rem)", color: theme.accentColor, opacity: 0.4, fontFamily: FONT, letterSpacing: "0.15em" }}>
          {v.agent}S IN FIELD: {event.teams.length * 4}
          <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: theme.accentColor, marginLeft: 6, animation: "blink 2s infinite" }} />
        </div>
        <div style={{ fontSize: "clamp(0.4rem,0.7vw,0.55rem)", color: event.timerMinutes && event.timerMinutes <= 5 ? "#ff3300" : "#4a6a7a", opacity: 0.5, fontFamily: FONT, letterSpacing: "0.15em" }}>
          THREAT LEVEL: {allDone ? "RESOLVED" : event.timerMinutes && event.timerMinutes <= 5 ? "ELEVATED" : "STANDARD"}
        </div>
      </div>

      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: theme.accentColor, opacity: 0.45, fontFamily: FONT }}>{v.mission} AKTIVA</div>
      <h1 style={{ fontSize: "clamp(1.3rem,3vw,2.5rem)", color: theme.accentColor, fontWeight: 700, textShadow: `0 0 20px ${theme.accentColor}40`, margin: "0 0 6px", fontFamily: FONT }}>OPERATIV STATUS</h1>
      {event.timerMinutes && <Timer minutes={event.timerMinutes} accentColor={theme.accentColor} />}
      <div style={{ display: "flex", gap: "clamp(10px,2.5vw,24px)", width: "100%", maxWidth: 900, justifyContent: "center", flexWrap: "wrap" }}>
        {event.teams.map((team) => {
          const d = tp[team.id];
          const done = d?.allDone;
          const mi = d?.missionIndex || 0;
          const total = d?.totalMissions || team.missions.length;
          return (
            <div key={team.id} style={{ flex: "1 1 clamp(200px,25vw,280px)", border: `2px solid ${done ? theme.successColor : team.color}`, borderRadius: 12, padding: "clamp(14px,2vw,24px)", background: done ? `${theme.successColor}08` : `${team.accent}0.04)`, transition: "all 0.5s" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "clamp(1.2rem,2.5vw,1.8rem)", color: team.color }}>{team.symbol}</span>
                  <span style={{ fontSize: "clamp(0.7rem,1.2vw,0.9rem)", color: team.color, fontWeight: 700, fontFamily: FONT }}>{team.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {done && <span style={{ fontSize: "clamp(0.55rem,0.9vw,0.7rem)", color: theme.successColor, fontFamily: FONT }}>✓ KLAR</span>}
                  {!done && <span style={{ fontSize: "clamp(0.35rem,0.6vw,0.45rem)", color: "#ff3300", fontFamily: FONT, animation: "blink 2s infinite", display: "flex", alignItems: "center", gap: 3 }}><span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ff3300" }} />REC</span>}
                </div>
              </div>
              <div style={{ height: 6, background: "rgba(20,30,40,0.6)", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", borderRadius: 3, background: done ? theme.successColor : team.color, width: `${done ? 100 : (mi / total) * 100}%`, transition: "width 0.8s", boxShadow: `0 0 8px ${done ? theme.successColor + "80" : team.color + "80"}` }} />
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} style={{ width: "clamp(10px,1.5vw,16px)", height: "clamp(10px,1.5vw,16px)", borderRadius: "50%", background: i < mi || done ? theme.successColor : i === mi && !done ? team.color : "#1a2530", boxShadow: (i < mi || done) ? `0 0 6px ${theme.successColor}60` : i === mi && !done ? `0 0 8px ${team.color}60` : "none", animation: i === mi && !done ? "blink 1.5s infinite" : "none" }} />
                ))}
              </div>
              <div style={{ fontSize: "clamp(0.45rem,0.75vw,0.6rem)", color: "#4a6a7a", textAlign: "center", marginTop: 8, fontFamily: FONT }}>{done ? "ALLA KLARA" : `${v.mission} ${mi + 1}/${total}`}</div>
            </div>
          );
        })}
      </div>
      {allDone && (
        <div style={{ marginTop: 16, textAlign: "center", animation: "fade-in 0.5s" }}>
          <div style={{ fontSize: "clamp(0.7rem,1.3vw,0.95rem)", color: theme.successColor, letterSpacing: "0.15em", marginBottom: 10, fontFamily: FONT }}>ALLA TEAM KLARA</div>
          <button onClick={() => setPhase("converge")} style={{ ...cBtn(theme.successColor) }}>SAMLA ALLA ▶</button>
        </div>
      )}
      {!allDone && <div style={{ fontSize: "clamp(0.5rem,0.85vw,0.7rem)", color: "#334455", marginTop: 12, fontFamily: FONT }}>Väntar på team... (Space = hoppa)</div>}
      <HQAtmosphere color={theme.accentColor} />
      <ScanLines /><MuteButton />
    </div>
  );

  // ── CONVERGE ──
  if (phase === "converge") {
    return <ConvergePhase theme={theme} event={event} showCont={showCont} onNext={() => setPhase("final_code")} />;
  }

  // ── FINAL CODE ──
  if (phase === "final_code") return (
    <div style={{ ...H, background: "radial-gradient(ellipse at center,#1a0800 0%,#080c12 70%)" }}>
      <div style={{ position: "absolute", inset: 0, border: "3px solid #ff330044", pointerEvents: "none", animation: "alert-flash 1.5s infinite" }} />
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: "#ff6633", opacity: 0.6, fontFamily: FONT }}>⚠ SLUTPROV</div>
      <h1 style={{ fontSize: "clamp(1.3rem,3vw,2.5rem)", fontWeight: 700, color: fb?.type === "success" ? theme.successColor : fb?.type === "error" ? "#ff4444" : "#ff6633", textShadow: fb?.type === "success" ? `0 0 30px ${theme.successColor}60` : "0 0 30px rgba(255,100,50,0.35)", margin: 0, textAlign: "center", animation: fb?.type === "error" ? "shake 0.4s" : "none", fontFamily: FONT }}>
        {fb?.type === "success" ? `✓ ${v.briefcase.toUpperCase()} UPPLÅST` : fb?.type === "error" ? "⚠ FEL KOD" : "ANGE SLUTKOD"}
      </h1>
      {fb?.type === "error" && <div style={{ color: "#ff4444", fontSize: "clamp(0.65rem,1.1vw,0.85rem)", animation: "shake 0.4s", fontFamily: FONT }}>FEL KOD — KONTROLLERA MED ALLA TEAM</div>}
      {fb?.type !== "success" && <Numpad value={codeIn} onChange={(fn) => setCodeIn(fn)} onSubmit={handleFinal} maxLen={event.finalCode.length} disabled={!!fb} accentColor="#ff6633" />}
      <ScanLines /><MuteButton />
    </div>
  );

  // ── COMPLETE ──
  if (phase === "complete") return (
    <div style={{ ...H, background: "radial-gradient(ellipse at center,#001a10 0%,#080c12 70%)" }}>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: theme.successColor, opacity: 0.6, fontFamily: FONT }}>{v.mission} SLUTFÖRT</div>
      <h1 style={{ fontSize: "clamp(1.5rem,4vw,3.5rem)", fontWeight: 700, color: theme.successColor, textShadow: `0 0 40px ${theme.successColor}80`, margin: 0, textAlign: "center", fontFamily: FONT }}>CERTIFIERING BEKRÄFTAD</h1>
      <div style={{ fontSize: "clamp(0.55rem,0.9vw,0.7rem)", color: theme.accentColor, letterSpacing: "0.25em", opacity: 0.5, fontFamily: FONT }}>{theme.certTitle}</div>
      <TypedMsg text={theme.completeSpeech} color="#88ddaa" />
      <div style={{ display: "flex", gap: 30, marginTop: 12 }}>
        {event.teams.map((t) => (
          <div key={t.id} style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", color: t.color, opacity: 0.6, textShadow: `0 0 15px ${t.color}40` }}>{t.symbol}</div>
        ))}
      </div>
      <ScanLines /><MuteButton />
    </div>
  );

  return null;
}

// Sub-components that use hooks at top level

function IntroPhase({ theme, event, showCont, onNext }: { theme: LynxEvent["theme"]; event: LynxEvent; showCont: boolean; onNext: () => void }) {
  const [t, d] = useTypewriter(theme.introSpeech, 28);
  const H = hqBase(theme.bgGradient);
  return (
    <div style={H}>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: theme.accentColor, opacity: 0.45, fontFamily: FONT }}>SÄKER KANAL</div>
      <h1 style={{ fontSize: "clamp(1.5rem,3.5vw,3rem)", color: theme.accentColor, fontWeight: 700, letterSpacing: "0.08em", textShadow: `0 0 25px ${theme.accentColor}40`, margin: 0, textAlign: "center", fontFamily: FONT }}>INKOMMANDE MEDDELANDE</h1>
      <div style={{ maxWidth: 650, fontSize: "clamp(0.75rem,1.5vw,1.05rem)", lineHeight: 1.8, textAlign: "center", color: "#85a0b5", minHeight: "5em", fontFamily: FONT }}>
        {t}{!d && <span style={{ color: theme.accentColor, animation: "blink 0.6s infinite" }}>▊</span>}
      </div>
      <div style={{ display: "flex", gap: "clamp(20px,5vw,50px)", marginTop: 12 }}>
        {event.teams.map((tm) => (
          <div key={tm.id} style={{ textAlign: "center", opacity: 0.5 }}>
            <div style={{ fontSize: "clamp(1.5rem,3vw,2.5rem)", color: tm.color }}>{tm.symbol}</div>
            <div style={{ fontSize: "clamp(0.45rem,0.8vw,0.6rem)", color: tm.color, letterSpacing: "0.2em", fontFamily: FONT }}>{tm.name}</div>
          </div>
        ))}
      </div>
      {showCont && <button onClick={onNext} style={cBtn(theme.accentColor)}>ANGE AKTIVERINGSKOD ▶</button>}
      <ScanLines /><MuteButton />
    </div>
  );
}

function DispatchPhase({ theme, event, showCont, onNext }: { theme: LynxEvent["theme"]; event: LynxEvent; showCont: boolean; onNext: () => void }) {
  const v = theme.vocabulary;
  const [t, d] = useTypewriter(`Team aktiverade. Gå till era ${v.station.toLowerCase()}er. Varje team har en terminal med egna ${v.mission.toLowerCase()}. Ledtrådarna i rummet är markerade med ert teams symbol — rör inte andras. Klara alla ${v.mission.toLowerCase()} och återvänd hit.`, 24);
  const H = hqBase(theme.bgGradient);
  return (
    <div style={H}>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: "#ff9500", opacity: 0.6, fontFamily: FONT }}>TEAM-AKTIVERING</div>
      <h1 style={{ fontSize: "clamp(1.3rem,3.5vw,2.8rem)", color: "#ff9500", fontWeight: 700, textShadow: "0 0 30px rgba(255,149,0,0.35)", margin: 0, textAlign: "center", fontFamily: FONT }}>GÅ TILL ERA BASER</h1>
      <div style={{ maxWidth: 620, fontSize: "clamp(0.75rem,1.4vw,1rem)", lineHeight: 1.8, textAlign: "center", color: "#85a0b5", minHeight: "4em", fontFamily: FONT }}>
        {t}{!d && <span style={{ color: "#ff9500", animation: "blink 0.6s infinite" }}>▊</span>}
      </div>
      <div style={{ display: "flex", gap: "clamp(12px,3vw,30px)", marginTop: 8 }}>
        {event.teams.map((tm) => (
          <div key={tm.id} style={{ border: `2px solid ${tm.color}`, borderRadius: 12, padding: "clamp(12px,2vw,24px) clamp(16px,3vw,32px)", background: `${tm.accent}0.05)`, textAlign: "center", minWidth: "clamp(80px,15vw,140px)" }}>
            <div style={{ fontSize: "clamp(2rem,4vw,3rem)", marginBottom: 8 }}>{tm.symbol}</div>
            <div style={{ fontSize: "clamp(0.65rem,1.2vw,0.9rem)", color: tm.color, fontWeight: 700, letterSpacing: "0.15em", fontFamily: FONT }}>TEAM {tm.name}</div>
          </div>
        ))}
      </div>
      {showCont && <button onClick={onNext} style={cBtn("#ff9500")}>STARTA {v.mission} ▶</button>}
      <ScanLines /><MuteButton />
    </div>
  );
}

function ConvergePhase({ theme, event, showCont, onNext }: { theme: LynxEvent["theme"]; event: LynxEvent; showCont: boolean; onNext: () => void }) {
  const v = theme.vocabulary;
  const [t, d] = useTypewriter(`Alla team har slutfört sina ${v.mission.toLowerCase()}. Varje team har en kodsiffra. Kombinera siffrorna och ange slutkoden. Det här avgör allt.`, 26);
  const H = hqBase(theme.bgGradient);
  return (
    <div style={H}>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: theme.successColor, opacity: 0.6, fontFamily: FONT }}>ALLA TEAM KLARA</div>
      <h1 style={{ fontSize: "clamp(1.3rem,3.5vw,2.8rem)", color: theme.successColor, fontWeight: 700, textShadow: `0 0 30px ${theme.successColor}60`, margin: 0, textAlign: "center", fontFamily: FONT }}>SAMLING VID {v.hq}</h1>
      <div style={{ maxWidth: 600, fontSize: "clamp(0.75rem,1.4vw,1rem)", lineHeight: 1.8, textAlign: "center", color: "#85a0b5", minHeight: "3em", fontFamily: FONT }}>
        {t}{!d && <span style={{ color: theme.successColor, animation: "blink 0.6s infinite" }}>▊</span>}
      </div>
      <div style={{ display: "flex", gap: "clamp(16px,4vw,40px)", marginTop: 8 }}>
        {event.teams.map((team) => (
          <div key={team.id} style={{ textAlign: "center" }}>
            <div style={{ fontSize: "clamp(0.5rem,0.8vw,0.65rem)", color: team.color, letterSpacing: "0.15em", marginBottom: 6, fontFamily: FONT }}>{team.symbol} {team.name}</div>
            <div style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: team.color, fontWeight: 700, textShadow: `0 0 20px ${team.color}60`, width: "clamp(50px,8vw,80px)", height: "clamp(55px,9vw,85px)", border: `2px solid ${team.color}`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `${team.accent}0.06)`, fontFamily: FONT }}>{team.finalDigit}</div>
          </div>
        ))}
      </div>
      {showCont && <button onClick={onNext} style={{ ...cBtn("#ff6633") }}>ANGE SLUTKOD ▶</button>}
      <ScanLines /><MuteButton />
    </div>
  );
}
