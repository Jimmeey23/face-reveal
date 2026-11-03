import { AnimatePresence, motion } from "motion/react";
import { Brain, Hand, Play, Timer, Users } from "lucide-react";
import type { Mode, Settings } from "../types";
import { Segmented, Toggle } from "./ui";

interface Props {
  open: boolean;
  peopleCount: number;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
  onStart: () => void;
  onManagePeople: () => void;
  previewImages: string[];
}

export function StartScreen({ open, peopleCount, settings, onChange, onStart, onManagePeople, previewImages }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: "blur(8px)" }}
          transition={{ duration: 0.45 }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.1 }}
            className="glass-strong relative w-full max-w-lg overflow-hidden rounded-[2rem] p-7 text-center sm:p-9"
          >
            {/* floating preview photos */}
            <div className="relative mx-auto mb-5 flex h-28 items-end justify-center">
              {previewImages.slice(0, 5).map((src, i) => {
                const mid = (previewImages.length - 1) / 2;
                const off = i - mid;
                return (
                  <motion.img
                    key={src}
                    src={src}
                    alt=""
                    initial={{ y: 40, opacity: 0, rotate: 0 }}
                    animate={{ y: Math.abs(off) * 8, opacity: 1, rotate: off * 9 }}
                    transition={{ delay: 0.25 + i * 0.07, type: "spring", stiffness: 220, damping: 18 }}
                    className="animate-float -mx-2 h-20 w-20 rounded-2xl border-[3px] border-white object-cover shadow-xl sm:h-24 sm:w-24"
                    style={{ zIndex: 10 - Math.abs(off), animationDelay: `${i * 0.4}s`, animationDuration: `${6 + i}s` }}
                  />
                );
              })}
              <span className="animate-float absolute -top-2 right-6 text-3xl" style={{ animationDuration: "5s" }}>
                ✨
              </span>
            </div>

            <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Guess the <span className="brand-text">Baby</span>
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-sm text-white/65 sm:text-base">
              One adorable baby photo at a time. Guess who it is, then watch them grow up right before your eyes.
            </p>

            <div className="mt-6 space-y-2 text-left">
              <div className="px-3">
                <div className="mb-2 text-xs font-black tracking-[0.18em] text-white/45 uppercase">How to reveal</div>
                <Segmented<Mode>
                  className="w-full"
                  value={settings.mode}
                  onChange={(mode) => onChange({ mode })}
                  options={[
                    { value: "timer", label: `Timer · ${settings.timerSeconds}s`, icon: <Timer size={14} /> },
                    { value: "manual", label: "Manual", icon: <Hand size={14} /> },
                  ]}
                />
              </div>
              <Toggle
                icon={<Brain size={16} />}
                label="Quiz mode"
                description="Pick the name from 4 options, keep score"
                checked={settings.quizMode}
                onChange={(quizMode) => onChange({ quizMode })}
              />
            </div>

            <motion.button
              type="button"
              onClick={onStart}
              disabled={peopleCount === 0}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="brand-gradient mt-6 flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 font-display text-xl font-bold text-white shadow-[0_18px_50px_-12px_var(--c1)] transition hover:brightness-110 disabled:opacity-40"
            >
              <Play size={22} className="fill-white" />
              Let's play · {peopleCount} {peopleCount === 1 ? "baby" : "babies"}
            </motion.button>

            <button
              type="button"
              onClick={onManagePeople}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white/60 transition hover:text-white"
            >
              <Users size={15} /> Add your own photos
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
