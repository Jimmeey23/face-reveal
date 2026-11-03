import { memo, useEffect, useMemo, useState, type CSSProperties } from "react";
import type { RevealAnimation } from "../types";
import { cn } from "../utils/cn";

interface Props {
  baby: string;
  adult: string;
  animation: RevealAnimation;
  revealed: boolean;
  /** When false the stage snaps to its target state without transitions. */
  animate: boolean;
  yearsApart?: number;
  peeking?: boolean;
}

const EASE = "cubic-bezier(.4,0,.2,1)";
const LAYER = "absolute inset-0 h-full w-full select-none object-contain";

function tr(animate: boolean, props: string[], ms: number, ease = EASE, delay = 0) {
  if (!animate) return "none";
  return props.map((p) => `${p} ${ms}ms ${ease} ${delay}ms`).join(", ");
}

/* ------------------------------------------------------------------ */
/* Morph: blur + scale crossfade with a soft flash                      */
/* ------------------------------------------------------------------ */
function Morph({ baby, adult, revealed, animate }: Props) {
  const t = tr(animate, ["opacity", "transform", "filter"], 1500);
  return (
    <>
      <img
        src={adult}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "scale(1)" : "scale(1.22)",
          filter: revealed ? "blur(0px)" : "blur(18px)",
          transition: t,
        }}
      />
      <img
        src={baby}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          opacity: revealed ? 0 : 1,
          transform: revealed ? "scale(1.22)" : "scale(1)",
          filter: revealed ? "blur(18px) saturate(1.5)" : "blur(0px) saturate(1)",
          transition: t,
        }}
      />
      {revealed && animate && (
        <div
          className="animate-flash pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,.95), rgba(255,255,255,0) 70%)" }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Flip: 3D card flip                                                   */
/* ------------------------------------------------------------------ */
function Flip({ baby, adult, revealed, animate }: Props) {
  return (
    <div className="absolute inset-0" style={{ perspective: 1400 }}>
      <div
        className="preserve-3d absolute inset-0"
        style={{
          transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
          transition: tr(animate, ["transform"], 1200, "cubic-bezier(.68,-0.3,.3,1.25)"),
        }}
      >
        <img src={baby} alt="" draggable={false} className={cn(LAYER, "backface-hidden")} />
        <img
          src={adult}
          alt=""
          draggable={false}
          className={cn(LAYER, "backface-hidden")}
          style={{ transform: "rotateY(180deg)" }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Iris: circular wipe                                                  */
/* ------------------------------------------------------------------ */
function Iris({ baby, adult, revealed, animate }: Props) {
  const ease = "cubic-bezier(.65,0,.35,1)";
  return (
    <>
      <img
        src={baby}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          transform: revealed ? "scale(1.1)" : "scale(1)",
          filter: revealed ? "blur(4px) brightness(.7)" : "blur(0px) brightness(1)",
          transition: tr(animate, ["transform", "filter"], 1300),
        }}
      />
      <img
        src={adult}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          clipPath: revealed ? "circle(75% at 50% 50%)" : "circle(0% at 50% 50%)",
          transition: tr(animate, ["clip-path"], 1300, ease),
        }}
      />
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 aspect-square rounded-full border-[3px] border-white"
        style={{
          width: revealed ? "160%" : "0%",
          opacity: revealed ? 0 : 1,
          transform: "translate(-50%,-50%)",
          boxShadow: "0 0 40px 6px rgba(255,255,255,.55)",
          transition: animate ? `width 1300ms ${ease}, opacity 900ms ease-in 400ms` : "none",
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Wipe: curtain + glowing scanline                                     */
/* ------------------------------------------------------------------ */
function Wipe({ baby, adult, revealed, animate }: Props) {
  return (
    <>
      <img
        src={adult}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          transform: revealed ? "scale(1)" : "scale(1.12)",
          transition: tr(animate, ["transform"], 1200),
        }}
      />
      <img
        src={baby}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          clipPath: revealed ? "inset(100% 0 0 0)" : "inset(0 0 0 0)",
          transition: tr(animate, ["clip-path"], 1200, "cubic-bezier(.76,0,.24,1)"),
        }}
      />
      {revealed && animate && (
        <div
          className="animate-sweep pointer-events-none absolute right-0 left-0 h-[3px]"
          style={{
            background: "linear-gradient(90deg, transparent, #fff 30%, #fff 70%, transparent)",
            boxShadow: "0 0 28px 8px rgba(255,255,255,.7), 0 0 60px 20px color-mix(in oklab, var(--c1) 60%, transparent)",
          }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Blinds: vertical slats flipping                                      */
/* ------------------------------------------------------------------ */
const SLATS = 9;
function Blinds({ revealed, animate }: Props) {
  return (
    <>
      {Array.from({ length: SLATS }, (_, i) => {
        const faceStyle: CSSProperties = {
          backgroundSize: "100cqw 100cqh",
          backgroundPosition: `calc(-${i} * 100cqw / ${SLATS}) 0`,
          backgroundRepeat: "no-repeat",
        };
        return (
          <div
            key={i}
            className="absolute top-0 h-full"
            style={{ left: `calc(${i} * 100cqw / ${SLATS})`, width: `calc(100cqw / ${SLATS} + 1px)`, perspective: 900 }}
          >
            <div
              className="preserve-3d absolute inset-0"
              style={{
                transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
                transition: tr(animate, ["transform"], 760, "cubic-bezier(.45,0,.2,1)", i * 85),
              }}
            >
              <div className="backface-hidden absolute inset-0" style={{ ...faceStyle, backgroundImage: "var(--baby)" }} />
              <div
                className="backface-hidden absolute inset-0"
                style={{ ...faceStyle, backgroundImage: "var(--adult)", transform: "rotateY(180deg)" }}
              />
            </div>
          </div>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Tiles: shared by Pixel Dust (dissolve) and Shatter                   */
/* ------------------------------------------------------------------ */
function Tiles({ baby, adult, revealed, animate, variant }: Props & { variant: "dissolve" | "shatter" }) {
  const cols = variant === "dissolve" ? 9 : 6;
  const rows = cols;

  const tiles = useMemo(() => {
    const list: { x: number; y: number; delay: number; transform: string }[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (variant === "dissolve") {
          const diag = (x + y) / (cols + rows - 2);
          list.push({
            x,
            y,
            delay: diag * 750 + Math.random() * 350,
            transform: `translateY(-${12 + Math.random() * 18}px) scale(.25) rotate(${(Math.random() - 0.5) * 50}deg)`,
          });
        } else {
          const cx = x + 0.5 - cols / 2;
          const cy = y + 0.5 - rows / 2;
          const dist = Math.hypot(cx, cy);
          const max = Math.hypot(cols / 2, rows / 2);
          const nx = cx / (dist || 1);
          const ny = cy / (dist || 1);
          const force = 260 + Math.random() * 260;
          list.push({
            x,
            y,
            delay: (dist / max) * 220 + Math.random() * 120,
            transform: `translate(${nx * force + (Math.random() - 0.5) * 60}px, ${ny * force + 120 + (Math.random() - 0.5) * 60}px) rotate(${(Math.random() - 0.5) * 260}deg) scale(.5)`,
          });
        }
      }
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  return (
    <>
      <img
        src={adult}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          transform: revealed ? "scale(1)" : "scale(1.1)",
          filter: revealed ? "brightness(1)" : "brightness(.6)",
          transition: tr(animate, ["transform", "filter"], 1500),
        }}
      />
      {tiles.map((t) => (
        <div
          key={`${t.x}-${t.y}`}
          className="absolute"
          style={{
            left: `calc(${t.x} * 100cqw / ${cols})`,
            top: `calc(${t.y} * 100cqh / ${rows})`,
            width: `calc(100cqw / ${cols} + 1px)`,
            height: `calc(100cqh / ${rows} + 1px)`,
            backgroundImage: "var(--baby)",
            backgroundSize: "100cqw 100cqh",
            backgroundPosition: `calc(-${t.x} * 100cqw / ${cols}) calc(-${t.y} * 100cqh / ${rows})`,
            backgroundRepeat: "no-repeat",
            opacity: revealed ? 0 : 1,
            transform: revealed ? t.transform : "none",
            filter: revealed && variant === "dissolve" ? "blur(2px)" : "none",
            transition: tr(
              animate,
              ["opacity", "transform", "filter"],
              variant === "dissolve" ? 650 : 950,
              variant === "dissolve" ? "cubic-bezier(.4,0,.6,1)" : "cubic-bezier(.5,0,.9,.4)",
              t.delay,
            ),
            willChange: animate ? "transform, opacity" : undefined,
          }}
        />
      ))}
      {/* pristine baby image on top until the reveal starts (prevents any seam artefacts at rest) */}
      <img src={baby} alt="" draggable={false} className={LAYER} style={{ opacity: revealed ? 0 : 1 }} />
      {revealed && animate && variant === "shatter" && (
        <div
          className="animate-flash pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,.9), rgba(255,255,255,0) 65%)" }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Time warp: zoom through the years                                    */
/* ------------------------------------------------------------------ */
function YearsTicker({ years }: { years: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const p = Math.min(1, (now - start) / 1150);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * years));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [years]);
  return (
    <div className="animate-ticker pointer-events-none absolute inset-0 grid place-items-center">
      <div className="text-center">
        <div
          className="font-display text-7xl font-bold text-white tabular-nums sm:text-8xl"
          style={{ textShadow: "0 0 30px rgba(255,255,255,.8), 0 4px 20px rgba(0,0,0,.5)" }}
        >
          +{n}
        </div>
        <div className="font-display text-lg font-semibold tracking-[0.3em] text-white/90 uppercase">years later</div>
      </div>
    </div>
  );
}

function TimeWarp({ baby, adult, revealed, animate, yearsApart = 25 }: Props) {
  return (
    <>
      <img
        src={adult}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          transform: revealed ? "scale(1) rotate(0deg)" : "scale(.2) rotate(-35deg)",
          opacity: revealed ? 1 : 0,
          filter: revealed ? "blur(0px)" : "blur(12px)",
          transition: tr(animate, ["transform", "opacity", "filter"], 1300, "cubic-bezier(.2,.8,.2,1)", 350),
        }}
      />
      <img
        src={baby}
        alt=""
        draggable={false}
        className={LAYER}
        style={{
          transform: revealed ? "scale(3.2) rotate(28deg)" : "scale(1) rotate(0deg)",
          opacity: revealed ? 0 : 1,
          filter: revealed ? "blur(14px)" : "blur(0px)",
          transition: tr(animate, ["transform", "opacity", "filter"], 1100, "cubic-bezier(.7,0,.84,0)"),
        }}
      />
      {revealed && animate && (
        <>
          <div
            className="animate-warp-spin pointer-events-none absolute inset-[-60%]"
            style={{
              background: "repeating-conic-gradient(from 0deg, rgba(255,255,255,.22) 0 3deg, transparent 3deg 11deg)",
              maskImage: "radial-gradient(circle, transparent 18%, black 55%)",
              WebkitMaskImage: "radial-gradient(circle, transparent 18%, black 55%)",
            }}
          />
          <YearsTicker years={yearsApart} />
        </>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Stage                                                                */
/* ------------------------------------------------------------------ */
export const RevealStage = memo(function RevealStage(props: Props) {
  const { animation, baby, adult, peeking } = props;

  let content;
  switch (animation) {
    case "flip":
      content = <Flip {...props} />;
      break;
    case "iris":
      content = <Iris {...props} />;
      break;
    case "wipe":
      content = <Wipe {...props} />;
      break;
    case "blinds":
      content = <Blinds {...props} />;
      break;
    case "timewarp":
      content = <TimeWarp {...props} />;
      break;
    case "dissolve":
      content = <Tiles {...props} variant="dissolve" />;
      break;
    case "shatter":
      content = <Tiles {...props} variant="shatter" />;
      break;
    default:
      content = <Morph {...props} />;
  }

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-neutral-900"
      style={
        {
          containerType: "size",
          "--baby": `url("${baby}")`,
          "--adult": `url("${adult}")`,
        } as CSSProperties
      }
    >
      {content}
      {/* Sneak peek overlay */}
      <img
        src={adult}
        alt=""
        draggable={false}
        aria-hidden
        className={cn(LAYER, "pointer-events-none transition-opacity duration-200")}
        style={{
          opacity: peeking ? 1 : 0,
          filter: "blur(22px) saturate(1.3) contrast(1.1)",
          transform: "scale(1.15)",
        }}
      />
    </div>
  );
});
