import { Theme } from "./types";

export const THEME_AGENT: Theme = {
  id: "agent",
  name: "Agent Academy",
  orgName: "LYNX",
  directorTitle: "Direktören",
  introSpeech:
    "Välkomna till LYNX Agent Academy. Jag är Direktören. Ni har blivit utvalda för vår hemligaste agentutbildning. Idag delas ni in i tre team. Varje team får sin egen terminal. Klara alla uppdrag och öppna agentväskan. Men först — bevisa att ni hör hemma här.",
  completeSpeech:
    "Uppdraget är slutfört. Ni är nu certifierade LYNX-agenter. Alla team har bevisat sitt värde. Kom ihåg — en agent löser aldrig uppdraget ensam. Var modiga. Var smarta. Var ett team. Direktören — slut.",
  certTitle: "CERTIFIERAD LYNX-AGENT",
  accentColor: "#00ffd5",
  alertColor: "#ff3300",
  successColor: "#33ff88",
  bgGradient: ["#0d1822", "#060a10"],
  vocabulary: {
    mission: "UPPDRAG",
    station: "STATION",
    hq: "HQ",
    agent: "AGENT",
    briefcase: "AGENTVÄSKAN",
  },
};

export const THEME_SPACE: Theme = {
  id: "space",
  name: "Space Mission",
  orgName: "NOVA COMMAND",
  directorTitle: "Befälhavaren",
  introSpeech:
    "Kadetter, välkomna till NOVA COMMAND. Jag är Befälhavaren. Ni har valts ut för en kritisk rymdexpedition. Era team ska lösa uppdrag i rymdbasen för att aktivera rymdkapseln. Ange säkerhetskoden.",
  completeSpeech:
    "Expedition slutförd. Ni är nu certifierade rymdkadetter. Tillsammans har ni räddat stationen. Befälhavaren — slut.",
  certTitle: "CERTIFIERAD RYMDKADET",
  accentColor: "#6677ff",
  alertColor: "#ff4466",
  successColor: "#44ffaa",
  bgGradient: ["#0a0e22", "#050810"],
  vocabulary: {
    mission: "MISSION",
    station: "MODUL",
    hq: "RYMDBASEN",
    agent: "KADET",
    briefcase: "RYMDKAPSELN",
  },
};

export const THEME_DETECTIVE: Theme = {
  id: "detective",
  name: "Detektivbyrån",
  orgName: "MYSTERIUM",
  directorTitle: "Kommissarien",
  introSpeech:
    "Detektiver, välkomna till byrå MYSTERIUM. Jag är Kommissarien. Ett brott har begåtts och vi behöver era skarpaste sinnen. Lös alla ärenden för att öppna bevislådan. Ange ert ID-nummer.",
  completeSpeech:
    "Fallet är löst. Ni är nu certifierade MYSTERIUM-detektiver. Ert arbete har räddat utredningen. Kommissarien — slut.",
  certTitle: "CERTIFIERAD MYSTERIUM-DETEKTIV",
  accentColor: "#dda844",
  alertColor: "#cc3333",
  successColor: "#55cc77",
  bgGradient: ["#18140a", "#0a0806"],
  vocabulary: {
    mission: "ÄRENDE",
    station: "PLATS",
    hq: "KONTORET",
    agent: "DETEKTIV",
    briefcase: "BEVISLÅDAN",
  },
};

export const ALL_THEMES: Theme[] = [THEME_AGENT, THEME_SPACE, THEME_DETECTIVE];

export function getThemeById(id: string): Theme {
  return ALL_THEMES.find((t) => t.id === id) || THEME_AGENT;
}
