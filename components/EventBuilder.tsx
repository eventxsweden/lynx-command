"use client";
import { useState } from "react";
import { sSet } from "@/lib/storage";
import { LynxEvent, Team, Mission, GeneratedMission } from "@/lib/types";
import { ALL_THEMES } from "@/lib/themes";
import { ALL_DEFAULT_EVENTS } from "@/lib/default-events";
import { STATION_TYPES, STATION_CATEGORIES, generateStation } from "@/lib/generators";
import { FONT } from "@/lib/styles";

interface Props {
  event: LynxEvent;
  allEvents: LynxEvent[];
  onEventChange: (event: LynxEvent) => void;
  onEventsChange: (events: LynxEvent[]) => void;
  onClose: () => void;
}

export default function EventBuilder({ event, allEvents, onEventChange, onEventsChange, onClose }: Props) {
  const [view, setView] = useState<"list" | "edit" | "stations">("list");
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
    const dup: LynxEvent = {
      ...JSON.parse(JSON.stringify(evt)),
      id: "evt_" + Math.random().toString(36).slice(2, 8),
      name: evt.name + " (kopia)",
      createdAt: Date.now(),
      lastUsed: null,
    };
    const evts = [...allEvents, dup];
    sSet("lynx-events", evts);
    onEventsChange(evts);
  };

  const deleteEvent = (id: string) => {
    const evts = allEvents.filter((e) => e.id !== id);
    sSet("lynx-events", evts);
    onEventsChange(evts);
  };

  const createFromTemplate = (template: LynxEvent) => {
    const newEvt: LynxEvent = {
      ...JSON.parse(JSON.stringify(template)),
      id: "evt_" + Math.random().toString(36).slice(2, 8),
      name: "Nytt event",
      createdAt: Date.now(),
      lastUsed: null,
    };
    setEditEvent(newEvt);
    setView("edit");
  };

  const createBlank = () => {
    const theme = ALL_THEMES[0];
    const newEvt: LynxEvent = {
      id: "evt_" + Math.random().toString(36).slice(2, 8),
      name: "Nytt event",
      theme,
      activationCode: "007",
      finalCode: "0000",
      timerMinutes: null,
      teams: [
        { id: "alpha", name: "ALPHA", symbol: "◆", color: "#00ffd5", accent: "rgba(0,255,213,", bg: "#0a1a1f", finalDigit: "0", missions: [] },
        { id: "bravo", name: "BRAVO", symbol: "▲", color: "#ff9f1c", accent: "rgba(255,159,28,", bg: "#1a150a", finalDigit: "0", missions: [] },
        { id: "charlie", name: "CHARLIE", symbol: "●", color: "#e040fb", accent: "rgba(224,64,251,", bg: "#1a0a1f", finalDigit: "0", missions: [] },
      ],
      createdAt: Date.now(),
      lastUsed: null,
    };
    setEditEvent(newEvt);
    setView("edit");
  };

  // ── LIST VIEW ──
  if (view === "list") {
    return (
      <div style={container()}>
        <Header onClose={onClose} title="EVENT-HANTERARE" />

        {/* Active event */}
        <div style={{ ...card(), borderColor: event.theme.accentColor + "40" }}>
          <div style={{ fontSize: "0.45rem", color: "#4a6a7a", letterSpacing: "0.15em" }}>AKTIVT EVENT</div>
          <div style={{ fontSize: "0.7rem", color: event.theme.accentColor, fontWeight: 700 }}>{event.name}</div>
          <div style={{ fontSize: "0.45rem", color: "#5a7a8a" }}>{event.theme.name} — {event.teams.length} team</div>
        </div>

        {/* Templates */}
        <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "0.15em", marginBottom: 8, marginTop: 4 }}>SNABBSTART — VÄLJ MALL</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
          {ALL_DEFAULT_EVENTS.map((tmpl) => (
            <button key={tmpl.id} onClick={() => createFromTemplate(tmpl)} style={{
              flex: "1 1 100px", padding: "12px 8px", background: "rgba(15,22,30,0.8)",
              border: `1px solid ${tmpl.theme.accentColor}30`, borderRadius: 8,
              color: tmpl.theme.accentColor, fontFamily: FONT, cursor: "pointer", textAlign: "center",
            }}>
              <div style={{ fontSize: "0.65rem", fontWeight: 700 }}>{tmpl.theme.name}</div>
              <div style={{ fontSize: "0.4rem", color: "#5a7a8a", marginTop: 4 }}>{tmpl.theme.orgName}</div>
            </button>
          ))}
          <button onClick={createBlank} style={{
            flex: "1 1 100px", padding: "12px 8px", background: "rgba(15,22,30,0.8)",
            border: "1px solid #2a3a4a", borderRadius: 8, color: "#5a7a8a",
            fontFamily: FONT, cursor: "pointer", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.65rem", fontWeight: 700 }}>+ Tomt event</div>
            <div style={{ fontSize: "0.4rem", marginTop: 4 }}>Bygg från scratch</div>
          </button>
        </div>

        {/* Saved events */}
        <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "0.15em", marginBottom: 8 }}>SPARADE EVENT ({allEvents.length})</div>
        {allEvents.map((evt) => (
          <div key={evt.id} style={{ ...card(), borderColor: evt.id === event.id ? evt.theme.accentColor + "40" : "#1a2a3a" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: "0.6rem", color: evt.theme.accentColor, fontWeight: 700 }}>{evt.name}</div>
                <div style={{ fontSize: "0.4rem", color: "#5a7a8a" }}>{evt.theme.name} — {evt.teams.length} team — {evt.teams.reduce((a, t) => a + t.missions.length, 0)} uppdrag</div>
              </div>
              {evt.id === event.id && <span style={{ fontSize: "0.4rem", color: "#33ff88", background: "rgba(51,255,136,0.1)", padding: "2px 6px", borderRadius: 3 }}>AKTIVT</span>}
            </div>
            <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
              <button onClick={() => activate(evt)} style={actionBtn(evt.theme.accentColor)} disabled={evt.id === event.id}>▶ AKTIVERA</button>
              <button onClick={() => { setEditEvent(JSON.parse(JSON.stringify(evt))); setView("edit"); }} style={actionBtn("#5a7a8a")}>✏ REDIGERA</button>
              <button onClick={() => duplicate(evt)} style={actionBtn("#5a7a8a")}>📋 DUPLICERA</button>
              <button onClick={() => deleteEvent(evt.id)} style={actionBtn("#8a3a3a")} disabled={evt.id === event.id}>🗑</button>
            </div>
          </div>
        ))}
        {allEvents.length === 0 && <div style={{ fontSize: "0.5rem", color: "#3a4a5a", textAlign: "center", padding: 20 }}>Inga sparade event. Välj en mall ovan.</div>}
      </div>
    );
  }

  // ── STATION PICKER VIEW ──
  if (view === "stations") {
    const team = editEvent.teams[stationTeamIdx];
    return (
      <div style={container()}>
        <Header onClose={() => { setPreviewMission(null); setView("edit"); }} title={`STATIONSBIBLIOTEK — ${team.name}`} />

        {previewMission ? (
          <div>
            <div style={card()}>
              <div style={{ fontSize: "0.6rem", color: team.color, fontWeight: 700, marginBottom: 6 }}>{previewMission.icon} {previewMission.title}</div>
              <div style={{ fontSize: "0.5rem", color: "#8aa0b0", lineHeight: 1.6, marginBottom: 8 }}>{previewMission.briefing}</div>
              <div style={{ fontSize: "0.45rem", color: "#5a7a8a" }}>Svar: <span style={{ color: "#33ff88" }}>{previewMission.answer}</span> ({previewMission.answerLen} siffror)</div>
              <div style={{ fontSize: "0.45rem", color: "#5a7a8a", marginTop: 4 }}>Ledtrådar:</div>
              {previewMission.hints.map((h, i) => (
                <div key={i} style={{ fontSize: "0.4rem", color: "#6a8a9a", paddingLeft: 8 }}>{i + 1}. [{h.level}] {h.text}</div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <button onClick={() => {
                const updated = { ...editEvent };
                const stType = STATION_TYPES.find((s) => previewMission.title.includes(s.name.toUpperCase()) || s.name.toUpperCase() === previewMission.title);
                const asMission: Mission = {
                  id: stType?.id || "gen_" + Date.now(),
                  icon: stType?.icon || "📋",
                  ...previewMission,
                };
                updated.teams[stationTeamIdx].missions.push(asMission);
                setEditEvent(updated);
                setPreviewMission(null);
                setView("edit");
              }} style={{ ...actionBtn("#33ff88"), flex: 1, padding: "10px" }}>✓ LÄGG TILL</button>
              <button onClick={() => {
                const stType = STATION_TYPES.find((s) => s.name === previewMission.title || previewMission.title.includes(s.name.toUpperCase()));
                if (stType) {
                  const m = stType.generate({ theme: editEvent.theme, teamSymbol: team.symbol, teamName: team.name, difficulty: stType.difficulty, ageRange: stType.ageRange, seed: Date.now() });
                  setPreviewMission(m);
                }
              }} style={{ ...actionBtn("#5a7a8a"), flex: 1, padding: "10px" }}>🔄 GENERERA NYTT</button>
              <button onClick={() => setPreviewMission(null)} style={{ ...actionBtn("#4a3a3a"), padding: "10px" }}>✕</button>
            </div>
          </div>
        ) : (
          <>
            {STATION_CATEGORIES.map((cat) => {
              const stations = STATION_TYPES.filter((s) => s.category === cat.id);
              return (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: "0.55rem", color: "#6a8a9a", letterSpacing: "0.1em", marginBottom: 6 }}>{cat.icon} {cat.name.toUpperCase()}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {stations.map((st) => (
                      <button key={st.id} onClick={() => {
                        const m = generateStation(st.id, { theme: editEvent.theme, teamSymbol: team.symbol, teamName: team.name, difficulty: st.difficulty, ageRange: st.ageRange, seed: Date.now() });
                        if (m) setPreviewMission(m);
                      }} style={{
                        flex: "1 1 140px", padding: "10px", background: "rgba(15,22,30,0.8)",
                        border: "1px solid #2a3a4a", borderRadius: 6, cursor: "pointer",
                        textAlign: "left", fontFamily: FONT,
                      }}>
                        <div style={{ fontSize: "0.6rem", color: "#a0b8c8" }}>{st.icon} {st.name}</div>
                        <div style={{ fontSize: "0.4rem", color: "#4a6a7a", marginTop: 2 }}>{"⭐".repeat(st.difficulty)} — {st.ageRange[0]}-{st.ageRange[1]} år</div>
                        <div style={{ fontSize: "0.38rem", color: "#3a5a6a", marginTop: 2 }}>{st.description}</div>
                        {st.requiresProps.length > 0 && <div style={{ fontSize: "0.35rem", color: "#5a4a3a", marginTop: 2 }}>Kräver: {st.requiresProps.join(", ")}</div>}
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

  // ── EDIT VIEW ──
  return (
    <div style={container()}>
      <Header onClose={() => setView("list")} title="REDIGERA EVENT" />

      {/* Basic info */}
      <div style={card()}>
        <Label>Eventnamn</Label>
        <Input value={editEvent.name} onChange={(v) => setEditEvent({ ...editEvent, name: v })} />
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            <Label>Aktiveringskod</Label>
            <Input value={editEvent.activationCode} onChange={(v) => setEditEvent({ ...editEvent, activationCode: v })} />
          </div>
          <div style={{ flex: 1 }}>
            <Label>Slutkod</Label>
            <Input value={editEvent.finalCode} onChange={(v) => setEditEvent({ ...editEvent, finalCode: v })} />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <Label>Timer (minuter, 0 = ingen)</Label>
          <Input value={String(editEvent.timerMinutes || 0)} onChange={(v) => setEditEvent({ ...editEvent, timerMinutes: parseInt(v) || null })} />
        </div>
      </div>

      {/* Theme */}
      <div style={card()}>
        <Label>Tema</Label>
        <div style={{ display: "flex", gap: 4 }}>
          {ALL_THEMES.map((t) => (
            <button key={t.id} onClick={() => setEditEvent({ ...editEvent, theme: t })} style={{
              flex: 1, padding: "8px 4px", background: editEvent.theme.id === t.id ? `${t.accentColor}15` : "rgba(10,16,24,0.6)",
              border: `1px solid ${editEvent.theme.id === t.id ? t.accentColor : "#2a3a4a"}`,
              borderRadius: 4, color: editEvent.theme.id === t.id ? t.accentColor : "#5a7a8a",
              fontSize: "0.45rem", fontFamily: FONT, cursor: "pointer",
            }}>
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Teams */}
      <div style={{ fontSize: "0.55rem", color: "#4a6a7a", letterSpacing: "0.15em", marginBottom: 6, marginTop: 4 }}>TEAM ({editEvent.teams.length})</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        {[2, 3].map((n) => (
          <button key={n} onClick={() => {
            const updated = { ...editEvent, teams: editEvent.teams.slice(0, n) };
            if (n > editEvent.teams.length) {
              updated.teams.push({ id: "charlie", name: "CHARLIE", symbol: "●", color: "#e040fb", accent: "rgba(224,64,251,", bg: "#1a0a1f", finalDigit: "0", missions: [] });
            }
            setEditEvent(updated);
          }} style={{
            padding: "4px 12px", border: `1px solid ${editEvent.teams.length === n ? editEvent.theme.accentColor : "#2a3a4a"}`,
            background: editEvent.teams.length === n ? `${editEvent.theme.accentColor}10` : "transparent",
            borderRadius: 4, color: editEvent.teams.length === n ? editEvent.theme.accentColor : "#5a7a8a",
            fontSize: "0.5rem", fontFamily: FONT, cursor: "pointer",
          }}>
            {n} team
          </button>
        ))}
      </div>

      {editEvent.teams.map((team, ti) => (
        <div key={team.id} style={{ ...card(), borderColor: team.color + "30" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ fontSize: "0.65rem", color: team.color, fontWeight: 700 }}>{team.symbol} {team.name}</span>
            <span style={{ fontSize: "0.4rem", color: "#4a6a7a" }}>Slutsiffra: {team.finalDigit}</span>
          </div>
          <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
            <div style={{ flex: 1 }}><Label>Namn</Label><Input value={team.name} onChange={(v) => { const u = { ...editEvent }; u.teams[ti].name = v; setEditEvent(u); }} /></div>
            <div style={{ flex: 0.4 }}><Label>Siffra</Label><Input value={team.finalDigit} onChange={(v) => { const u = { ...editEvent }; u.teams[ti].finalDigit = v; setEditEvent(u); }} /></div>
          </div>

          <div style={{ fontSize: "0.45rem", color: "#5a7a8a", marginBottom: 4 }}>{editEvent.theme.vocabulary.mission} ({team.missions.length})</div>
          {team.missions.map((m, mi) => (
            <div key={mi} style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 0", borderBottom: "1px solid #1a2530" }}>
              <span style={{ fontSize: "0.5rem", color: "#6a8a9a", flex: 1 }}>{mi + 1}. {m.icon} {m.title} — svar: {m.answer}</span>
              <button onClick={() => {
                const u = { ...editEvent };
                u.teams[ti].missions.splice(mi, 1);
                setEditEvent(u);
              }} style={{ ...actionBtn("#5a3a3a"), fontSize: "0.4rem" }}>✕</button>
            </div>
          ))}
          <button onClick={() => { setStationTeamIdx(ti); setView("stations"); }} style={{ ...actionBtn(team.color), width: "100%", marginTop: 6, padding: "8px" }}>
            + LÄGG TILL {editEvent.theme.vocabulary.station.toUpperCase()}
          </button>
        </div>
      ))}

      {/* Save buttons */}
      <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
        <button onClick={() => { save(editEvent); setView("list"); }} style={{ ...actionBtn("#5a8a6a"), flex: 1, padding: "12px", fontSize: "0.6rem" }}>💾 SPARA</button>
        <button onClick={() => { activate(editEvent); onClose(); }} style={{ ...actionBtn("#33ff88"), flex: 1, padding: "12px", fontSize: "0.6rem" }}>▶ SPARA & AKTIVERA</button>
      </div>
    </div>
  );
}

// Helpers
function container() {
  return { width: "100vw", minHeight: "100vh", background: "#080c12", fontFamily: FONT, color: "#c0d0e0", padding: 12, overflowY: "auto" as const };
}

function card() {
  return { background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 8, padding: 12, marginBottom: 8 };
}

function Header({ onClose, title }: { onClose: () => void; title: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
      <button onClick={onClose} style={{ padding: "4px 10px", background: "transparent", border: "1px solid #2a3a4a", borderRadius: 4, color: "#5a7a8a", fontSize: "0.55rem", fontFamily: FONT, cursor: "pointer" }}>← TILLBAKA</button>
      <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#5a7a8a" }}>{title}</span>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: "0.4rem", color: "#4a6a7a", letterSpacing: "0.1em", marginBottom: 3 }}>{children}</div>;
}

function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} style={{
      width: "100%", padding: "6px 8px", background: "rgba(10,16,24,0.8)",
      border: "1px solid #2a3a4a", borderRadius: 4, color: "#a0b8c8",
      fontSize: "0.55rem", fontFamily: FONT, outline: "none",
    }} />
  );
}

function actionBtn(color: string) {
  return { padding: "4px 8px", background: `${color}10`, border: `1px solid ${color}40`, borderRadius: 4, color, fontSize: "0.45rem", fontFamily: FONT, cursor: "pointer" } as const;
}
