import { AnimatePresence, motion } from "motion/react";
import { memo, useEffect, useMemo, useState } from "react";

const EMOJIS = ["👶", "🍼", "🧸", "✨", "🎈", "⭐", "🎀", "🌈"];

function Particles() {
  const items = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        emoji: EMOJIS[i % EMOJIS.length],
        left: Math.random() * 100,
        delay: -Math.random() * 18,
        duration: 14 + Math.random() * 12,
        size: 14 + Math.random() * 18,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {items.map((p) => (
        <span
          key={p.id}
          className="animate-rise absolute select-none"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            filter: "blur(0.3px)",
            opacity: 0,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}

// The current baby's animated clips filling the whole background, behind the photo card.
// With several clips they play in turn. Faded and softly blurred so the photo stays the highlight.
function ClipBackdrop({ clips }: { clips?: string[] }) {
  const [turn, setTurn] = useState(0);
  useEffect(() => setTurn(0), [clips]);
  const src = clips?.length ? clips[turn % clips.length] : undefined;
  const single = (clips?.length ?? 0) < 2;
  return (
    <div className="absolute inset-0 motion-reduce:hidden" aria-hidden>
      <AnimatePresence>
        {src && (
          <motion.video
            key={src}
            src={src}
            autoPlay
            muted
            loop={single}
            onEnded={() => setTurn((t) => t + 1)}
            playsInline
            disablePictureInPicture
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full object-cover object-[50%_30%] blur-[3px] saturate-[1.15]"
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export const Background = memo(function Background({ particles, clips }: { particles: boolean; clips?: string[] }) {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      {/* base gradient */}
      <div
        className="absolute inset-0 transition-[background] duration-700"
        style={{
          background:
            "radial-gradient(120% 90% at 50% -10%, var(--bg-b) 0%, var(--bg-a) 55%, #05030c 100%)",
        }}
      />
      {/* drifting orbs */}
      <div
        className="animate-drift absolute -top-32 -left-24 h-[48vmax] w-[48vmax] rounded-full opacity-50 blur-[90px]"
        style={{ background: "var(--c1)", animationDuration: "28s" }}
      />
      <div
        className="animate-drift absolute top-1/3 -right-32 h-[42vmax] w-[42vmax] rounded-full opacity-40 blur-[100px]"
        style={{ background: "var(--c3)", animationDuration: "34s", animationDelay: "-12s" }}
      />
      <div
        className="animate-drift absolute -bottom-40 left-1/3 h-[40vmax] w-[40vmax] rounded-full opacity-35 blur-[110px]"
        style={{ background: "var(--c2)", animationDuration: "31s", animationDelay: "-20s" }}
      />
      <ClipBackdrop clips={clips} />
      {/* soft vignette */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(80% 70% at 50% 50%, transparent 40%, rgba(0,0,0,0.55) 100%)" }}
      />
      {/* dotted grid */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(70% 70% at 50% 50%, black 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(70% 70% at 50% 50%, black 30%, transparent 100%)",
        }}
      />
      {/* film grain */}
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {particles && <Particles />}
    </div>
  );
});
