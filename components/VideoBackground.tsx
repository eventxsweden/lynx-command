"use client";
import { useRef, useEffect } from "react";

interface Props {
  src: string;
  opacity?: number;
  overlay?: string; // CSS gradient overlay
  blend?: string;
}

export default function VideoBackground({ src, opacity = 0.15, overlay, blend = "screen" }: Props) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure autoplay on interaction
    const play = () => {
      ref.current?.play().catch(() => {});
      window.removeEventListener("click", play);
    };
    ref.current?.play().catch(() => {
      window.addEventListener("click", play);
    });
    return () => window.removeEventListener("click", play);
  }, []);

  return (
    <>
      <video
        ref={ref}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "fixed", inset: 0,
          width: "100vw", height: "100vh",
          objectFit: "cover",
          opacity,
          mixBlendMode: blend as React.CSSProperties["mixBlendMode"],
          zIndex: 0,
          pointerEvents: "none",
          filter: "saturate(0.6)",
        }}
      />
      {overlay && (
        <div style={{
          position: "fixed", inset: 0,
          background: overlay,
          zIndex: 1,
          pointerEvents: "none",
        }} />
      )}
    </>
  );
}
