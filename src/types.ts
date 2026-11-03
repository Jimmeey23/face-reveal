export interface Person {
  id: string;
  name: string;
  babyImage: string;
  adultImage: string;
  funFact?: string;
  yearsApart?: number;
  custom?: boolean;
  /** Animated clips of this baby, played in turn in the background while they are on screen. */
  animations?: string[];
}

export type RevealAnimation =
  | "morph"
  | "flip"
  | "iris"
  | "wipe"
  | "blinds"
  | "timewarp"
  | "dissolve"
  | "shatter";

export type AnimationSetting = RevealAnimation | "random";
export type RevealStyle = "photo" | "name" | "hidden";
export type Mode = "timer" | "manual";
export type Palette = "sunset" | "ocean" | "candy" | "forest";
export type Phase = "idle" | "counting" | "revealing" | "revealed";
export type AnswerResult = "correct" | "wrong" | "missed";

export interface Settings {
  mode: Mode;
  timerSeconds: number;
  autoStartTimer: boolean;
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  animation: AnimationSetting;
  revealStyle: RevealStyle;
  sound: boolean;
  confetti: boolean;
  quizMode: boolean;
  shuffle: boolean;
  showFunFacts: boolean;
  palette: Palette;
  showParticles: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  mode: "timer",
  timerSeconds: 10,
  autoStartTimer: true,
  autoAdvance: false,
  autoAdvanceDelay: 6,
  animation: "morph",
  revealStyle: "photo",
  sound: true,
  confetti: true,
  quizMode: false,
  shuffle: true,
  showFunFacts: true,
  palette: "sunset",
  showParticles: true,
};

export interface AnimationMeta {
  id: RevealAnimation;
  label: string;
  emoji: string;
  description: string;
  duration: number; // ms until the reveal is considered complete
}

export const ANIMATIONS: AnimationMeta[] = [
  { id: "morph", label: "Morph", emoji: "✨", description: "Dreamy blur-and-scale crossfade", duration: 1700 },
  { id: "flip", label: "3D Flip", emoji: "🔄", description: "The photo flips to its grown-up side", duration: 1300 },
  { id: "iris", label: "Iris", emoji: "🔍", description: "Circle wipe from the center", duration: 1400 },
  { id: "wipe", label: "Curtain", emoji: "🎭", description: "A glowing scanline sweeps down", duration: 1300 },
  { id: "blinds", label: "Blinds", emoji: "🪟", description: "Vertical slats flip one by one", duration: 1600 },
  { id: "timewarp", label: "Time Warp", emoji: "⏳", description: "Zoom through the years", duration: 1700 },
  { id: "dissolve", label: "Pixel Dust", emoji: "🌫️", description: "Tiles fade away like stardust", duration: 1800 },
  { id: "shatter", label: "Shatter", emoji: "💥", description: "Pieces burst outward", duration: 1700 },
];

export const PALETTES: { id: Palette; label: string; colors: [string, string, string] }[] = [
  { id: "sunset", label: "Sunset", colors: ["#ff6b8b", "#ffb347", "#ff8fd8"] },
  { id: "ocean", label: "Ocean", colors: ["#38bdf8", "#34d399", "#818cf8"] },
  { id: "candy", label: "Candy", colors: ["#f472b6", "#c084fc", "#22d3ee"] },
  { id: "forest", label: "Forest", colors: ["#4ade80", "#facc15", "#2dd4bf"] },
];

export interface QuizStats {
  correct: number;
  wrong: number;
  missed: number;
  streak: number;
  bestStreak: number;
}

export const EMPTY_STATS: QuizStats = { correct: 0, wrong: 0, missed: 0, streak: 0, bestStreak: 0 };
