"use client";
import { useState, useEffect, use } from "react";
import { sGet, sSet } from "@/lib/storage";
import { LynxEvent } from "@/lib/types";
import { DEFAULT_EVENT_AGENT, ALL_DEFAULT_EVENTS } from "@/lib/default-events";
import { GLOBAL_STYLES } from "@/lib/styles";
import TeamTerminal from "@/components/TeamTerminal";

export default function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = use(params);
  const [event, setEvent] = useState<LynxEvent | null>(null);

  useEffect(() => {
    const load = async () => {
      let active = await sGet<LynxEvent>("lynx-active-event", null);
      if (!active) {
        active = DEFAULT_EVENT_AGENT;
        await sSet("lynx-active-event", active);
        const existing = await sGet<LynxEvent[]>("lynx-events", null);
        if (!existing || existing.length === 0) {
          await sSet("lynx-events", ALL_DEFAULT_EVENTS);
        }
      }
      setEvent(active);
    };
    load();
    // Poll for event changes
    const iv = setInterval(async () => {
      const active = await sGet<LynxEvent>("lynx-active-event", null);
      if (active) setEvent(active);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const team = event?.teams.find((t) => t.id === teamId);

  if (!event || !team) return (
    <div style={{ width: "100vw", height: "100vh", background: "#060a10", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff4444", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.8rem", letterSpacing: "0.2em", textAlign: "center", flexDirection: "column", gap: 12 }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      {!event ? "LADDAR..." : `TEAM "${teamId}" FINNS INTE`}
      {event && <div style={{ fontSize: "0.5rem", color: "#4a6a7a" }}>Tillgängliga: {event.teams.map((t) => t.id).join(", ")}</div>}
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <TeamTerminal team={team} vocabulary={event.theme.vocabulary} />
    </>
  );
}
