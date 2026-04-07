import { LynxEvent } from "./types";
import { THEME_AGENT, THEME_SPACE, THEME_DETECTIVE } from "./themes";

export const DEFAULT_EVENT_AGENT: LynxEvent = {
  id: "default-agent",
  name: "Agent Academy (Standard)",
  theme: THEME_AGENT,
  activationCode: "007",
  finalCode: "7316",
  timerMinutes: null,
  teams: [
    {
      id: "alpha",
      name: "ALPHA",
      symbol: "◆",
      color: "#00ffd5",
      accent: "rgba(0,255,213,",
      bg: "#0a1a1f",
      finalDigit: "7",
      missions: [
        {
          id: "uv",
          title: "UV-SPANING",
          icon: "🔦",
          briefing:
            "Agenter — i rummet finns dolda meddelanden som bara syns med UV-lampa. Hitta alla meddelanden markerade med er symbol ◆. Sätt ihop bokstäverna till ett ord och räkna ut talet.",
          hints: [
            { text: "Ledtrådarna sitter på ställen i ögonhöjd för barn. Kolla väggarna.", level: "mild" },
            { text: "Bokstäverna bildar ett ord. Räkna antalet bokstäver i ordet.", level: "medium" },
            { text: "Ordet har 6 bokstäver. Multiplicera med 3.", level: "strong" },
          ],
          answer: "18",
          answerLen: 2,
          successMsg: "UV-spaning klarad. Ni ser det osynliga.",
        },
        {
          id: "cipher",
          title: "CHIFFER-AVKODNING",
          icon: "🔐",
          briefing:
            "Ett kodat meddelande har fångats upp. Använd chiffernyckeln vid er station för att avkoda det. Varje bokstav skiftas 3 steg framåt i alfabetet.",
          hints: [
            { text: "Chiffernyckeln visar vilken bokstav som blir vilken. Jobba bakåt.", level: "mild" },
            { text: "A→D, B→E, C→F. Det betyder att D i koden egentligen är A.", level: "medium" },
            { text: "Första siffran i svaret är 3. Kolla meddelandet igen.", level: "strong" },
          ],
          answer: "349",
          answerLen: 3,
          successMsg: "Chiffret knäckt. Ni tänker som kryptografer.",
        },
        {
          id: "puzzle",
          title: "PUSSELKAMMAREN",
          icon: "🧩",
          briefing:
            "Hitta de fyra pusselbitarna gömda i ert område. Varje bit har en siffra. Lägg pusslet och läs av koden uppifrån ner, vänster till höger.",
          hints: [
            { text: "Bitarna är gömda nära föremål med er symbol ◆.", level: "mild" },
            { text: "Symbolerna i hörnen visar hur bitarna ska roteras.", level: "medium" },
            { text: "Börja med biten som har en stjärna i övre vänstra hörnet.", level: "strong" },
          ],
          answer: "4821",
          answerLen: 4,
          successMsg: "Pusslet löst. Er precision är imponerande.",
        },
        {
          id: "recon",
          title: "REKOGNOSERING",
          icon: "👁",
          briefing:
            "Svara på tre frågor om saker ni kan observera i rummet. Kombinera svaren till en kod. Fråga 1: Hur många stolar? Fråga 2: Vilken färg har dörren? (1=röd 2=blå 3=vit 4=svart) Fråga 3: Hur många fönster?",
          hints: [
            { text: "Räkna noggrant. Missa inte stolarna bakom bordet.", level: "mild" },
            { text: "Dörren har en specifik färg — titta på huvuddörren, inte skåpdörrar.", level: "medium" },
            { text: "Det finns 6 stolar, dörren ger siffra 3, och räkna fönstren en gång till.", level: "strong" },
          ],
          answer: "632",
          answerLen: 3,
          successMsg: "Rekognosering komplett. En agent missar inget.",
        },
      ],
    },
    {
      id: "bravo",
      name: "BRAVO",
      symbol: "▲",
      color: "#ff9f1c",
      accent: "rgba(255,159,28,",
      bg: "#1a150a",
      finalDigit: "3",
      missions: [
        {
          id: "uv",
          title: "UV-SPANING",
          icon: "🔦",
          briefing:
            "Agenter — i rummet finns dolda meddelanden som bara syns med UV-lampa. Hitta alla meddelanden markerade med er symbol ▲. Hitta siffrorna och addera dem.",
          hints: [
            { text: "Det finns tre dolda meddelanden. Ett sitter högt upp.", level: "mild" },
            { text: "Varje meddelande innehåller en siffra. Addera alla tre.", level: "medium" },
            { text: "Siffrorna är 8, 7 och 9. Vad blir summan?", level: "strong" },
          ],
          answer: "24",
          answerLen: 2,
          successMsg: "UV-spaning klarad. Bra ögon, agenter.",
        },
        {
          id: "cipher",
          title: "CHIFFER-AVKODNING",
          icon: "🔐",
          briefing:
            "Ert kodade meddelande använder ett spegelchiffer — varje bokstav ersätts med sin spegling i alfabetet. A↔Ö, B↔Ä osv. Avkoda meddelandet.",
          hints: [
            { text: "Spegeltabellen vid stationen visar alla byten.", level: "mild" },
            { text: "Jobba bokstav för bokstav. Den första bokstaven i koden pekar på siffran 5.", level: "medium" },
            { text: "Koden börjar på 5. Nästa siffra får ni från det andra avkodade ordet.", level: "strong" },
          ],
          answer: "517",
          answerLen: 3,
          successMsg: "Chiffret knäckt. Imponerande kodknäckare.",
        },
        {
          id: "laser",
          title: "LASERLABYRINT",
          icon: "⚡",
          briefing:
            "Ta er genom laserlabyrinten utan att bryta en stråle. Vid slutet finns en kod skriven med osynligt bläck. Memorera och rapportera.",
          hints: [
            { text: "Böj er under de höga strålarna, kliv över de låga.", level: "mild" },
            { text: "Koden finns på ett kort vid slutet. Använd UV-lampan för att läsa den.", level: "medium" },
            { text: "Koden har fyra siffror och börjar med 7.", level: "strong" },
          ],
          answer: "7135",
          answerLen: 4,
          successMsg: "Labyrinten besegrad. Ingen stråle bruten.",
        },
        {
          id: "recon",
          title: "SIGNALSPANING",
          icon: "📡",
          briefing:
            "Hitta de tre gömda radiostationerna i ert område. Varje station har en siffra. Ange siffrorna: röd → gul → blå.",
          hints: [
            { text: "Stationerna är markerade med ▲. En sitter under ett bord.", level: "mild" },
            { text: "Röd station först, sen gul, sen blå. Kolla färgmarkeringarna.", level: "medium" },
            { text: "Röd = 8, Gul = 9. Hitta den blå stationen!", level: "strong" },
          ],
          answer: "895",
          answerLen: 3,
          successMsg: "Signaler lokaliserade. Utmärkt fältarbete.",
        },
      ],
    },
    {
      id: "charlie",
      name: "CHARLIE",
      symbol: "●",
      color: "#e040fb",
      accent: "rgba(224,64,251,",
      bg: "#1a0a1f",
      finalDigit: "1",
      missions: [
        {
          id: "uv",
          title: "UV-SPANING",
          icon: "🔦",
          briefing:
            "Agenter — dolda meddelanden finns i rummet, synliga med UV-lampa. Hitta alla markerade med ●. Varje meddelande innehåller en siffra. Multiplicera dem.",
          hints: [
            { text: "Det finns tre dolda meddelanden med ●-symbolen.", level: "mild" },
            { text: "Multiplicera de tre siffrorna: A × B × C.", level: "medium" },
            { text: "Siffrorna är 2, 6 och 3. Vad blir produkten?", level: "strong" },
          ],
          answer: "36",
          answerLen: 2,
          successMsg: "UV-spaning klarad. Ni hittar det ingen annan ser.",
        },
        {
          id: "cipher",
          title: "CHIFFER-AVKODNING",
          icon: "🔐",
          briefing:
            "Ert chiffer är ett sifferchiffer — varje siffra subtraheras med 4. Negativt? Börja om från 9. Avkoda meddelandet.",
          hints: [
            { text: "Exempel: 5→1 (5-4=1). Prova med varje siffra.", level: "mild" },
            { text: "Om siffran är 3: 3-4=-1, börja om: 10-1=9. Så 3→9.", level: "medium" },
            { text: "Det kodade meddelandet är 826. Subtrahera 4 från varje siffra.", level: "strong" },
          ],
          answer: "482",
          answerLen: 3,
          successMsg: "Chiffret löst. Matematiska agenter.",
        },
        {
          id: "memory",
          title: "MINNESPROV",
          icon: "🧠",
          briefing:
            "Vid er station finns tio föremål under en duk. Ni får titta i 30 sekunder. Sen täcks de. Ange: RÖDA + RUNDA + med TEXT + totalt antal.",
          hints: [
            { text: "Dela upp det: en person räknar röda, en räknar runda, en tittar på text.", level: "mild" },
            { text: "Det finns 3 röda föremål och 4 runda.", level: "medium" },
            { text: "Röda=3, Runda=4, Med text=2, Totalt=5 föremål av en viss typ.", level: "strong" },
          ],
          answer: "3425",
          answerLen: 4,
          successMsg: "Perfekt minne. En agent glömmer aldrig.",
        },
        {
          id: "shadow",
          title: "SKUGGNING",
          icon: "🕵",
          briefing:
            "Er instruktör ger er en beskrivning av en person. Hitta rätt foto bland bilderna i ert område. Koden finns på baksidan.",
          hints: [
            { text: "Lyssna noga på alla detaljer: hårfärg, kläder, accessoarer.", level: "mild" },
            { text: "Personen har något specifikt på huvudet. Titta efter det.", level: "medium" },
            { text: "Det är fotot närmast fönstret. Koden har tre siffror.", level: "strong" },
          ],
          answer: "264",
          answerLen: 3,
          successMsg: "Målet identifierat. Perfekt skuggning.",
        },
      ],
    },
  ],
  createdAt: Date.now(),
  lastUsed: null,
};

export const DEFAULT_EVENT_SPACE: LynxEvent = {
  id: "default-space",
  name: "Space Mission (Standard)",
  theme: THEME_SPACE,
  activationCode: "123",
  finalCode: "5924",
  timerMinutes: null,
  teams: [
    {
      id: "alpha", name: "NEBULA", symbol: "◆", color: "#6677ff", accent: "rgba(102,119,255,", bg: "#0a0e22", finalDigit: "5",
      missions: [
        { id: "star", title: "STJÄRNKARTAN", icon: "⭐", briefing: "Kadetter — hitta de dolda stjärnkoordinaterna i rummet. Varje koordinat är markerad med ◆. Kombinera X-värdena.", hints: [{ text: "Koordinaterna sitter på väggen. Sök i ögonhöjd.", level: "mild" }, { text: "Det finns tre koordinater. Addera X-värdena.", level: "medium" }, { text: "X-värdena är 1, 2 och 4. Summa?", level: "strong" }], answer: "07", answerLen: 2, successMsg: "Koordinater inlåsta. Bra navigation." },
        { id: "signal", title: "SIGNALDEKODNING", icon: "📡", briefing: "En nödsignal har fångats upp. Använd frekvenstabellen vid stationen för att avkoda meddelandet.", hints: [{ text: "Varje frekvens motsvarar en bokstav.", level: "mild" }, { text: "De tre första frekvenserna ger siffrorna 4, 1 och 8.", level: "medium" }, { text: "Koden är 418.", level: "strong" }], answer: "418", answerLen: 3, successMsg: "Signal avkodad. Kommunikation återställd." },
        { id: "asteroid", title: "ASTEROIDNAVIGERING", icon: "☄️", briefing: "Navigera förbi asteroidfältet. Lös ekvationerna för att hitta säker kurs. X + 12 = 20, Y × 3 = 15, Z - 7 = 2.", hints: [{ text: "Lös en ekvation i taget.", level: "mild" }, { text: "X = 8, Y = 5. Vad är Z?", level: "medium" }, { text: "Z = 9. Koden är XYZ.", level: "strong" }], answer: "859", answerLen: 3, successMsg: "Asteroidfält passerat. Skicklig navigering." },
        { id: "energy", title: "ENERGIMODULEN", icon: "🔋", briefing: "Hitta de fyra energicellerna gömda i rummet (markerade ◆). Varje cell har en siffra. Ange i ordning: röd, blå, grön, gul.", hints: [{ text: "En cell sitter under ett bord.", level: "mild" }, { text: "Röd = 3, Blå = 7.", level: "medium" }, { text: "Koden är 3761.", level: "strong" }], answer: "3761", answerLen: 4, successMsg: "Energi laddad. Stationen är online." },
      ],
    },
    {
      id: "bravo", name: "COSMOS", symbol: "▲", color: "#ff6699", accent: "rgba(255,102,153,", bg: "#1a0a12", finalDigit: "9",
      missions: [
        { id: "star", title: "PLANETJAKT", icon: "🪐", briefing: "Hitta de dolda planetnamnen i rummet (markerade ▲). Räkna bokstäverna i det längsta namnet.", hints: [{ text: "Det finns tre gömda planetnamn.", level: "mild" }, { text: "Planeterna är Mars, Venus och Saturnus.", level: "medium" }, { text: "Saturnus har 8 bokstäver. Addera 4.", level: "strong" }], answer: "12", answerLen: 2, successMsg: "Planeter kartlagda. Utmärkt astronomi." },
        { id: "signal", title: "KRYPTOFREKVENS", icon: "📻", briefing: "Avkoda den hemliga frekvensen. Varje siffra i koden ökas med 2.", hints: [{ text: "Om originalsiffran är 3, blir kodad siffra 5.", level: "mild" }, { text: "De kodade siffrorna är 5, 8, 3.", level: "medium" }, { text: "5-2=3, 8-2=6, 3-2=1. Koden?", level: "strong" }], answer: "361", answerLen: 3, successMsg: "Frekvens dekrypterad. Stark signal." },
        { id: "asteroid", title: "METEORITUNDVIKARE", icon: "💫", briefing: "Hitta den säkra rutten. Lös: A = 14 ÷ 2, B = 3 × 3, C = 20 - 15, D = 1 + 1.", hints: [{ text: "Räkna steg för steg.", level: "mild" }, { text: "A = 7, B = 9.", level: "medium" }, { text: "C = 5, D = 2. Koden: ABCD.", level: "strong" }], answer: "7952", answerLen: 4, successMsg: "Meteoriter undvikna. Perfekt piloting." },
        { id: "energy", title: "SYREFÖRSÖRJNING", icon: "💨", briefing: "Hitta de tre syretankarna (▲). Addera volymerna (skrivna på tankarna).", hints: [{ text: "Tankarna är gömda i ert område.", level: "mild" }, { text: "Volymerna är 35, 42 och 23.", level: "medium" }, { text: "35 + 42 + 23 = ?", level: "strong" }], answer: "100", answerLen: 3, successMsg: "Syrenivå stabil. Besättningen är säker." },
      ],
    },
    {
      id: "charlie", name: "STELLAR", symbol: "●", color: "#44ddaa", accent: "rgba(68,221,170,", bg: "#0a1a14", finalDigit: "2",
      missions: [
        { id: "star", title: "KONSTELLATIONER", icon: "✨", briefing: "Hitta de dolda stjärnbilderna i rummet (●). Räkna antalet stjärnor i den största bilden. Multiplicera med 2.", hints: [{ text: "Det finns tre stjärnbilder. En sitter bakom en hylla.", level: "mild" }, { text: "Den största har 7 stjärnor.", level: "medium" }, { text: "7 × 2 = ?", level: "strong" }], answer: "14", answerLen: 2, successMsg: "Stjärnor kartlagda. Navigationsdata sparad." },
        { id: "signal", title: "RADIOSIGNAL", icon: "🛰", briefing: "Avkoda radiosignalen med binärkod. 101 = ?, 110 = ?, 011 = ?", hints: [{ text: "Binärt: 101 = 5 i decimal.", level: "mild" }, { text: "110 = 6 i decimal.", level: "medium" }, { text: "011 = 3. Koden: 563.", level: "strong" }], answer: "563", answerLen: 3, successMsg: "Signal mottagen. Data överförd." },
        { id: "asteroid", title: "GRAVITATION", icon: "🌀", briefing: "Beräkna gravitationskraften. A × B = 24 där A > B. A - B = 2. Hitta A och B, plus C = A + B.", hints: [{ text: "Prova olika faktorer av 24.", level: "mild" }, { text: "A = 6, B = 4 (6×4=24, 6-4=2).", level: "medium" }, { text: "C = 6+4 = 10. Koden: ABC = 6410.", level: "strong" }], answer: "6410", answerLen: 4, successMsg: "Gravitationsberäkning korrekt." },
        { id: "energy", title: "SKÖLDGENERATOR", icon: "🛡", briefing: "Hitta de tre sköldmodulerna (●). Varje modul har en siffra. Addera dem och multiplicera med 3.", hints: [{ text: "Modulerna är gömda i ert område.", level: "mild" }, { text: "Siffrorna är 5, 3 och 2. Summa?", level: "medium" }, { text: "10 × 3 = ?", level: "strong" }], answer: "030", answerLen: 3, successMsg: "Sköld aktiverad. Stationen är skyddad." },
      ],
    },
  ],
  createdAt: Date.now(),
  lastUsed: null,
};

export const DEFAULT_EVENT_DETECTIVE: LynxEvent = {
  id: "default-detective",
  name: "Detektivbyrån (Standard)",
  theme: THEME_DETECTIVE,
  activationCode: "911",
  finalCode: "4827",
  timerMinutes: null,
  teams: [
    {
      id: "alpha", name: "FALKEN", symbol: "◆", color: "#dda844", accent: "rgba(221,168,68,", bg: "#18140a", finalDigit: "4",
      missions: [
        { id: "fingerprint", title: "FINGERAVTRYCK", icon: "🖐", briefing: "Detektiver — hitta de dolda fingeravtrycken i rummet (markerade ◆). Varje avtryck har en bokstav. Bokstävernas position i alfabetet, adderade, ger koden.", hints: [{ text: "Det finns tre fingeravtryck med bokstäver.", level: "mild" }, { text: "Bokstäverna är A, C och E.", level: "medium" }, { text: "A=1, C=3, E=5. Summa = 9. Koden: 09.", level: "strong" }], answer: "09", answerLen: 2, successMsg: "Fingeravtryck analyserade. Bevis säkrat." },
        { id: "witness", title: "VITTNESFÖRHÖR", icon: "🗣", briefing: "Instruktören läser tre vittnesmål. Varje vittnesmål innehåller en dold siffra (nämnd som antal). Anteckna och kombinera.", hints: [{ text: "Lyssna efter antal — 'tre bilar', 'fem personer'.", level: "mild" }, { text: "Första siffran är 3.", level: "medium" }, { text: "Siffrorna: 3, 6, 1.", level: "strong" }], answer: "361", answerLen: 3, successMsg: "Vittnesmål verifierade. Ledtrådar noterade." },
        { id: "crossref", title: "KORSREFERENS", icon: "🔗", briefing: "Matcha de tre ledtrådarna i rummet (◆) med listan på misstänkta. Varje matchning ger en siffra.", hints: [{ text: "Ledtrådarna beskriver utseende, plats och tid.", level: "mild" }, { text: "Första matchningen ger 5.", level: "medium" }, { text: "Koden: 5283.", level: "strong" }], answer: "5283", answerLen: 4, successMsg: "Korsreferens komplett. Misstänkt identifierad." },
        { id: "crime", title: "BROTTSPLATSANALYS", icon: "🔍", briefing: "Analysera brottsplatsen. Svara: Hur många bevis? + Vilken färg på bandet? (1=röd 2=blå 3=gul) + Tidpunkt (timsiffra)?", hints: [{ text: "Räkna alla bevismarkeringar i rummet.", level: "mild" }, { text: "Det finns 4 bevis och bandet är blått.", level: "medium" }, { text: "4, 2 (blå), klockan 8. Koden: 428.", level: "strong" }], answer: "428", answerLen: 3, successMsg: "Brottsplats dokumenterad. Utmärkt analys." },
      ],
    },
    {
      id: "bravo", name: "UGGLORNA", symbol: "▲", color: "#cc7744", accent: "rgba(204,119,68,", bg: "#1a100a", finalDigit: "8",
      missions: [
        { id: "fingerprint", title: "SPÅRJAKT", icon: "👣", briefing: "Följ spåren i rummet (▲). Varje spår har en symbol. Räkna antalet unika symboler och multiplicera med 5.", hints: [{ text: "Det finns spår utspridda i hela ert område.", level: "mild" }, { text: "Det finns 3 unika symboler.", level: "medium" }, { text: "3 × 5 = ?", level: "strong" }], answer: "15", answerLen: 2, successMsg: "Spår analyserade. Detektivarbete i toppklass." },
        { id: "witness", title: "ALIBIKONTROLL", icon: "⏰", briefing: "Tre misstänkta har alibin. Instruktören läser upp dem. Hitta den som ljuger — koden är den misstänktas nummer plus tidskillnaden.", hints: [{ text: "En av tiderna stämmer inte med vad vittnet sa.", level: "mild" }, { text: "Misstänkt nr 2 har fel tid.", level: "medium" }, { text: "Koden: 247.", level: "strong" }], answer: "247", answerLen: 3, successMsg: "Alibi genomskådat. Lögnen avslöjad." },
        { id: "crossref", title: "BEVISPUSSEL", icon: "🧩", briefing: "Hitta de fyra bevisen gömda i rummet (▲). Varje bevis har en siffra. Lägg dem i ordning efter bevisnummer.", hints: [{ text: "Bevisen är numrerade 1-4 på baksidan.", level: "mild" }, { text: "Bevis 1 har siffra 6, bevis 2 har siffra 0.", level: "medium" }, { text: "Koden: 6039.", level: "strong" }], answer: "6039", answerLen: 4, successMsg: "Beviskedja komplett. Stark åklagargrund." },
        { id: "crime", title: "MOTIVANALYS", icon: "🧠", briefing: "Lös logikpusslet: A har motiv om B ljuger. B ljuger om C har alibi. C har alibi. Vem har motiv? Koden = personens nummer × 123.", hints: [{ text: "Börja bakifrån: har C alibi?", level: "mild" }, { text: "C har alibi → B ljuger → A har motiv.", level: "medium" }, { text: "A = person 1. 1 × 123 = ?", level: "strong" }], answer: "123", answerLen: 3, successMsg: "Motiv fastställt. Logiken är kristallklar." },
      ],
    },
    {
      id: "charlie", name: "RÄVEN", symbol: "●", color: "#88aa44", accent: "rgba(136,170,68,", bg: "#121a0a", finalDigit: "2",
      missions: [
        { id: "fingerprint", title: "DNA-ANALYS", icon: "🧬", briefing: "Hitta de dolda DNA-proverna i rummet (●). Varje prov har en siffra. Addera alla.", hints: [{ text: "Det finns fyra prover utspridda.", level: "mild" }, { text: "Siffrorna är 3, 2, 5 och 1.", level: "medium" }, { text: "3+2+5+1 = ?", level: "strong" }], answer: "11", answerLen: 2, successMsg: "DNA matchat. Bevisning odiskutabel." },
        { id: "witness", title: "FOTOGRAFISKT MINNE", icon: "📸", briefing: "Studera bilden i 20 sekunder. Besvara tre frågor: antal personer, färg på hatten (1=röd 2=svart 3=brun), antal bilar.", hints: [{ text: "Fokusera på personerna och fordonen.", level: "mild" }, { text: "Det finns 5 personer och hatten är svart.", level: "medium" }, { text: "5 personer, svart(2), 3 bilar. Koden: 523.", level: "strong" }], answer: "523", answerLen: 3, successMsg: "Fotografiskt minne bekräftat. Imponerande." },
        { id: "crossref", title: "TIDSLINJE", icon: "📅", briefing: "Placera de fyra händelserna (●) i kronologisk ordning. Varje händelse har en siffra. Ange i tidsordning.", hints: [{ text: "Kolla datumen på varje händelsekort.", level: "mild" }, { text: "Ordningen: mars, juni, september, december.", level: "medium" }, { text: "Koden: 7194.", level: "strong" }], answer: "7194", answerLen: 4, successMsg: "Tidslinje rekonstruerad. Händelseförloppet klart." },
        { id: "crime", title: "HEMLIGT MEDDELANDE", icon: "✉️", briefing: "Avkoda det hemliga meddelandet. Varje ord i meddelandet har en bokstav markerad med stor stil. Bokstäverna bildar en sifferkod (A=1, B=2...).", hints: [{ text: "Läs bara de stora bokstäverna.", level: "mild" }, { text: "Bokstäverna är D, A, G.", level: "medium" }, { text: "D=4, A=1, G=7. Koden: 417.", level: "strong" }], answer: "417", answerLen: 3, successMsg: "Meddelande avkodat. Fallet tar ny vändning." },
      ],
    },
  ],
  createdAt: Date.now(),
  lastUsed: null,
};

export const ALL_DEFAULT_EVENTS: LynxEvent[] = [
  DEFAULT_EVENT_AGENT,
  DEFAULT_EVENT_SPACE,
  DEFAULT_EVENT_DETECTIVE,
];
