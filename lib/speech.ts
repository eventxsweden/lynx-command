// Speech synthesis — Swedish Director voice
let speechEnabled = true;

export function setSpeechEnabled(v: boolean) { speechEnabled = v; }
export function isSpeechEnabled() { return speechEnabled; }

export function speak(text: string, rate = 0.82) {
  if (!speechEnabled) return;
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "sv-SE";
  u.rate = rate;
  u.pitch = 0.65;
  u.volume = 0.9;
  const sv = speechSynthesis.getVoices().find((v) => v.lang.startsWith("sv"));
  if (sv) u.voice = sv;
  speechSynthesis.speak(u);
}

export function stopSpeech() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
