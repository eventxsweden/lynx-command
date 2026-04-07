// Shared CSS-in-JS styles and keyframes
export const FONT = "'Share Tech Mono','Courier New',monospace";

export const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{margin:0;overflow-x:hidden;background:#060a10;font-family:${FONT}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
@keyframes fade-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
@keyframes breathe{0%,100%{transform:translateX(-50%) scale(1);opacity:.6}50%{transform:translateX(-50%) scale(1.06);opacity:1}}
@keyframes glow-pulse{0%,100%{box-shadow:0 0 5px rgba(0,255,213,.06)}50%{box-shadow:0 0 15px rgba(0,255,213,.18)}}
@keyframes pulse-red{from{opacity:1}to{opacity:.5}}
@keyframes alert-flash{0%,100%{border-color:transparent}50%{border-color:#ff330044}}
@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}
@keyframes scan-move{0%{top:-50%}100%{top:150%}}
@keyframes particle{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-80px) scale(0.2)}}
@media print{.no-print{display:none!important}.print-only{display:block!important}}
.print-only{display:none}
`;

export function hqBase(gradient?: [string, string]) {
  const g = gradient || ["#0d1822", "#060a10"];
  return {
    width: "100vw", height: "100vh",
    background: `radial-gradient(ellipse at center,${g[0]} 0%,${g[1]} 100%)`,
    display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
    fontFamily: FONT, color: "#c0d0e0",
    padding: "clamp(10px,2.5vw,28px)", gap: "clamp(8px,2vh,24px)",
    position: "relative" as const, overflow: "hidden",
  };
}

export function tBase() {
  return {
    width: "100vw", minHeight: "100vh",
    background: "radial-gradient(ellipse at center,#0d1822 0%,#060a10 100%)",
    display: "flex", flexDirection: "column" as const, alignItems: "center", justifyContent: "center",
    fontFamily: FONT, color: "#c0d0e0",
    padding: "clamp(10px,2.5vw,28px)", gap: "clamp(6px,1.5vh,16px)",
    position: "relative" as const,
  };
}

export function cBtn(accent = "#00ffd5") {
  return {
    marginTop: 8, padding: "clamp(8px,1.5vw,14px) clamp(20px,4vw,40px)",
    background: `${accent}12`, border: `2px solid ${accent}`,
    borderRadius: 8, color: accent,
    fontSize: "clamp(0.65rem,1.2vw,0.85rem)", fontFamily: FONT,
    letterSpacing: "0.15em", cursor: "pointer",
    animation: "fade-in 0.5s", fontWeight: 700,
    touchAction: "manipulation" as const,
  };
}
