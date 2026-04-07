"use client";
export default function ScanLines() {
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px)",
        pointerEvents: "none", zIndex: 1000,
      }}
    />
  );
}
