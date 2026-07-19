"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { sSet, sGet } from "@/lib/storage";
import { playIncoming, playSuccess, playError, playUnlock, playTransmission, playStamp, playDotPling, playCrescendo, playStaticBurst, startAmbient, stopAmbient } from "@/lib/audio";
import { speak, prewarmSpeech, setVoicePreset, VOICE_PRESETS, VoicePreset } from "@/lib/speech";
import { Team, AdminMessage, HQState, TeamProgress } from "@/lib/types";
import { tBase, FONT } from "@/lib/styles";
import { useTypewriter } from "./TypedMsg";
import Numpad from "./Numpad";
import HintSystem from "./HintSystem";
import IncomingMessage from "./IncomingMessage";
import ScanLines from "./ScanLines";
import MuteButton from "./MuteButton";
import { TeamAtmosphere, TargetingFrame, MissionLoadSequence, CodeReveal } from "./Atmosphere";
import VideoBackground from "./VideoBackground";

interface Props {
  team: Team;
  vocabulary: { mission: string; station: string; hq: string; agent: string; briefcase: string };
  allTeams?: { id: string; totalMissions: number }[];
}

type TerminalPhase = "waiting" | "loading" | "briefing" | "input" | "verifying" | "transmitting" | "confirmed" | "done" | "codeReveal" | "waitingForTeams";

export default function TeamTerminal({ team, vocabulary: v, allTeams }: Props) {
  const [active, setActive] = useState(false);
  const [needsActivation, setNeedsActivation] = useState(false);
  const [actInput, setActInput] = useState("");
  const [actError, setActError] = useState(false);
  const [mIdx, setMIdx] = useState(0);
  const [input, setInput] = useState("");
  const [termPhase, setTermPhase] = useState<TerminalPhase>("loading");
  const [allDone, setAllDone] = useState(false);
  const [incomingMsg, setIncomingMsg] = useState<AdminMessage | null>(null);
  const [lastMsgId, setLastMsgId] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [missionStartTime, setMissionStartTime] = useState(Date.now());
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLandscape, setIsLandscape] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const hydratedRef = useRef(false);
  const fbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mission = team.missions[mIdx] || null;

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopAmbient(); if (fbTimer.current) clearTimeout(fbTimer.current); };
  }, []);

  // ── Resume after a browser reload ──
  // Progress lives in KV; on mount, restore it so a closed/reopened browser
  // returns to the same mission instead of restarting from activation.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const hq = await sGet<HQState>("lynx-hq-state", null);
      const saved = await sGet<TeamProgress>(`lynx-team-${team.id}`, null);
      const inPlay = hq && ["active", "converge", "final_code", "complete"].includes(hq.phase);
      if (!cancelled && inPlay && saved?.active) {
        if (saved.allDone) {
          setActive(true); setAllDone(true); setNeedsActivation(false);
        } else {
          setActive(true); setNeedsActivation(false);
          setMIdx(Math.min(saved.missionIndex, team.missions.length - 1));
          setTermPhase("loading");
        }
      }
      if (!cancelled) { hydratedRef.current = true; setHydrated(true); }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.id]);

  // Landscape detection
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setIsLandscape(w >= h || w > 768); // Don't nag on tablets/desktops
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Start ambient on first interaction
  useEffect(() => {
    const start = () => { startAmbient(); window.removeEventListener("click", start); };
    window.addEventListener("click", start);
    return () => window.removeEventListener("click", start);
  }, []);

  // Poll HQ + messages
  useEffect(() => {
    const poll = async () => {
      const hq = await sGet<HQState>("lynx-hq-state", { phase: "boot", timestamp: 0 });
      if (hq) {
        if (hq.phase === "active" && !active && !needsActivation && hydratedRef.current) {
          if (team.activationCode) {
            // Per-team login: each team types their own code on their terminal
            setNeedsActivation(true); playIncoming();
            speak("Terminal låst. Ange ert teams aktiveringskod.");
          } else {
            setActive(true); playIncoming();
            speak(`${v.mission} mottaget. Er terminal är nu aktiv.`);
            setTermPhase("loading");
          }
        }
        if (hq.phase === "boot" || hq.phase === "intro") {
          setActive(false); setNeedsActivation(false); setActInput(""); setActError(false);
          setMIdx(0); setInput(""); setTermPhase("loading");
          setAllDone(false); setLastMsgId(0); setAttempts(0); setHintsUsed(0);
        }
      }
      const msg = await sGet<AdminMessage>(`lynx-msg-${team.id}`, null);
      if (msg && msg.id > lastMsgId) {
        setLastMsgId(msg.id);
        setIncomingMsg(msg);
      }
      // Follow the voice chosen in admin
      const vp = await sGet<VoicePreset>("lynx-voice-preset", null);
      if (vp && VOICE_PRESETS.some((p) => p.id === vp)) setVoicePreset(vp);
    };
    poll();
    const iv = setInterval(poll, 1500);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, needsActivation, lastMsgId, team.id]);

  // Report progress — only after hydration, so the restore read isn't clobbered
  useEffect(() => {
    if (!hydrated) return;
    sSet(`lynx-team-${team.id}`, {
      teamId: team.id, missionIndex: mIdx, currentMission: mission?.title || "",
      totalMissions: team.missions.length,
      allDone, finalDigit: team.finalDigit, timestamp: Date.now(),
      active, // true once the team has passed activation — enables resume on reload
    });
  }, [hydrated, mIdx, allDone, active, team, mission?.title]);

  // Track mission timing
  useEffect(() => {
    setMissionStartTime(Date.now());
    setAttempts(0);
    setHintsUsed(0);
  }, [mIdx]);

  // Pre-generate this mission's speech while the load animation shows,
  // so briefing + success lines start instantly when spoken.
  useEffect(() => {
    const cur = team.missions[mIdx];
    if (cur) { prewarmSpeech(cur.briefing); prewarmSpeech(cur.successMsg); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mIdx]);

  // ── Per-team activation code entry ──
  const handleActivation = useCallback(() => {
    if (!team.activationCode || actInput.length === 0) return;
    if (actInput === team.activationCode) {
      playUnlock();
      setNeedsActivation(false); setActive(true); setActInput("");
      speak("Aktiveringskod bekräftad. Identitet verifierad. Välkomna, agenter.");
      setTermPhase("loading");
    } else {
      playError(); setActError(true); setActInput("");
      if (fbTimer.current) clearTimeout(fbTimer.current);
      fbTimer.current = setTimeout(() => setActError(false), 2000);
    }
  }, [actInput, team.activationCode]);

  // ── Simultaneous-mission gate: info_exchange starts only when ALL teams are ready ──
  const gateActive = mission?.id === "info_exchange" && !!allTeams && allTeams.length > 1;
  useEffect(() => {
    if (!gateActive || !active || (termPhase !== "loading" && termPhase !== "waitingForTeams")) return;
    let cancelled = false;
    const checkTeams = async () => {
      const states = await Promise.all(
        allTeams!.map((t) => sGet<TeamProgress>(`lynx-team-${t.id}`, null).then((p) => ({ t, p })))
      );
      // A team is ready when it has reached its final (simultaneous) mission
      return states.every(({ t, p }) => p && (p.allDone || p.missionIndex >= t.totalMissions - 1));
    };
    const iv = setInterval(async () => {
      const ready = await checkTeams();
      if (cancelled) return;
      if (ready && termPhase === "waitingForTeams") setTermPhase("loading");
      if (!ready && termPhase === "loading") {
        setTermPhase("waitingForTeams");
        playIncoming();
        speak(`Alla era ${v.station.toLowerCase()}er är klara. Väntar på att alla team ska bli redo för det sista ${v.mission.toLowerCase()}et.`);
      }
    }, 1500);
    // Run the first check immediately so the gate reacts without delay
    checkTeams().then((ready) => {
      if (cancelled) return;
      if (ready && termPhase === "waitingForTeams") setTermPhase("loading");
      if (!ready && termPhase === "loading") {
        setTermPhase("waitingForTeams");
        playIncoming();
        speak(`Alla era ${v.station.toLowerCase()}er är klara. Väntar på att alla team ska bli redo för det sista ${v.mission.toLowerCase()}et.`);
      }
    });
    return () => { cancelled = true; clearInterval(iv); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gateActive, termPhase, active, mIdx]);

  // ── 5-Step Submit Sequence ──
  const handleSubmit = useCallback(() => {
    if (!mission || input.length === 0) return;
    setAttempts((a) => a + 1);

    if (input === mission.answer) {
      // Step 1: VERIFYING (0.6s)
      setTermPhase("verifying");

      setTimeout(() => {
        // Step 2: TRANSMITTING (1s)
        playTransmission();
        setTermPhase("transmitting");

        setTimeout(() => {
          // Step 3: HQ BEKRÄFTAR — speech must finish before we move on
          playStamp();
          setTermPhase("confirmed");
          const speechDone = new Promise<void>((resolve) => {
            setTimeout(() => speak(mission.successMsg).then(resolve), 300);
          });

          // Save stats
          const elapsed = Math.round((Date.now() - missionStartTime) / 1000);
          sGet<Record<string, unknown>[]>(`lynx-stats-${team.id}`, []).then((stats) => {
            const s = stats || [];
            s.push({ missionId: mission.id, time: elapsed, attempts: attempts + 1, hintsUsed });
            sSet(`lynx-stats-${team.id}`, s);
          });

          // Step 4: Progress dot pling (after 1s)
          setTimeout(() => playDotPling(), 1000);

          // Step 5: Transition — after speech ends (min 2.5s, max 12s safety cap)
          const minWait = new Promise<void>((r) => setTimeout(r, 2500));
          const safetyCap = new Promise<void>((r) => setTimeout(r, 12000));
          Promise.race([Promise.all([speechDone, minWait]), safetyCap]).then(() => {
            const isLast = mIdx + 1 >= team.missions.length;
            if (isLast) {
              // Final mission — dramatic code reveal
              playCrescendo();
              setTermPhase("codeReveal");
            } else {
              // Normal transition — increment mission index THEN show loading
              playStaticBurst();
              setInput("");
              setMIdx((i) => i + 1);
              setTermPhase("loading");
            }
          });
        }, 1000);
      }, 600);

    } else {
      playError();
      setErrorMsg("FEL SVAR — FÖRSÖK IGEN");
      setInput("");
      if (fbTimer.current) clearTimeout(fbTimer.current);
      fbTimer.current = setTimeout(() => setErrorMsg(null), 2000);
    }
  }, [input, mission, mIdx, team, missionStartTime, attempts, hintsUsed]);

  const finishAllMissions = useCallback(() => {
    setAllDone(true);
    playUnlock();
    // Digit is shown on screen only — never spoken aloud where other teams can hear it
    speak(`Alla ${v.mission.toLowerCase()} klarade. Er slutsiffra visas på skärmen. Memorera den. Dela den inte — ännu.`);
  }, [v]);

  const msgOverlay = incomingMsg ? (
    <IncomingMessage message={incomingMsg} teamColor={team.color} onDismiss={() => setIncomingMsg(null)} />
  ) : null;

  // ── Landscape warning overlay ──
  if (!isLandscape) {
    return (
      <div style={{ ...tBase(), background: "#060a10" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>📱↔️</div>
          <div style={{ fontSize: "clamp(1rem,3vw,1.5rem)", color: team.color, fontWeight: 700, letterSpacing: "0.1em", fontFamily: FONT }}>ROTERA ENHETEN</div>
          <div style={{ fontSize: "clamp(0.7rem,1.5vw,0.9rem)", color: "#5a7a8a", marginTop: 12, fontFamily: FONT }}>Terminalen kräver landskapsläge</div>
        </div>
      </div>
    );
  }

  // ── Per-team activation code entry ──
  if (!active && needsActivation) return (
    <div style={tBase()}>
      <VideoBackground src="/videos/spy-hud.mp4" opacity={0.1} overlay={`radial-gradient(ellipse at center, transparent 30%, #060a10 75%)`} />
      {msgOverlay}
      <div style={{ textAlign: "center", zIndex: 2, position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div style={{ fontSize: "clamp(2rem,6vw,4rem)", opacity: 0.4 }}>{team.symbol}</div>
        <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: team.color, opacity: 0.5, fontFamily: FONT }}>TEAM {team.name} — SÄKERHETSKONTROLL</div>
        <h1 style={{ fontSize: "clamp(1.1rem,2.8vw,2rem)", fontWeight: 700, color: actError ? "#ff4444" : team.color, textShadow: actError ? "0 0 30px rgba(255,60,60,0.4)" : `0 0 25px ${team.color}40`, margin: 0, fontFamily: FONT, animation: actError ? "shake 0.4s" : "none" }}>
          {actError ? "⚠ FEL KOD" : "ANGE ERT TEAMS AKTIVERINGSKOD"}
        </h1>
        <Numpad value={actInput} onChange={(fn) => setActInput(fn)} onSubmit={handleActivation} maxLen={team.activationCode?.length || 3} disabled={actError} accentColor={team.color} />
      </div>
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );

  // ── Waiting for HQ ──
  if (!active) return (
    <div style={tBase()}>
      <VideoBackground src="/videos/spy-hud.mp4" opacity={0.1} overlay={`radial-gradient(ellipse at center, transparent 30%, #060a10 75%)`} />
      {msgOverlay}
      <div style={{ textAlign: "center", zIndex: 2, position: "relative" }}>
        <div style={{ fontSize: "clamp(3rem,10vw,6rem)", marginBottom: 16, opacity: 0.3 }}>{team.symbol}</div>
        <div style={{ fontSize: "clamp(1.2rem,3vw,2rem)", color: team.color, letterSpacing: "0.15em", fontWeight: 700, fontFamily: FONT, textShadow: `0 0 30px ${team.color}40` }}>TEAM {team.name}</div>
        <div style={{ fontSize: "clamp(0.7rem,1.5vw,1rem)", color: "#4a6a7a", marginTop: 16, animation: "blink 2s infinite", fontFamily: FONT }}>VÄNTAR PÅ {v.hq}-SIGNAL...</div>
      </div>
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );

  // ── Waiting for all teams before the simultaneous final mission ──
  if (termPhase === "waitingForTeams") return (
    <div style={tBase()}>
      <VideoBackground src="/videos/radar-sweep.mp4" opacity={0.1} overlay={`radial-gradient(ellipse at center, transparent 30%, #060a10 75%)`} />
      {msgOverlay}
      <div style={{ textAlign: "center", zIndex: 2, position: "relative" }}>
        <div style={{ fontSize: "clamp(0.6rem,1vw,0.8rem)", letterSpacing: "0.3em", color: "#33ff88", opacity: 0.6, marginBottom: 12, fontFamily: FONT }}>✓ ALLA {v.station.toUpperCase()}ER KLARA</div>
        <div style={{ fontSize: "clamp(1.1rem,2.8vw,2rem)", color: team.color, fontWeight: 700, letterSpacing: "0.08em", fontFamily: FONT, textShadow: `0 0 25px ${team.color}40`, marginBottom: 16 }}>VÄNTAR PÅ ÖVRIGA TEAM</div>
        <div style={{ fontSize: "clamp(0.7rem,1.3vw,0.95rem)", color: "#6a8a9a", maxWidth: 480, margin: "0 auto", lineHeight: 1.8, fontFamily: FONT }}>
          Det sista {v.mission.toLowerCase()}et kräver alla team samtidigt. Invänta klartecken.
        </div>
        <div style={{ marginTop: 20, fontSize: "clamp(0.6rem,1vw,0.8rem)", color: "#4a6a7a", animation: "blink 1.5s infinite", fontFamily: FONT }}>SYNKRONISERAR TEAM-STATUS...</div>
      </div>
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );

  // ── All done — CodeReveal ──
  if (termPhase === "codeReveal") return (
    <div style={tBase()}>
      {msgOverlay}
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: team.color, opacity: 0.5, fontFamily: FONT, animation: "blink 0.8s infinite" }}>TRANSMITTING FINAL REPORT...</div>
      <div style={{ fontSize: "clamp(1rem,2.5vw,1.8rem)", color: "#33ff88", fontWeight: 700, fontFamily: FONT, marginBottom: 12, animation: "fade-in 0.5s" }}>ALLA {v.station.toUpperCase()}ER KLARA</div>
      <CodeReveal digit={team.finalDigit} color={team.color} onDone={finishAllMissions} />
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );

  // ── All done — Final screen ──
  if (allDone) return (
    <div style={tBase()}>
      {msgOverlay}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(0.6rem,1vw,0.8rem)", letterSpacing: "0.3em", color: "#33ff88", opacity: 0.6, marginBottom: 8, fontFamily: FONT }}>ALLA {v.mission} KLARADE</div>
        <div style={{ fontSize: "clamp(1.5rem,4vw,3rem)", color: "#33ff88", fontWeight: 700, letterSpacing: "0.1em", textShadow: "0 0 30px rgba(51,255,136,0.4)", marginBottom: 20, fontFamily: FONT }}>MISSION KOMPLETT</div>
        <div style={{ fontSize: "clamp(0.8rem,1.6vw,1.1rem)", color: "#85a0b5", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 24px", fontFamily: FONT }}>
          Bra jobbat, Team {team.name}. Er kodsiffra till {v.briefcase.toLowerCase()}:
        </div>
        <div style={{ fontSize: "clamp(4rem,12vw,8rem)", color: team.color, fontWeight: 700, textShadow: `0 0 40px ${team.color}80, 0 0 80px ${team.color}40`, fontFamily: FONT, animation: "glow-pulse 2s infinite" }}>{team.finalDigit}</div>
        <div style={{ fontSize: "clamp(0.7rem,1.2vw,0.9rem)", color: "#4a6a7a", marginTop: 20, fontFamily: FONT }}>MEMORERA DENNA SIFFRA — DELA DEN INTE ÄNNU</div>
        <div style={{ fontSize: "clamp(0.6rem,1vw,0.8rem)", color: "#3a5a6a", marginTop: 8, fontFamily: FONT }}>ÅTERVÄND TILL {v.hq} OCH INVÄNTA ORDER</div>
      </div>
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );

  // ── Mission Loading Transition ──
  if (termPhase === "loading") return (
    <div style={tBase()}>
      {msgOverlay}
      <MissionLoadSequence title={mission.title} onComplete={() => setTermPhase("briefing")} color={team.color} />
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );

  // ── Verifying sequence (step 1) ──
  if (termPhase === "verifying") return (
    <div style={tBase()}>
      {msgOverlay}
      <div style={{ textAlign: "center", animation: "fade-in 0.2s" }}>
        <div style={{ fontSize: "clamp(0.6rem,1.1vw,0.8rem)", color: team.color, letterSpacing: "0.2em", fontFamily: FONT }}>VERIFYING CODE...</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
          {input.split("").map((d, i) => (
            <div key={i} style={{
              width: 50, height: 60, border: `2px solid ${team.color}`, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.8rem", color: team.color, fontFamily: FONT,
              animation: `blink 0.4s infinite ${i * 0.1}s`,
            }}>{d}</div>
          ))}
        </div>
        <div style={{ marginTop: 16, width: 120, height: 3, background: "#1a2530", borderRadius: 2, margin: "16px auto", overflow: "hidden" }}>
          <div style={{ height: "100%", background: team.color, animation: "verify-bar 0.6s ease-out forwards" }} />
        </div>
      </div>
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
      <style>{`@keyframes verify-bar{0%{width:0}100%{width:100%}}`}</style>
    </div>
  );

  // ── Transmitting sequence (step 2) ──
  if (termPhase === "transmitting") return (
    <div style={tBase()}>
      {msgOverlay}
      <div style={{ textAlign: "center", animation: "fade-in 0.2s" }}>
        <div style={{ fontSize: "clamp(0.6rem,1.1vw,0.8rem)", color: team.color, letterSpacing: "0.2em", fontFamily: FONT, animation: "blink 0.6s infinite" }}>TRANSMITTING TO {v.hq}...</div>
        {/* Particle animation */}
        <div style={{ position: "relative", height: 80, width: 100, margin: "16px auto", overflow: "hidden" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              position: "absolute", bottom: 0, left: `${30 + Math.sin(i) * 30}%`,
              width: 4, height: 4, borderRadius: "50%", background: team.color,
              animation: `transmit-up 0.8s ease-out infinite`, animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      </div>
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
      <style>{`@keyframes transmit-up{0%{transform:translateY(0);opacity:0.9}100%{transform:translateY(-80px);opacity:0}}`}</style>
    </div>
  );

  // ── HQ Confirmed (step 3) ──
  if (termPhase === "confirmed") return (
    <div style={{ ...tBase(), animation: "screen-flash 0.3s ease-out" }}>
      {msgOverlay}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: "#33ff88", opacity: 0.6, fontFamily: FONT }}>{v.hq} BEKRÄFTAR</div>
        <h1 style={{ fontSize: "clamp(1.3rem,3.5vw,2.5rem)", color: "#33ff88", fontWeight: 700, textShadow: "0 0 30px rgba(51,255,136,0.4)", margin: "8px 0", fontFamily: FONT }}>✓ GODKÄND</h1>
        <div style={{ fontSize: "clamp(0.6rem,1vw,0.8rem)", color: team.color, fontFamily: FONT, marginBottom: 8 }}>{mission.icon} {mission.title}</div>
        <div style={{ maxWidth: 500, fontSize: "clamp(0.7rem,1.3vw,0.95rem)", lineHeight: 1.7, textAlign: "center", color: "#88ddaa", fontFamily: FONT }}>{mission.successMsg}</div>
        {/* Progress dots with animation */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 20 }}>
          {team.missions.map((_, i) => (
            <div key={i} style={{
              width: 16, height: 16, borderRadius: "50%",
              background: i <= mIdx ? "#33ff88" : "#1a2530",
              boxShadow: i === mIdx ? "0 0 12px #33ff88, 0 0 24px #33ff8840" : i < mIdx ? "0 0 6px #33ff8860" : "none",
              transition: "all 0.5s",
              animation: i === mIdx ? "dot-expand 0.5s ease-out" : "none",
            }} />
          ))}
        </div>
        <div style={{ fontSize: "clamp(0.5rem,0.8vw,0.6rem)", color: "#4a6a7a", marginTop: 12, fontFamily: FONT }}>
          {mIdx + 1 < team.missions.length
            ? `${v.mission} ${mIdx + 1}/${team.missions.length} KLART — NÄSTA: ${team.missions[mIdx + 1].title}`
            : `SISTA ${v.mission.toUpperCase()} KLART`}
        </div>
      </div>
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
      <style>{`
        @keyframes screen-flash{0%{background:${team.color}20}100%{background:transparent}}
        @keyframes dot-expand{0%{transform:scale(0.5);box-shadow:0 0 0 rgba(51,255,136,0)}100%{transform:scale(1);box-shadow:0 0 12px #33ff88,0 0 24px #33ff8840}}
      `}</style>
    </div>
  );

  // Guard: if mission is null (shouldn't happen but safety)
  if (!mission) {
    return (
      <div style={tBase()}>
        <div style={{ textAlign: "center", color: "#ff4444", fontFamily: FONT }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 8 }}>⚠</div>
          <div>Inget uppdrag hittades. Kontakta instruktören.</div>
        </div>
        <ScanLines />
      </div>
    );
  }

  // ── Active mission (briefing + input) ──
  const dots = team.missions.map((_, i) => ({ status: i < mIdx ? "clear" : i === mIdx ? "active" : "locked" }));

  return (
    <div style={{ ...tBase(), overflow: "auto" }}>
      {msgOverlay}
      {/* Header bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 40, background: "rgba(6,10,16,0.95)", borderBottom: `1px solid ${team.color}20`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: team.color, boxShadow: `0 0 8px ${team.color}`, animation: "blink 2s infinite" }} />
          <span style={{ fontSize: "clamp(0.55rem,0.9vw,0.65rem)", letterSpacing: "0.2em", color: team.color, opacity: 0.7, fontFamily: FONT }}>TEAM {team.name} {team.symbol}</span>
        </div>
        <span style={{ fontSize: "clamp(0.5rem,0.8vw,0.6rem)", color: "#445566", fontFamily: FONT }}>{v.mission} {mIdx + 1}/{team.missions.length}</span>
      </div>

      <div style={{ marginTop: 24 }} />

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {dots.map((d, i) => (
          <div key={i} style={{
            width: 14, height: 14, borderRadius: "50%",
            background: d.status === "clear" ? "#33ff88" : d.status === "active" ? team.color : "#1a2530",
            boxShadow: d.status === "active" ? `0 0 10px ${team.color}` : d.status === "clear" ? "0 0 8px #33ff88" : "none",
            transition: "all 0.5s",
          }} />
        ))}
      </div>

      {/* Mission header */}
      <div style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)", marginBottom: 2 }}>{mission.icon}</div>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: errorMsg ? "#ff4444" : team.color, opacity: 0.6, marginBottom: 4, fontFamily: FONT }}>{v.mission} {mIdx + 1}</div>
      <h1 style={{
        fontSize: "clamp(1.1rem,2.8vw,2rem)", fontWeight: 700, letterSpacing: "0.05em",
        color: errorMsg ? "#ff4444" : team.color,
        textShadow: errorMsg ? "0 0 30px rgba(255,60,60,0.4)" : `0 0 20px ${team.color}40`,
        margin: "0 0 6px", textAlign: "center",
        animation: errorMsg ? "shake 0.4s ease-out" : "fade-in 0.5s ease-out",
        fontFamily: FONT,
      }}>
        {errorMsg ? "⚠ FEL SVAR" : mission.title}
      </h1>

      {/* Error message */}
      {errorMsg && <div style={{ fontSize: "clamp(0.65rem,1.1vw,0.85rem)", color: "#ff4444", letterSpacing: "0.1em", animation: "shake 0.4s ease-out", marginBottom: 8, fontFamily: FONT }}>{errorMsg}</div>}

      {/* Briefing — typewriter text + confirm button */}
      {termPhase === "briefing" && !errorMsg && (
        <BriefingWithConfirm text={mission.briefing} teamColor={team.color} onConfirm={() => setTermPhase("input")} vocabulary={v} />
      )}

      {/* Input area with TargetingFrame */}
      {termPhase === "input" && (
        <>
          <TargetingFrame color={team.color}>
            <Numpad value={input} onChange={(fn) => setInput(fn)} onSubmit={handleSubmit} maxLen={mission.answerLen} disabled={false} accentColor={team.color} />
          </TargetingFrame>
          <HintSystem hints={mission.hints} teamColor={team.color} missionId={mission.id} />
          <button onClick={() => speak(mission.briefing)} style={{ marginTop: 6, padding: "8px 18px", background: "transparent", border: "1px solid #1a2a3a", borderRadius: 6, color: "#556677", fontSize: "clamp(0.5rem,0.9vw,0.65rem)", fontFamily: FONT, cursor: "pointer", touchAction: "manipulation" }}>
            🔊 LÄS UPP UPPDRAGET
          </button>
        </>
      )}

      <div style={{ minHeight: 20 }} />
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );
}

function BriefingWithConfirm({ text, teamColor, onConfirm, vocabulary }: { text: string; teamColor: string; onConfirm: () => void; vocabulary: { mission: string; station: string; hq: string; agent: string; briefcase: string } }) {
  const [started, setStarted] = useState(false);
  const [typedBrief, briefDone] = useTypewriter(started ? text : null, 22);

  // Speak the briefing; the typewriter starts when the audio actually begins
  // (5s fallback so the screen never stays empty if audio can't play).
  useEffect(() => {
    setStarted(false);
    const fallback = setTimeout(() => setStarted(true), 5000);
    const begin = () => { clearTimeout(fallback); setStarted(true); };
    speak(text, 0.92, begin);
    return () => clearTimeout(fallback);
  }, [text]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, maxWidth: 560 }}>
      <div style={{ fontSize: "clamp(0.75rem,1.4vw,1rem)", lineHeight: 1.8, textAlign: "center", color: "#8aa0b5", minHeight: "3em", fontFamily: FONT, padding: "0 12px" }}>
        {typedBrief}
        {!(started && briefDone) && <span style={{ color: teamColor, animation: "blink 0.6s infinite" }}>▊</span>}
      </div>
      {started && briefDone && (
        <button onClick={onConfirm} style={{
          padding: "clamp(12px,2vw,18px) clamp(28px,6vw,50px)",
          background: `${teamColor}12`, border: `2px solid ${teamColor}`,
          borderRadius: 10, color: teamColor,
          fontSize: "clamp(0.75rem,1.4vw,0.95rem)", fontFamily: FONT,
          letterSpacing: "0.12em", cursor: "pointer", fontWeight: 700,
          animation: "fade-in 0.5s", touchAction: "manipulation",
          textShadow: `0 0 10px ${teamColor}40`,
        }}>
          UPPFATTAT — STARTA {vocabulary.mission} ▶
        </button>
      )}
    </div>
  );
}
