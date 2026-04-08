"use client";
import { useState, useEffect } from "react";
import { sGet } from "@/lib/storage";
import { LynxEvent } from "@/lib/types";
import { GLOBAL_STYLES, FONT } from "@/lib/styles";

interface MissionStat {
  missionId: string;
  time: number;
  attempts: number;
  hintsUsed: number;
}

export default function StatsPage() {
  const [event, setEvent] = useState<LynxEvent | null>(null);
  const [stats, setStats] = useState<Record<string, MissionStat[]>>({});

  useEffect(() => {
    const load = async () => {
      let active = await sGet<LynxEvent>("lynx-active-event", null);
      if (!active) {
        // Fallback to default event if none active in storage
        const { DEFAULT_EVENT_AGENT } = await import("@/lib/default-events");
        active = DEFAULT_EVENT_AGENT;
      }
      setEvent(active);
      const s: Record<string, MissionStat[]> = {};
      for (const t of active.teams) {
        s[t.id] = await sGet<MissionStat[]>(`lynx-stats-${t.id}`, []) || [];
      }
      setStats(s);
    };
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  if (!event) return (
    <div style={{ width: "100vw", height: "100vh", background: "#060a10", display: "flex", alignItems: "center", justifyContent: "center", color: "#00ffd5", fontFamily: FONT }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      LADDAR STATISTIK...
    </div>
  );

  const totalAgents = event.teams.length * 4;
  const allDone = event.teams.every((t) => (stats[t.id]?.length || 0) >= t.missions.length);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <div style={{ width: "100vw", minHeight: "100vh", background: "radial-gradient(ellipse at center,#0d1822 0%,#060a10 100%)", fontFamily: FONT, color: "#c0d0e0", padding: "clamp(16px,4vw,40px)" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.7rem)", letterSpacing: "0.3em", color: event.theme.accentColor, opacity: 0.5 }}>POST-MISSION RAPPORT</div>
          <h1 style={{ fontSize: "clamp(1.5rem,4vw,3rem)", color: event.theme.accentColor, fontWeight: 700, textShadow: `0 0 30px ${event.theme.accentColor}40`, margin: "8px 0" }}>{event.theme.orgName}</h1>
          <div style={{ fontSize: "clamp(0.7rem,1.3vw,0.9rem)", color: "#5a7a8a" }}>{event.name} — {totalAgents} {event.theme.vocabulary.agent.toLowerCase()}er</div>
          <div style={{ fontSize: "clamp(0.6rem,1.1vw,0.8rem)", color: allDone ? "#33ff88" : "#ff8844", marginTop: 8 }}>
            {allDone ? "✓ MISSION KOMPLETT" : "◎ MISSION PÅGÅR"}
          </div>
        </div>

        {/* Team cards */}
        <div style={{ display: "flex", gap: "clamp(12px,2.5vw,24px)", flexWrap: "wrap", justifyContent: "center", maxWidth: 1000, margin: "0 auto" }}>
          {event.teams.map((team) => {
            const teamStats = stats[team.id] || [];
            const totalTime = teamStats.reduce((a, s) => a + s.time, 0);
            const totalAttempts = teamStats.reduce((a, s) => a + s.attempts, 0);
            const totalHints = teamStats.reduce((a, s) => a + s.hintsUsed, 0);
            const done = teamStats.length >= team.missions.length;

            return (
              <div key={team.id} style={{
                flex: "1 1 clamp(260px,30vw,320px)", border: `2px solid ${done ? "#33ff8840" : team.color + "30"}`,
                borderRadius: 12, padding: "clamp(16px,2.5vw,28px)", background: "rgba(15,22,30,0.8)",
              }}>
                {/* Team header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: team.color }}>{team.symbol}</span>
                  <div>
                    <div style={{ fontSize: "clamp(0.85rem,1.6vw,1.1rem)", color: team.color, fontWeight: 700 }}>TEAM {team.name}</div>
                    <div style={{ fontSize: "clamp(0.5rem,0.9vw,0.65rem)", color: "#5a7a8a" }}>{done ? "KOMPLETT" : `${teamStats.length}/${team.missions.length} klara`}</div>
                  </div>
                </div>

                {/* Summary stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                  <StatBox label="TID" value={formatTime(totalTime)} color={team.color} />
                  <StatBox label="FÖRSÖK" value={String(totalAttempts)} color={totalAttempts > team.missions.length * 2 ? "#ff8844" : "#33ff88"} />
                  <StatBox label="LEDTRÅDAR" value={String(totalHints)} color={totalHints === 0 ? "#33ff88" : "#ff8844"} />
                </div>

                {/* Per-mission breakdown */}
                {team.missions.map((m, mi) => {
                  const ms = teamStats[mi];
                  return (
                    <div key={mi} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: mi < team.missions.length - 1 ? "1px solid #1a2530" : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: "0.9rem" }}>{m.icon}</span>
                        <span style={{ fontSize: "clamp(0.6rem,1.1vw,0.75rem)", color: ms ? "#8aa0b0" : "#3a4a5a" }}>{m.title}</span>
                      </div>
                      {ms ? (
                        <div style={{ display: "flex", gap: 10, fontSize: "clamp(0.55rem,1vw,0.7rem)" }}>
                          <span style={{ color: "#5a8a6a" }}>{formatTime(ms.time)}</span>
                          <span style={{ color: ms.attempts > 2 ? "#ff8844" : "#5a7a8a" }}>{ms.attempts}x</span>
                          <span style={{ color: ms.hintsUsed > 0 ? "#8a7a4a" : "#3a4a3a" }}>💡{ms.hintsUsed}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: "clamp(0.5rem,0.9vw,0.6rem)", color: "#2a3a4a" }}>—</span>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Rankings */}
        {allDone && (
          <div style={{ maxWidth: 600, margin: "32px auto 0", textAlign: "center" }}>
            <div style={{ fontSize: "clamp(0.6rem,1.1vw,0.8rem)", color: "#5a7a8a", letterSpacing: "0.2em", marginBottom: 12 }}>RANKING — SNABBAST TEAM</div>
            {[...event.teams]
              .sort((a, b) => {
                const aTime = (stats[a.id] || []).reduce((s, m) => s + m.time, 0);
                const bTime = (stats[b.id] || []).reduce((s, m) => s + m.time, 0);
                return aTime - bTime;
              })
              .map((team, rank) => {
                const t = (stats[team.id] || []).reduce((s, m) => s + m.time, 0);
                return (
                  <div key={team.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "10px 16px", marginBottom: 6,
                    background: rank === 0 ? "rgba(255,215,0,0.06)" : "rgba(15,22,30,0.6)",
                    border: `1px solid ${rank === 0 ? "#ffd70040" : "#1a2530"}`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "clamp(1rem,2vw,1.3rem)", color: rank === 0 ? "#ffd700" : rank === 1 ? "#c0c0c0" : "#cd7f32" }}>
                        {rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"}
                      </span>
                      <span style={{ fontSize: "clamp(0.75rem,1.4vw,0.9rem)", color: team.color, fontWeight: 700 }}>{team.symbol} {team.name}</span>
                    </div>
                    <span style={{ fontSize: "clamp(0.75rem,1.4vw,0.9rem)", color: "#8aa0b0" }}>{formatTime(t)}</span>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: "rgba(10,16,24,0.6)", border: "1px solid #1a2530", borderRadius: 6, padding: "8px 6px", textAlign: "center" }}>
      <div style={{ fontSize: "clamp(0.4rem,0.7vw,0.5rem)", color: "#4a6a7a", letterSpacing: "0.1em", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: "clamp(0.85rem,1.6vw,1.1rem)", color, fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}
