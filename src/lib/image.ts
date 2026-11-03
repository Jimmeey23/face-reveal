type FaceBox = { boundingBox: DOMRectReadOnly };
type FaceDetectorCtor = new (opts?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
  detect(img: ImageBitmapSource): Promise<FaceBox[]>;
};

/** Face centre as fractions of the image, via the browser FaceDetector where supported. */
async function findFace(img: HTMLImageElement): Promise<{ x: number; y: number } | null> {
  const Detector = (window as unknown as { FaceDetector?: FaceDetectorCtor }).FaceDetector;
  if (!Detector) return null;
  try {
    const [face] = await new Detector({ fastMode: false, maxDetectedFaces: 1 }).detect(img);
    if (!face) return null;
    const b = face.boundingBox;
    return { x: (b.x + b.width / 2) / img.naturalWidth, y: (b.y + b.height / 2) / img.naturalHeight };
  } catch {
    return null;
  }
}

/**
 * Reads an image file, crops it to the 3:4 photo frame around the face (or the
 * upper-centre, where faces usually are) and encodes a high-quality JPEG data URL.
 */
export function compressImageFile(file: File, width = 1200, quality = 0.9): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please choose an image file."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      try {
        const W = img.naturalWidth;
        const H = img.naturalHeight;
        const cw = Math.min(W, (H * 3) / 4);
        const ch = (cw * 4) / 3;
        const face = (await findFace(img)) ?? { x: 0.5, y: 0.35 };
        const sx = Math.min(Math.max(face.x * W - cw / 2, 0), W - cw);
        const sy = Math.min(Math.max(face.y * H - ch * 0.42, 0), H - ch);
        // Never upscale: keep the source's own resolution if it is smaller.
        const outW = Math.round(Math.min(width, cw));
        const outH = Math.round((outW * 4) / 3);
        const canvas = document.createElement("canvas");
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas not supported");
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, sx, sy, cw, ch, 0, 0, outW, outH);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Couldn't read that image."));
    };
    img.src = url;
  });
}

export function uid(prefix = "p") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
