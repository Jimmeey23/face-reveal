import { Maximize2, Minimize2, Settings2, Users, Volume2, VolumeX, Flame } from "lucide-react";
import type { QuizStats } from "../types";
import { IconButton } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  quizMode: boolean;
  stats: QuizStats;
  sound: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onOpenSettings: () => void;
  onOpenPeople: () => void;
  hidden: boolean;
}

export function Header({
  quizMode,
  stats,
  sound,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  onOpenSettings,
  onOpenPeople,
  hidden,
}: Props) {
  return (
    <header
      className={cn(
        "relative z-30 flex items-center justify-between gap-3 px-4 py-3 transition-all duration-500 sm:px-6",
        hidden && "pointer-events-none -translate-y-4 opacity-0",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="brand-gradient animate-float grid h-11 w-11 place-items-center rounded-2xl text-2xl shadow-[0_10px_30px_-8px_var(--c1)]">
          <span className="drop-shadow">👶</span>
        </div>
        <div className="leading-tight">
          <h1 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            Guess the <span className="brand-text">Baby</span>
          </h1>
          <p className="hidden text-[11px] font-bold tracking-[0.2em] text-white/45 uppercase sm:block">
            who's that lil cutie?
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {quizMode && (
          <div className="glass mr-1 hidden items-center gap-3 rounded-xl px-3 py-1.5 text-sm font-bold sm:flex">
            <span className="flex items-center gap-1 text-emerald-300">
              <span className="text-base">✅</span>
              {stats.correct}
            </span>
            <span className="flex items-center gap-1 text-rose-300">
              <span className="text-base">❌</span>
              {stats.wrong + stats.missed}
            </span>
            <span
              className={cn(
                "flex items-center gap-1 text-white/60 transition-colors",
                stats.streak >= 3 && "text-orange-300",
              )}
              title="Current streak"
            >
              <Flame size={16} className={cn(stats.streak >= 3 && "animate-heartbeat fill-orange-400 text-orange-400")} />
              {stats.streak}
            </span>
          </div>
        )}
        <IconButton label="Manage people" shortcut="U" onClick={onOpenPeople}>
          <Users size={18} />
        </IconButton>
        <IconButton label={sound ? "Mute" : "Unmute"} shortcut="M" onClick={onToggleSound} active={false}>
          {sound ? <Volume2 size={18} /> : <VolumeX size={18} className="text-white/50" />}
        </IconButton>
        <IconButton
          label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          shortcut="F"
          onClick={onToggleFullscreen}
          className="hidden sm:grid"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </IconButton>
        <IconButton label="Settings" shortcut="S" onClick={onOpenSettings}>
          <Settings2 size={18} />
        </IconButton>
      </div>
    </header>
  );
}
