import { AnimatePresence, motion } from "motion/react";
import { useId, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../utils/cn";

/* ---------------- Icon button ---------------- */
interface IconButtonProps {
  label: string;
  onClick?: () => void;
  active?: boolean;
  children: ReactNode;
  className?: string;
  shortcut?: string;
  disabled?: boolean;
}
export function IconButton({ label, onClick, active, children, className, shortcut, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "group relative grid h-10 w-10 place-items-center rounded-xl text-white/80 transition-all duration-200",
        "glass hover:bg-white/15 hover:text-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-40",
        active && "bg-white/20 text-white ring-2 ring-brand-1/60",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------------- Toggle ---------------- */
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  icon?: ReactNode;
}
export function Toggle({ checked, onChange, label, description, icon }: ToggleProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl px-3 py-2.5 transition-colors hover:bg-white/5">
      <span className="flex items-center gap-3">
        {icon && <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/8 text-white/80">{icon}</span>}
        <span className="flex flex-col">
          <span className="text-sm font-bold text-white/95">{label}</span>
          {description && <span className="text-xs text-white/50">{description}</span>}
        </span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300",
          checked ? "brand-gradient shadow-[0_0_18px_-2px_var(--c1)]" : "bg-white/15",
        )}
      >
        <span
          className={cn(
            "absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-300",
            checked && "translate-x-5",
          )}
        />
      </button>
    </label>
  );
}

/* ---------------- Segmented control ---------------- */
interface SegmentedProps<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; icon?: ReactNode }[];
  className?: string;
  size?: "sm" | "md";
}
export function Segmented<T extends string>({ value, onChange, options, className, size = "md" }: SegmentedProps<T>) {
  const id = useId();
  return (
    <div className={cn("glass inline-flex rounded-2xl p-1", className)}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative flex items-center gap-1.5 rounded-xl font-bold transition-colors",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
              active ? "text-white" : "text-white/60 hover:text-white/90",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-xl brand-gradient shadow-lg"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Slider ---------------- */
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  label: string;
  format?: (v: number) => string;
}
export function Slider({ value, min, max, step = 1, onChange, label, format }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="px-3 py-2">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-white/95">{label}</span>
        <span className="rounded-lg bg-white/10 px-2 py-0.5 font-display text-sm font-semibold brand-text">
          {format ? format(value) : value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-brand w-full"
        style={{ ["--pct" as string]: `${pct}%` }}
        aria-label={label}
      />
    </div>
  );
}

/* ---------------- Modal ---------------- */
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: "md" | "lg";
  hideClose?: boolean;
}
export function Modal({ open, onClose, title, children, size = "md", hideClose }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className={cn(
              "glass-strong relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl",
              size === "lg" ? "sm:max-w-3xl" : "sm:max-w-xl",
            )}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between gap-4 border-b border-white/10 px-6 py-4">
                <div className="font-display text-xl font-semibold">{title}</div>
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="grid h-9 w-9 place-items-center rounded-xl text-white/70 transition hover:bg-white/10 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Section heading ---------------- */
export function SectionTitle({ children, icon }: { children: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mt-6 mb-2 flex items-center gap-2 px-3 text-[11px] font-black tracking-[0.18em] text-white/45 uppercase first:mt-0">
      {icon}
      {children}
    </div>
  );
}

/* ---------------- Keyboard key ---------------- */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-flex min-w-[1.6rem] items-center justify-center rounded-md border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans text-[11px] font-bold text-white/80 shadow-[0_2px_0_rgba(255,255,255,0.08)]">
      {children}
    </kbd>
  );
}
