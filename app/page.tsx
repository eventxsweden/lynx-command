"use client";
import { useState, useEffect } from "react";
import { sGet, sSet } from "@/lib/storage";
import { LynxEvent } from "@/lib/types";
import { DEFAULT_EVENT_AGENT, ALL_DEFAULT_EVENTS } from "@/lib/default-events";
import { GLOBAL_STYLES } from "@/lib/styles";
import HQScreen from "@/components/HQScreen";
import KioskMode from "@/components/KioskMode";

export default function HQPage() {
  const [event, setEvent] = useState<LynxEvent | null>(null);

  useEffect(() => {
    const load = async () => {
      let active = await sGet<LynxEvent>("lynx-active-event", null);
      if (!active) {
        active = DEFAULT_EVENT_AGENT;
        await sSet("lynx-active-event", active);
        // Init default events
        const existing = await sGet<LynxEvent[]>("lynx-events", null);
        if (!existing || existing.length === 0) {
          await sSet("lynx-events", ALL_DEFAULT_EVENTS);
        }
      }
      setEvent(active);
    };
    load();
    // Poll for event changes (admin might switch event)
    const iv = setInterval(async () => {
      const active = await sGet<LynxEvent>("lynx-active-event", null);
      if (active) setEvent(active);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  if (!event) return (
    <div style={{ width: "100vw", height: "100vh", background: "#060a10", display: "flex", alignItems: "center", justifyContent: "center", color: "#00ffd5", fontFamily: "'Share Tech Mono',monospace", fontSize: "0.8rem", letterSpacing: "0.2em" }}>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      LADDAR...
    </div>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_STYLES }} />
      <KioskMode>
        <HQScreen event={event} />
      </KioskMode>
    </>
  );
}
