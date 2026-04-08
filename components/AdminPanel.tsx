"use client";
import { useState, useEffect, useCallback } from "react";
import { sSet, sGet } from "@/lib/storage";
import { LynxEvent, TeamProgress, HQState, PresetMessage } from "@/lib/types";
import { FONT } from "@/lib/styles";
import EventBuilder from "./EventBuilder";

const PRESET_MESSAGES: PresetMessage[] = [
  { label: "⏰ Skynda", text: "Direktören meddelar: Tiden rinner ut, agenter. Öka tempot!", speech: "Tiden rinner ut, agenter. Öka tempot." },
  { label: "💪 Bra jobbat", text: "Direktören meddelar: Bra insats, agenter. Fortsätt så!", speech: "Bra insats, agenter. Fortsätt så." },
  { label: "🔍 Titta noga", text: "Direktören meddelar: Svaret finns framför er. Titta en gång till.", speech: "Svaret finns framför er. Titta en gång till." },
  { label: "🤝 Samarbeta", text: "Direktören meddelar: Alla måste hjälpas åt!", speech: "Alla i teamet måste hjälpas åt." },
  { label: "📍 Fel zon", text: "Direktören meddelar: Ni söker i fel område. Kolla efter er symbol!", speech: "Ni söker i fel område." },
  { label: "🔇 Tyst!", text: "⚠ OPERATIV VARNING: Ljudnivån är för hög.", speech: "Operativ varning. Ljudnivån är för hög." },
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
  const [showLinks, setShowLinks] = useState(false);

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
    sendMsg(`💡 Ledtråd: ${hint.text}`, hint.text, tid);
  }, [teamProgress, event.teams, sendMsg]);

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
      sSet("lynx-active-event", updated);
      const evts = allEvents.map((e) => (e.id === updated.id ? updated : e));
      sSet("lynx-events", evts);
      onEventsChange(evts);
    }
    setEditingAnswer(null);
  };

  const phases = [
    { id: "boot", label: "BOOT", icon: "🔄" }, { id: "intro", label: "INTRO", icon: "📢" },
    { id: "activate", label: "KOD", icon: "🔐" }, { id: "dispatch", label: "DISPATCH", icon: "🚀" },
    { id: "active", label: "AKTIV", icon: "▶" }, { id: "converge", label: "SAMLING", icon: "📍" },
    { id: "final_code", label: "SLUTKOD", icon: "🎯" }, { id: "complete", label: "KLAR", icon: "✓" },
  ];

  const allDone = event.teams.every((t) => teamProgress[t.id]?.allDone);

  if (showBuilder) {
    return <EventBuilder event={event} allEvents={allEvents} onEventChange={onEventChange} onEventsChange={onEventsChange} onClose={() => setShowBuilder(false)} />;
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#080c12", fontFamily: FONT, color: "#c0d0e0", padding: "16px", overflowY: "auto" }}>
      {/* ═══ Header ═══ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff3300", animation: "blink 1.5s infinite" }} />
          <span style={{ fontSize: "clamp(0.85rem,2vw,1rem)", letterSpacing: "0.2em", color: "#ff3300", fontWeight: 700 }}>ADMIN</span>
        </div>
        <button onClick={() => setShowBuilder(true)} style={{ padding: "8px 16px", background: "rgba(20,30,40,0.8)", border: `1px solid ${theme.accentColor}40`, borderRadius: 6, color: theme.accentColor, fontSize: "clamp(0.7rem,1.5vw,0.85rem)", fontFamily: FONT, cursor: "pointer", fontWeight: 700 }}>📋 EVENT</button>
      </div>

      {/* ═══ Active Event Banner + Links ═══ */}
      <div style={{ background: `${theme.accentColor}08`, border: `1px solid ${theme.accentColor}25`, borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "clamp(0.55rem,1.1vw,0.65rem)", color: "#5a7a8a", letterSpacing: "0.15em" }}>AKTIVT EVENT</div>
            <div style={{ fontSize: "clamp(0.85rem,1.8vw,1rem)", color: theme.accentColor, fontWeight: 700 }}>{event.name}</div>
          </div>
          <button onClick={() => setShowLinks(!showLinks)} style={{ padding: "6px 12px", background: showLinks ? `${theme.accentColor}15` : "transparent", border: `1px solid ${showLinks ? theme.accentColor : "#2a3a4a"}`, borderRadius: 6, color: showLinks ? theme.accentColor : "#5a7a8a", fontSize: "clamp(0.65rem,1.3vw,0.8rem)", fontFamily: FONT, cursor: "pointer" }}>
            🔗 LÄNKAR
          </button>
        </div>
        {showLinks && <AdminQuickLinks event={event} />}
      </div>

      {/* ═══ Phase Navigation — Sticky on mobile ═══ */}
      <div style={{ background: "rgba(15,22,30,0.95)", border: "1px solid #1a2a3a", borderRadius: 10, padding: "12px 14px", marginBottom: 14, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ fontSize: "clamp(0.6rem,1.2vw,0.75rem)", color: "#5a7a8a", letterSpacing: "0.12em", marginBottom: 8 }}>HQ-FAS: <span style={{ color: theme.accentColor, fontWeight: 700 }}>{hqState.phase?.toUpperCase()}</span></div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {phases.map((p) => (
            <button key={p.id} onClick={() => setPhase(p.id)} style={{
              padding: "8px 4px", border: `1px solid ${hqState.phase === p.id ? theme.accentColor : "#1a2a3a"}`,
              borderRadius: 6, background: hqState.phase === p.id ? `${theme.accentColor}18` : "rgba(10,16,24,0.6)",
              color: hqState.phase === p.id ? theme.accentColor : "#5a7a8a",
              fontSize: "clamp(0.6rem,1.2vw,0.75rem)", fontFamily: "inherit", cursor: "pointer",
              fontWeight: hqState.phase === p.id ? 700 : 400, textAlign: "center",
            }}>
              <div style={{ fontSize: "clamp(0.85rem,1.6vw,1rem)" }}>{p.icon}</div>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Team Progress Cards ═══ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        {event.teams.map((team) => {
          const tp = teamProgress[team.id] || {};
          const mi = tp.missionIndex || 0;
          const total = tp.totalMissions || team.missions.length;
          const done = tp.allDone;
          const currentMission = team.missions[mi];
          return (
            <div key={team.id} style={{ background: "rgba(15,22,30,0.8)", border: `2px solid ${done ? "#33ff8840" : team.color + "30"}`, borderRadius: 10, padding: "14px 16px" }}>
              {/* Team header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "clamp(1.2rem,2.5vw,1.5rem)", color: team.color }}>{team.symbol}</span>
                  <span style={{ fontSize: "clamp(0.85rem,1.8vw,1rem)", color: team.color, fontWeight: 700, letterSpacing: "0.08em" }}>{team.name}</span>
                  {done && <span style={{ fontSize: "clamp(0.6rem,1.1vw,0.7rem)", color: "#33ff88", background: "rgba(51,255,136,0.1)", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>✓ KLAR</span>}
                </div>
                <span style={{ fontSize: "clamp(0.65rem,1.3vw,0.8rem)", color: done ? "#33ff88" : "#5a7a8a", fontWeight: 700 }}>{done ? `SIFFRA: ${tp.finalDigit}` : `${mi}/${total}`}</span>
              </div>

              {/* Progress bar */}
              <div style={{ height: 6, background: "rgba(20,30,40,0.6)", borderRadius: 3, overflow: "hidden", marginBottom: 10 }}>
                <div style={{ height: "100%", borderRadius: 3, background: done ? "#33ff88" : team.color, width: `${done ? 100 : (mi / total) * 100}%`, transition: "width 0.8s ease", boxShadow: `0 0 8px ${done ? "#33ff8880" : team.color + "80"}` }} />
              </div>

              {/* Mission dots */}
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: 28, borderRadius: 6,
                    background: i < mi || done ? "rgba(51,255,136,0.12)" : i === mi && !done ? `${team.accent}0.1)` : "rgba(15,22,30,0.5)",
                    border: `1px solid ${i < mi || done ? "#33ff8830" : i === mi && !done ? team.color + "50" : "#1a2530"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "clamp(0.6rem,1.1vw,0.75rem)", color: i < mi || done ? "#33ff88" : i === mi && !done ? team.color : "#2a3a4a", fontWeight: 700,
                  }}>
                    {i < mi || done ? "✓" : i === mi && !done ? "▶" : `${i + 1}`}
                  </div>
                ))}
              </div>

              {/* Current mission + live answer editing */}
              {!done && currentMission && (
                <div style={{ fontSize: "clamp(0.65rem,1.3vw,0.8rem)", color: "#6a8a9a", marginBottom: 8, padding: "6px 10px", background: "rgba(10,16,24,0.5)", borderRadius: 6 }}>
                  <span style={{ color: "#8aa0b0" }}>Nu:</span> {currentMission.icon} {currentMission.title}
                  <span style={{ color: "#4a6a7a" }}> — Svar: </span>
                  {editingAnswer?.teamId === team.id && editingAnswer?.mIdx === mi ? (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <input value={editValue} onChange={(e) => setEditValue(e.target.value)} style={{ width: 70, background: "#0a1020", border: `1px solid ${team.color}`, color: team.color, fontFamily: FONT, fontSize: "clamp(0.65rem,1.3vw,0.8rem)", padding: "3px 6px", borderRadius: 4 }} autoFocus />
                      <button onClick={() => updateAnswer(team.id, mi, editValue)} style={qBtn("#33ff88")}>✓</button>
                      <button onClick={() => setEditingAnswer(null)} style={qBtn("#ff5555")}>✕</button>
                    </span>
                  ) : (
                    <span onClick={() => { setEditingAnswer({ teamId: team.id, mIdx: mi }); setEditValue(currentMission.answer); }} style={{ color: team.color, cursor: "pointer", borderBottom: `1px dashed ${team.color}50`, fontWeight: 700, fontSize: "clamp(0.75rem,1.5vw,0.9rem)" }}>
                      {currentMission.answer}
                    </span>
                  )}
                </div>
              )}

              {/* Quick actions — larger touch targets */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => pushHint(team.id)} disabled={done} style={actionBtn(done ? "#1a2530" : "#2a5a4a", done)}>💡 Ledtråd</button>
                <button onClick={() => sendMsg(`Skynda på, ${team.name}!`, `Skynda på, ${team.name}`, team.id)} disabled={done} style={actionBtn(done ? "#1a2530" : "#5a4a2a", done)}>⏰ Skynda</button>
                <button onClick={() => sendMsg(`Bra jobbat, Team ${team.name}!`, `Bra jobbat, Team ${team.name}`, team.id)} style={actionBtn("#2a3a4a", false)}>💪 Pep</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ═══ All Done Banner ═══ */}
      {allDone && (
        <div style={{ background: "rgba(51,255,136,0.06)", border: "2px solid #33ff8840", borderRadius: 10, padding: 16, marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: "clamp(0.85rem,1.8vw,1rem)", color: "#33ff88", letterSpacing: "0.15em", fontWeight: 700 }}>✓ ALLA TEAM KLARA</div>
          <div style={{ fontSize: "clamp(0.7rem,1.4vw,0.85rem)", color: "#5a8a6a", marginTop: 6 }}>
            Siffror: {event.teams.map((t) => `${t.symbol} ${t.finalDigit}`).join("  •  ")}
          </div>
          <div style={{ fontSize: "clamp(0.65rem,1.3vw,0.8rem)", color: "#5a8a6a", marginTop: 4 }}>
            Slutkod: <span style={{ color: "#ff8844", fontWeight: 700, fontSize: "clamp(0.85rem,1.8vw,1.1rem)" }}>{event.finalCode}</span>
          </div>
        </div>
      )}

      {/* ═══ Message Center ═══ */}
      <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: "14px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: "clamp(0.65rem,1.3vw,0.8rem)", color: "#5a7a8a", letterSpacing: "0.12em", marginBottom: 10, fontWeight: 700 }}>MEDDELANDECENTRAL</div>

        {/* Target selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          <button onClick={() => setSelectedTeam("all")} style={targetBtn("all", selectedTeam, "#8899aa")}>📢 ALLA</button>
          {event.teams.map((t) => (
            <button key={t.id} onClick={() => setSelectedTeam(t.id)} style={targetBtn(t.id, selectedTeam, t.color)}>{t.symbol} {t.name}</button>
          ))}
        </div>

        {/* Preset messages — larger buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
          {PRESET_MESSAGES.map((pm, i) => (
            <button key={i} onClick={() => sendMsg(pm.text, pm.speech, selectedTeam)} style={{
              padding: "10px 8px", background: "rgba(20,30,40,0.6)", border: "1px solid #2a3a4a",
              borderRadius: 6, color: "#8aa0b0", fontSize: "clamp(0.65rem,1.3vw,0.8rem)",
              fontFamily: "inherit", cursor: "pointer", textAlign: "center",
              touchAction: "manipulation",
            }}>
              {pm.label}
            </button>
          ))}
        </div>

        {/* Custom message */}
        <div style={{ display: "flex", gap: 6 }}>
          <input value={customMsg} onChange={(e) => setCustomMsg(e.target.value)} placeholder="Skriv eget meddelande..." style={{
            flex: 1, padding: "10px 12px", background: "rgba(10,16,24,0.8)",
            border: "1px solid #2a3a4a", borderRadius: 6, color: "#a0b8c8",
            fontSize: "clamp(0.75rem,1.5vw,0.9rem)", fontFamily: "inherit", outline: "none",
          }}
            onKeyDown={(e) => { if (e.key === "Enter" && customMsg.trim()) { sendMsg(customMsg, customMsg, selectedTeam); setCustomMsg(""); } }}
          />
          <button onClick={() => { if (customMsg.trim()) { sendMsg(customMsg, customMsg, selectedTeam); setCustomMsg(""); } }} style={{
            padding: "10px 18px", background: `${theme.accentColor}12`, border: `1px solid ${theme.accentColor}40`,
            borderRadius: 6, color: theme.accentColor, fontSize: "clamp(0.7rem,1.4vw,0.85rem)",
            fontFamily: "inherit", cursor: "pointer", fontWeight: 700,
          }}>SKICKA</button>
        </div>
        {sentConfirm && <div style={{ marginTop: 8, fontSize: "clamp(0.65rem,1.3vw,0.8rem)", color: "#33ff88", animation: "fade-in 0.3s ease-out" }}>✓ Skickat till {sentConfirm}</div>}
      </div>

      {/* ═══ Cheat Sheet ═══ */}
      <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: "14px 16px" }}>
        <button onClick={() => setShowCodes(!showCodes)} style={{
          width: "100%", padding: "10px", background: "transparent", border: "1px solid #2a3a4a",
          borderRadius: 6, color: "#5a7a8a", fontSize: "clamp(0.7rem,1.4vw,0.85rem)",
          fontFamily: "inherit", cursor: "pointer", fontWeight: 700,
        }}>
          {showCodes ? "▼ DÖLJ FACIT" : "▶ VISA FACIT (alla svar)"}
        </button>
        {showCodes && (
          <div style={{ marginTop: 12 }}>
            {event.teams.map((team) => (
              <div key={team.id} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: "clamp(0.7rem,1.4vw,0.85rem)", color: team.color, fontWeight: 700, marginBottom: 6 }}>{team.symbol} {team.name} — slutsiffra: <span style={{ fontSize: "clamp(0.85rem,1.8vw,1.1rem)" }}>{team.finalDigit}</span></div>
                {team.missions.map((m, i) => (
                  <div key={i} style={{ fontSize: "clamp(0.65rem,1.3vw,0.8rem)", color: "#6a8a9a", padding: "4px 0", display: "flex", justifyContent: "space-between" }}>
                    <span>{i + 1}. {m.icon} {m.title}</span>
                    <span style={{ color: "#8aaa9a", fontWeight: 700, fontSize: "clamp(0.75rem,1.5vw,0.9rem)" }}>{m.answer}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{ fontSize: "clamp(0.7rem,1.4vw,0.85rem)", color: "#5a7a8a", marginTop: 8, borderTop: "1px solid #1a2a3a", paddingTop: 10 }}>
              Slutkod: <span style={{ color: "#ff6633", fontWeight: 700, fontSize: "clamp(0.85rem,1.8vw,1.1rem)" }}>{event.finalCode}</span>
              <span style={{ color: "#3a5a6a", marginLeft: 16 }}>Aktiveringskod: <span style={{ color: theme.accentColor, fontWeight: 700 }}>{event.activationCode}</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdminQuickLinks({ event }: { event: LynxEvent }) {
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  useEffect(() => { setBaseUrl(typeof window !== "undefined" ? window.location.origin : ""); }, []);

  const links = [
    { key: "hq", icon: "🖥", label: "HQ", path: "/" },
    { key: "admin", icon: "📱", label: "Admin", path: "/admin" },
    ...event.teams.map((t) => ({ key: t.id, icon: t.symbol, label: t.name, path: `/team/${t.id}` })),
    { key: "stats", icon: "📊", label: "Stats", path: "/stats" },
  ];

  return (
    <div style={{ marginTop: 10, borderTop: "1px solid #1a2530", paddingTop: 10 }}>
      {links.map((l) => (
        <div key={l.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
          <div style={{ fontSize: "clamp(0.6rem,1.2vw,0.75rem)", color: "#7a9aaa" }}>{l.icon} {l.label}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: "clamp(0.5rem,1vw,0.65rem)", color: "#4a6a7a" }}>{baseUrl}{l.path}</span>
            <button onClick={() => { navigator.clipboard?.writeText(baseUrl + l.path); setCopied(l.key); setTimeout(() => setCopied(null), 1200); }} style={{ padding: "4px 8px", background: copied === l.key ? "rgba(51,255,136,0.15)" : "rgba(20,30,40,0.6)", border: `1px solid ${copied === l.key ? "#33ff88" : "#2a3a4a"}`, borderRadius: 4, color: copied === l.key ? "#33ff88" : "#5a7a8a", fontSize: "clamp(0.5rem,1vw,0.65rem)", fontFamily: FONT, cursor: "pointer" }}>
              {copied === l.key ? "✓" : "📋"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function qBtn(color: string) {
  return { padding: "4px 10px", background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 4, color, fontSize: "clamp(0.65rem,1.3vw,0.8rem)", fontFamily: FONT, cursor: "pointer" } as const;
}

function actionBtn(borderColor: string, disabled: boolean) {
  return {
    flex: 1, padding: "8px 6px", background: "rgba(10,16,24,0.6)", border: `1px solid ${borderColor}`,
    borderRadius: 6, color: disabled ? "#2a3a4a" : "#7a9aaa",
    fontSize: "clamp(0.65rem,1.3vw,0.8rem)", fontFamily: FONT, cursor: disabled ? "not-allowed" : "pointer",
    touchAction: "manipulation" as const, opacity: disabled ? 0.4 : 1,
  } as const;
}

function targetBtn(tid: string, selected: string, color: string) {
  const active = tid === selected;
  return {
    padding: "8px 12px", background: active ? `${color}18` : "rgba(10,16,24,0.6)",
    border: `1px solid ${active ? color : "#1a2a3a"}`, borderRadius: 6,
    color: active ? color : "#5a7a8a", fontSize: "clamp(0.65rem,1.3vw,0.8rem)",
    fontFamily: FONT, cursor: "pointer", fontWeight: active ? 700 : 400,
    touchAction: "manipulation" as const,
  } as const;
}
