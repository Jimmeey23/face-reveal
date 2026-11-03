import { AnimatePresence, motion } from "motion/react";
import {
  Brain,
  Check,
  Hand,
  Keyboard,
  MessageSquareQuote,
  Music4,
  Palette as PaletteIcon,
  PartyPopper,
  Play,
  Shuffle,
  SkipForward,
  Sparkles,
  Timer,
  X,
  Gamepad2,
  Wand2,
} from "lucide-react";
import { ANIMATIONS, DEFAULT_SETTINGS, PALETTES, type Mode, type Settings } from "../types";
import { Kbd, SectionTitle, Segmented, Slider, Toggle } from "./ui";
import { cn } from "../utils/cn";

interface Props {
  open: boolean;
  onClose: () => void;
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

const SHORTCUTS: [string, string][] = [
  ["Space", "Start timer / Reveal / Next"],
  ["→ / ←", "Next / previous baby"],
  ["R", "Reveal now"],
  ["1 – 4", "Pick a quiz answer"],
  ["H", "Show a hint"],
  ["T", "Toggle timer / manual"],
  ["Q", "Toggle quiz mode"],
  ["F", "Fullscreen"],
  ["M", "Mute / unmute"],
  ["S", "Settings"],
  ["U", "Manage people"],
  ["Esc", "Close panels"],
];

export function SettingsPanel({ open, onClose, settings, onChange }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="glass-strong fixed inset-y-0 right-0 z-[75] flex w-full max-w-md flex-col rounded-l-3xl"
            role="dialog"
            aria-label="Settings"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-semibold">Settings</h2>
                <p className="text-xs text-white/50">Tweak the game to taste — everything saves automatically.</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close settings"
                className="grid h-9 w-9 place-items-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              {/* ---------------- Game ---------------- */}
              <SectionTitle icon={<Gamepad2 size={13} />}>Game</SectionTitle>
              <div className="px-3 py-2">
                <div className="mb-2 text-sm font-bold text-white/95">Reveal mode</div>
                <Segmented<Mode>
                  className="w-full"
                  value={settings.mode}
                  onChange={(mode) => onChange({ mode })}
                  options={[
                    { value: "timer", label: "Countdown timer", icon: <Timer size={14} /> },
                    { value: "manual", label: "Manual reveal", icon: <Hand size={14} /> },
                  ]}
                />
              </div>
              <Slider
                label="Timer length"
                value={settings.timerSeconds}
                min={3}
                max={60}
                onChange={(timerSeconds) => onChange({ timerSeconds })}
                format={(v) => `${v}s`}
              />
              <Toggle
                icon={<Play size={16} />}
                label="Auto-start timer"
                description="Countdown begins as soon as a new baby appears"
                checked={settings.autoStartTimer}
                onChange={(autoStartTimer) => onChange({ autoStartTimer })}
              />
              <Toggle
                icon={<Brain size={16} />}
                label="Quiz mode"
                description="Multiple-choice names, scoring & streaks"
                checked={settings.quizMode}
                onChange={(quizMode) => onChange({ quizMode })}
              />
              <Toggle
                icon={<Shuffle size={16} />}
                label="Shuffle order"
                description="Randomize the deck each round"
                checked={settings.shuffle}
                onChange={(shuffle) => onChange({ shuffle })}
              />
              <Toggle
                icon={<MessageSquareQuote size={16} />}
                label="Show fun facts"
                description="Display the little caption after the reveal"
                checked={settings.showFunFacts}
                onChange={(showFunFacts) => onChange({ showFunFacts })}
              />

              {/* ---------------- Reveal ---------------- */}
              <SectionTitle icon={<Wand2 size={13} />}>Reveal effect</SectionTitle>
              <div className="grid grid-cols-3 gap-2 px-3 py-2">
                {[{ id: "random" as const, emoji: "🎲", label: "Surprise", description: "Random every time" }, ...ANIMATIONS].map((a) => {
                  const active = settings.animation === a.id;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => onChange({ animation: a.id })}
                      title={a.description}
                      className={cn(
                        "relative flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-all",
                        active
                          ? "border-white/40 bg-white/15 shadow-[0_0_24px_-6px_var(--c1)]"
                          : "border-white/10 bg-white/5 hover:bg-white/10",
                      )}
                    >
                      <span className="text-2xl">{a.emoji}</span>
                      <span className="text-xs font-bold">{a.label}</span>
                      {active && (
                        <span className="absolute top-1.5 right-1.5 grid h-4 w-4 place-items-center rounded-full brand-gradient">
                          <Check size={10} strokeWidth={4} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <Toggle
                icon={<SkipForward size={16} />}
                label="Auto-advance"
                description="Move to the next baby after the reveal (hands-free slideshow)"
                checked={settings.autoAdvance}
                onChange={(autoAdvance) => onChange({ autoAdvance })}
              />
              {settings.autoAdvance && (
                <Slider
                  label="Linger after reveal"
                  value={settings.autoAdvanceDelay}
                  min={2}
                  max={20}
                  onChange={(autoAdvanceDelay) => onChange({ autoAdvanceDelay })}
                  format={(v) => `${v}s`}
                />
              )}

              {/* ---------------- Look & feel ---------------- */}
              <SectionTitle icon={<PaletteIcon size={13} />}>Look &amp; feel</SectionTitle>
              <div className="grid grid-cols-4 gap-2 px-3 py-2">
                {PALETTES.map((p) => {
                  const active = settings.palette === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onChange({ palette: p.id })}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-2xl border p-2 transition-all",
                        active ? "border-white/50 bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10",
                      )}
                    >
                      <span
                        className="h-9 w-full rounded-xl shadow-inner"
                        style={{ background: `linear-gradient(120deg, ${p.colors[0]}, ${p.colors[1]} 55%, ${p.colors[2]})` }}
                      />
                      <span className="text-[11px] font-bold">{p.label}</span>
                    </button>
                  );
                })}
              </div>
              <Toggle
                icon={<Music4 size={16} />}
                label="Sound effects"
                description="Ticks, whooshes and fanfares"
                checked={settings.sound}
                onChange={(sound) => onChange({ sound })}
              />
              <Toggle
                icon={<PartyPopper size={16} />}
                label="Confetti"
                description="Celebrate every reveal"
                checked={settings.confetti}
                onChange={(confetti) => onChange({ confetti })}
              />
              <Toggle
                icon={<Sparkles size={16} />}
                label="Floating particles"
                description="Little emoji drifting in the background"
                checked={settings.showParticles}
                onChange={(showParticles) => onChange({ showParticles })}
              />

              {/* ---------------- Shortcuts ---------------- */}
              <SectionTitle icon={<Keyboard size={13} />}>Keyboard shortcuts</SectionTitle>
              <div className="grid grid-cols-1 gap-1 px-3 py-1">
                {SHORTCUTS.map(([k, d]) => (
                  <div key={k} className="flex items-center justify-between rounded-lg px-1 py-1 text-sm">
                    <span className="text-white/70">{d}</span>
                    <Kbd>{k}</Kbd>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 px-6 py-3">
              <button
                type="button"
                onClick={() => onChange({ ...DEFAULT_SETTINGS })}
                className="text-xs font-bold text-white/50 underline-offset-4 transition hover:text-white hover:underline"
              >
                Reset to defaults
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
