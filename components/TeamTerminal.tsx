"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { sSet, sGet } from "@/lib/storage";
import { playIncoming, playSuccess, playError, playUnlock } from "@/lib/audio";
import { speak } from "@/lib/speech";
import { Team, AdminMessage, HQState } from "@/lib/types";
import { tBase, FONT } from "@/lib/styles";
import { useTypewriter } from "./TypedMsg";
import Numpad from "./Numpad";
import HintSystem from "./HintSystem";
import IncomingMessage from "./IncomingMessage";
import ScanLines from "./ScanLines";
import MuteButton from "./MuteButton";
import { TeamAtmosphere, TargetingFrame, MissionLoadSequence, CodeReveal, TransmissionAnimation } from "./Atmosphere";

interface Props {
  team: Team;
  vocabulary: { mission: string; station: string; hq: string; agent: string; briefcase: string };
}

export default function TeamTerminal({ team, vocabulary: v }: Props) {
  const [active, setActive] = useState(false);
  const [mIdx, setMIdx] = useState(0);
  const [input, setInput] = useState("");
  const [feedback, setFeedback] = useState<{ type: string; msg: string } | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [showBriefing, setShowBriefing] = useState(true);
  const [incomingMsg, setIncomingMsg] = useState<AdminMessage | null>(null);
  const [lastMsgId, setLastMsgId] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [missionStartTime, setMissionStartTime] = useState(Date.now());
  const fbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mission = team.missions[mIdx];

  // Poll HQ + messages
  useEffect(() => {
    const poll = async () => {
      const hq = await sGet<HQState>("lynx-hq-state", { phase: "boot", timestamp: 0 });
      if (hq) {
        if (hq.phase === "active" && !active) {
          setActive(true); playIncoming();
          speak(`${v.mission} mottaget. Er terminal är nu aktiv.`);
        }
        if (hq.phase === "boot" || hq.phase === "intro") {
          setActive(false); setMIdx(0); setInput(""); setFeedback(null);
          setAllDone(false); setShowBriefing(true); setLastMsgId(0);
          setAttempts(0); setHintsUsed(0);
        }
      }
      const msg = await sGet<AdminMessage>(`lynx-msg-${team.id}`, null);
      if (msg && msg.id > lastMsgId) {
        setLastMsgId(msg.id);
        setIncomingMsg(msg);
      }
    };
    poll();
    const iv = setInterval(poll, 1500);
    return () => clearInterval(iv);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, lastMsgId, team.id]);

  // Report progress
  useEffect(() => {
    sSet(`lynx-team-${team.id}`, {
      teamId: team.id, missionIndex: mIdx, currentMission: mission?.title || "",
      totalMissions: team.missions.length,
      allDone, finalDigit: team.finalDigit, timestamp: Date.now(),
    });
  }, [mIdx, allDone, team, mission?.title]);

  // Track mission timing
  useEffect(() => {
    setMissionStartTime(Date.now());
    setAttempts(0);
  }, [mIdx]);

  const handleSubmit = useCallback(() => {
    if (!mission || input.length === 0) return;
    setAttempts((a) => a + 1);
    if (input === mission.answer) {
      playSuccess();
      setFeedback({ type: "success", msg: mission.successMsg });
      if (mission.successMsg) setTimeout(() => speak(mission.successMsg), 300);
      // Save stats
      const elapsed = Math.round((Date.now() - missionStartTime) / 1000);
      sGet<Record<string, unknown>[]>(`lynx-stats-${team.id}`, []).then((stats) => {
        const s = stats || [];
        s.push({ missionId: mission.id, time: elapsed, attempts: attempts + 1, hintsUsed });
        sSet(`lynx-stats-${team.id}`, s);
      });
      if (fbTimer.current) clearTimeout(fbTimer.current);
      fbTimer.current = setTimeout(() => {
        setFeedback(null); setInput(""); setShowBriefing(true);
        if (mIdx + 1 >= team.missions.length) {
          setAllDone(true); playUnlock();
          speak(`Alla ${v.mission.toLowerCase()} klarade. Er kodsiffra är: ${team.finalDigit}. Återvänd till ${v.hq}.`);
        } else { setMIdx((i) => i + 1); }
      }, 3500);
    } else {
      playError();
      setFeedback({ type: "error", msg: "FEL SVAR — FÖRSÖK IGEN" });
      setInput("");
      if (fbTimer.current) clearTimeout(fbTimer.current);
      fbTimer.current = setTimeout(() => setFeedback(null), 2000);
    }
  }, [input, mission, mIdx, team, missionStartTime, attempts, hintsUsed, v]);

  const msgOverlay = incomingMsg ? (
    <IncomingMessage message={incomingMsg} teamColor={team.color} onDismiss={() => setIncomingMsg(null)} />
  ) : null;

  // ── Waiting ──
  if (!active) return (
    <div style={tBase()}>
      {msgOverlay}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(3rem,10vw,6rem)", marginBottom: 16, opacity: 0.3 }}>{team.symbol}</div>
        <div style={{ fontSize: "clamp(1.2rem,3vw,2rem)", color: team.color, letterSpacing: "0.15em", fontWeight: 700, fontFamily: FONT }}>TEAM {team.name}</div>
        <div style={{ fontSize: "clamp(0.7rem,1.5vw,1rem)", color: "#4a6a7a", marginTop: 16, animation: "blink 2s infinite", fontFamily: FONT }}>VÄNTAR PÅ {v.hq}-SIGNAL...</div>
      </div>
      <ScanLines /><MuteButton />
    </div>
  );

  // ── All done ──
  if (allDone) return (
    <div style={tBase()}>
      {msgOverlay}
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "clamp(0.6rem,1vw,0.8rem)", letterSpacing: "0.3em", color: "#33ff88", opacity: 0.6, marginBottom: 8, fontFamily: FONT }}>ALLA {v.mission} KLARADE</div>
        <div style={{ fontSize: "clamp(1.5rem,4vw,3rem)", color: "#33ff88", fontWeight: 700, letterSpacing: "0.1em", textShadow: "0 0 30px rgba(51,255,136,0.4)", marginBottom: 20, fontFamily: FONT }}>MISSION KOMPLETT</div>
        <div style={{ fontSize: "clamp(0.8rem,1.6vw,1.1rem)", color: "#85a0b5", lineHeight: 1.8, maxWidth: 500, margin: "0 auto 24px", fontFamily: FONT }}>
          Bra jobbat, Team {team.name}. Er kodsiffra till {v.briefcase.toLowerCase()}:
        </div>
        <div style={{ fontSize: "clamp(4rem,12vw,8rem)", color: team.color, fontWeight: 700, textShadow: `0 0 40px ${team.color}80, 0 0 80px ${team.color}40`, fontFamily: FONT }}>{team.finalDigit}</div>
        <div style={{ fontSize: "clamp(0.7rem,1.2vw,0.9rem)", color: "#4a6a7a", marginTop: 20, fontFamily: FONT }}>Återvänd till {v.hq} med er siffra</div>
      </div>
      <ScanLines /><MuteButton />
    </div>
  );

  // ── Active mission ──
  const dots = team.missions.map((_, i) => ({ status: i < mIdx ? "clear" : i === mIdx ? "active" : "locked" }));

  return (
    <div style={{ ...tBase(), overflow: "auto" }}>
      {msgOverlay}
      {/* Header bar */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: 36, background: "rgba(6,10,16,0.9)", borderBottom: `1px solid ${team.color}15`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: team.color, boxShadow: `0 0 8px ${team.color}`, animation: "blink 2s infinite" }} />
          <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: team.color, opacity: 0.6, fontFamily: FONT }}>TEAM {team.name} {team.symbol}</span>
        </div>
        <span style={{ fontSize: "0.55rem", color: "#334455", fontFamily: FONT }}>{v.mission} {mIdx + 1}/{team.missions.length}</span>
      </div>

      <div style={{ marginTop: 20 }} />

      {/* Progress dots */}
      <div style={{ display: "flex", gap: 10, marginBottom: 8 }}>
        {dots.map((d, i) => (
          <div key={i} style={{
            width: 12, height: 12, borderRadius: "50%",
            background: d.status === "clear" ? "#33ff88" : d.status === "active" ? team.color : "#1a2530",
            boxShadow: d.status === "active" ? `0 0 10px ${team.color}` : d.status === "clear" ? "0 0 8px #33ff88" : "none",
            transition: "all 0.5s",
          }} />
        ))}
      </div>

      {/* Mission header */}
      <div style={{ fontSize: "clamp(1.5rem,4vw,2.5rem)", marginBottom: 2 }}>{mission.icon}</div>
      <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: feedback?.type === "success" ? "#33ff88" : feedback?.type === "error" ? "#ff4444" : team.color, opacity: 0.6, marginBottom: 4, fontFamily: FONT }}>{v.mission} {mIdx + 1}</div>
      <h1 style={{
        fontSize: "clamp(1.1rem,2.8vw,2rem)", fontWeight: 700, letterSpacing: "0.05em",
        color: feedback?.type === "success" ? "#33ff88" : feedback?.type === "error" ? "#ff4444" : team.color,
        textShadow: feedback?.type === "success" ? "0 0 30px rgba(51,255,136,0.4)" : feedback?.type === "error" ? "0 0 30px rgba(255,60,60,0.4)" : `0 0 20px ${team.color}40`,
        margin: "0 0 6px", textAlign: "center",
        animation: feedback?.type === "error" ? "shake 0.4s ease-out" : "fade-in 0.5s ease-out",
        fontFamily: FONT,
      }}>
        {feedback?.type === "success" ? "✓ GODKÄND" : feedback?.type === "error" ? "⚠ FEL SVAR" : mission.title}
      </h1>

      {/* Briefing */}
      {showBriefing && !feedback && (
        <BriefingText text={mission.briefing} teamColor={team.color} onDone={() => setShowBriefing(false)} />
      )}

      {/* Feedback */}
      {feedback?.type === "success" && <div style={{ maxWidth: 500, fontSize: "clamp(0.7rem,1.3vw,0.95rem)", lineHeight: 1.7, textAlign: "center", color: "#88ddaa", marginBottom: 8, fontFamily: FONT }}>{feedback.msg}</div>}
      {feedback?.type === "error" && <div style={{ fontSize: "clamp(0.65rem,1.1vw,0.85rem)", color: "#ff4444", letterSpacing: "0.1em", animation: "shake 0.4s ease-out", marginBottom: 8, fontFamily: FONT }}>{feedback.msg}</div>}

      {/* Input + hints */}
      {!showBriefing && feedback?.type !== "success" && (
        <>
          <Numpad value={input} onChange={(fn) => setInput(fn)} onSubmit={handleSubmit} maxLen={mission.answerLen} disabled={!!feedback} accentColor={team.color} />
          <HintSystem hints={mission.hints} teamColor={team.color} missionId={mission.id} />
          <button onClick={() => speak(mission.briefing)} style={{ marginTop: 4, padding: "4px 14px", background: "transparent", border: "1px solid #1a2a3a", borderRadius: 4, color: "#334455", fontSize: "0.5rem", fontFamily: FONT, cursor: "pointer" }}>
            🔊 LÄS UPP IGEN
          </button>
        </>
      )}

      <div style={{ minHeight: 20 }} />
      <TeamAtmosphere color={team.color} />
      <ScanLines /><MuteButton />
    </div>
  );
}

function BriefingText({ text, teamColor, onDone }: { text: string; teamColor: string; onDone: () => void }) {
  const [typedBrief, briefDone] = useTypewriter(text, 22);
  useEffect(() => {
    if (briefDone) {
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
  }, [briefDone, onDone]);
  return (
    <div style={{ maxWidth: 520, fontSize: "clamp(0.7rem,1.3vw,0.95rem)", lineHeight: 1.7, textAlign: "center", color: "#85a0b5", minHeight: "3em", marginBottom: 4, fontFamily: FONT }}>
      {typedBrief}
      {!briefDone && <span style={{ color: teamColor, animation: "blink 0.6s infinite" }}>▊</span>}
    </div>
  );
}
