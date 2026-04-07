// ═══════════════════════════════════════════════════════════════
// LYNX COMMAND CENTER — Type Definitions
// ═══════════════════════════════════════════════════════════════

export interface Team {
  id: string;
  name: string;
  symbol: string;
  color: string;
  accent: string;
  bg: string;
  finalDigit: string;
  missions: Mission[];
}

export interface Mission {
  id: string;
  title: string;
  icon: string;
  briefing: string;
  answer: string;
  answerLen: number;
  hints: Hint[];
  successMsg: string;
}

export interface Hint {
  text: string;
  level: "mild" | "medium" | "strong";
}

export interface Theme {
  id: string;
  name: string;
  orgName: string;
  directorTitle: string;
  introSpeech: string;
  completeSpeech: string;
  certTitle: string;
  accentColor: string;
  alertColor: string;
  successColor: string;
  bgGradient: [string, string];
  vocabulary: {
    mission: string;
    station: string;
    hq: string;
    agent: string;
    briefcase: string;
  };
}

export interface LynxEvent {
  id: string;
  name: string;
  theme: Theme;
  activationCode: string;
  finalCode: string;
  timerMinutes: number | null;
  teams: Team[];
  createdAt: number;
  lastUsed: number | null;
}

export interface HQState {
  phase: string;
  timestamp: number;
}

export interface TeamProgress {
  teamId: string;
  missionIndex: number;
  currentMission: string;
  totalMissions: number;
  allDone: boolean;
  finalDigit: string;
  timestamp: number;
}

export interface AdminMessage {
  id: number;
  text: string;
  speech: string;
  from: string;
  timestamp: number;
}

export interface PresetMessage {
  label: string;
  text: string;
  speech: string;
}

export interface StationType {
  id: string;
  name: string;
  category: "chiffer" | "fysisk" | "logik" | "observation" | "samarbete";
  icon: string;
  description: string;
  ageRange: [number, number];
  difficulty: 1 | 2 | 3;
  requiresProps: string[];
  printableTypes: string[];
}

export interface GeneratorConfig {
  theme: Theme;
  teamSymbol: string;
  teamName: string;
  difficulty: 1 | 2 | 3;
  ageRange: [number, number];
  seed?: number;
}

export interface GeneratedMission {
  id?: string;
  icon?: string;
  title: string;
  briefing: string;
  answer: string;
  answerLen: number;
  hints: Hint[];
  successMsg: string;
  printData: {
    sheets: PrintSheet[];
  };
  instructorNotes: string;
}

export interface PrintSheet {
  type: string;
  title: string;
  content: Record<string, unknown>;
  forInstructor?: boolean;
}

export interface SessionStats {
  eventId: string;
  startedAt: number;
  completedAt: number | null;
  teams: {
    teamId: string;
    missionTimes: { missionId: string; startedAt: number; completedAt: number; attempts: number; hintsUsed: number }[];
    totalTime: number;
  }[];
}
