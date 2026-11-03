import { motion } from "motion/react";
import type { AnswerResult, Person } from "../types";
import { cn } from "../utils/cn";

interface Props {
  deck: Person[];
  index: number;
  revealed: Set<string>;
  answers: Record<string, AnswerResult>;
  onJump: (i: number) => void;
}

export function ProgressStrip({ deck, index, revealed, answers, onJump }: Props) {
  if (!deck.length) return null;
  const pct = ((index + 1) / deck.length) * 100;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1 text-[11px] font-black tracking-[0.18em] text-white/45 uppercase">
        <span>
          Round {index + 1} <span className="text-white/25">/</span> {deck.length}
        </span>
        <span>{revealed.size} revealed</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full brand-gradient"
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 py-2">
        {deck.map((p, i) => {
          const isRevealed = revealed.has(p.id);
          const res = answers[p.id];
          const active = i === index;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onJump(i)}
              title={isRevealed ? p.name : `Baby #${i + 1}`}
              className={cn(
                "relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-2 transition-all duration-300",
                active ? "scale-110 ring-white shadow-[0_0_0_4px_color-mix(in_oklab,var(--c1)_55%,transparent)]" : "ring-white/15 hover:ring-white/50",
                !isRevealed && !active && "opacity-70",
              )}
            >
              <img
                src={isRevealed ? p.adultImage : p.babyImage}
                alt=""
                className={cn("h-full w-full object-cover transition-all duration-700", !isRevealed && !active && "grayscale-[35%]")}
              />
              {res && (
                <span
                  className={cn(
                    "absolute right-0 bottom-0 grid h-4 w-4 place-items-center rounded-full text-[9px] font-black text-white ring-2 ring-neutral-900",
                    res === "correct" ? "bg-emerald-500" : res === "wrong" ? "bg-rose-500" : "bg-amber-500",
                  )}
                >
                  {res === "correct" ? "✓" : res === "wrong" ? "✗" : "!"}
                </span>
              )}
              {!isRevealed && !active && (
                <span className="absolute inset-0 grid place-items-center bg-black/35 font-display text-base font-bold text-white/90">
                  ?
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
