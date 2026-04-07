"use client";
import { useState, useEffect, useCallback } from "react";
import { sSet, sGet } from "@/lib/storage";
import { LynxEvent, TeamProgress, HQState, PresetMessage } from "@/lib/types";
import { FONT } from "@/lib/styles";
import EventBuilder from "./EventBuilder";

const PRESET_MESSAGES: PresetMessage[] = [
  { label: "⏰ Skynda på", text: "Direktören meddelar: Tiden rinner ut, agenter. Öka tempot!", speech: "Tiden rinner ut, agenter. Öka tempot." },
  { label: "💪 Bra jobbat", text: "Direktören meddelar: Bra insats, agenter. Fortsätt så!", speech: "Bra insats, agenter. Fortsätt så." },
  { label: "🔍 Titta noga", text: "Direktören meddelar: Svaret finns framför er. Titta en gång till.", speech: "Svaret finns framför er. Titta en gång till." },
  { label: "🤝 Samarbeta", text: "Direktören meddelar: Alla måste hjälpas åt!", speech: "Alla i teamet måste hjälpas åt." },
  { label: "📍 Fel område", text: "Direktören meddelar: Ni söker i fel område. Kolla efter er symbol!", speech: "Ni söker i fel område." },
  { label: "🔇 Tystnad", text: "⚠ OPERATIV VARNING: Ljudnivån är för hög.", speech: "Operativ varning. Ljudnivån är för hög." },
];

interface Props {
  event: LynxEvent;
  allEvents: LynxEvent[];
  onEventChange: (event: LynxEvent) => void;
  onEventsChange: (events: LynxEvent[]) => void;
}

export default function AdminPanel({ event, allEvents, onEventChange, onEventsChange }: Props) {
  const [teamProgress, setTeamProgress] = useState<Record<string, TeamProgress>>({});
  const [hqState, setHqState] = useState<HQState>({ phase: "boot", timestamp: 0 });
  const [customMsg, setCustomMsg] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [sentConfirm, setSentConfirm] = useState<string | null>(null);
  const [showCodes, setShowCodes] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState<{ teamId: string; mIdx: number } | null>(null);
  const [editValue, setEditValue] = useState("");

  const theme = event.theme;
  const v = theme.vocabulary;

  useEffect(() => {
    const poll = async () => {
      const progress: Record<string, TeamProgress> = {};
      for (const t of event.teams) {
        progress[t.id] = await sGet<TeamProgress>(`lynx-team-${t.id}`, { teamId: t.id, missionIndex: 0, currentMission: "", totalMissions: t.missions.length, allDone: false, finalDigit: t.finalDigit, timestamp: 0 });
      }
      setTeamProgress(progress);
      setHqState(await sGet<HQState>("lynx-hq-state", { phase: "boot", timestamp: 0 }));
    };
    poll();
    const iv = setInterval(poll, 2000);
    return () => clearInterval(iv);
  }, [event.teams]);

  const sendMsg = useCallback((text: string, speech: string, targets: string) => {
    const ts = targets === "all" ? event.teams.map((t) => t.id) : [targets];
    const id = Date.now();
    ts.forEach((tid) => sSet(`lynx-msg-${tid}`, { id, text, speech, from: "admin", timestamp: id }));
    const label = targets === "all" ? "ALLA TEAM" : event.teams.find((t) => t.id === targets)?.name || targets;
    setSentConfirm(label);
    setTimeout(() => setSentConfirm(null), 2500);
  }, [event.teams]);

  const pushHint = useCallback((tid: string) => {
    const tp = teamProgress[tid];
    const mi = tp?.missionIndex || 0;
    const team = event.teams.find((t) => t.id === tid);
    const mission = team?.missions[mi];
    if (!mission) return;
    const hint = mission.hints[0];
    sendMsg(`💡 Ledtråd från ${v.hq}: ${hint.text}`, hint.text, tid);
  }, [teamProgress, event.teams, sendMsg, v.hq]);

  const setPhase = (phase: string) => {
    sSet("lynx-hq-state", { phase, timestamp: Date.now() });
    setHqState({ phase, timestamp: Date.now() });
  };

  const updateAnswer = (teamId: string, mIdx: number, newAnswer: string) => {
    const updated = { ...event };
    const team = updated.teams.find((t) => t.id === teamId);
    if (team && team.missions[mIdx]) {
      team.missions[mIdx].answer = newAnswer;
      team.missions[mIdx].answerLen = newAnswer.length;
      onEventChange(updated);
      // Save to storage
      sSet("lynx-active-event", updated);
      const evts = allEvents.map((e) => (e.id === updated.id ? updated : e));
      sSet("lynx-events", evts);
      onEventsChange(evts);
    }
    setEditingAnswer(null);
  };

  const phases = [
    { id: "boot", label: "BOOT" }, { id: "intro", label: "INTRO" }, { id: "activate", label: "KODEN" },
    { id: "dispatch", label: "DISPATCH" }, { id: "active", label: "AKTIV" }, { id: "converge", label: "SAMLING" },
    { id: "final_code", label: "SLUTKOD" }, { id: "complete", label: "KLAR" },
  ];

  const allDone = event.teams.every((t) => teamProgress[t.id]?.allDone);

  if (showBuilder) {
    return <EventBuilder event={event} allEvents={allEvents} onEventChange={onEventChange} onEventsChange={onEventsChange} onClose={() => setShowBuilder(false)} />;
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#080c12", fontFamily: FONT, color: "#c0d0e0", padding: 12, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, padding: "0 4px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ff3300", animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", color: "#ff3300" }}>ADMIN KONTROLL</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => setShowBuilder(true)} style={headerBtn()}>📋 EVENT</button>
          <span style={{ fontSize: "0.5rem", color: "#334455" }}>{theme.orgName} v4</span>
        </div>
      </div>

      {/* Active event indicator */}
      <div style={{ background: `${theme.accentColor}08`, border: `1px solid ${theme.accentColor}20`, borderRadius: 8, padding: "8px 12px", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: "0.45rem", color: "#4a6a7a", letterSpacing: "0.15em" }}>AKTIVT EVENT</div>
          <div style={{ fontSize: "0.65rem", color: theme.accentColor, fontWeight: 700 }}>{event.name}</div>
        </div>
        <div style={{ fontSize: "0.45rem", color: "#4a6a7a" }}>{event.theme.name}</div>
      </div>

      {/* Phase nav */}
      <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 8, padding: 10, marginBottom: 10 }}>
        <div style={{ fontSize: "0.5rem", color: "#4a6a7a", letterSpacing: "0.15em", marginBottom: 6 }}>HQ-FAS: {hqState.phase?.toUpperCase() || "?"}</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {phases.map((p) => (
            <button key={p.id} onClick={() => setPhase(p.id)} style={{
              padding: "5px 8px", border: `1px solid ${hqState.phase === p.id ? theme.accentColor : "#1a2a3a"}`,
              borderRadius: 4, background: hqState.phase === p.id ? `${theme.accentColor}15` : "rgba(10,16,24,0.6)",
              color: hqState.phase === p.id ? theme.accentColor : "#4a6a7a", fontSize: "0.5rem",
              fontFamily: "inherit", cursor: "pointer", letterSpacing: "0.05em",
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Team progress cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
        {event.teams.map((team) => {
          const tp = teamProgress[team.id] || {};
          const mi = tp.missionIndex || 0;
          const total = tp.totalMissions || team.missions.length;
          const done = tp.allDone;
          const currentMission = team.missions[mi];
          return (
            <div key={team.id} style={{ background: "rgba(15,22,30,0.8)", border: `1px solid ${done ? "#33ff8830" : team.color + "25"}`, borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: "1.1rem", color: team.color }}>{team.symbol}</span>
                  <span style={{ fontSize: "0.7rem", color: team.color, fontWeight: 700, letterSpacing: "0.1em" }}>{team.name}</span>
                  {done && <span style={{ fontSize: "0.5rem", color: "#33ff88", background: "rgba(51,255,136,0.1)", padding: "2px 6px", borderRadius: 3 }}>✓ KLAR</span>}
                </div>
                <span style={{ fontSize: "0.55rem", color: "#4a6a7a" }}>{done ? `SIFFRA: ${tp.finalDigit}` : `${mi}/${total}`}</span>
              </div>
              <div style={{ height: 4, background: "rgba(20,30,40,0.6)", borderRadius: 2, overflow: "hidden", marginBottom: 8 }}>
                <div style={{ height: "100%", borderRadius: 2, background: done ? "#33ff88" : team.color, width: `${done ? 100 : (mi / total) * 100}%`, transition: "width 0.8s ease", boxShadow: `0 0 6px ${done ? "#33ff8860" : team.color + "60"}` }} />
              </div>
              <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 20, borderRadius: 4,
                    background: i < mi || done ? "rgba(51,255,136,0.15)" : i === mi && !done ? `${team.accent}0.12)` : "rgba(15,22,30,0.5)",
                    border: `1px solid ${i < mi || done ? "#33ff8830" : i === mi && !done ? team.color + "40" : "#1a2530"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.45rem", color: i < mi || done ? "#33ff88" : i === mi && !done ? team.color : "#2a3a4a",
                  }}>
                    {i < mi || done ? "✓" : i === mi && !done ? "▶" : `${i + 1}`}
                  </div>
                ))}
              </div>
              {!done && currentMission && (
                <div style={{ fontSize: "0.5rem", color: "#5a7a8a", marginBottom: 6 }}>
                  Nu: {currentMission.icon} {currentMission.title} — Svar:{" "}
                  {editingAnswer?.teamId === team.id && editingAnswer?.mIdx === mi ? (
                    <span>
                      <input value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ width: 60, background: "#0a1020", border: "1px solid " + team.color, color: team.color, fontFamily: FONT, fontSize: "0.5rem", padding: "2px 4px", borderRadius: 3 }} />
                      <button onClick={() => updateAnswer(team.id, mi, editValue)} style={{ ...smallBtn("#2a4a4a"), marginLeft: 4 }}>✓</button>
                      <button onClick={() => setEditingAnswer(null)} style={{ ...smallBtn("#4a2a2a"), marginLeft: 2 }}>✕</button>
                    </span>
                  ) : (
                    <span onClick={() => { setEditingAnswer({ teamId: team.id, mIdx: mi }); setEditValue(currentMission.answer); }} style={{ color: team.color, cursor: "pointer", borderBottom: "1px dashed " + team.color + "40" }}>
                      {currentMission.answer}
                    </span>
                  )}
                </div>
              )}
              <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => pushHint(team.id)} disabled={done} style={smallBtn(done ? "#1a2530" : "#2a4a4a")}>💡 Ledtråd</button>
                <button onClick={() => sendMsg(`Skynda på, ${team.name}!`, `Skynda på, ${team.name}`, team.id)} disabled={done} style={smallBtn(done ? "#1a2530" : "#4a3a2a")}>⏰ Skynda</button>
                <button onClick={() => sendMsg(`Bra jobbat, Team ${team.name}!`, `Bra jobbat, Team ${team.name}`, team.id)} style={smallBtn("#2a3a4a")}>💪 Pep</button>
              </div>
            </div>
          );
        })}
      </div>

      {allDone && (
        <div style={{ background: "rgba(51,255,136,0.05)", border: "1px solid #33ff8830", borderRadius: 8, padding: 12, marginBottom: 10, textAlign: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "#33ff88", letterSpacing: "0.15em" }}>✓ ALLA TEAM KLARA</div>
          <div style={{ fontSize: "0.5rem", color: "#5a8a6a", marginTop: 4 }}>
            Siffror: {event.teams.map((t) => `${t.symbol} ${t.finalDigit}`).join("  ")}
          </div>
        </div>
      )}

      {/* Message center */}
      <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 8, padding: 12, marginBottom: 10 }}>
        <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "0.15em", marginBottom: 8 }}>MEDDELANDECENTRAL</div>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          <button onClick={() => setSelectedTeam("all")} style={teamSelBtn("all", selectedTeam, "#8899aa")}>📢 ALLA</button>
          {event.teams.map((t) => (
            <button key={t.id} onClick={() => setSelectedTeam(t.id)} style={teamSelBtn(t.id, selectedTeam, t.color)}>{t.symbol} {t.name}</button>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 8 }}>
          {PRESET_MESSAGES.map((pm, i) => (
            <button key={i} onClick={() => sendMsg(pm.text, pm.speech, selectedTeam)} style={{ padding: "6px 10px", background: "rgba(20,30,40,0.6)", border: "1px solid #2a3a4a", borderRadius: 4, color: "#7a9aaa", fontSize: "0.5rem", fontFamily: "inherit", cursor: "pointer" }}>
              {pm.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          <input value={customMsg} onChange={(e) => setCustomMsg(e.target.value)} placeholder="Skriv eget meddelande..." style={{ flex: 1, padding: "8px 10px", background: "rgba(10,16,24,0.8)", border: "1px solid #2a3a4a", borderRadius: 4, color: "#a0b8c8", fontSize: "0.6rem", fontFamily: "inherit", outline: "none" }}
            onKeyDown={(e) => { if (e.key === "Enter" && customMsg.trim()) { sendMsg(customMsg, customMsg, selectedTeam); setCustomMsg(""); } }}
          />
          <button onClick={() => { if (customMsg.trim()) { sendMsg(customMsg, customMsg, selectedTeam); setCustomMsg(""); } }} style={{ padding: "8px 14px", background: `${theme.accentColor}12`, border: `1px solid ${theme.accentColor}40`, borderRadius: 4, color: theme.accentColor, fontSize: "0.55rem", fontFamily: "inherit", cursor: "pointer" }}>SKICKA</button>
        </div>
        {sentConfirm && <div style={{ marginTop: 6, fontSize: "0.5rem", color: "#33ff88", animation: "fade-in 0.3s ease-out" }}>✓ Meddelande skickat till {sentConfirm}</div>}
      </div>

      {/* Cheat sheet */}
      <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 8, padding: 12 }}>
        <button onClick={() => setShowCodes(!showCodes)} style={{ width: "100%", padding: "6px", background: "transparent", border: "1px solid #2a3a4a", borderRadius: 4, color: "#4a6a7a", fontSize: "0.55rem", fontFamily: "inherit", cursor: "pointer" }}>
          {showCodes ? "▼ DÖLJ FACIT" : "▶ VISA FACIT (alla svar)"}
        </button>
        {showCodes && (
          <div style={{ marginTop: 8 }}>
            {event.teams.map((team) => (
              <div key={team.id} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: "0.55rem", color: team.color, fontWeight: 700, marginBottom: 4 }}>{team.symbol} {team.name} (slutsiffra: {team.finalDigit})</div>
                {team.missions.map((m, i) => (
                  <div key={i} style={{ fontSize: "0.5rem", color: "#5a7a8a", padding: "2px 0" }}>
                    {i + 1}. {m.icon} {m.title}: <span style={{ color: "#8aaa9a", fontWeight: 700 }}>{m.answer}</span> ({m.answerLen} siffror)
                  </div>
                ))}
              </div>
            ))}
            <div style={{ fontSize: "0.5rem", color: "#5a7a8a", marginTop: 4, borderTop: "1px solid #1a2a3a", paddingTop: 6 }}>
              Slutkod ({v.briefcase.toLowerCase()}): <span style={{ color: "#ff6633", fontWeight: 700 }}>{event.finalCode}</span>
            </div>
            <div style={{ fontSize: "0.5rem", color: "#5a7a8a" }}>
              Aktiveringskod: <span style={{ color: theme.accentColor, fontWeight: 700 }}>{event.activationCode}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function headerBtn() {
  return { padding: "4px 10px", background: "rgba(20,30,40,0.8)", border: "1px solid #2a3a4a", borderRadius: 4, color: "#7a9aaa", fontSize: "0.55rem", fontFamily: FONT, cursor: "pointer" } as const;
}

function smallBtn(borderColor: string) {
  return { padding: "4px 8px", background: "rgba(10,16,24,0.6)", border: `1px solid ${borderColor}`, borderRadius: 3, color: "#6a8a9a", fontSize: "0.45rem", fontFamily: FONT, cursor: "pointer" } as const;
}

function teamSelBtn(tid: string, selected: string, color: string) {
  const active = tid === selected;
  return { padding: "4px 8px", background: active ? `${color}15` : "rgba(10,16,24,0.6)", border: `1px solid ${active ? color : "#1a2a3a"}`, borderRadius: 4, color: active ? color : "#4a6a7a", fontSize: "0.5rem", fontFamily: FONT, cursor: "pointer" } as const;
}
