"use client";
import { useState, useEffect, use } from "react";
import { sGet } from "@/lib/storage";
import { LynxEvent } from "@/lib/types";
import { FONT } from "@/lib/styles";

export default function PrintPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [event, setEvent] = useState<LynxEvent | null>(null);

  useEffect(() => {
    const load = async () => {
      const events = await sGet<LynxEvent[]>("lynx-events", []);
      const found = events?.find((e) => e.id === eventId);
      if (found) setEvent(found);
      else {
        const active = await sGet<LynxEvent>("lynx-active-event", null);
        if (active) setEvent(active);
      }
    };
    load();
  }, [eventId]);

  if (!event) return <div style={{ padding: 40, fontFamily: FONT, color: "#333" }}>Laddar event...</div>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", color: "#111", padding: 20, background: "#fff", minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { .no-print { display: none !important; } body { background: white; } }
        @page { margin: 1.5cm; }
      `}} />

      <div className="no-print" style={{ background: "#f0f0f0", padding: "12px 20px", marginBottom: 24, borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <strong>{event.name}</strong> — Utskriftsmaterial
        </div>
        <button onClick={() => window.print()} style={{ padding: "8px 20px", background: "#333", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>
          🖨 SKRIV UT
        </button>
      </div>

      <h1 style={{ fontSize: 24, marginBottom: 4 }}>{event.theme.orgName} — {event.name}</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>Tema: {event.theme.name} | Aktiveringskod: {event.activationCode} | Slutkod: {event.finalCode}</p>

      {/* Instructor overview */}
      <div style={{ breakAfter: "page", marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, borderBottom: "2px solid #333", paddingBottom: 4 }}>INSTRUKTÖRSBLAD — FACIT</h2>
        {event.teams.map((team) => (
          <div key={team.id} style={{ marginTop: 16 }}>
            <h3 style={{ color: team.color === "#00ffd5" ? "#008877" : team.color.replace("#", "#") }}>
              {team.symbol} Team {team.name} — Slutsiffra: {team.finalDigit}
            </h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={thStyle()}>#</th>
                  <th style={thStyle()}>Station</th>
                  <th style={thStyle()}>Svar</th>
                  <th style={thStyle()}>Siffror</th>
                </tr>
              </thead>
              <tbody>
                {team.missions.map((m, i) => (
                  <tr key={i}>
                    <td style={tdStyle()}>{i + 1}</td>
                    <td style={tdStyle()}>{m.icon} {m.title}</td>
                    <td style={{ ...tdStyle(), fontWeight: 700, fontSize: 16 }}>{m.answer}</td>
                    <td style={tdStyle()}>{m.answerLen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        <div style={{ marginTop: 20, padding: 12, background: "#fff3e0", borderRadius: 4, border: "1px solid #ffcc80" }}>
          <strong>Slutkod ({event.theme.vocabulary.briefcase}):</strong> {event.finalCode}
          <br />
          <strong>Aktiveringskod:</strong> {event.activationCode}
          <br />
          <strong>Slutsiffror:</strong> {event.teams.map((t) => `${t.symbol} ${t.name} = ${t.finalDigit}`).join("  |  ")}
        </div>
      </div>

      {/* Per-team materials */}
      {event.teams.map((team) => (
        <div key={team.id} style={{ breakBefore: "page" }}>
          <h2 style={{ fontSize: 18, borderBottom: `2px solid ${team.color}`, paddingBottom: 4, marginBottom: 16 }}>
            {team.symbol} TEAM {team.name} — Material
          </h2>
          {team.missions.map((m, mi) => (
            <div key={mi} style={{ marginBottom: 24, padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <h3 style={{ margin: 0 }}>{m.icon} Station {mi + 1}: {m.title}</h3>
                <span style={{ fontSize: 12, color: "#888" }}>{team.symbol} {team.name}</span>
              </div>
              <p style={{ color: "#555", fontSize: 14, lineHeight: 1.6 }}>{m.briefing}</p>
              <div style={{ marginTop: 8, padding: 8, background: "#f9f9f9", borderRadius: 4 }}>
                <div style={{ fontSize: 12, color: "#888" }}>Ledtrådar (om det behövs):</div>
                {m.hints.map((h, hi) => (
                  <div key={hi} style={{ fontSize: 13, color: "#666", padding: "2px 0" }}>
                    Nivå {hi + 1}: {h.text}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}

      {/* QR code section */}
      <div style={{ breakBefore: "page", textAlign: "center", paddingTop: 40 }}>
        <h2>Snabblänkar & QR-koder</h2>
        <p style={{ color: "#666", marginBottom: 8 }}>Skanna QR-koden eller öppna URL:en på respektive enhet.</p>
        <p style={{ color: "#999", fontSize: 12, marginBottom: 24 }}>Bas-URL: ange din Vercel-adress nedan</p>
        <QRSection event={event} />
      </div>
    </div>
  );
}

function QRSection({ event }: { event: LynxEvent }) {
  const [baseUrl, setBaseUrl] = useState("");
  const [qrUrls, setQrUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const url = typeof window !== "undefined" ? window.location.origin : "";
    setBaseUrl(url);
  }, []);

  useEffect(() => {
    if (!baseUrl) return;
    const generateQR = async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const urls: Record<string, string> = {};
        urls["hq"] = await QRCode.toDataURL(`${baseUrl}/`, { width: 180, margin: 1, color: { dark: "#000000", light: "#ffffff" } });
        urls["admin"] = await QRCode.toDataURL(`${baseUrl}/admin`, { width: 180, margin: 1 });
        urls["stats"] = await QRCode.toDataURL(`${baseUrl}/stats`, { width: 180, margin: 1 });
        for (const t of event.teams) {
          urls[t.id] = await QRCode.toDataURL(`${baseUrl}/team/${t.id}`, { width: 180, margin: 1 });
        }
        setQrUrls(urls);
      } catch (e) {
        console.error("QR generation failed", e);
      }
    };
    generateQR();
  }, [baseUrl, event.teams]);

  const items = [
    { key: "hq", label: "HQ (TV)", path: "/", color: "#333" },
    { key: "admin", label: "Admin (mobil)", path: "/admin", color: "#cc3300" },
    { key: "stats", label: "Statistik", path: "/stats", color: "#666" },
    ...event.teams.map((t) => ({ key: t.id, label: `${t.symbol} ${t.name}`, path: `/team/${t.id}`, color: t.color })),
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 30, marginTop: 20 }}>
      {items.map((item) => (
        <div key={item.key} style={{ textAlign: "center", padding: 12, border: "1px solid #ddd", borderRadius: 8, minWidth: 140 }}>
          <div style={{ fontWeight: 700, marginBottom: 8, color: item.color, fontSize: 14 }}>{item.label}</div>
          {qrUrls[item.key] ? (
            <img src={qrUrls[item.key]} alt={`QR ${item.label}`} style={{ width: 140, height: 140 }} />
          ) : (
            <div style={{ width: 140, height: 140, background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#999" }}>Genererar...</div>
          )}
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#888", marginTop: 6 }}>{baseUrl}{item.path}</div>
        </div>
      ))}
    </div>
  );
}

function thStyle() {
  return { textAlign: "left" as const, padding: "6px 10px", borderBottom: "1px solid #ddd", fontSize: 13 };
}

function tdStyle() {
  return { padding: "6px 10px", borderBottom: "1px solid #eee", fontSize: 14 };
}
