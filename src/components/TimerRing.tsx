import { Pause, Play } from "lucide-react";
import { useCountdown } from "../hooks/useCountdown";
import { cn } from "../utils/cn";

interface Props {
  duration: number;
  active: boolean;
  paused: boolean;
  onComplete: () => void;
  onTick?: (secondsLeft: number) => void;
  onClick?: () => void;
  size?: number;
}

export function TimerRing({ duration, active, paused, onComplete, onTick, onClick, size = 88 }: Props) {
  const { remaining, progress } = useCountdown({ duration, active, paused, onComplete, onTick });
  const stroke = 7;
  const r = (size - stroke * 2) / 2;
  const c = 2 * Math.PI * r;
  const secs = Math.max(0, Math.ceil(remaining));
  const urgent = active && !paused && remaining <= 3.05 && remaining > 0;
  const color = !active ? "rgba(255,255,255,.55)" : progress > 0.5 ? "url(#ringGrad)" : progress > 0.25 ? "#fbbf24" : "#f87171";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={!active ? "Start timer" : paused ? "Resume timer" : "Pause timer"}
      title={!active ? "Start timer" : paused ? "Resume" : "Pause"}
      className={cn(
        "group relative grid place-items-center rounded-full bg-neutral-900/90 shadow-[0_12px_30px_-8px_rgba(0,0,0,.6)] ring-[5px] ring-white backdrop-blur transition-transform hover:scale-105 active:scale-95",
        urgent && "shadow-[0_0_40px_-4px_rgba(248,113,113,.9)]",
      )}
      style={{ width: size, height: size }}
    >
      {urgent && <span className="animate-pulse-ring absolute inset-0 rounded-full border-4 border-red-400" />}
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--c1)" />
            <stop offset="100%" stopColor="var(--c2)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.12)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - (active ? progress : 1))}
          style={{ transition: "stroke .4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {active && paused ? (
          <Play size={size * 0.3} className="ml-1 fill-white text-white" />
        ) : (
          <span
            className={cn(
              "font-display font-bold text-white tabular-nums",
              urgent && "animate-heartbeat text-red-300",
            )}
            style={{ fontSize: size * 0.34, lineHeight: 1 }}
          >
            {active ? secs : duration}
          </span>
        )}
        {/* hover affordance */}
        <span className="absolute bottom-2 text-white/60 opacity-0 transition-opacity group-hover:opacity-100">
          {!active ? <Play size={10} className="fill-current" /> : paused ? null : <Pause size={10} className="fill-current" />}
        </span>
      </div>
    </button>
  );
}
