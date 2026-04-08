"use client";
import { useState, useEffect } from "react";
import { sSet } from "@/lib/storage";
import { LynxEvent, Team, Mission, GeneratedMission } from "@/lib/types";
import { ALL_THEMES } from "@/lib/themes";
import { ALL_DEFAULT_EVENTS } from "@/lib/default-events";
import { STATION_TYPES, STATION_CATEGORIES, generateStation } from "@/lib/generators";
import { FONT } from "@/lib/styles";
import PuzzleAdvisor from "./PuzzleAdvisor";

interface Props {
  event: LynxEvent;
  allEvents: LynxEvent[];
  onEventChange: (event: LynxEvent) => void;
  onEventsChange: (events: LynxEvent[]) => void;
  onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════
// QUICK LINKS — URLs for all views
// ═══════════════════════════════════════════════════════════════
function QuickLinks({ event }: { event: LynxEvent }) {
  const [baseUrl, setBaseUrl] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setBaseUrl(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  const links = [
    { key: "hq", icon: "🖥", label: "HQ (TV)", path: "/", color: "#00ffd5" },
    { key: "admin", icon: "📱", label: "Admin (mobil)", path: "/admin", color: "#ff5533" },
    { key: "stats", icon: "📊", label: "Statistik", path: "/stats", color: "#5a8a6a" },
    ...event.teams.map((t) => ({ key: t.id, icon: t.symbol, label: `${t.name} (laptop)`, path: `/team/${t.id}`, color: t.color })),
    { key: "print", icon: "🖨", label: "Utskrift", path: `/print/${event.id}`, color: "#8a8a6a" },
  ];

  const copyOne = (path: string, key: string) => {
    navigator.clipboard?.writeText(baseUrl + path);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const copyAll = () => {
    const text = links.map((l) => `${l.label}: ${baseUrl}${l.path}`).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied("all");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div style={card()}>
      <div style={{ fontSize: S.label, color: "#5a7a8a", letterSpacing: "0.12em", marginBottom: 10, fontWeight: 700 }}>🔗 SNABBLÄNKAR — Öppna på respektive enhet</div>
      {links.map((l) => (
        <div key={l.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1a2530" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: "1rem", flexShrink: 0 }}>{l.icon}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: S.body, color: l.color, fontWeight: 700 }}>{l.label}</div>
              <div style={{ fontSize: S.small, color: "#4a6a7a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{baseUrl}{l.path}</div>
            </div>
          </div>
          <button onClick={() => copyOne(l.path, l.key)} style={{ padding: "6px 12px", background: copied === l.key ? "rgba(51,255,136,0.15)" : "rgba(20,30,40,0.6)", border: `1px solid ${copied === l.key ? "#33ff88" : "#2a3a4a"}`, borderRadius: 6, color: copied === l.key ? "#33ff88" : "#6a8a9a", fontSize: S.small, fontFamily: FONT, cursor: "pointer", flexShrink: 0, touchAction: "manipulation" }}>
            {copied === l.key ? "✓" : "KOPIERA"}
          </button>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={copyAll} style={{ ...actionBtn("#5a8a6a"), flex: 1, padding: "10px", fontSize: S.body }}>
          {copied === "all" ? "✓ KOPIERAT" : "📋 KOPIERA ALLA"}
        </button>
        <button onClick={() => window.open(`/print/${event.id}`, "_blank")} style={{ ...actionBtn("#8a8a6a"), flex: 1, padding: "10px", fontSize: S.body }}>
          🖨 UTSKRIFT
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EVENT BUILDER
// ═══════════════════════════════════════════════════════════════
export default function EventBuilder({ event, allEvents, onEventChange, onEventsChange, onClose }: Props) {
  const [view, setView] = useState<"list" | "edit" | "stations" | "puzzles">("list");
  const [editEvent, setEditEvent] = useState<LynxEvent>(event);
  const [stationTeamIdx, setStationTeamIdx] = useState(0);
  const [previewMission, setPreviewMission] = useState<GeneratedMission | null>(null);

  const save = (evt: LynxEvent) => {
    const evts = allEvents.some((e) => e.id === evt.id)
      ? allEvents.map((e) => (e.id === evt.id ? evt : e))
      : [...allEvents, evt];
    sSet("lynx-events", evts);
    onEventsChange(evts);
  };

  const activate = (evt: LynxEvent) => {
    evt.lastUsed = Date.now();
    save(evt);
    sSet("lynx-active-event", evt);
    onEventChange(evt);
  };

  const duplicate = (evt: LynxEvent) => {
    const dup: LynxEvent = { ...JSON.parse(JSON.stringify(evt)), id: "evt_" + Math.random().toString(36).slice(2, 8), name: evt.name + " (kopia)", createdAt: Date.now(), lastUsed: null };
    sSet("lynx-events", [...allEvents, dup]);
    onEventsChange([...allEvents, dup]);
  };

  const deleteEvent = (id: string) => {
    const evts = allEvents.filter((e) => e.id !== id);
    sSet("lynx-events", evts);
    onEventsChange(evts);
  };

  const createFromTemplate = (template: LynxEvent) => {
    setEditEvent({ ...JSON.parse(JSON.stringify(template)), id: "evt_" + Math.random().toString(36).slice(2, 8), name: "Nytt event", createdAt: Date.now(), lastUsed: null });
    setView("edit");
  };

  const createBlank = () => {
    setEditEvent({
      id: "evt_" + Math.random().toString(36).slice(2, 8), name: "Nytt event", theme: ALL_THEMES[0],
      activationCode: "007", finalCode: "0000", timerMinutes: null,
      teams: [
        { id: "alpha", name: "ALPHA", symbol: "◆", color: "#00ffd5", accent: "rgba(0,255,213,", bg: "#0a1a1f", finalDigit: "0", missions: [] },
        { id: "bravo", name: "BRAVO", symbol: "▲", color: "#ff9f1c", accent: "rgba(255,159,28,", bg: "#1a150a", finalDigit: "0", missions: [] },
        { id: "charlie", name: "CHARLIE", symbol: "●", color: "#e040fb", accent: "rgba(224,64,251,", bg: "#1a0a1f", finalDigit: "0", missions: [] },
      ],
      createdAt: Date.now(), lastUsed: null,
    });
    setView("edit");
  };

  // ═══ PUZZLE ADVISOR ═══
  if (view === "puzzles") {
    return <PuzzleAdvisor onClose={() => setView("list")} teamCount={editEvent.teams.length} ageRange={[7, 12]} />;
  }

  // ═══ LIST VIEW ═══
  if (view === "list") {
    return (
      <div style={container()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <button onClick={onClose} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #2a3a4a", borderRadius: 6, color: "#6a8a9a", fontSize: S.body, fontFamily: FONT, cursor: "pointer", touchAction: "manipulation" }}>← TILLBAKA</button>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setView("puzzles")} style={{ padding: "8px 14px", background: "rgba(221,168,68,0.1)", border: "1px solid #dda84440", borderRadius: 6, color: "#dda844", fontSize: S.body, fontFamily: FONT, cursor: "pointer", fontWeight: 700 }}>🧩 PUSSELGUIDE</button>
            <span style={{ fontSize: S.label, letterSpacing: "0.15em", color: "#5a7a8a", display: "flex", alignItems: "center" }}>EVENT-HANTERARE</span>
          </div>
        </div>

        {/* Active event */}
        <div style={{ ...card(), borderColor: event.theme.accentColor + "40" }}>
          <div style={{ fontSize: S.label, color: "#5a7a8a", letterSpacing: "0.12em" }}>AKTIVT EVENT</div>
          <div style={{ fontSize: S.heading, color: event.theme.accentColor, fontWeight: 700 }}>{event.name}</div>
          <div style={{ fontSize: S.small, color: "#5a7a8a" }}>{event.theme.name} — {event.teams.length} team — {event.teams.reduce((a, t) => a + t.missions.length, 0)} uppdrag</div>
        </div>

        {/* Quick links for active event */}
        <QuickLinks event={event} />

        {/* Templates */}
        <div style={{ fontSize: S.label, color: "#5a7a8a", letterSpacing: "0.12em", marginBottom: 10, marginTop: 6 }}>SNABBSTART — VÄLJ MALL</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8, marginBottom: 14 }}>
          {ALL_DEFAULT_EVENTS.map((tmpl) => (
            <button key={tmpl.id} onClick={() => createFromTemplate(tmpl)} style={{
              padding: "16px 12px", background: "rgba(15,22,30,0.8)",
              border: `1px solid ${tmpl.theme.accentColor}30`, borderRadius: 10,
              color: tmpl.theme.accentColor, fontFamily: FONT, cursor: "pointer", textAlign: "center",
              touchAction: "manipulation",
            }}>
              <div style={{ fontSize: S.body, fontWeight: 700 }}>{tmpl.theme.name}</div>
              <div style={{ fontSize: S.small, color: "#5a7a8a", marginTop: 4 }}>{tmpl.theme.orgName}</div>
            </button>
          ))}
          <button onClick={createBlank} style={{
            padding: "16px 12px", background: "rgba(15,22,30,0.8)",
            border: "1px solid #2a3a4a", borderRadius: 10, color: "#5a7a8a",
            fontFamily: FONT, cursor: "pointer", textAlign: "center", touchAction: "manipulation",
          }}>
            <div style={{ fontSize: S.body, fontWeight: 700 }}>+ Tomt event</div>
            <div style={{ fontSize: S.small, marginTop: 4 }}>Bygg från scratch</div>
          </button>
        </div>

        {/* Saved events */}
        <div style={{ fontSize: S.label, color: "#5a7a8a", letterSpacing: "0.12em", marginBottom: 10 }}>SPARADE EVENT ({allEvents.length})</div>
        {allEvents.map((evt) => (
          <div key={evt.id} style={{ ...card(), borderColor: evt.id === event.id ? evt.theme.accentColor + "40" : "#1a2a3a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: S.body, color: evt.theme.accentColor, fontWeight: 700 }}>{evt.name}</div>
                <div style={{ fontSize: S.small, color: "#5a7a8a" }}>{evt.theme.name} — {evt.teams.length} team — {evt.teams.reduce((a, t) => a + t.missions.length, 0)} uppdrag</div>
              </div>
              {evt.id === event.id && <span style={{ fontSize: S.small, color: "#33ff88", background: "rgba(51,255,136,0.1)", padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>AKTIVT</span>}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              <button onClick={() => activate(evt)} style={actionBtn(evt.theme.accentColor)} disabled={evt.id === event.id}>▶ AKTIVERA</button>
              <button onClick={() => { setEditEvent(JSON.parse(JSON.stringify(evt))); setView("edit"); }} style={actionBtn("#5a7a8a")}>✏ REDIGERA</button>
              <button onClick={() => duplicate(evt)} style={actionBtn("#5a7a8a")}>📋 KOPIA</button>
              <button onClick={() => deleteEvent(evt.id)} style={actionBtn("#8a3a3a")} disabled={evt.id === event.id}>🗑</button>
            </div>
          </div>
        ))}
        {allEvents.length === 0 && <div style={{ fontSize: S.body, color: "#3a4a5a", textAlign: "center", padding: 24 }}>Inga sparade event. Välj en mall ovan.</div>}
      </div>
    );
  }

  // ═══ STATION PICKER ═══
  if (view === "stations") {
    const team = editEvent.teams[stationTeamIdx];
    return (
      <div style={container()}>
        <Header onClose={() => { setPreviewMission(null); setView("edit"); }} title={`STATIONER — ${team.name}`} />

        {previewMission ? (
          <div>
            <div style={card()}>
              <div style={{ fontSize: "clamp(1rem,2.2vw,1.3rem)", color: team.color, fontWeight: 700, marginBottom: 12 }}>{previewMission.icon} {previewMission.title}</div>
              <div style={{ fontSize: S.body, color: "#a0b8c8", lineHeight: 1.8, marginBottom: 14, padding: "10px 14px", background: "rgba(10,16,24,0.4)", borderRadius: 8, borderLeft: `3px solid ${team.color}30` }}>{previewMission.briefing}</div>
              <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                <div style={{ flex: 1, padding: "12px 14px", background: "rgba(51,255,136,0.06)", border: "1px solid #33ff8830", borderRadius: 8, textAlign: "center" }}>
                  <div style={{ fontSize: S.small, color: "#5a8a6a", marginBottom: 4 }}>SVAR</div>
                  <div style={{ fontSize: "clamp(1.1rem,2.5vw,1.5rem)", color: "#33ff88", fontWeight: 700 }}>{previewMission.answer}</div>
                  <div style={{ fontSize: S.small, color: "#4a6a5a" }}>{previewMission.answerLen} siffror</div>
                </div>
              </div>
              <div style={{ fontSize: S.label, color: "#8aa0b0", marginBottom: 6, fontWeight: 700 }}>💡 Ledtrådar:</div>
              {previewMission.hints.map((h, i) => (
                <div key={i} style={{ fontSize: S.body, color: "#7a9aaa", padding: "8px 12px", marginBottom: 4, background: "rgba(10,16,24,0.3)", borderRadius: 6, lineHeight: 1.6, borderLeft: `2px solid ${h.level === "mild" ? "#4a8a6a" : h.level === "medium" ? "#8a8a4a" : "#8a5a4a"}40` }}>
                  <span style={{ color: h.level === "mild" ? "#5a9a7a" : h.level === "medium" ? "#9a9a5a" : "#9a6a5a", fontSize: S.small, fontWeight: 700 }}>NIVÅ {i + 1}</span> — {h.text}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button onClick={() => {
                const updated = { ...editEvent };
                const stType = STATION_TYPES.find((s) => previewMission.title.includes(s.name.toUpperCase()) || s.name.toUpperCase() === previewMission.title);
                const asMission: Mission = { id: stType?.id || "gen_" + Date.now(), icon: stType?.icon || "📋", ...previewMission };
                updated.teams[stationTeamIdx].missions.push(asMission);
                setEditEvent(updated);
                setPreviewMission(null);
                setView("edit");
              }} style={{ ...actionBtn("#33ff88"), flex: 1, padding: "12px", fontSize: S.body, fontWeight: 700 }}>✓ LÄGG TILL</button>
              <button onClick={() => {
                const stType = STATION_TYPES.find((s) => s.name === previewMission.title || previewMission.title.includes(s.name.toUpperCase()));
                if (stType) {
                  const m = stType.generate({ theme: editEvent.theme, teamSymbol: team.symbol, teamName: team.name, difficulty: stType.difficulty, ageRange: stType.ageRange, seed: Date.now() });
                  setPreviewMission(m);
                }
              }} style={{ ...actionBtn("#5a7a8a"), flex: 1, padding: "12px", fontSize: S.body }}>🔄 NYTT</button>
              <button onClick={() => setPreviewMission(null)} style={{ ...actionBtn("#4a3a3a"), padding: "12px", fontSize: S.body }}>✕</button>
            </div>
          </div>
        ) : (
          <>
            {STATION_CATEGORIES.map((cat) => {
              const stations = STATION_TYPES.filter((s) => s.category === cat.id);
              return (
                <div key={cat.id} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: S.label, color: "#6a8a9a", letterSpacing: "0.1em", marginBottom: 8 }}>{cat.icon} {cat.name.toUpperCase()}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
                    {stations.map((st) => (
                      <button key={st.id} onClick={() => {
                        const m = generateStation(st.id, { theme: editEvent.theme, teamSymbol: team.symbol, teamName: team.name, difficulty: st.difficulty, ageRange: st.ageRange, seed: Date.now() });
                        if (m) setPreviewMission(m);
                      }} style={{
                        padding: "14px 12px", background: "rgba(15,22,30,0.8)",
                        border: "1px solid #2a3a4a", borderRadius: 8, cursor: "pointer",
                        textAlign: "left", fontFamily: FONT, touchAction: "manipulation",
                      }}>
                        <div style={{ fontSize: S.body, color: "#c0d8e8", fontWeight: 700 }}>{st.icon} {st.name}</div>
                        <div style={{ fontSize: S.small, color: "#7a9aaa", marginTop: 4 }}>{"⭐".repeat(st.difficulty)} — {st.ageRange[0]}–{st.ageRange[1]} år</div>
                        <div style={{ fontSize: S.small, color: "#6a8a9a", marginTop: 4, lineHeight: 1.5 }}>{st.description}</div>
                        {st.requiresProps.length > 0 && <div style={{ fontSize: S.small, color: "#9a8a6a", marginTop: 5 }}>📦 {st.requiresProps.join(", ")}</div>}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    );
  }

  // ═══ EDIT VIEW ═══
  return (
    <div style={container()}>
      <Header onClose={() => setView("list")} title="REDIGERA EVENT" />

      {/* Basic info */}
      <div style={card()}>
        <Label>Eventnamn</Label>
        <Input value={editEvent.name} onChange={(v) => setEditEvent({ ...editEvent, name: v })} />
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div style={{ flex: 1 }}>
            <Label>Aktiveringskod</Label>
            <Input value={editEvent.activationCode} onChange={(v) => setEditEvent({ ...editEvent, activationCode: v })} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Slutkod</Label>
            <Input value={editEvent.finalCode} onChange={(v) => setEditEvent({ ...editEvent, finalCode: v })} />
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <Label>Timer (minuter, 0 = ingen)</Label>
          <Input value={String(editEvent.timerMinutes || 0)} onChange={(v) => setEditEvent({ ...editEvent, timerMinutes: parseInt(v) || null })} />
        </div>
      </div>

      {/* Theme */}
      <div style={card()}>
        <Label>Tema</Label>
        <div style={{ display: "flex", gap: 6 }}>
          {ALL_THEMES.map((t) => (
            <button key={t.id} onClick={() => setEditEvent({ ...editEvent, theme: t })} style={{
              flex: 1, padding: "10px 6px", background: editEvent.theme.id === t.id ? `${t.accentColor}18` : "rgba(10,16,24,0.6)",
              border: `1px solid ${editEvent.theme.id === t.id ? t.accentColor : "#2a3a4a"}`,
              borderRadius: 6, color: editEvent.theme.id === t.id ? t.accentColor : "#5a7a8a",
              fontSize: S.body, fontFamily: FONT, cursor: "pointer", fontWeight: editEvent.theme.id === t.id ? 700 : 400,
              touchAction: "manipulation",
            }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div style={{ fontSize: S.label, color: "#5a7a8a", letterSpacing: "0.12em", marginBottom: 8, marginTop: 6 }}>TEAM ({editEvent.teams.length})</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {[2, 3].map((n) => (
          <button key={n} onClick={() => {
            const updated = { ...editEvent, teams: editEvent.teams.slice(0, n) };
            if (n > editEvent.teams.length) updated.teams.push({ id: "charlie", name: "CHARLIE", symbol: "●", color: "#e040fb", accent: "rgba(224,64,251,", bg: "#1a0a1f", finalDigit: "0", missions: [] });
            setEditEvent(updated);
          }} style={{
            padding: "8px 16px", border: `1px solid ${editEvent.teams.length === n ? editEvent.theme.accentColor : "#2a3a4a"}`,
            background: editEvent.teams.length === n ? `${editEvent.theme.accentColor}12` : "transparent",
            borderRadius: 6, color: editEvent.teams.length === n ? editEvent.theme.accentColor : "#5a7a8a",
            fontSize: S.body, fontFamily: FONT, cursor: "pointer", fontWeight: editEvent.teams.length === n ? 700 : 400,
          }}>
            {n} team
          </button>
        ))}
      </div>

      {editEvent.teams.map((team, ti) => (
        <div key={team.id} style={{ ...card(), borderColor: team.color + "30" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span style={{ fontSize: "clamp(0.9rem,2vw,1.1rem)", color: team.color, fontWeight: 700 }}>{team.symbol} {team.name}</span>
            <span style={{ fontSize: S.body, color: "#7a9aaa", background: "rgba(10,16,24,0.5)", padding: "4px 10px", borderRadius: 4 }}>Slutsiffra: <span style={{ color: team.color, fontWeight: 700, fontSize: S.heading }}>{team.finalDigit}</span></span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}><Label>Namn</Label><Input value={team.name} onChange={(v) => { const u = { ...editEvent }; u.teams[ti].name = v; setEditEvent(u); }} /></div>
            <div style={{ flex: 0.35 }}><Label>Siffra</Label><Input value={team.finalDigit} onChange={(v) => { const u = { ...editEvent }; u.teams[ti].finalDigit = v; setEditEvent(u); }} /></div>
          </div>

          <div style={{ fontSize: S.small, color: "#5a7a8a", marginBottom: 6 }}>{editEvent.theme.vocabulary.mission} ({team.missions.length})</div>
          {team.missions.map((m, mi) => (
            <div key={mi} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", marginBottom: 4, background: "rgba(10,16,24,0.3)", borderRadius: 6, border: "1px solid #1a253040" }}>
              <span style={{ fontSize: S.body, color: "#8aa0b0", flex: 1 }}>{mi + 1}. {m.icon} <strong>{m.title}</strong> — svar: <span style={{ color: "#33ff88", fontWeight: 700 }}>{m.answer}</span></span>
              <button onClick={() => { const u = { ...editEvent }; u.teams[ti].missions.splice(mi, 1); setEditEvent(u); }} style={{ ...actionBtn("#6a3a3a"), padding: "8px 12px" }}>✕</button>
            </div>
          ))}
          <button onClick={() => { setStationTeamIdx(ti); setView("stations"); }} style={{ ...actionBtn(team.color), width: "100%", marginTop: 8, padding: "12px", fontSize: S.body, fontWeight: 700 }}>
            + LÄGG TILL {editEvent.theme.vocabulary.station.toUpperCase()}
          </button>
        </div>
      ))}

      {/* Save buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={() => { save(editEvent); setView("list"); }} style={{ ...actionBtn("#5a8a6a"), flex: 1, padding: "14px", fontSize: S.body, fontWeight: 700 }}>💾 SPARA</button>
        <button onClick={() => { activate(editEvent); onClose(); }} style={{ ...actionBtn("#33ff88"), flex: 1, padding: "14px", fontSize: S.body, fontWeight: 700 }}>▶ SPARA & AKTIVERA</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════

// Responsive font size scale
const S = {
  heading: "clamp(0.85rem,1.8vw,1rem)",
  body: "clamp(0.7rem,1.4vw,0.85rem)",
  label: "clamp(0.65rem,1.3vw,0.8rem)",
  small: "clamp(0.6rem,1.2vw,0.75rem)",
  tiny: "clamp(0.55rem,1vw,0.65rem)",
};

function container() {
  return { width: "100vw", minHeight: "100vh", background: "#080c12", fontFamily: FONT, color: "#c0d0e0", padding: 16, overflowY: "auto" as const };
}

function card() {
  return { background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: 16, marginBottom: 10 };
}

function Header({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <button onClick={onClose} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #2a3a4a", borderRadius: 6, color: "#6a8a9a", fontSize: S.body, fontFamily: FONT, cursor: "pointer", touchAction: "manipulation" }}>← TILLBAKA</button>
      <span style={{ fontSize: S.label, letterSpacing: "0.15em", color: "#5a7a8a" }}>{title}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: S.small, color: "#8aa0b0", letterSpacing: "0.08em", marginBottom: 5, fontWeight: 700 }}>{children}</div>;
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} style={{
      width: "100%", padding: "12px 14px", background: "rgba(10,16,24,0.8)",
      border: "1px solid #3a4a5a", borderRadius: 8, color: "#c0d8e8",
      fontSize: S.body, fontFamily: FONT, outline: "none",
    }} />
  );
}

function actionBtn(color: string) {
  return { padding: "8px 10px", background: `${color}10`, border: `1px solid ${color}40`, borderRadius: 6, color, fontSize: S.small, fontFamily: FONT, cursor: "pointer", touchAction: "manipulation" as const } as const;
}
