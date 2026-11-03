import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Check, Clock, X } from "lucide-react";
import { useCallback, type PointerEvent } from "react";
import type { AnswerResult, Person, Phase, RevealAnimation, RevealStyle } from "../types";
import { RevealStage } from "./RevealStage";
import { Sticker, type StickerVariant } from "./Sticker";
import { TimerRing } from "./TimerRing";
import { cn } from "../utils/cn";

interface Props {
  person: Person;
  phase: Phase;
  animation: RevealAnimation;
  revealStyle: RevealStyle;
  animateReveal: boolean;
  peeking: boolean;
  hintLevel: number;
  showFunFact: boolean;
  result?: AnswerResult;
  quizMode: boolean;
  // timer
  showTimer: boolean;
  timerSeconds: number;
  timerPaused: boolean;
  onTimerComplete: () => void;
  onTimerTick: (s: number) => void;
  onTimerClick: () => void;
}

function hintText(name: string, level: number, funFact?: string) {
  if (level <= 0 || !name.trim()) return null;
  const first = name.trim().charAt(0).toUpperCase();
  const blanks = name
    .trim()
    .split("")
    .map((ch, i) => (i === 0 ? first : ch === " " ? " " : "_"))
    .join(" ");
  if (level === 1) return `Starts with "${first}" · ${name.replace(/\s/g, "").length} letters`;
  if (level === 2 && funFact) return funFact;
  return blanks;
}

export function PhotoCard(props: Props) {
  const {
    person,
    phase,
    animation,
    revealStyle,
    animateReveal,
    peeking,
    hintLevel,
    showFunFact,
    result,
    quizMode,
    showTimer,
    timerSeconds,
    timerPaused,
    onTimerComplete,
    onTimerTick,
    onTimerClick,
  } = props;

  const isRevealed = phase === "revealed";
  const stageRevealed = phase === "revealing" || phase === "revealed";

  // --- 3D tilt ---
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [7, -7]), { stiffness: 180, damping: 18 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 180, damping: 18 });

  const onMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (phase === "revealing" || e.pointerType === "touch") return;
      const rect = e.currentTarget.getBoundingClientRect();
      mx.set((e.clientX - rect.left) / rect.width - 0.5);
      my.set((e.clientY - rect.top) / rect.height - 0.5);
    },
    [mx, my, phase],
  );
  const onLeave = useCallback(() => {
    mx.set(0);
    my.set(0);
  }, [mx, my]);

  let stickerVariant: StickerVariant = "question";
  if (isRevealed) {
    stickerVariant = result === "correct" ? "correct" : result === "wrong" ? "wrong" : result === "missed" ? "missed" : "reveal";
  }

  const hint = !isRevealed ? hintText(person.name, hintLevel, person.funFact) : null;
  const revealImage = revealStyle === "photo" ? person.adultImage : person.babyImage;

  return (
    <div className="relative w-full" style={{ perspective: 1400 }}>
      <motion.div
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* Sticker: above the polaroid on small screens, beside it on wide ones; never covers the photo */}
        {!(isRevealed && revealStyle === "hidden") && (
          <div className="relative z-20 mb-4 w-[min(80%,19rem)] lg:absolute lg:top-4 lg:right-full lg:mr-8 lg:mb-0 lg:w-[17rem]" style={{ transform: "translateZ(40px)" }}>
            <Sticker variant={stickerVariant} seed={person.id} name={person.name} hideName={revealStyle === "hidden" || !person.name} />
          </div>
        )}

        {/* Polaroid frame */}
        <div
          className={cn(
            "relative rounded-[1.5rem] bg-white p-3 pb-3 text-neutral-900 transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]",
            "shadow-[0_30px_70px_-20px_rgba(0,0,0,.75),0_0_0_1px_rgba(0,0,0,.08)]",
            isRevealed ? "rotate-[1.2deg]" : "-rotate-[1.6deg]",
          )}
        >
          <div
            className={cn(
              "relative aspect-[3/4] overflow-hidden rounded-[1rem] bg-neutral-200",
              phase === "counting" && "ring-2 ring-brand-1/40 ring-offset-2 ring-offset-white",
            )}
          >
            <RevealStage
              key={person.id}
              baby={person.babyImage}
              adult={revealImage}
              animation={animation}
              revealed={stageRevealed}
              animate={animateReveal}
              yearsApart={person.yearsApart}
              peeking={revealStyle === "photo" && peeking}
            />
            {/* glossy sheen + inner vignette */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/25 mix-blend-overlay" />
            <div
              className="pointer-events-none absolute inset-0"
              style={{ boxShadow: "inset 0 0 60px rgba(0,0,0,.18), inset 0 0 0 1px rgba(0,0,0,.06)" }}
            />
            {/* Peek label */}
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 bottom-3 flex justify-center transition-opacity duration-200",
                peeking ? "opacity-100" : "opacity-0",
              )}
            >
              <span className="rounded-full bg-black/60 px-3 py-1 font-display text-sm font-semibold text-white backdrop-blur">
                👀 sneaky peek…
              </span>
            </div>
            {/* Quiz result badge */}
            {isRevealed && quizMode && result && (
              <div
                className={cn(
                  "animate-pop absolute right-3 bottom-3 grid h-14 w-14 place-items-center rounded-full border-4 border-white text-white shadow-xl",
                  result === "correct" && "bg-emerald-500",
                  result === "wrong" && "bg-rose-500",
                  result === "missed" && "bg-amber-500",
                )}
              >
                {result === "correct" ? <Check size={28} strokeWidth={3.5} /> : result === "wrong" ? <X size={28} strokeWidth={3.5} /> : <Clock size={26} strokeWidth={3} />}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="flex min-h-[4rem] flex-col items-center justify-center px-3 pt-3 pb-1 text-center">
            {isRevealed ? (
              <>
                {revealStyle !== "hidden" && person.name && (
                  <div className="animate-stamp font-display text-3xl font-bold tracking-tight sm:text-4xl">
                    <span className="brand-text">{person.name}</span>
                  </div>
                )}
                {revealStyle === "photo" && showFunFact && person.funFact && (
                    <p className="animate-fade-up mt-1 max-w-[95%] font-hand text-lg leading-snug text-neutral-600" style={{ animationDelay: "0.35s" }}>
                      {person.funFact}
                    </p>
                  )}
                {revealStyle === "photo" && person.yearsApart && (
                    <span
                      className="animate-fade-up mt-1.5 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-[11px] font-black tracking-wider text-neutral-500 uppercase"
                      style={{ animationDelay: "0.5s" }}
                    >
                      ⏳ {person.yearsApart} years later
                    </span>
                  )}
              </>
            ) : (
              <>
                <p className="font-hand text-2xl text-neutral-500">
                  {phase === "revealing" ? "drumroll please… 🥁" : "who could it be? 🤔"}
                </p>
                {hint && (
                  <p className="animate-fade-up mt-1 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200">
                    💡 {hint}
                  </p>
                )}
              </>
            )}
          </div>
          {/* Tape */}
          <div
            className="animate-tape pointer-events-none absolute top-0 left-1/2 h-7 w-28 bg-[rgba(255,236,170,.72)] shadow-md backdrop-blur-[1px]"
            style={{
              transform: "translate(-50%,-50%) rotate(-3deg)",
              clipPath: "polygon(1% 0, 99% 5%, 100% 100%, 0 95%)",
              backgroundImage: "repeating-linear-gradient(90deg, rgba(255,255,255,.25) 0 2px, transparent 2px 6px)",
            }}
          />
        </div>

        {/* Timer */}
        {showTimer && (
          <div
            className={cn(
              "absolute -top-5 -right-1 z-20 transition-all duration-500 sm:-top-6 sm:-right-6",
              !(phase === "idle" || phase === "counting") && "pointer-events-none scale-50 opacity-0",
            )}
            style={{ transform: "translateZ(50px)" }}
          >
            <TimerRing
              duration={timerSeconds}
              active={phase === "counting"}
              paused={timerPaused}
              onComplete={onTimerComplete}
              onTick={onTimerTick}
              onClick={onTimerClick}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
