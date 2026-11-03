import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Eye,
  Hand,
  Lightbulb,
  Loader2,
  RotateCcw,
  Sparkles,
  Timer,
  Trophy,
} from "lucide-react";
import { useState } from "react";
import { ANIMATIONS, type AnimationSetting, type Mode, type Phase } from "../types";
import { Segmented } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  phase: Phase;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  isFirst: boolean;
  isLast: boolean;
  onPrev: () => void;
  onNext: () => void;
  onPrimary: () => void;
  hintLevel: number;
  maxHint: number;
  onHint: () => void;
  onPeekStart: () => void;
  onPeekEnd: () => void;
  onRestart: () => void;
  animation: AnimationSetting;
  onAnimationChange: (a: AnimationSetting) => void;
  autoAdvance: boolean;
  autoAdvanceDelay: number;
  autoAdvancePaused: boolean;
  autoAdvanceKey: string;
}

export function Controls(props: Props) {
  const {
    phase,
    mode,
    onModeChange,
    isFirst,
    isLast,
    onPrev,
    onNext,
    onPrimary,
    hintLevel,
    maxHint,
    onHint,
    onPeekStart,
    onPeekEnd,
    onRestart,
    animation,
    onAnimationChange,
    autoAdvance,
    autoAdvanceDelay,
    autoAdvancePaused,
    autoAdvanceKey,
  } = props;

  const [fxOpen, setFxOpen] = useState(false);
  const guessing = phase === "idle" || phase === "counting";

  const primary = (() => {
    if (phase === "revealing") return { label: "Revealing…", icon: <Loader2 size={22} className="animate-spin" />, disabled: true };
    if (phase === "revealed")
      return isLast
        ? { label: "See results", icon: <Trophy size={22} />, disabled: false }
        : { label: "Next baby", icon: <ArrowRight size={22} />, disabled: false };
    if (phase === "counting") return { label: "Reveal now", icon: <Sparkles size={22} />, disabled: false };
    return mode === "timer"
      ? { label: "Start timer", icon: <Timer size={22} />, disabled: false }
      : { label: "Reveal!", icon: <Sparkles size={22} />, disabled: false };
  })();

  const currentFx = animation === "random" ? { emoji: "🎲", label: "Surprise me" } : ANIMATIONS.find((a) => a.id === animation)!;

  return (
    <div className="flex flex-col gap-3">
      {/* Main row */}
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          aria-label="Previous"
          title="Previous (←)"
          className="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white/85 transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowLeft size={20} />
        </button>

        <motion.button
          type="button"
          onClick={onPrimary}
          disabled={primary.disabled}
          whileTap={!primary.disabled ? { scale: 0.96 } : undefined}
          className={cn(
            "brand-gradient relative flex h-14 min-w-[13rem] flex-1 items-center justify-center gap-2.5 overflow-hidden rounded-2xl px-6 font-display text-lg font-bold text-white",
            "shadow-[0_14px_40px_-10px_var(--c1),inset_0_1px_0_rgba(255,255,255,.35)] transition-all hover:brightness-110 disabled:cursor-wait disabled:opacity-80",
          )}
        >
          {/* sheen */}
          <span
            className="animate-shimmer pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage: "linear-gradient(110deg, transparent 30%, rgba(255,255,255,.35) 50%, transparent 70%)",
              backgroundSize: "200% 100%",
            }}
          />
          {/* auto-advance progress */}
          {phase === "revealed" && autoAdvance && !autoAdvancePaused && !isLast && (
            <span
              key={autoAdvanceKey}
              className="animate-progress absolute bottom-0 left-0 h-1.5 bg-white/80"
              style={{ animationDuration: `${autoAdvanceDelay}s` }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2.5 drop-shadow-[0_1px_1px_rgba(0,0,0,.25)]">
            {primary.icon}
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={primary.label}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -10, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {primary.label}
              </motion.span>
            </AnimatePresence>
          </span>
        </motion.button>

        <button
          type="button"
          onClick={onNext}
          disabled={isLast && phase !== "revealed"}
          aria-label="Next"
          title="Next (→)"
          className="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white/85 transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Secondary row */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Segmented<Mode>
          size="sm"
          value={mode}
          onChange={onModeChange}
          options={[
            { value: "timer", label: "Timer", icon: <Timer size={14} /> },
            { value: "manual", label: "Manual", icon: <Hand size={14} /> },
          ]}
        />

        <button
          type="button"
          onClick={onHint}
          disabled={!guessing || hintLevel >= maxHint}
          title="Hint (H)"
          className="glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white/85 transition hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Lightbulb size={14} className={cn(hintLevel > 0 && "fill-amber-300 text-amber-300")} />
          Hint
          {maxHint > 0 && (
            <span className="rounded-md bg-white/15 px-1.5 text-[10px] tabular-nums">
              {hintLevel}/{maxHint}
            </span>
          )}
        </button>

        <button
          type="button"
          disabled={!guessing}
          onPointerDown={(e) => {
            e.preventDefault();
            onPeekStart();
          }}
          onPointerUp={onPeekEnd}
          onPointerLeave={onPeekEnd}
          onPointerCancel={onPeekEnd}
          onContextMenu={(e) => e.preventDefault()}
          title="Hold for a blurry sneak peek"
          className="glass flex h-9 touch-none items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white/85 transition select-none hover:bg-white/15 active:scale-95 active:bg-white/25 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <Eye size={14} />
          Hold to peek
        </button>

        {/* Effect picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setFxOpen((v) => !v)}
            title="Reveal effect"
            className={cn(
              "glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white/85 transition hover:bg-white/15 active:scale-95",
              fxOpen && "bg-white/15",
            )}
          >
            <span>{currentFx.emoji}</span>
            {currentFx.label}
            <ChevronDown size={14} className={cn("transition-transform", fxOpen && "rotate-180")} />
          </button>
          <AnimatePresence>
            {fxOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setFxOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.16 }}
                  className="glass-strong absolute bottom-full left-1/2 z-40 mb-2 w-60 -translate-x-1/2 rounded-2xl p-1.5"
                >
                  {[{ id: "random" as const, emoji: "🎲", label: "Surprise me", description: "Random effect each reveal" }, ...ANIMATIONS].map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        onAnimationChange(a.id);
                        setFxOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-white/10",
                        animation === a.id && "bg-white/12",
                      )}
                    >
                      <span className="text-lg">{a.emoji}</span>
                      <span className="flex flex-col">
                        <span className="text-sm font-bold">{a.label}</span>
                        <span className="text-[11px] text-white/50">{a.description}</span>
                      </span>
                      {animation === a.id && <span className="ml-auto h-2 w-2 rounded-full brand-gradient" />}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={onRestart}
          title="Restart deck"
          className="glass flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold text-white/85 transition hover:bg-white/15 active:scale-95"
        >
          <RotateCcw size={14} />
          Restart
        </button>
      </div>
    </div>
  );
}
