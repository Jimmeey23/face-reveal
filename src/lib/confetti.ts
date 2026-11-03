import confetti from "canvas-confetti";

let emojiShapes: confetti.Shape[] | null = null;
let sadShapes: confetti.Shape[] | null = null;

function getEmojiShapes() {
  if (!emojiShapes) {
    try {
      emojiShapes = ["👶", "🍼", "🎉", "✨", "🧸"].map((text) => confetti.shapeFromText({ text, scalar: 2.4 }));
    } catch {
      emojiShapes = [];
    }
  }
  return emojiShapes;
}

function getSadShapes() {
  if (!sadShapes) {
    try {
      sadShapes = ["😅", "🙈", "💭"].map((text) => confetti.shapeFromText({ text, scalar: 2.4 }));
    } catch {
      sadShapes = [];
    }
  }
  return sadShapes;
}

function paletteColors(): string[] {
  const css = getComputedStyle(document.documentElement);
  const read = (v: string) => css.getPropertyValue(v).trim();
  return [read("--c1"), read("--c2"), read("--c3"), "#ffffff", "#ffe66d"].filter(Boolean);
}

/** Big celebratory burst from both sides + emoji rain. */
export function celebrate() {
  const colors = paletteColors();
  const end = Date.now() + 1200;
  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 60,
      origin: { x: 0, y: 0.7 },
      colors,
      zIndex: 9999,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 60,
      origin: { x: 1, y: 0.7 },
      colors,
      zIndex: 9999,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  confetti({
    particleCount: 90,
    spread: 100,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.5 },
    colors,
    zIndex: 9999,
    scalar: 1.1,
  });

  const shapes = getEmojiShapes();
  if (shapes.length) {
    confetti({
      particleCount: 18,
      spread: 120,
      startVelocity: 35,
      origin: { x: 0.5, y: 0.45 },
      shapes,
      scalar: 2.4,
      gravity: 0.9,
      zIndex: 9999,
      flat: true,
    });
  }
}

/** Gentle little puff, used for small wins. */
export function sprinkle(x = 0.5, y = 0.5) {
  confetti({
    particleCount: 30,
    spread: 70,
    startVelocity: 25,
    origin: { x, y },
    colors: paletteColors(),
    zIndex: 9999,
    scalar: 0.8,
  });
}

/** Soft "oops" emoji rain for wrong/missed guesses. */
export function sadRain() {
  const shapes = getSadShapes();
  confetti({
    particleCount: 14,
    spread: 80,
    startVelocity: 20,
    gravity: 0.7,
    origin: { x: 0.5, y: 0.3 },
    shapes: shapes.length ? shapes : undefined,
    colors: ["#94a3b8", "#cbd5e1"],
    scalar: shapes.length ? 2.2 : 1,
    zIndex: 9999,
    flat: true,
  });
}
