"use client";
import { useEffect, useState } from "react";
import { FONT } from "@/lib/styles";

interface Props {
  children: React.ReactNode;
  enabled?: boolean;
}

export default function KioskMode({ children, enabled = false }: Props) {
  const [isKiosk, setIsKiosk] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  // Check URL param ?kiosk=true
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const kioskParam = params.get("kiosk") === "true" || enabled;
    if (kioskParam) {
      setShowPrompt(true);
    }
  }, [enabled]);

  const enterKiosk = () => {
    setIsKiosk(true);
    setShowPrompt(false);
    // Request fullscreen
    document.documentElement.requestFullscreen?.().catch(() => {});
  };

  // Kiosk behaviors
  useEffect(() => {
    if (!isKiosk) return;

    // Block right-click
    const blockContext = (e: MouseEvent) => { e.preventDefault(); };
    // Block common navigation keys
    const blockKeys = (e: KeyboardEvent) => {
      // Allow numpad keys, backspace (for numpad DEL), Enter
      if (e.key >= "0" && e.key <= "9") return;
      if (e.key === "Backspace" || e.key === "Enter") return;
      // Block F5, Ctrl+R, Ctrl+W, Alt+F4, etc
      if (e.key === "F5" || (e.ctrlKey && e.key === "r") || (e.ctrlKey && e.key === "w")) {
        e.preventDefault();
      }
      // Allow Shift+R and Shift+F for admin reset/fullscreen
      if (e.shiftKey && (e.key === "R" || e.key === "F")) return;
    };
    // Re-enter fullscreen if exited
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isKiosk) {
        setTimeout(() => {
          document.documentElement.requestFullscreen?.().catch(() => {});
        }, 500);
      }
    };

    document.addEventListener("contextmenu", blockContext);
    document.addEventListener("keydown", blockKeys);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    // Hide cursor after 3s of inactivity
    let cursorTimer: ReturnType<typeof setTimeout>;
    const showCursor = () => {
      document.body.style.cursor = "default";
      clearTimeout(cursorTimer);
      cursorTimer = setTimeout(() => { document.body.style.cursor = "none"; }, 3000);
    };
    document.addEventListener("mousemove", showCursor);
    cursorTimer = setTimeout(() => { document.body.style.cursor = "none"; }, 3000);

    return () => {
      document.removeEventListener("contextmenu", blockContext);
      document.removeEventListener("keydown", blockKeys);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mousemove", showCursor);
      document.body.style.cursor = "default";
      clearTimeout(cursorTimer);
    };
  }, [isKiosk]);

  // Prompt to enter kiosk mode
  if (showPrompt) {
    return (
      <div style={{
        width: "100vw", height: "100vh", background: "#060a10",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: FONT, color: "#c0d0e0", gap: 20,
      }}>
        <div style={{ fontSize: "clamp(0.6rem,1.2vw,0.8rem)", color: "#00ffd5", letterSpacing: "0.2em", opacity: 0.5 }}>LYNX COMMAND CENTER</div>
        <div style={{ fontSize: "clamp(1rem,2.5vw,1.5rem)", color: "#00ffd5", fontWeight: 700 }}>KIOSK-LÄGE</div>
        <div style={{ fontSize: "clamp(0.7rem,1.3vw,0.9rem)", color: "#5a7a8a", textAlign: "center", maxWidth: 400, lineHeight: 1.7 }}>
          Fullskärm aktiveras. Högerklick och navigering blockeras. Perfekt för kalas-skärmar.
        </div>
        <button onClick={enterKiosk} style={{
          padding: "14px 40px", background: "rgba(0,255,213,0.1)", border: "2px solid #00ffd5",
          borderRadius: 10, color: "#00ffd5", fontSize: "clamp(0.8rem,1.5vw,1rem)",
          fontFamily: FONT, fontWeight: 700, cursor: "pointer", letterSpacing: "0.1em",
        }}>
          STARTA KIOSK-LÄGE ▶
        </button>
        <button onClick={() => { setShowPrompt(false); }} style={{
          padding: "8px 20px", background: "transparent", border: "1px solid #2a3a4a",
          borderRadius: 6, color: "#4a6a7a", fontSize: "clamp(0.6rem,1.1vw,0.75rem)",
          fontFamily: FONT, cursor: "pointer",
        }}>
          Hoppa över
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
