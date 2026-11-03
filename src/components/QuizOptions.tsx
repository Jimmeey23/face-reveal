import { motion } from "motion/react";
import { Check, X } from "lucide-react";
import { cn } from "../utils/cn";

interface Props {
  options: string[];
  correct: string;
  selected: string | null;
  disabled: boolean;
  onSelect: (name: string) => void;
}

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export function QuizOptions({ options, correct, selected, disabled, onSelect }: Props) {
  const answered = selected !== null;
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {options.map((name, i) => {
        const isCorrect = name === correct;
        const isSelected = name === selected;
        const showCorrect = answered && isCorrect;
        const showWrong = answered && isSelected && !isCorrect;
        return (
          <motion.button
            key={name}
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 * i + 0.2, type: "spring", stiffness: 300, damping: 22 }}
            whileHover={!answered && !disabled ? { scale: 1.03, y: -2 } : undefined}
            whileTap={!answered && !disabled ? { scale: 0.97 } : undefined}
            disabled={disabled || answered}
            onClick={() => onSelect(name)}
            className={cn(
              "group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3 py-3 text-left transition-colors",
              "glass disabled:cursor-default",
              !answered && !disabled && "hover:bg-white/14",
              showCorrect && "border-emerald-300/60 bg-emerald-500/30 shadow-[0_0_30px_-6px_rgba(52,211,153,.8)]",
              showWrong && "animate-shake border-rose-300/60 bg-rose-500/30",
              answered && !showCorrect && !showWrong && "opacity-40",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-xl font-display text-sm font-bold transition-colors",
                showCorrect ? "bg-emerald-400 text-emerald-950" : showWrong ? "bg-rose-400 text-rose-950" : "bg-white/12 text-white/80 group-hover:bg-white/20",
              )}
            >
              {showCorrect ? <Check size={16} strokeWidth={3.5} /> : showWrong ? <X size={16} strokeWidth={3.5} /> : LETTERS[i]}
            </span>
            <span className="truncate font-display text-lg font-semibold text-white">{name}</span>
            <span className="absolute right-2 text-[10px] font-bold text-white/30">{i + 1}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
