"use client";
import { useState, useEffect } from "react";
import { sGet, sSet } from "@/lib/storage";
import { LynxEvent } from "@/lib/types";
import { DEFAULT_EVENT_AGENT, ALL_DEFAULT_EVENTS } from "@/lib/default-events";
import { GLOBAL_STYLES } from "@/lib/styles";
import AdminPanel from "@/components/AdminPanel";

export default function AdminPage() {
  const [event, setEvent] = useState<LynxEvent | null>(null);
  const [allEvents, setAllEvents] = useState<LynxEvent[]>([]);

  useEffect(() => {
    const load = async () => {
      let active = await sGet<LynxEvent>("lynx-active-event", null);
      if (!active) {
        active = DEFAULT_EVENT_AGENT;
        await sSet("lynx-active-event", active);
      }
      setEvent(active);

      let events = await sGet<LynxEvent[]>("lynx-events", null);
      if (!events || events.length === 0) {
        events = ALL_DEFAULT_EVENTS;
        await sSet("lynx-events", events);
      }
      setAllEvents(events);
    };
    load();
  }, []);

  if (!event) return (
    <div style={{ width: "100vw", height: "100vh", background: "#080c12", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff3300", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.8rem", letterSpacing: "0.2em" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      LADDAR ADMIN...
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <AdminPanel
        event={event}
        allEvents={allEvents}
        onEventChange={(e) => { setEvent(e); sSet("lynx-active-event", e); }}
        onEventsChange={(evts) => { setAllEvents(evts); sSet("lynx-events", evts); }}
      />
    </>
  );
}
