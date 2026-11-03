import { motion } from "motion/react";
import { ArrowRight, RotateCcw, Shuffle, Users } from "lucide-react";
import type { AnswerResult, Person, QuizStats } from "../types";
import { Modal } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  deck: Person[];
  answers: Record<string, AnswerResult>;
  stats: QuizStats;
  quizMode: boolean;
  onReplay: () => void;
  onShuffleReplay: () => void;
  onManagePeople: () => void;
}

function rating(pct: number) {
  if (pct === 100) return { title: "Baby whisperer! 🍼", sub: "Flawless. Do you work at a maternity ward?" };
  if (pct >= 75) return { title: "Impressive! 🏆", sub: "You clearly pay attention to cheeks." };
  if (pct >= 50) return { title: "Not bad! 👍", sub: "Half the babies would be proud." };
  if (pct >= 25) return { title: "Hmm… 🤔", sub: "Babies really do all look alike, huh?" };
  return { title: "Who ARE these people?! 😅", sub: "Maybe peek a little next time." };
}

export function ResultsModal({ open, onClose, deck, answers, stats, quizMode, onReplay, onShuffleReplay, onManagePeople }: Props) {
  const total = deck.length;
  const pct = total ? Math.round((stats.correct / total) * 100) : 0;
  const r = rating(pct);
  const size = 150;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;

  return (
    <Modal open={open} onClose={onClose} size="lg" hideClose>
      <div className="p-6 sm:p-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
            className="mx-auto mb-3 text-6xl"
          >
            {quizMode ? (pct >= 50 ? "🎉" : "🙈") : "🎉"}
          </motion.div>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{quizMode ? r.title : "That's everyone!"}</h2>
          <p className="mt-1 text-white/60">{quizMode ? r.sub : "All the babies have grown up before your very eyes."}</p>
        </div>

        {quizMode && (
          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-10">
            <div className="relative" style={{ width: size, height: size }}>
              <svg width={size} height={size} className="-rotate-90">
                <defs>
                  <linearGradient id="resGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--c1)" />
                    <stop offset="100%" stopColor="var(--c2)" />
                  </linearGradient>
                </defs>
                <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,.1)" strokeWidth={stroke} fill="none" />
                <motion.circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke="url(#resGrad)"
                  strokeWidth={stroke}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={circ}
                  initial={{ strokeDashoffset: circ }}
                  animate={{ strokeDashoffset: circ * (1 - pct / 100) }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center">
                  <div className="font-display text-4xl font-bold">{pct}%</div>
                  <div className="text-[10px] font-black tracking-[0.2em] text-white/50 uppercase">accuracy</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
              {[
                { label: "Correct", value: stats.correct, cls: "text-emerald-300", emoji: "✅" },
                { label: "Wrong", value: stats.wrong, cls: "text-rose-300", emoji: "❌" },
                { label: "Missed", value: stats.missed, cls: "text-amber-300", emoji: "⏰" },
                { label: "Best streak", value: stats.bestStreak, cls: "text-orange-300", emoji: "🔥" },
              ].map((s) => (
                <div key={s.label} className="glass flex min-w-[8rem] items-center gap-3 rounded-2xl px-4 py-3">
                  <span className="text-xl">{s.emoji}</span>
                  <div>
                    <div className={cn("font-display text-2xl leading-none font-bold", s.cls)}>{s.value}</div>
                    <div className="text-[11px] font-bold text-white/50">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recap grid */}
        <div className="mt-7">
          <div className="mb-2 text-[11px] font-black tracking-[0.18em] text-white/45 uppercase">Recap</div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-5">
            {deck.map((p, i) => {
              const res = answers[p.id];
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i + 0.4 }}
                  className="glass flex flex-col items-center gap-2 rounded-2xl p-3"
                >
                  <div className="flex items-center gap-1">
                    <img src={p.babyImage} alt="" className="h-12 w-12 rounded-xl object-cover" />
                    <ArrowRight size={12} className="text-white/40" />
                    <img src={p.adultImage} alt="" className="h-12 w-12 rounded-xl object-cover" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-display text-sm font-semibold">{p.name}</span>
                    {res && (
                      <span className="text-xs">{res === "correct" ? "✅" : res === "wrong" ? "❌" : "⏰"}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onReplay}
            className="brand-gradient flex items-center gap-2 rounded-2xl px-6 py-3 font-display text-base font-bold shadow-[0_14px_40px_-10px_var(--c1)] transition hover:brightness-110 active:scale-95"
          >
            <RotateCcw size={18} /> Play again
          </button>
          <button
            type="button"
            onClick={onShuffleReplay}
            className="glass flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-base font-bold transition hover:bg-white/15 active:scale-95"
          >
            <Shuffle size={18} /> Shuffle &amp; replay
          </button>
          <button
            type="button"
            onClick={onManagePeople}
            className="glass flex items-center gap-2 rounded-2xl px-5 py-3 font-display text-base font-bold transition hover:bg-white/15 active:scale-95"
          >
            <Users size={18} /> Add people
          </button>
        </div>
      </div>
    </Modal>
  );
}
