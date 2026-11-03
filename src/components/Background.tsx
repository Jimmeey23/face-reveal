import { memo, useMemo } from "react";
import anim1 from "../assets/bg/anim-1.mp4";
import anim2 from "../assets/bg/anim-2.mp4";
import anim3 from "../assets/bg/anim-3.mp4";
import anim4 from "../assets/bg/anim-4.mp4";
import anim5 from "../assets/bg/anim-5.mp4";
import anim6 from "../assets/bg/anim-6.mp4";
import anim7 from "../assets/bg/anim-7.mp4";

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

// Animated baby clips as floating polaroids around the edges, kept clear of the centre photo.
const CLIPS: { src: string; top: string; left: string; w: string; rotate: number; duration: number; delay: number }[] = [
  { src: anim1, top: "8%", left: "3%", w: "clamp(7rem,12vw,11rem)", rotate: -8, duration: 9, delay: 0 },
  { src: anim2, top: "58%", left: "6%", w: "clamp(7rem,11vw,10rem)", rotate: 6, duration: 11, delay: -3 },
  { src: anim3, top: "36%", left: "-2%", w: "clamp(8rem,14vw,13rem)", rotate: -4, duration: 10, delay: -6 },
  { src: anim4, top: "6%", left: "84%", w: "clamp(7rem,11vw,10rem)", rotate: 7, duration: 12, delay: -2 },
  { src: anim5, top: "40%", left: "88%", w: "clamp(7rem,11vw,10rem)", rotate: -6, duration: 9.5, delay: -5 },
  { src: anim6, top: "70%", left: "80%", w: "clamp(8rem,14vw,13rem)", rotate: 5, duration: 10.5, delay: -7 },
  { src: anim7, top: "78%", left: "30%", w: "clamp(6rem,9vw,8.5rem)", rotate: -9, duration: 11.5, delay: -4 },
];

function ClipCollage() {
  return (
    <div className="absolute inset-0 overflow-hidden motion-reduce:hidden" aria-hidden>
      {CLIPS.map((c, i) => (
        <div
          key={i}
          className="animate-float absolute"
          style={{ top: c.top, left: c.left, width: c.w, animationDuration: `${c.duration}s`, animationDelay: `${c.delay}s` }}
        >
          <div
            className="rounded-xl bg-white/90 p-1.5 pb-4 opacity-45 shadow-[0_20px_40px_-12px_rgba(0,0,0,.7)] blur-[0.5px] saturate-[.9]"
            style={{ transform: `rotate(${c.rotate}deg)` }}
          >
            <video
              src={c.src}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              disablePictureInPicture
              className="block aspect-[3/4] w-full rounded-lg object-cover"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export const Background = memo(function Background({ particles }: { particles: boolean }) {
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
      <ClipCollage />
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
