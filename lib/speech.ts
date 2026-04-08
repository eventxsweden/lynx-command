// Speech synthesis — Androgynous robotic Director voice
let speechEnabled = true;

export function setSpeechEnabled(v: boolean) { speechEnabled = v; }
export function isSpeechEnabled() { return speechEnabled; }

export function speak(text: string, rate = 0.88) {
  if (!speechEnabled) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "sv-SE";
  u.rate = rate;
  u.pitch = 1.15; // Higher pitch for androgynous/slightly feminine robotic voice
  u.volume = 0.9;

  // Try to find a female Swedish voice for more androgynous feel
  const voices = speechSynthesis.getVoices();
  const svFemale = voices.find((v) => v.lang.startsWith("sv") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("astrid") || v.name.toLowerCase().includes("sofie") || v.name.toLowerCase().includes("alva")));
  const svAny = voices.find((v) => v.lang.startsWith("sv"));
  if (svFemale) u.voice = svFemale;
  else if (svAny) u.voice = svAny;

  speechSynthesis.speak(u);
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
