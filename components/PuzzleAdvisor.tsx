"use client";
import { useState } from "react";
import { FONT } from "@/lib/styles";

// ═══════════════════════════════════════════════════════════════
// PUZZLE ADVISOR — Pusselrådgivare
// Based on the puzzle-kunskapsbas knowledge framework
// ═══════════════════════════════════════════════════════════════

interface PuzzleType {
  id: string;
  name: string;
  category: string;
  categoryIcon: string;
  description: string;
  examples: string[];
  ageMin: number;
  ageMax: number;
  difficulty: 1 | 2 | 3;
  timeMinutes: number;
  groupSize: string;
  props: string[];
  techLevel: "low" | "mid" | "high";
  resetClass: "auto" | "quick" | "manual";
  physicalActivity: "stillasittande" | "lätt rörelse" | "aktiv";
  collaboration: "solo" | "2+" | "3+" | "hela gruppen";
  tips: string[];
}

const PUZZLE_DATABASE: PuzzleType[] = [
  // ─── LOGIK ───
  { id: "logic_grid", name: "Logikrutnät", category: "Logik", categoryIcon: "🧠", description: "Tre ledtrådar pekar entydigt på ett svar. Barnen eliminerar alternativ.", examples: ["Vem bor i vilket hus?", "Vilken agent har vilken kod?"], ageMin: 9, ageMax: 12, difficulty: 2, timeMinutes: 4, groupSize: "2-4", props: ["Utskrivet rutnät"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "2+", tips: ["Ge visuellt rutnät att fylla i", "Max 3 variabler × 3 alternativ för barn", "Ledtrådarna ska vara entydiga — inga luriga formuleringar"] },
  { id: "pattern_seq", name: "Mönsterigenkänning", category: "Logik", categoryIcon: "🧠", description: "Hitta mönstret i en serie (siffror, former, färger) och fyll i luckan.", examples: ["2, 5, 8, 11, ?", "●○●○●?", "Färgsekvens med Fibonacci"], ageMin: 7, ageMax: 12, difficulty: 1, timeMinutes: 3, groupSize: "2-4", props: ["Utskrivet kort"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "solo", tips: ["Aritmetiska sekvenser för 7-8 år", "Geometriska/Fibonacci för 10-12 år", "Visuella mönster (former/färger) för yngre"] },
  { id: "button_sequence", name: "Knappsekvens", category: "Logik", categoryIcon: "🧠", description: "Tryck knappar i rätt ordning baserat på ledtrådar i rummet.", examples: ["Följ stjärnkartan", "Tryck i färgordning"], ageMin: 7, ageMax: 12, difficulty: 1, timeMinutes: 2, groupSize: "hela gruppen", props: ["4-6 knappar/tryckplattor"], techLevel: "mid", resetClass: "auto", physicalActivity: "lätt rörelse", collaboration: "hela gruppen", tips: ["Kognitiv gräns: 7±2 steg", "Färgkoda knappar", "Ge positiv feedback per korrekt steg (ljud/ljus)"] },

  // ─── CHIFFER ───
  { id: "caesar", name: "Caesarchiffer", category: "Chiffer & Kod", categoryIcon: "🔐", description: "Varje bokstav skiftas N steg. Barnen får nyckel + kodat meddelande.", examples: ["Shift +3: A→D, B→E", "Avkoda 'KHPOLJW'"], ageMin: 8, ageMax: 12, difficulty: 2, timeMinutes: 4, groupSize: "2-4", props: ["Chiffernyckel", "Kodat meddelande"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "2+", tips: ["Max shift +5 för barn", "Ge referensalfabet utskrivet", "Korta ord (3-6 bokstäver)"] },
  { id: "symbol_cipher", name: "Symbolchiffer", category: "Chiffer & Kod", categoryIcon: "🔐", description: "Varje bokstav ersätts med en symbol. Barnen matchar med tabell.", examples: ["★=A, ▲=B, ●=C", "Pigpen-chiffer"], ageMin: 7, ageMax: 12, difficulty: 1, timeMinutes: 3, groupSize: "2-4", props: ["Symboltabell", "Kodat meddelande"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "2+", tips: ["Visuellt tilltalande symboler", "Max 10 unika symboler för yngre barn", "Ge stor tydlig referenstabell"] },
  { id: "morse", name: "Morsekod", category: "Chiffer & Kod", categoryIcon: "🔐", description: "Prickar och streck avkodas till bokstäver med referenskort.", examples: ["... --- ... = SOS", "Blinkande lampa = morsekod"], ageMin: 9, ageMax: 12, difficulty: 3, timeMinutes: 5, groupSize: "2-4", props: ["Morse-referens", "Ficklampa (valfritt)"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "2+", tips: ["Korta ord (3-4 bokstäver)", "Tydliga mellanrum mellan bokstäver", "Kan göras med ljud (pip) eller ljus (blink)"] },
  { id: "steganography", name: "Dolt meddelande", category: "Chiffer & Kod", categoryIcon: "🔐", description: "Meddelande gömt i en vanlig text — t.ex. första bokstaven i varje mening.", examples: ["Akrostikon: initial-bokstäver bildar ord", "Markerade bokstäver i tidningsartikel"], ageMin: 8, ageMax: 12, difficulty: 2, timeMinutes: 3, groupSize: "2-4", props: ["Utskriven text"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "solo", tips: ["Gör det tydligt ATT något är dolt", "Fetstil eller understruken som hint", "Max 6-8 meningar"] },

  // ─── FYSISK ───
  { id: "uv_hunt", name: "UV-jakt", category: "Fysisk & Sök", categoryIcon: "🔦", description: "Dolda meddelanden skrivna med UV-penna, synliga med UV-lampa.", examples: ["Siffror på väggar", "Hemlig karta under bordet"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 3, groupSize: "2-4", props: ["UV-lampa", "UV-penna"], techLevel: "low", resetClass: "quick", physicalActivity: "aktiv", collaboration: "hela gruppen", tips: ["Skriv i ögonhöjd för barn", "Testa att bläcket syns med din UV-lampa", "Undvik direkt solljus — UV syns sämre", "Märk med team-symbol"] },
  { id: "laser_maze", name: "Laserlabyrint", category: "Fysisk & Sök", categoryIcon: "⚡", description: "Snören/rep som 'laserstrålar'. Ta sig igenom utan att röra.", examples: ["Kryp under, kliv över", "Timing-baserad passage"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 3, groupSize: "hela gruppen", props: ["Snöre/rep", "Tejp"], techLevel: "low", resetClass: "manual", physicalActivity: "aktiv", collaboration: "hela gruppen", tips: ["Variera höjder (30cm, 60cm, 90cm)", "Golvklistermärken = 'lasermine'", "Belöning/kod vid slutet"] },
  { id: "puzzle_pieces", name: "Pusselbitsjakt", category: "Fysisk & Sök", categoryIcon: "🧩", description: "Pusselbitar gömda i rummet. Hitta och sätt ihop för att avslöja kod.", examples: ["4 bitar → bild med kod", "Hörnsymboler visar ordning"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 4, groupSize: "2-4", props: ["Utskrivna pusselbitar", "Sax"], techLevel: "low", resetClass: "quick", physicalActivity: "aktiv", collaboration: "hela gruppen", tips: ["Max 4-6 bitar", "Tydliga hörnsymboler för ordning", "Göm nära teamets symboler"] },
  { id: "magnet_fishing", name: "Magnetfiske", category: "Fysisk & Sök", categoryIcon: "🧲", description: "Fiska upp magnetiska föremål (med nyckel/kod) ur en behållare.", examples: ["Fiska nyckeln ur 'giftbrunnen'", "Magnetstav i sandhink"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 2, groupSize: "2-4", props: ["Magnetstav/snöre", "Metallföremål", "Behållare"], techLevel: "low", resetClass: "quick", physicalActivity: "lätt rörelse", collaboration: "solo", tips: ["Undvik vatten (stökigt)", "Sand eller bönor fungerar bra", "Fäst koden på metallbricka"] },

  // ─── OBSERVATION ───
  { id: "counting", name: "Räkneuppgift", category: "Observation", categoryIcon: "👁", description: "Räkna specifika föremål i rummet. Antalet = koden.", examples: ["Hur många böcker?", "Antal röda föremål + blå = kod"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 2, groupSize: "2-4", props: [], techLevel: "low", resetClass: "auto", physicalActivity: "lätt rörelse", collaboration: "hela gruppen", tips: ["Vanligaste pusseltypen — alla kan delta", "Kombinera med matte: 'röda × blåa = ?'", "Fråga om specifika detaljer, inte uppenbara saker"] },
  { id: "memory_test", name: "Minnestest", category: "Observation", categoryIcon: "👁", description: "Visa föremål, täck, ställ frågor. Svaren = koden.", examples: ["10 föremål under duk", "Foto visas 20 sek → frågor"], ageMin: 7, ageMax: 12, difficulty: 2, timeMinutes: 3, groupSize: "2-4", props: ["Duk", "Diverse föremål"], techLevel: "low", resetClass: "quick", physicalActivity: "stillasittande", collaboration: "hela gruppen", tips: ["7±2 föremål max", "Ge tydliga kategorifrågor", "Teamet delegerar: en räknar röda, en runda osv"] },
  { id: "spot_difference", name: "Hitta skillnaden", category: "Observation", categoryIcon: "👁", description: "Två bilder med kontrollerade skillnader. Antal skillnader = kod.", examples: ["2 utskrivna rum-bilder", "Antal skillnader × 2 = kod"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 3, groupSize: "2-4", props: ["Två utskrivna bilder"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "2+", tips: ["3-7 skillnader beroende på ålder", "Skriv ut i A4 eller större", "Variation: digital på skärm vs utskrivet"] },

  // ─── MATTE ───
  { id: "equation", name: "Ekvation", category: "Matte", categoryIcon: "🧮", description: "Åldersanpassad ekvation vars lösning ger koden.", examples: ["12 + ? = 20", "X × 3 = 27"], ageMin: 7, ageMax: 12, difficulty: 1, timeMinutes: 2, groupSize: "2-4", props: ["Ekvationskort"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "solo", tips: ["7-8 år: addition/subtraktion", "9-10 år: multiplikation", "11-12 år: okänt X, tvåstegs", "Bädda in i narrativ: 'Agenten har X kulor...'"] },
  { id: "coordinates", name: "Koordinatrutnät", category: "Matte", categoryIcon: "🧮", description: "Läs av koordinater på rutnät. Värden = koden.", examples: ["A3 = 7, C1 = 2, B4 = 9", "Skattkartan"], ageMin: 8, ageMax: 12, difficulty: 2, timeMinutes: 3, groupSize: "2-4", props: ["Utskrivet rutnät"], techLevel: "low", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "2+", tips: ["6×6 rutnät max", "Färgkoda koordinater efter svårighet", "Alternativ: fysiskt rutnät på golvet"] },

  // ─── SAMARBETE ───
  { id: "silent_comm", name: "Tyst kommunikation", category: "Samarbete", categoryIcon: "🤝", description: "Ett barn ser koden, förmedlar utan att prata (gester, teckning, knackning).", examples: ["Rita i luften", "Knacka antal", "Handtecken"], ageMin: 7, ageMax: 12, difficulty: 1, timeMinutes: 3, groupSize: "2-4", props: ["Kodlapp"], techLevel: "low", resetClass: "auto", physicalActivity: "lätt rörelse", collaboration: "hela gruppen", tips: ["Skapa tydliga regler ('inga ljud')", "Låt barnen vara kreativa med metoden", "Alternativ: ett barn bakom skärm beskriver"] },
  { id: "chain_message", name: "Kedjebud", category: "Samarbete", categoryIcon: "🤝", description: "Kod viskas i kedja. Sista barnet matar in.", examples: ["Telefon-leken med siffror", "Viska + minnesprov"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 2, groupSize: "3+", props: ["Kodlapp"], techLevel: "low", resetClass: "auto", physicalActivity: "lätt rörelse", collaboration: "hela gruppen", tips: ["Kort kod (3-4 siffror)", "Längre kedja = svårare", "Roligt kaosmoment — barnen älskar det"] },
  { id: "sync_action", name: "Synkroniserad uppgift", category: "Samarbete", categoryIcon: "🤝", description: "Alla måste göra något samtidigt (trycka, stå på plattor, räcka upp hand).", examples: ["Alla trycker knapp på '3!'", "Stå på 4 markeringar samtidigt"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 2, groupSize: "hela gruppen", props: [], techLevel: "low", resetClass: "auto", physicalActivity: "aktiv", collaboration: "hela gruppen", tips: ["Nedräkning skapar spänning", "Visuell/audio feedback vid lyckad synk", "Bra som 'lås' som kräver hela teamet"] },

  // ─── SENSORISK ───
  { id: "sound_puzzle", name: "Ljudpussel", category: "Sensorisk", categoryIcon: "🎧", description: "Identifiera ljud, avkoda morse-blink, eller hitta ljudkällan.", examples: ["Vilka djur hör ni? Antal = kod", "Morse via högtalare"], ageMin: 7, ageMax: 12, difficulty: 2, timeMinutes: 3, groupSize: "2-4", props: ["Högtalare/telefon"], techLevel: "mid", resetClass: "auto", physicalActivity: "stillasittande", collaboration: "hela gruppen", tips: ["Testa volymen i förväg", "Max 5 ljud att identifiera", "Alternativ: musikigenkänning"] },
  { id: "tactile", name: "Känselpussel", category: "Sensorisk", categoryIcon: "🎧", description: "Känn föremål utan att se (ögonbindel/låda med hål). Identifiera = kod.", examples: ["Vad är i mysterielådan?", "Blindfold + formsortering"], ageMin: 6, ageMax: 12, difficulty: 1, timeMinutes: 2, groupSize: "2-4", props: ["Låda med hål/ögonbindel", "Diverse föremål"], techLevel: "low", resetClass: "quick", physicalActivity: "stillasittande", collaboration: "solo", tips: ["Säkra kanter — inga vassa föremål", "Tydliga kategorier (djur, frukt, former)", "Koppla identifiering till sifferkod"] },

  // ─── META ───
  { id: "meta_combo", name: "Metapussel (slutkod)", category: "Meta & Final", categoryIcon: "🏆", description: "Svar från flera pussel kombineras till en slutkod. Det stora finalen.", examples: ["3 teams × 1 siffra = slutkod", "Pusselbitar från varje station bildar karta"], ageMin: 7, ageMax: 12, difficulty: 2, timeMinutes: 3, groupSize: "hela gruppen", props: ["Kodlås/agentväska"], techLevel: "low", resetClass: "quick", physicalActivity: "lätt rörelse", collaboration: "hela gruppen", tips: ["Varje team bidrar med en unik del", "Kombinationsmomentet skapar höjdpunkt", "Fysiskt kodlås (3-4 siffror) som final", "Alla måste samarbeta — ingen kan lösa ensam"] },
];

const CATEGORIES = [
  { id: "Logik", icon: "🧠", color: "#6677ff" },
  { id: "Chiffer & Kod", icon: "🔐", color: "#00ffd5" },
  { id: "Fysisk & Sök", icon: "🔦", color: "#ff9f1c" },
  { id: "Observation", icon: "👁", color: "#e040fb" },
  { id: "Matte", icon: "🧮", color: "#44ddaa" },
  { id: "Samarbete", icon: "🤝", color: "#ff6699" },
  { id: "Sensorisk", icon: "🎧", color: "#dda844" },
  { id: "Meta & Final", icon: "🏆", color: "#ffd700" },
];

const FLOW_TYPES = [
  { id: "linear", name: "Linjärt", icon: "➡️", desc: "P1 → P2 → P3 — som kapitel i en bok", best: "Små grupper (2-4), nybörjare, filmisk upplevelse", risk: "Flaskhalsar om ett team fastnar" },
  { id: "parallel", name: "Parallellt", icon: "⚡", desc: "Alla pussel tillgängliga direkt", best: "Stora grupper (6+), erfarna spelare", risk: "Kan övervälma nybörjare" },
  { id: "hybrid", name: "Hybrid (rekommenderat)", icon: "🔀", desc: "Parallella spår → konvergerar till final", best: "Alla gruppstorlekar, bästa balans", risk: "Kräver tydlig färgkodning/symboler" },
];

const S = {
  heading: "clamp(0.85rem,1.8vw,1rem)",
  body: "clamp(0.7rem,1.4vw,0.85rem)",
  label: "clamp(0.65rem,1.3vw,0.8rem)",
  small: "clamp(0.6rem,1.2vw,0.75rem)",
};

interface Props {
  onClose: () => void;
  teamCount: number;
  ageRange?: [number, number];
}

export default function PuzzleAdvisor({ onClose, teamCount, ageRange = [7, 12] }: Props) {
  const [tab, setTab] = useState<"browse" | "flow" | "difficulty" | "checklist">("browse");
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [filterAge, setFilterAge] = useState<number>(ageRange[0]);
  const [filterDiff, setFilterDiff] = useState<1 | 2 | 3 | null>(null);
  const [selectedPuzzle, setSelectedPuzzle] = useState<PuzzleType | null>(null);
  const [eventPuzzles, setEventPuzzles] = useState<PuzzleType[]>([]);

  const filtered = PUZZLE_DATABASE.filter((p) => {
    if (filterCat && p.category !== filterCat) return false;
    if (filterAge < p.ageMin || filterAge > p.ageMax) return false;
    if (filterDiff && p.difficulty !== filterDiff) return false;
    return true;
  });

  const totalTime = eventPuzzles.reduce((a, p) => a + p.timeMinutes, 0);
  const diffBalance = {
    easy: eventPuzzles.filter((p) => p.difficulty === 1).length,
    medium: eventPuzzles.filter((p) => p.difficulty === 2).length,
    hard: eventPuzzles.filter((p) => p.difficulty === 3).length,
  };
  const typeBalance = {
    thinking: eventPuzzles.filter((p) => ["Logik", "Chiffer & Kod", "Matte"].includes(p.category)).length,
    action: eventPuzzles.filter((p) => ["Fysisk & Sök", "Sensorisk"].includes(p.category)).length,
    social: eventPuzzles.filter((p) => ["Samarbete", "Observation"].includes(p.category)).length,
  };

  return (
    <div style={{ width: "100vw", minHeight: "100vh", background: "#080c12", fontFamily: FONT, color: "#c0d0e0", padding: 16, overflowY: "auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={onClose} style={{ padding: "8px 14px", background: "transparent", border: "1px solid #2a3a4a", borderRadius: 6, color: "#6a8a9a", fontSize: S.body, fontFamily: FONT, cursor: "pointer" }}>← TILLBAKA</button>
        <span style={{ fontSize: S.label, letterSpacing: "0.15em", color: "#dda844" }}>🧩 PUSSELRÅDGIVARE</span>
      </div>

      {/* Event summary bar */}
      {eventPuzzles.length > 0 && (
        <div style={{ background: "rgba(221,168,68,0.08)", border: "1px solid #dda84430", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ fontSize: S.small, color: "#8a7a4a" }}>VALT: {eventPuzzles.length} pussel</div>
            <div style={{ fontSize: S.body, color: "#dda844", fontWeight: 700 }}>⏱ ~{totalTime} min | 🎯 {diffBalance.easy}L / {diffBalance.medium}M / {diffBalance.hard}S | 🧠{typeBalance.thinking} 🏃{typeBalance.action} 🤝{typeBalance.social}</div>
          </div>
          <button onClick={() => setEventPuzzles([])} style={{ padding: "6px 12px", background: "rgba(100,50,50,0.2)", border: "1px solid #6a3a3a40", borderRadius: 6, color: "#8a5a5a", fontSize: S.small, fontFamily: FONT, cursor: "pointer" }}>RENSA</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 14 }}>
        {[
          { id: "browse", label: "📋 Pussel", desc: "Bläddra & välj" },
          { id: "flow", label: "🔀 Flöde", desc: "Arkitektur" },
          { id: "difficulty", label: "🎯 Svårighet", desc: "5 spakar" },
          { id: "checklist", label: "✅ Checklista", desc: "Kvalitetskoll" },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id as typeof tab)} style={{
            padding: "10px 4px", background: tab === t.id ? "rgba(221,168,68,0.12)" : "rgba(10,16,24,0.6)",
            border: `1px solid ${tab === t.id ? "#dda844" : "#1a2a3a"}`, borderRadius: 8,
            color: tab === t.id ? "#dda844" : "#5a7a8a", fontSize: S.small, fontFamily: FONT,
            cursor: "pointer", textAlign: "center", fontWeight: tab === t.id ? 700 : 400,
          }}>
            <div style={{ fontSize: "1rem" }}>{t.label.split(" ")[0]}</div>
            <div style={{ fontSize: S.small, marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>

      {/* ═══ BROWSE TAB ═══ */}
      {tab === "browse" && (
        <>
          {/* Filters */}
          <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
            <div style={{ fontSize: S.small, color: "#5a7a8a", marginBottom: 8 }}>FILTER</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <button onClick={() => setFilterCat(null)} style={filterBtn(filterCat === null, "#dda844")}>Alla</button>
              {CATEGORIES.map((c) => (
                <button key={c.id} onClick={() => setFilterCat(c.id)} style={filterBtn(filterCat === c.id, c.color)}>{c.icon} {c.id}</button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: S.small, color: "#5a7a8a" }}>Ålder: {filterAge} år</span>
              <input type="range" min={6} max={12} value={filterAge} onChange={(e) => setFilterAge(Number(e.target.value))} style={{ flex: 1, accentColor: "#dda844" }} />
              <div style={{ display: "flex", gap: 4 }}>
                {([1, 2, 3] as const).map((d) => (
                  <button key={d} onClick={() => setFilterDiff(filterDiff === d ? null : d)} style={filterBtn(filterDiff === d, d === 1 ? "#33ff88" : d === 2 ? "#dda844" : "#ff5533")}>{"⭐".repeat(d)}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Results */}
          <div style={{ fontSize: S.small, color: "#5a7a8a", marginBottom: 8 }}>{filtered.length} pussel matchar</div>

          {selectedPuzzle ? (
            <div style={{ background: "rgba(15,22,30,0.8)", border: `1px solid #dda84430`, borderRadius: 10, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: S.heading, color: "#dda844", fontWeight: 700 }}>{selectedPuzzle.categoryIcon} {selectedPuzzle.name}</div>
                <button onClick={() => setSelectedPuzzle(null)} style={{ padding: "4px 10px", background: "transparent", border: "1px solid #2a3a4a", borderRadius: 4, color: "#5a7a8a", fontSize: S.small, fontFamily: FONT, cursor: "pointer" }}>✕</button>
              </div>
              <div style={{ fontSize: S.body, color: "#8aa0b0", lineHeight: 1.7, marginBottom: 12 }}>{selectedPuzzle.description}</div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
                <InfoBox label="ÅLDER" value={`${selectedPuzzle.ageMin}-${selectedPuzzle.ageMax} år`} />
                <InfoBox label="TID" value={`~${selectedPuzzle.timeMinutes} min`} />
                <InfoBox label="SVÅRIGHET" value={"⭐".repeat(selectedPuzzle.difficulty)} />
                <InfoBox label="GRUPP" value={selectedPuzzle.groupSize} />
                <InfoBox label="AKTIVITET" value={selectedPuzzle.physicalActivity} />
                <InfoBox label="RESET" value={selectedPuzzle.resetClass} />
              </div>

              {selectedPuzzle.props.length > 0 && (
                <div style={{ fontSize: S.small, color: "#6a8a9a", marginBottom: 8 }}>
                  📦 Kräver: {selectedPuzzle.props.join(", ")}
                </div>
              )}

              <div style={{ fontSize: S.small, color: "#5a7a8a", marginBottom: 4 }}>Exempel:</div>
              {selectedPuzzle.examples.map((ex, i) => (
                <div key={i} style={{ fontSize: S.small, color: "#7a9aaa", paddingLeft: 10 }}>• {ex}</div>
              ))}

              <div style={{ fontSize: S.small, color: "#5a7a8a", marginTop: 10, marginBottom: 4 }}>💡 Tips:</div>
              {selectedPuzzle.tips.map((tip, i) => (
                <div key={i} style={{ fontSize: S.small, color: "#8a9a6a", paddingLeft: 10, lineHeight: 1.5 }}>• {tip}</div>
              ))}

              <button onClick={() => {
                setEventPuzzles([...eventPuzzles, selectedPuzzle]);
                setSelectedPuzzle(null);
              }} style={{ width: "100%", marginTop: 14, padding: "12px", background: "rgba(51,255,136,0.1)", border: "1px solid #33ff8840", borderRadius: 8, color: "#33ff88", fontSize: S.body, fontFamily: FONT, cursor: "pointer", fontWeight: 700 }}>
                ✓ LÄGG TILL I EVENT ({eventPuzzles.length + 1})
              </button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 8 }}>
              {filtered.map((p) => (
                <button key={p.id} onClick={() => setSelectedPuzzle(p)} style={{
                  padding: "14px 12px", background: eventPuzzles.includes(p) ? "rgba(51,255,136,0.06)" : "rgba(15,22,30,0.8)",
                  border: `1px solid ${eventPuzzles.includes(p) ? "#33ff8830" : "#2a3a4a"}`, borderRadius: 8,
                  cursor: "pointer", textAlign: "left", fontFamily: FONT, touchAction: "manipulation",
                }}>
                  <div style={{ fontSize: S.body, color: CATEGORIES.find((c) => c.id === p.category)?.color || "#8aa0b0", fontWeight: 700 }}>{p.categoryIcon} {p.name}</div>
                  <div style={{ fontSize: S.small, color: "#5a7a8a", marginTop: 4 }}>{"⭐".repeat(p.difficulty)} — {p.ageMin}-{p.ageMax} år — ~{p.timeMinutes}min</div>
                  <div style={{ fontSize: S.small, color: "#4a6a7a", marginTop: 3, lineHeight: 1.4 }}>{p.description.slice(0, 60)}...</div>
                  {eventPuzzles.includes(p) && <div style={{ fontSize: S.small, color: "#33ff88", marginTop: 4 }}>✓ Vald</div>}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═══ FLOW TAB ═══ */}
      {tab === "flow" && (
        <div>
          <div style={{ fontSize: S.label, color: "#5a7a8a", marginBottom: 10 }}>PUSSELFLÖDE — Välj arkitektur</div>
          {FLOW_TYPES.map((f) => (
            <div key={f.id} style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: S.heading, color: "#dda844", fontWeight: 700, marginBottom: 6 }}>{f.icon} {f.name}</div>
              <div style={{ fontSize: S.body, color: "#8aa0b0", lineHeight: 1.7, marginBottom: 8 }}>{f.desc}</div>
              <div style={{ fontSize: S.small, color: "#5a8a6a" }}>✓ Bäst för: {f.best}</div>
              <div style={{ fontSize: S.small, color: "#8a5a4a", marginTop: 2 }}>⚠ Risk: {f.risk}</div>
            </div>
          ))}

          <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #dda84420", borderRadius: 10, padding: 16, marginTop: 14 }}>
            <div style={{ fontSize: S.heading, color: "#dda844", fontWeight: 700, marginBottom: 8 }}>🎭 Treaktsstruktur (pacing)</div>
            <div style={{ fontSize: S.body, color: "#8aa0b0", lineHeight: 1.8 }}>
              <strong style={{ color: "#6677ff" }}>Akt I</strong> (5-10 min) — Orientering. Enkla pussel som lär ut mekaniker.<br />
              <strong style={{ color: "#ff9f1c" }}>Akt II</strong> (huvuddelen) — Eskalerande utmaningar. Varva tänk + action.<br />
              <strong style={{ color: "#ff3300" }}>Akt III</strong> (10-15 min) — Klimax. Slutpussel som kombinerar allt.
            </div>
            <div style={{ fontSize: S.small, color: "#6a8a6a", marginTop: 10, padding: "8px 10px", background: "rgba(51,255,136,0.04)", borderRadius: 6 }}>
              💡 <strong>Alterneringsprincipen:</strong> Varva tänkpussel (kod, logik) med actionpussel (sök, fysiskt) för att undvika mental utmattning.
            </div>
          </div>
        </div>
      )}

      {/* ═══ DIFFICULTY TAB ═══ */}
      {tab === "difficulty" && (
        <div>
          <div style={{ fontSize: S.label, color: "#5a7a8a", marginBottom: 10 }}>SVÅRIGHETSKALIBRERING — 5 Spakar</div>
          {[
            { name: "Antal steg", desc: "1 steg = enkelt → 4-5 steg = avancerat", tip: "Barn 6-8: max 2 steg. Barn 9-12: max 4 steg." },
            { name: "Signaltydlighet", desc: "Explicit instruktion → ingen vägledning", tip: "Nybörjare: 'Sök under bordet'. Expert: inga ledtrådar." },
            { name: "Distraktioner", desc: "Inga → tematiska vilseledare", tip: "Undvik för barn <9 år. Red herrings frustrerar yngre." },
            { name: "Abstraktionsnivå", desc: "Bokstavligt → metaforiskt/symboliskt", tip: "'Hitta nyckeln' (bokstavligt) vs 'Nyckeln ligger i musiken' (abstrakt)" },
            { name: "Tidspress", desc: "Gott om tid → snäv deadline", tip: "Timer skapar spänning men stress under 8 år." },
          ].map((lever, i) => (
            <div key={i} style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
              <div style={{ fontSize: S.body, color: "#dda844", fontWeight: 700 }}>{i + 1}. {lever.name}</div>
              <div style={{ fontSize: S.small, color: "#8aa0b0", marginTop: 4 }}>{lever.desc}</div>
              <div style={{ fontSize: S.small, color: "#6a8a6a", marginTop: 4 }}>💡 {lever.tip}</div>
            </div>
          ))}

          <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #ff884430", borderRadius: 10, padding: 16, marginTop: 10 }}>
            <div style={{ fontSize: S.body, color: "#ff8844", fontWeight: 700 }}>⚠ Kalibreringsprincip</div>
            <div style={{ fontSize: S.body, color: "#8aa0b0", marginTop: 6, lineHeight: 1.7 }}>
              &quot;Fler lager av lättare ledtrådar slår färre svårare.&quot;<br />
              Om samma ledtråd behövs i mer än 50% av sessionerna → pusslet är trasigt och behöver redesignas.
            </div>
          </div>

          <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: 16, marginTop: 10 }}>
            <div style={{ fontSize: S.body, color: "#6677ff", fontWeight: 700 }}>Målvärden per ålder</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 8 }}>
              <InfoBox label="6-8 ÅR" value="95% clearrate" />
              <InfoBox label="9-12 ÅR" value="85-90% clearrate" />
              <InfoBox label="VUXNA" value="70-80% clearrate" />
            </div>
          </div>
        </div>
      )}

      {/* ═══ CHECKLIST TAB ═══ */}
      {tab === "checklist" && (
        <div>
          <div style={{ fontSize: S.label, color: "#5a7a8a", marginBottom: 10 }}>KVALITETSCHECKLISTA</div>

          <CheckSection title="🎭 Narrativ grund (3 frågor)" items={[
            "Varför är spelarna 'låsta'? (Narrativ anledning att vara här)",
            "Varför MÅSTE de lösa pusslen? (Stakes/motivation)",
            "Varför finns pusslen i detta rum? (Diegetisk logik)",
          ]} />

          <CheckSection title="⚖️ Balans" items={[
            `Varvar tänk + action? (${typeBalance.thinking} tänk, ${typeBalance.action} action, ${typeBalance.social} social)`,
            `Total tid ~${totalTime} min (mål: 45-60 min inkl intro/final)`,
            `Svårighetsbalans: ${diffBalance.easy} lätta, ${diffBalance.medium} medel, ${diffBalance.hard} svåra`,
            "Första pusslet 'primar' — lär ut mekanik som behövs senare?",
            "Slutpussel kräver bidrag från ALLA team?",
          ]} />

          <CheckSection title="🔄 Reset & drift" items={[
            "Alla pussel klassificerade (auto/quick/manual)?",
            "Maximal reset-tid mellan kalas < 10 min?",
            "Fotodokumentation för reset finns?",
            "Backup om teknik krånglar (alternativ lösningsväg)?",
          ]} />

          <CheckSection title="💡 Ledtrådssystem" items={[
            "3 nivåer per pussel: riktning → specificering → direkt guide?",
            "Instruktören har facit med alla svar?",
            "Ledtrådarna testad — behövs de verkligen?",
          ]} />

          <CheckSection title="📦 Materiallista" items={[
            ...Array.from(new Set(eventPuzzles.flatMap((p) => p.props))).map((prop) => `${prop}`),
            ...(eventPuzzles.flatMap((p) => p.props).length === 0 ? ["(Lägg till pussel för att generera materiallista)"] : []),
          ]} />
        </div>
      )}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "rgba(10,16,24,0.6)", border: "1px solid #1a2530", borderRadius: 6, padding: "8px 6px", textAlign: "center" }}>
      <div style={{ fontSize: S.small, color: "#4a6a7a", letterSpacing: "0.08em", marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: S.body, color: "#8aa0b0", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function CheckSection({ title, items }: { title: string; items: string[] }) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  return (
    <div style={{ background: "rgba(15,22,30,0.8)", border: "1px solid #1a2a3a", borderRadius: 10, padding: "14px 16px", marginBottom: 10 }}>
      <div style={{ fontSize: S.body, color: "#dda844", fontWeight: 700, marginBottom: 8 }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} onClick={() => setChecked({ ...checked, [i]: !checked[i] })} style={{
          display: "flex", alignItems: "flex-start", gap: 8, padding: "6px 0", cursor: "pointer",
          borderBottom: i < items.length - 1 ? "1px solid #1a2530" : "none",
        }}>
          <span style={{ fontSize: "0.9rem", flexShrink: 0, marginTop: 1 }}>{checked[i] ? "✅" : "⬜"}</span>
          <span style={{ fontSize: S.small, color: checked[i] ? "#5a8a6a" : "#7a9aaa", lineHeight: 1.5, textDecoration: checked[i] ? "line-through" : "none" }}>{item}</span>
        </div>
      ))}
    </div>
  );
}

function filterBtn(active: boolean, color: string) {
  return {
    padding: "6px 10px", background: active ? `${color}15` : "rgba(10,16,24,0.6)",
    border: `1px solid ${active ? color : "#2a3a4a"}`, borderRadius: 6,
    color: active ? color : "#5a7a8a", fontSize: S.small, fontFamily: FONT,
    cursor: "pointer", touchAction: "manipulation" as const,
  } as const;
}
