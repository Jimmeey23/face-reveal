import { AnimatePresence, motion } from "motion/react";
import { cn } from "../utils/cn";

export type StickerVariant = "question" | "reveal" | "correct" | "wrong" | "missed";

interface Props {
  variant: StickerVariant;
  name?: string;
  className?: string;
}

const CONTENT: Record<StickerVariant, { text: (n: string) => string; emoji: string; bg: string; tail: string }> = {
  question: {
    text: () => "Can you guess who this cute lil baby is?",
    emoji: "👶",
    bg: "linear-gradient(135deg, var(--c1) 0%, var(--c3) 100%)",
    tail: "color-mix(in oklab, var(--c1) 45%, var(--c3))",
  },
  reveal: {
    text: (n) => `Ta-da! It's ${n}!`,
    emoji: "🎉",
    bg: "linear-gradient(135deg, var(--c2) 0%, var(--c1) 100%)",
    tail: "color-mix(in oklab, var(--c2) 45%, var(--c1))",
  },
  correct: {
    text: (n) => `Nailed it! It's ${n}!`,
    emoji: "🏆",
    bg: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    tail: "#10b981",
  },
  wrong: {
    text: (n) => `Nope — it's ${n}!`,
    emoji: "😅",
    bg: "linear-gradient(135deg, #fb7185 0%, #e11d48 100%)",
    tail: "#e11d48",
  },
  missed: {
    text: (n) => `Time's up! It's ${n}!`,
    emoji: "⏰",
    bg: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
    tail: "#f97316",
  },
};

export function Sticker({ variant, name = "", className }: Props) {
  const c = CONTENT[variant];
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={variant}
        initial={{ scale: 0, rotate: -35, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        exit={{ scale: 0, rotate: 25, opacity: 0 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className={cn("sticker-shadow origin-bottom-left", className)}
      >
        <div className="animate-wobble relative origin-center">
          <div
            className="relative rounded-[1.5rem] border-[5px] border-white px-5 py-3 pr-9 text-white"
            style={{ background: c.bg }}
          >
            <span
              className="text-stroke-dark block font-display text-[1.15rem] leading-[1.15] font-bold sm:text-[1.3rem]"
              style={{ textWrap: "balance" }}
            >
              {c.text(name)}
            </span>
            {/* speech tail: white outline + colored fill */}
            <span className="absolute -bottom-[21px] left-8 h-0 w-0 border-x-[14px] border-t-[18px] border-x-transparent border-t-white" />
            <span
              className="absolute -bottom-[10px] left-[42px] h-0 w-0 border-x-[8px] border-t-[11px] border-x-transparent"
              style={{ borderTopColor: c.tail }}
            />
          </div>
          {/* emoji badge */}
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 400, damping: 14 }}
            className="animate-float absolute -top-4 -right-4 grid h-11 w-11 place-items-center rounded-full border-[4px] border-white bg-white text-2xl shadow-lg"
            style={{ animationDuration: "3.5s" }}
          >
            {c.emoji}
          </motion.span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
