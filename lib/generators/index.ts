import { StationType, GeneratorConfig, GeneratedMission, Hint } from "../types";

// ═══════════════════════════════════════════════════════════════
// STATION LIBRARY — All station types with generators
// ═══════════════════════════════════════════════════════════════

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)];
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rngInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

// Swedish alphabet for ciphers
const ALPHA_SV = "ABCDEFGHIJKLMNOPQRSTUVWXYZÅÄÖ";

// Theme-aware briefing wrapper
function brief(cfg: GeneratorConfig, text: string): string {
  const v = cfg.theme.vocabulary;
  return text
    .replace(/\{agent\}/g, v.agent.toLowerCase() + "er")
    .replace(/\{Agent\}/g, v.agent + "ER")
    .replace(/\{symbol\}/g, cfg.teamSymbol)
    .replace(/\{team\}/g, cfg.teamName)
    .replace(/\{mission\}/g, v.mission.toLowerCase())
    .replace(/\{station\}/g, v.station.toLowerCase())
    .replace(/\{hq\}/g, v.hq);
}

// ─── CIPHER GENERATORS ───────────────────────────────────────

function generateCaesarCipher(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const shift = cfg.difficulty === 1 ? rngInt(1, 3, rng) : cfg.difficulty === 2 ? rngInt(3, 5, rng) : rngInt(4, 7, rng);
  const words = ["AGENT", "HEMLIG", "SPION", "KRYPTO", "SKYDD", "SIGNAL", "RADAR", "PILOT", "KRAFT", "STORM"];
  const word = pick(words, rng);
  const coded = word.split("").map((c) => {
    const i = ALPHA_SV.indexOf(c);
    return i >= 0 ? ALPHA_SV[(i + shift) % ALPHA_SV.length] : c;
  }).join("");
  const answer = String(word.length * shift).padStart(2, "0").slice(-3);
  const answerLen = answer.length;

  const keyTable = ALPHA_SV.split("").map((c, i) => `${c}→${ALPHA_SV[(i + shift) % ALPHA_SV.length]}`).join(", ");

  return {
    title: "CAESARCHIFFER",
    briefing: brief(cfg, `{Agent} — ett kodat meddelande har fångats upp. Använd chiffernyckeln vid er {station} för att avkoda det. Varje bokstav skiftas ${shift} steg framåt. Avkoda ordet och beräkna: antal bokstäver × ${shift}.`),
    answer,
    answerLen,
    hints: [
      { text: `Chiffernyckeln visar vilken bokstav som blir vilken. Jobba bakåt. Koden lyder: ${coded}`, level: "mild" },
      { text: `Prova att skifta tillbaka ${shift} steg. Första bokstaven i det avkodade ordet är ${word[0]}.`, level: "medium" },
      { text: `Ordet är "${word}". Det har ${word.length} bokstäver. ${word.length} × ${shift} = ${answer}.`, level: "strong" },
    ],
    successMsg: "Chiffret knäckt. Kryptografiskt geni.",
    printData: {
      sheets: [
        { type: "cipher_key", title: `Caesarchiffer — Nyckel (shift +${shift})`, content: { keyTable, shift }, forInstructor: false },
        { type: "coded_message", title: "Kodat meddelande", content: { coded, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Caesarchiffer", content: { word, coded, shift, answer, formula: `${word.length} × ${shift} = ${answer}` }, forInstructor: true },
      ],
    },
    instructorNotes: `Skriv ut chiffernyckeln och det kodade meddelandet. Placera vid teamets ${cfg.theme.vocabulary.station.toLowerCase()}.`,
  };
}

function generateMirrorCipher(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const mirror: Record<string, string> = {};
  const half1 = ALPHA_SV.slice(0, Math.ceil(ALPHA_SV.length / 2));
  const half2 = ALPHA_SV.slice(Math.ceil(ALPHA_SV.length / 2)).split("").reverse().join("");
  for (let i = 0; i < half1.length; i++) {
    if (i < half2.length) {
      mirror[half1[i]] = half2[i];
      mirror[half2[i]] = half1[i];
    }
  }
  const words = ["HEMLIGHET", "UPPDRAG", "FARLIGT", "VAPEN", "KARTA"];
  const word = pick(words, rng);
  const coded = word.split("").map((c) => mirror[c] || c).join("");
  const answer = String(word.length * 7).padStart(2, "0").slice(-3);

  return {
    title: "SPEGELCHIFFER",
    briefing: brief(cfg, `{Agent} — avkoda meddelandet med spegelchiffret. Varje bokstav byts mot sin "spegling" i alfabetet. Använd spegeltabellen vid er {station}. Avkoda och beräkna: antal bokstäver × 7.`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: `Koden lyder: ${coded}. Spegeltabellen visar alla byten.`, level: "mild" },
      { text: `Första bokstaven i klartext är ${word[0]}. Jobba vidare bokstav för bokstav.`, level: "medium" },
      { text: `Ordet är "${word}". ${word.length} × 7 = ${answer}.`, level: "strong" },
    ],
    successMsg: "Spegelchiffret besegrat.",
    printData: {
      sheets: [
        { type: "mirror_table", title: "Spegeltabell", content: { mirror, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "coded_message", title: "Kodat meddelande", content: { coded }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Spegelchiffer", content: { word, coded, answer }, forInstructor: true },
      ],
    },
    instructorNotes: "Skriv ut spegeltabellen och det kodade meddelandet.",
  };
}

function generateNumberCipher(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const op = cfg.difficulty === 1 ? rngInt(2, 4, rng) : rngInt(3, 6, rng);
  const digits = [rngInt(1, 9, rng), rngInt(1, 9, rng), rngInt(1, 9, rng)];
  const coded = digits.map((d) => ((d + op) % 10));
  const answer = digits.join("");

  return {
    title: "SIFFERCHIFFER",
    briefing: brief(cfg, `{Agent} — varje siffra i den kodade koden har ökats med ${op}. Om resultatet överstiger 9 börjar det om från 0. Avkoda och rapportera.`),
    answer,
    answerLen: 3,
    hints: [
      { text: `Subtrahera ${op} från varje siffra. Om resultatet är negativt, addera 10.`, level: "mild" },
      { text: `Den kodade koden är: ${coded.join("")}. Första siffran: ${coded[0]} - ${op} = ${digits[0]}.`, level: "medium" },
      { text: `Svaret är ${answer}.`, level: "strong" },
    ],
    successMsg: "Sifferkoden avkodad.",
    printData: {
      sheets: [
        { type: "number_cipher", title: "Sifferchiffer", content: { rule: `Subtrahera ${op} från varje siffra`, coded: coded.join(""), teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Sifferchiffer", content: { coded: coded.join(""), answer, op }, forInstructor: true },
      ],
    },
    instructorNotes: `Skriv ut regel-kortet med den kodade siffran ${coded.join("")}.`,
  };
}

function generateSymbolTable(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const symbols = shuffle(["★", "▲", "●", "■", "♦", "♠", "♣", "♥", "◆", "▼", "○", "□", "△", "☆", "◇", "⬡", "⬟", "✦", "✧", "✶", "✴", "❖", "⊕", "⊗", "⊘", "⊙", "⊛", "⊜", "⊝"], rng);
  const mapping: Record<string, string> = {};
  for (let i = 0; i < ALPHA_SV.length; i++) {
    mapping[ALPHA_SV[i]] = symbols[i % symbols.length];
  }
  const words = ["KOD", "SPY", "BAS", "MÅL", "VÄG"];
  const word = pick(words, rng);
  const coded = word.split("").map((c) => mapping[c] || c).join(" ");
  const answer = String(word.length * 13).padStart(2, "0").slice(-3);

  return {
    title: "SYMBOLTABELL",
    briefing: brief(cfg, `{Agent} — ett meddelande i symboler har fångats upp. Använd symboltabellen för att avkoda. Antal bokstäver × 13 = koden.`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: `Meddelandet: ${coded}. Slå upp varje symbol i tabellen.`, level: "mild" },
      { text: `Första symbolen är ${mapping[word[0]]} som motsvarar bokstaven ${word[0]}.`, level: "medium" },
      { text: `Ordet är "${word}". ${word.length} × 13 = ${answer}.`, level: "strong" },
    ],
    successMsg: "Symbolkoden tolkad.",
    printData: {
      sheets: [
        { type: "symbol_table", title: "Symboltabell", content: { mapping, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "coded_message", title: "Kodat meddelande (symboler)", content: { coded }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Symboltabell", content: { word, coded, answer }, forInstructor: true },
      ],
    },
    instructorNotes: "Skriv ut symboltabellen och det kodade meddelandet.",
  };
}

function generateMorseCode(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const morse: Record<string, string> = {
    A: ".-", B: "-...", C: "-.-.", D: "-..", E: ".", F: "..-.", G: "--.", H: "....", I: "..", J: ".---",
    K: "-.-", L: ".-..", M: "--", N: "-.", O: "---", P: ".--.", Q: "--.-", R: ".-.", S: "...", T: "-",
    U: "..-", V: "...-", W: ".--", X: "-..-", Y: "-.--", Z: "--..",
    "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
    "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  };
  const words = ["SOS", "KOD", "HIT", "MÅL", "FYR"];
  const word = pick(words, rng);
  const coded = word.split("").map((c) => morse[c] || c).join(" / ");
  const multiplier = rngInt(2, 5, rng);
  const answer = String(word.length * multiplier).padStart(2, "0");

  return {
    title: "MORSEKOD",
    briefing: brief(cfg, `{Agent} — ett morsemeddelande har fångats upp. Avkoda och beräkna: antal bokstäver × ${multiplier}.`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: `Morsemeddelandet: ${coded}. Använd referenskortet.`, level: "mild" },
      { text: `Första bokstaven: ${morse[word[0]]} = ${word[0]}.`, level: "medium" },
      { text: `Ordet är "${word}". ${word.length} × ${multiplier} = ${answer}.`, level: "strong" },
    ],
    successMsg: "Morsemeddelande avkodat.",
    printData: {
      sheets: [
        { type: "morse_ref", title: "Morsekod — Referens", content: { morse }, forInstructor: false },
        { type: "coded_message", title: "Morsemeddelande", content: { coded, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Morsekod", content: { word, coded, answer }, forInstructor: true },
      ],
    },
    instructorNotes: "Skriv ut morse-referenskortet och meddelandet.",
  };
}

function generateBinaryCode(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const d1 = rngInt(1, 9, rng);
  const d2 = rngInt(1, 9, rng);
  const d3 = rngInt(1, 9, rng);
  const toBin = (n: number) => n.toString(2).padStart(4, "0");
  const answer = `${d1}${d2}${d3}`;

  return {
    title: "BINÄRKOD",
    briefing: brief(cfg, `{Agent} — tre siffror har kodats i binärt (ettor och nollor). Omvandla till decimala siffror och rapportera koden.`),
    answer,
    answerLen: 3,
    hints: [
      { text: `De binära talen: ${toBin(d1)}, ${toBin(d2)}, ${toBin(d3)}. Binär-referensen hjälper er.`, level: "mild" },
      { text: `${toBin(d1)} = ${d1} i decimal.`, level: "medium" },
      { text: `Svaret: ${answer}.`, level: "strong" },
    ],
    successMsg: "Binärkoden omvandlad.",
    printData: {
      sheets: [
        { type: "binary_ref", title: "Binär referens", content: { table: Array.from({ length: 10 }, (_, i) => ({ decimal: i, binary: i.toString(2).padStart(4, "0") })) }, forInstructor: false },
        { type: "coded_message", title: "Binärkodade siffror", content: { codes: [toBin(d1), toBin(d2), toBin(d3)], teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Binärkod", content: { answer, binary: [toBin(d1), toBin(d2), toBin(d3)] }, forInstructor: true },
      ],
    },
    instructorNotes: "Skriv ut binär-referensen och de kodade siffrorna.",
  };
}

// ─── LOGIC & MATH GENERATORS ─────────────────────────────────

function generateEquation(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const age = cfg.ageRange[0];
  let equation: string, answer: string;

  if (age <= 8 || cfg.difficulty === 1) {
    const a = rngInt(10, 40, rng);
    const b = rngInt(5, 25, rng);
    answer = String(a + b);
    equation = `${a} + ${b} = ?`;
  } else if (age <= 10 || cfg.difficulty === 2) {
    const a = rngInt(3, 9, rng);
    const b = rngInt(3, 9, rng);
    answer = String(a * b);
    equation = `${a} × ${b} = ?`;
  } else {
    const x = rngInt(5, 20, rng);
    const b = rngInt(3, 15, rng);
    const result = x + b;
    answer = String(x);
    equation = `X + ${b} = ${result}. Vad är X?`;
  }

  return {
    title: "EKVATION",
    briefing: brief(cfg, `{Agent} — lös ekvationen för att få koden. ${equation}`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: "Ta det steg för steg. Skriv ner på papper om det hjälper.", level: "mild" },
      { text: `Svaret har ${answer.length} siffror.`, level: "medium" },
      { text: `Svaret är ${answer}.`, level: "strong" },
    ],
    successMsg: "Ekvation löst. Matematiskt sinne.",
    printData: {
      sheets: [
        { type: "equation_card", title: "Ekvation", content: { equation, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Ekvation", content: { equation, answer }, forInstructor: true },
      ],
    },
    instructorNotes: `Ekvationskort med: ${equation}`,
  };
}

function generateNumberSequence(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const diff = rngInt(2, 6, rng);
  const start = rngInt(1, 10, rng);
  const seq = Array.from({ length: 5 }, (_, i) => start + i * diff);
  const answer = String(seq[4]);

  return {
    title: "TALFÖLJD",
    briefing: brief(cfg, `{Agent} — hitta mönstret och fyll i det saknade talet: ${seq.slice(0, 4).join(", ")}, ?`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: "Titta på skillnaden mellan varje tal.", level: "mild" },
      { text: `Mönstret ökar med ${diff} för varje steg.`, level: "medium" },
      { text: `Nästa tal: ${seq[3]} + ${diff} = ${answer}.`, level: "strong" },
    ],
    successMsg: "Mönstret funnet.",
    printData: {
      sheets: [
        { type: "sequence_card", title: "Talföljd", content: { sequence: [...seq.slice(0, 4), "?"], teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Talföljd", content: { sequence: seq, diff, answer }, forInstructor: true },
      ],
    },
    instructorNotes: `Talföljd: ${seq.slice(0, 4).join(", ")}, ? (svar: ${answer})`,
  };
}

function generateCoordinateHunt(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const rows = "ABCDEF";
  const cols = "123456";
  const grid: string[][] = [];
  const letters = shuffle("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""), rng);
  let li = 0;
  for (let r = 0; r < 6; r++) {
    grid[r] = [];
    for (let c = 0; c < 6; c++) {
      grid[r][c] = letters[li++ % letters.length];
    }
  }
  const coords: { row: number; col: number }[] = [];
  const digits: string[] = [];
  for (let i = 0; i < 3; i++) {
    const r = rngInt(0, 5, rng);
    const c = rngInt(0, 5, rng);
    const d = String(rngInt(1, 9, rng));
    grid[r][c] = d;
    coords.push({ row: r, col: c });
    digits.push(d);
  }
  const answer = digits.join("");

  return {
    title: "KOORDINATJAKT",
    briefing: brief(cfg, `{Agent} — använd rutnätet och läs av koordinaterna: ${coords.map((c) => `${rows[c.row]}${cols[c.col]}`).join(", ")}. Siffrorna ger koden.`),
    answer,
    answerLen: 3,
    hints: [
      { text: "Rad = bokstav (A-F), kolumn = siffra (1-6). Hitta korsningen.", level: "mild" },
      { text: `Första koordinaten ${rows[coords[0].row]}${cols[coords[0].col]} ger: ${digits[0]}.`, level: "medium" },
      { text: `Svaret: ${answer}.`, level: "strong" },
    ],
    successMsg: "Koordinater avlästa.",
    printData: {
      sheets: [
        { type: "coordinate_grid", title: "Koordinatrutnät", content: { grid, rows: rows.split(""), cols: cols.split(""), targetCoords: coords.map((c) => `${rows[c.row]}${cols[c.col]}`), teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Koordinatjakt", content: { coords: coords.map((c) => `${rows[c.row]}${cols[c.col]}`), digits, answer }, forInstructor: true },
      ],
    },
    instructorNotes: "Skriv ut rutnätet. Koordinaterna står i briefingen.",
  };
}

function generateLogicPuzzle(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const names = shuffle(["Alex", "Kim", "Sam"], rng);
  const animals = shuffle(["hund", "katt", "fisk"], rng);
  const colors = shuffle(["röd", "blå", "grön"], rng);
  const targetIdx = 0;
  const answer = String(rngInt(100, 999, rng));

  const clues = [
    `${names[0]} har en ${animals[0]}.`,
    `Personen med ${colors[1]} hus har inte en ${animals[0]}.`,
    `${names[2]} bor i det ${colors[2]} huset.`,
  ];

  return {
    title: "LOGIKPUSSEL",
    briefing: brief(cfg, `{Agent} — lös logikpusslet. ${clues.join(" ")} Vilken färg har ${names[targetIdx]}s hus? Koden finns på färgkortet med den färgen.`),
    answer,
    answerLen: 3,
    hints: [
      { text: "Börja med det du vet säkert och uteslut.", level: "mild" },
      { text: `${names[2]} bor i ${colors[2]} hus. ${names[0]} har ${animals[0]} och bor inte i ${colors[1]} hus.`, level: "medium" },
      { text: `${names[0]} bor i det ${colors[0]} huset. Koden på ${colors[0]} kortet: ${answer}.`, level: "strong" },
    ],
    successMsg: "Logikpussel löst. Skarp deduktion.",
    printData: {
      sheets: [
        { type: "logic_puzzle", title: "Logikpussel", content: { clues, names, question: `Vilken färg har ${names[targetIdx]}s hus?`, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "color_cards", title: "Färgkort", content: { cards: colors.map((c, i) => ({ color: c, code: i === 0 ? answer : String(rngInt(100, 999, rng)) })) }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Logikpussel", content: { solution: `${names[0]} → ${colors[0]}`, answer }, forInstructor: true },
      ],
    },
    instructorNotes: `Placera tre färgkort (${colors.join(", ")}) i teamets område. Koden ${answer} på ${colors[0]} kortet.`,
  };
}

// ─── PHYSICAL ACTIVITY GENERATORS ────────────────────────────

function generateUVHunt(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const count = cfg.difficulty === 1 ? 3 : cfg.difficulty === 2 ? 4 : 5;
  const digits = Array.from({ length: count }, () => rngInt(1, 9, rng));
  const sum = digits.reduce((a, b) => a + b, 0);
  const answer = String(sum);

  return {
    title: "UV-JAKT",
    briefing: brief(cfg, `{Agent} — dolda meddelanden finns i rummet, synliga med UV-lampa. Hitta alla markerade med {symbol}. Varje meddelande har en siffra. Addera alla siffror.`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: `Det finns ${count} dolda meddelanden med ${cfg.teamSymbol}-symbolen.`, level: "mild" },
      { text: `De första siffrorna: ${digits.slice(0, 2).join(", ")}...`, level: "medium" },
      { text: `Alla siffror: ${digits.join(" + ")} = ${answer}.`, level: "strong" },
    ],
    successMsg: "UV-jakt klarad. Ni ser det osynliga.",
    printData: {
      sheets: [
        { type: "uv_instructions", title: "UV-jakt — Instruktörsblad", content: { digits, placements: digits.map((d, i) => `Siffra ${d} — plats ${i + 1}`), teamSymbol: cfg.teamSymbol, answer }, forInstructor: true },
      ],
    },
    instructorNotes: `Skriv med UV-penna: ${digits.map((d, i) => `${cfg.teamSymbol}${d} (plats ${i + 1})`).join(", ")}. Svar: ${answer}.`,
  };
}

function generateLaserMaze(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const code = Array.from({ length: 4 }, () => rngInt(1, 9, rng)).join("");

  return {
    title: "LASERLABYRINT",
    briefing: brief(cfg, `{Agent} — ta er genom laserlabyrinten utan att röra en stråle. Vid slutet finns en kod. Memorera och rapportera.`),
    answer: code,
    answerLen: 4,
    hints: [
      { text: "Böj er under de höga strålarna, kliv över de låga.", level: "mild" },
      { text: `Koden finns vid slutet. Den börjar med ${code[0]}.`, level: "medium" },
      { text: `Koden: ${code}.`, level: "strong" },
    ],
    successMsg: "Labyrinten besegrad. Ingen stråle bruten.",
    printData: {
      sheets: [
        { type: "laser_code", title: "Laserlabyrint — Kodlapp", content: { code, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Laserlabyrint", content: { code, notes: "Placera kodlappen vid slutet av labyrinten." }, forInstructor: true },
      ],
    },
    instructorNotes: `Spänn snören/rep som "laserstrålar". Placera kodlappen ${code} vid slutet.`,
  };
}

function generatePuzzlePieces(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const digits = Array.from({ length: 4 }, () => rngInt(1, 9, rng));
  const answer = digits.join("");
  const corners = ["★", "▽", "◇", "✦"];

  return {
    title: "PUSSELBITAR",
    briefing: brief(cfg, `{Agent} — hitta de fyra pusselbitarna gömda i ert område (markerade {symbol}). Varje bit har en siffra. Lägg ihop pusslet — hörnsymbolerna visar ordningen: ${corners.join(" → ")}.`),
    answer,
    answerLen: 4,
    hints: [
      { text: `Bitarna är gömda nära föremål med er symbol ${cfg.teamSymbol}.`, level: "mild" },
      { text: `Ordningen styrs av hörnsymbolerna. Börja med ${corners[0]} = ${digits[0]}.`, level: "medium" },
      { text: `Ordning: ${corners.map((c, i) => `${c}=${digits[i]}`).join(", ")}. Koden: ${answer}.`, level: "strong" },
    ],
    successMsg: "Pusslet löst. Perfekt precision.",
    printData: {
      sheets: [
        { type: "puzzle_pieces", title: "Pusselbitar — Klipp ut", content: { pieces: digits.map((d, i) => ({ digit: d, corner: corners[i] })), teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Pusselbitar", content: { answer, pieces: digits.map((d, i) => `${corners[i]}=${d}`), notes: "Klipp ut och göm bitarna i teamets område." }, forInstructor: true },
      ],
    },
    instructorNotes: `Klipp ut 4 pusselbitar (${digits.join(", ")}). Göm i teamets område med ${cfg.teamSymbol}.`,
  };
}

function generateSecretCourier(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const code = String(rngInt(100, 999, rng));

  return {
    title: "HEMLIG KURIRVÄG",
    briefing: brief(cfg, `{Agent} — ett barn i teamet får se en hemlig kod och ska förmedla den till de andra UTAN att prata (gester, teckning, knackning). De andra matar in koden.`),
    answer: code,
    answerLen: 3,
    hints: [
      { text: "Kuriren kan rita i luften eller knacka antal.", level: "mild" },
      { text: `Koden har tre siffror. Första siffran är ${code[0]}.`, level: "medium" },
      { text: `Koden: ${code}.`, level: "strong" },
    ],
    successMsg: "Budskapet levererat. Tyst kommunikation perfekt.",
    printData: {
      sheets: [
        { type: "courier_code", title: "Hemlig kod (bara kuriren ser)", content: { code, teamSymbol: cfg.teamSymbol, rules: "Visa koden för ETT barn. Barnet ska förmedla koden UTAN att prata." }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Hemlig kurirväg", content: { code }, forInstructor: true },
      ],
    },
    instructorNotes: `Visa koden ${code} för ett barn. Det barnet förmedlar tyst till de andra.`,
  };
}

// ─── OBSERVATION GENERATORS ──────────────────────────────────

function generateReconnaissance(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const d1 = rngInt(2, 8, rng);
  const d2 = rngInt(1, 4, rng);
  const d3 = rngInt(1, 5, rng);
  const answer = `${d1}${d2}${d3}`;

  return {
    title: "REKOGNOSERING",
    briefing: brief(cfg, `{Agent} — svara på tre frågor om er omgivning. Fråga 1: Hur många stolar finns i rummet? Fråga 2: Vilken färg har dörren? (1=röd 2=blå 3=vit 4=svart). Fråga 3: Hur många fönster?`),
    answer,
    answerLen: 3,
    hints: [
      { text: "Räkna noggrant. Missa inte dolda stolar.", level: "mild" },
      { text: `Stolar: ${d1}. Kolla dörren noga.`, level: "medium" },
      { text: `Stolar: ${d1}, dörr: ${d2}, fönster: ${d3}. Koden: ${answer}.`, level: "strong" },
    ],
    successMsg: "Rekognosering komplett.",
    printData: {
      sheets: [
        { type: "recon_questions", title: "Rekognosering — Frågor", content: { questions: [`Hur många stolar? (svar: ${d1})`, `Dörrfärg: 1=röd 2=blå 3=vit 4=svart (svar: ${d2})`, `Antal fönster? (svar: ${d3})`], answer, teamSymbol: cfg.teamSymbol }, forInstructor: true },
      ],
    },
    instructorNotes: `Anpassa frågorna efter rummet. Standardsvar: ${d1}, ${d2}, ${d3} = ${answer}. ÄNDRA till korrekta svar.`,
  };
}

function generateMemoryTest(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const d1 = rngInt(2, 5, rng);
  const d2 = rngInt(2, 5, rng);
  const d3 = rngInt(1, 3, rng);
  const d4 = rngInt(5, 10, rng);
  const answer = `${d1}${d2}${d3}${d4}`;

  return {
    title: "MINNESTEST",
    briefing: brief(cfg, `{Agent} — vid er {station} finns föremål under en duk. Ni får titta i 30 sekunder. Sen täcks de. Ange: antal RÖDA + antal RUNDA + antal med TEXT + TOTALT.`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: "Dela upp uppgifterna — en räknar röda, en räknar runda, en tittar på text.", level: "mild" },
      { text: `Det finns ${d1} röda och ${d2} runda föremål.`, level: "medium" },
      { text: `Röda=${d1}, Runda=${d2}, Text=${d3}, Totalt=${d4}. Koden: ${answer}.`, level: "strong" },
    ],
    successMsg: "Perfekt minne. En agent glömmer aldrig.",
    printData: {
      sheets: [
        { type: "memory_instructions", title: "Minnestest — Instruktörsblad", content: { answer, items: { red: d1, round: d2, withText: d3, total: d4 }, teamSymbol: cfg.teamSymbol, notes: "Lägg ut föremål som matchar dessa siffror. Täck med en duk." }, forInstructor: true },
      ],
    },
    instructorNotes: `Lägg ut föremål: ${d1} röda, ${d2} runda, ${d3} med text, ${d4} totalt. Svar: ${answer}.`,
  };
}

function generateShadowing(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const code = String(rngInt(100, 999, rng));
  const descriptions = ["Personen har glasögon och blått hår.", "Personen bär en röd jacka och har kort hår.", "Personen har en hatt och skägg."];
  const desc = pick(descriptions, rng);

  return {
    title: "SKUGGNING",
    briefing: brief(cfg, `{Agent} — instruktören ger en beskrivning av en person. Hitta rätt foto bland bilderna i ert område ({symbol}). Koden finns på baksidan.`),
    answer: code,
    answerLen: 3,
    hints: [
      { text: "Lyssna noga på alla detaljer: hårfärg, kläder, accessoarer.", level: "mild" },
      { text: `Personen har något specifikt. ${desc.split(".")[0]}.`, level: "medium" },
      { text: `Koden: ${code}.`, level: "strong" },
    ],
    successMsg: "Målet identifierat. Perfekt skuggning.",
    printData: {
      sheets: [
        { type: "shadow_instructions", title: "Skuggning — Instruktörsblad", content: { description: desc, correctCode: code, teamSymbol: cfg.teamSymbol, notes: "Skriv ut foton eller beskriv. Skriv koden på baksidan av rätt foto." }, forInstructor: true },
      ],
    },
    instructorNotes: `Beskriv: "${desc}". Rätt fotos kod: ${code}.`,
  };
}

function generateSpotDifference(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const diffCount = rngInt(3, 7, rng);
  const answer = String(diffCount);

  return {
    title: "HITTA SKILLNADEN",
    briefing: brief(cfg, `{Agent} — studera de två bilderna vid er {station}. Hitta alla skillnader. Antal skillnader = koden.`),
    answer,
    answerLen: answer.length,
    hints: [
      { text: "Jämför systematiskt: gå uppifrån ner, vänster till höger.", level: "mild" },
      { text: `Det finns fler än ${diffCount - 2} skillnader.`, level: "medium" },
      { text: `Det finns exakt ${diffCount} skillnader. Koden: ${answer}.`, level: "strong" },
    ],
    successMsg: "Alla skillnader funna. Skarpt öga.",
    printData: {
      sheets: [
        { type: "spot_diff_instructions", title: "Hitta skillnaden — Instruktörsblad", content: { diffCount, answer, teamSymbol: cfg.teamSymbol, notes: "Skriv ut eller rita två nästan identiska bilder med exakt detta antal skillnader." }, forInstructor: true },
      ],
    },
    instructorNotes: `Skapa två bilder med exakt ${diffCount} skillnader. Svar: ${answer}.`,
  };
}

// ─── COLLABORATION GENERATORS ────────────────────────────────

function generateSilentComm(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const code = String(rngInt(100, 999, rng));

  return {
    title: "TYST KOMMUNIKATION",
    briefing: brief(cfg, `{Agent} — ett barn ser koden och ska förmedla den till de andra UTAN att prata. Gester, teckning, knackning — allt utom ljud.`),
    answer: code,
    answerLen: 3,
    hints: [
      { text: "Tänk kreativt — rita i luften, knacka rytmer, visa med fingrar.", level: "mild" },
      { text: `Första siffran: ${code[0]}.`, level: "medium" },
      { text: `Koden: ${code}.`, level: "strong" },
    ],
    successMsg: "Tyst kommunikation lyckad.",
    printData: {
      sheets: [
        { type: "silent_code", title: "Hemlig kod (bara ett barn ser)", content: { code, teamSymbol: cfg.teamSymbol, rules: "Visa för ETT barn. Barnet förmedlar utan ljud." }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Tyst kommunikation", content: { code }, forInstructor: true },
      ],
    },
    instructorNotes: `Visa koden ${code} för ett barn. Regler: inga ljud.`,
  };
}

function generateChainMessage(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const code = String(rngInt(1000, 9999, rng));

  return {
    title: "KEDJEBUD",
    briefing: brief(cfg, `{Agent} — en fyrsiffrig kod viskas i kedja. Första barnet får se koden, viskar till nästa, osv. Sista barnet matar in.`),
    answer: code,
    answerLen: 4,
    hints: [
      { text: "Viska tydligt och långsamt. Siffra för siffra.", level: "mild" },
      { text: `Koden börjar med ${code[0]}${code[1]}.`, level: "medium" },
      { text: `Koden: ${code}.`, level: "strong" },
    ],
    successMsg: "Kedjebud levererat utan fel.",
    printData: {
      sheets: [
        { type: "chain_code", title: "Kedjebud — Startkod", content: { code, teamSymbol: cfg.teamSymbol }, forInstructor: false },
        { type: "instructor_key", title: "FACIT — Kedjebud", content: { code }, forInstructor: true },
      ],
    },
    instructorNotes: `Visa koden ${code} för första barnet. Viskningskedja.`,
  };
}

function generateSyncPress(cfg: GeneratorConfig): GeneratedMission {
  const rng = seededRandom(cfg.seed || Date.now());
  const code = String(rngInt(100, 999, rng));

  return {
    title: "SYNKRONISERAT TRYCK",
    briefing: brief(cfg, `{Agent} — alla i teamet ska trycka på bordet exakt SAMTIDIGT (instruktören räknar ner). Om synkroniseringen lyckas avslöjar instruktören koden.`),
    answer: code,
    answerLen: 3,
    hints: [
      { text: "Titta på varandra och räkna ner tillsammans.", level: "mild" },
      { text: `Instruktören godkänner om alla trycker inom 1 sekund.`, level: "medium" },
      { text: `Koden som avslöjas: ${code}.`, level: "strong" },
    ],
    successMsg: "Perfekt synkronisering. Teamwork.",
    printData: {
      sheets: [
        { type: "instructor_key", title: "FACIT — Synkroniserat tryck", content: { code, notes: "Räkna ner 3-2-1. Om alla trycker ungefär samtidigt, avslöja koden." }, forInstructor: true },
      ],
    },
    instructorNotes: `Räkna ner och bedöm synkronisering. Avslöja: ${code}.`,
  };
}

// ═══════════════════════════════════════════════════════════════
// STATION TYPE REGISTRY
// ═══════════════════════════════════════════════════════════════

export const STATION_TYPES: (StationType & { generate: (cfg: GeneratorConfig) => GeneratedMission })[] = [
  // CIPHER
  { id: "caesar_cipher", name: "Caesarchiffer", category: "chiffer", icon: "🔐", description: "Varje bokstav skiftas N steg. Barnen avkodar med nyckel.", ageRange: [7, 12], difficulty: 2, requiresProps: ["Penna"], printableTypes: ["cipher_key", "coded_message"], generate: generateCaesarCipher },
  { id: "mirror_cipher", name: "Spegelchiffer", category: "chiffer", icon: "🪞", description: "Bokstäver speglas i alfabetet. A↔Ö, B↔Ä.", ageRange: [8, 12], difficulty: 2, requiresProps: ["Penna"], printableTypes: ["mirror_table", "coded_message"], generate: generateMirrorCipher },
  { id: "number_cipher", name: "Sifferchiffer", category: "chiffer", icon: "🔢", description: "Siffror transformeras med en operation.", ageRange: [7, 12], difficulty: 1, requiresProps: ["Penna"], printableTypes: ["number_cipher"], generate: generateNumberCipher },
  { id: "symbol_table", name: "Symboltabell", category: "chiffer", icon: "✦", description: "Bokstäver ersätts med symboler.", ageRange: [7, 12], difficulty: 2, requiresProps: ["Penna"], printableTypes: ["symbol_table", "coded_message"], generate: generateSymbolTable },
  { id: "morse_code", name: "Morsekod", category: "chiffer", icon: "📡", description: "Prickar och streck översätts till bokstäver.", ageRange: [9, 12], difficulty: 3, requiresProps: ["Penna"], printableTypes: ["morse_ref", "coded_message"], generate: generateMorseCode },
  { id: "binary_code", name: "Binärkod", category: "chiffer", icon: "💻", description: "Siffror skrivna i binärt.", ageRange: [10, 12], difficulty: 3, requiresProps: ["Penna"], printableTypes: ["binary_ref", "coded_message"], generate: generateBinaryCode },
  // LOGIC
  { id: "equation", name: "Ekvation", category: "logik", icon: "🧮", description: "Åldersanpassad ekvation ger koden.", ageRange: [7, 12], difficulty: 1, requiresProps: ["Penna"], printableTypes: ["equation_card"], generate: generateEquation },
  { id: "number_sequence", name: "Talföljd", category: "logik", icon: "📊", description: "Hitta mönstret, fyll i nästa tal.", ageRange: [8, 12], difficulty: 2, requiresProps: ["Penna"], printableTypes: ["sequence_card"], generate: generateNumberSequence },
  { id: "coordinate_hunt", name: "Koordinatjakt", category: "logik", icon: "🗺", description: "Avläs koordinater på rutnät.", ageRange: [8, 12], difficulty: 2, requiresProps: ["Penna"], printableTypes: ["coordinate_grid"], generate: generateCoordinateHunt },
  { id: "logic_puzzle", name: "Logikpussel", category: "logik", icon: "🧩", description: "Tre ledtrådar → ett svar.", ageRange: [9, 12], difficulty: 3, requiresProps: ["Penna"], printableTypes: ["logic_puzzle", "color_cards"], generate: generateLogicPuzzle },
  // PHYSICAL
  { id: "uv_hunt", name: "UV-jakt", category: "fysisk", icon: "🔦", description: "Dolda meddelanden synliga med UV-lampa.", ageRange: [7, 12], difficulty: 1, requiresProps: ["UV-lampa", "UV-penna"], printableTypes: [], generate: generateUVHunt },
  { id: "laser_maze", name: "Laserlabyrint", category: "fysisk", icon: "⚡", description: "Snören som 'laserstrålar'. Navigera utan att röra.", ageRange: [7, 12], difficulty: 1, requiresProps: ["Snöre/rep"], printableTypes: ["laser_code"], generate: generateLaserMaze },
  { id: "puzzle_pieces", name: "Pusselbitar", category: "fysisk", icon: "🧩", description: "Gömda pusselbitar med siffror.", ageRange: [7, 12], difficulty: 1, requiresProps: ["Sax"], printableTypes: ["puzzle_pieces"], generate: generatePuzzlePieces },
  { id: "secret_courier", name: "Hemlig kurirväg", category: "fysisk", icon: "🏃", description: "Ett barn förmedlar kod utan att prata.", ageRange: [7, 12], difficulty: 1, requiresProps: [], printableTypes: ["courier_code"], generate: generateSecretCourier },
  // OBSERVATION
  { id: "reconnaissance", name: "Rekognosering", category: "observation", icon: "👁", description: "Frågor om rummet/miljön.", ageRange: [7, 12], difficulty: 1, requiresProps: [], printableTypes: [], generate: generateReconnaissance },
  { id: "memory_test", name: "Minnestest", category: "observation", icon: "🧠", description: "Föremål visas, täcks, frågor besvaras.", ageRange: [7, 12], difficulty: 2, requiresProps: ["Duk", "Diverse föremål"], printableTypes: [], generate: generateMemoryTest },
  { id: "shadowing", name: "Skuggning", category: "observation", icon: "🕵", description: "Matcha personbeskrivning med foto.", ageRange: [7, 12], difficulty: 2, requiresProps: ["Utskrivna foton"], printableTypes: [], generate: generateShadowing },
  { id: "spot_difference", name: "Hitta skillnaden", category: "observation", icon: "🔍", description: "Hitta skillnader mellan två bilder.", ageRange: [7, 12], difficulty: 2, requiresProps: ["Två utskrivna bilder"], printableTypes: [], generate: generateSpotDifference },
  // COLLABORATION
  { id: "silent_comm", name: "Tyst kommunikation", category: "samarbete", icon: "🤫", description: "Förmedla kod utan att prata.", ageRange: [7, 12], difficulty: 1, requiresProps: [], printableTypes: ["silent_code"], generate: generateSilentComm },
  { id: "chain_message", name: "Kedjebud", category: "samarbete", icon: "🔗", description: "Kod viskas i kedja.", ageRange: [7, 12], difficulty: 1, requiresProps: [], printableTypes: ["chain_code"], generate: generateChainMessage },
  { id: "sync_press", name: "Synkroniserat tryck", category: "samarbete", icon: "👆", description: "Alla trycker exakt samtidigt.", ageRange: [7, 12], difficulty: 1, requiresProps: [], printableTypes: [], generate: generateSyncPress },
];

export const STATION_CATEGORIES = [
  { id: "chiffer", name: "Chiffer", icon: "🔐" },
  { id: "logik", name: "Logik & Matte", icon: "🧮" },
  { id: "fysisk", name: "Fysisk aktivitet", icon: "🏃" },
  { id: "observation", name: "Observation", icon: "👁" },
  { id: "samarbete", name: "Samarbete", icon: "🤝" },
];

export function generateStation(stationId: string, config: GeneratorConfig): GeneratedMission | null {
  const station = STATION_TYPES.find((s) => s.id === stationId);
  if (!station) return null;
  return station.generate(config);
}
