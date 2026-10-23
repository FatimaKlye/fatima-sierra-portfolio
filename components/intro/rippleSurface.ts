import { getTheme, subscribeTheme } from "@/lib/theme";

/**
 * A still, blush-white (or, in dark mode, deep charcoal) pool with a faint "F" resting beneath it.
 *
 * Classic two-buffer height-field ripples run on a coarse grid (~90k cells at most), and each
 * cell refracts and shades the background texture by the local slope. The canvas is sized to the
 * grid and stretched by CSS, so the browser's bilinear upscale gives the water its soft look for
 * free. Steps run at a fixed 60Hz so ripples travel at the same speed on 120Hz screens.
 */

export interface RippleSurface {
  /** Drops a ripple at a viewport point (CSS px). */
  drop(x: number, y: number, amplitude: number, radius?: number): void;
  /** Disturbs the surface along a pointer path (CSS px). */
  stir(x0: number, y0: number, x1: number, y1: number, amplitude: number): void;
  destroy(): void;
}

const MAX_CELLS = 90_000;
const DAMPING = 0.984;
const STEP_MS = 1000 / 60;
const REFRACTION = 0.07; // texture cells displaced per unit of slope
const SHADING = 0.42; // brightness per unit of slope
const MAX_SHADE = 46;

interface Palette {
  top: string;
  bottom: string;
  glyph: string;
  /** Per-channel (r, g, b) response to slope: crests lift by `crest`, troughs deepen by `trough`. */
  crest: [number, number, number];
  trough: [number, number, number];
}

const PALETTES: Record<"light" | "dark", Palette> = {
  // Crests lift toward white; troughs deepen toward rose rather than grey.
  light: {
    top: "#fff9fb", // --color-background
    bottom: "#fcf0f5",
    glyph: "rgba(166, 61, 104, 0.1)", // --color-primary, barely there
    crest: [0.4, 1, 0.75],
    trough: [0.3, 0.95, 0.62],
  },
  // Crests catch a dusty-rose sheen; troughs settle gently toward the charcoal floor.
  dark: {
    top: "#161215", // a breath above --color-background
    bottom: "#121012",
    glyph: "rgba(219, 130, 168, 0.12)", // dark --color-primary, barely there
    crest: [1, 0.62, 0.8],
    trough: [0.25, 0.3, 0.28],
  },
};

export const GLYPH_CENTER_Y = 0.45; // fraction of the viewport height

export function createRippleSurface(canvas: HTMLCanvasElement, { animate }: { animate: boolean }): RippleSurface {
  const ctx = canvas.getContext("2d");
  const texture = document.createElement("canvas");
  const tctx = texture.getContext("2d", { willReadFrequently: true });
  if (!ctx || !tctx) return { drop() {}, stir() {}, destroy() {} };

  let scale = 4;
  let W = 0;
  let H = 0;
  let current = new Float32Array(0);
  let previous = new Float32Array(0);
  // Background texture split into channels so refraction can sample between cells (bilinear),
  // which keeps the glyph's edges smooth instead of stepping a whole cell at a time.
  let texR = new Float32Array(0);
  let texG = new Float32Array(0);
  let texB = new Float32Array(0);
  let image = ctx.createImageData(1, 1);
  let out = new Uint32Array(image.data.buffer);

  let frame = 0;
  let lastTime = 0;
  let accumulator = 0;
  let nextAmbient = 0;
  let destroyed = false;
  let dirty = true;
  let palette = PALETTES[getTheme()];

  const fontFamily = getComputedStyle(document.body).fontFamily || "sans-serif";

  const paintTexture = () => {
    palette = PALETTES[getTheme()];
    texture.width = W;
    texture.height = H;
    const gradient = tctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, palette.top);
    gradient.addColorStop(1, palette.bottom);
    tctx.fillStyle = gradient;
    tctx.fillRect(0, 0, W, H);

    const size = Math.min(H * 0.56, W * 0.95);
    tctx.font = `500 ${size}px ${fontFamily}`;
    tctx.textAlign = "left";
    tctx.textBaseline = "alphabetic";
    const m = tctx.measureText("F");
    const glyphWidth = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
    const x = W / 2 - glyphWidth / 2 + m.actualBoundingBoxLeft;
    const y = H * GLYPH_CENTER_Y + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2;
    tctx.fillStyle = palette.glyph;
    tctx.fillText("F", x, y);

    const pixels = tctx.getImageData(0, 0, W, H).data;
    out.set(new Uint32Array(pixels.buffer)); // border cells never move, so they keep these pixels for good
    texR = new Float32Array(W * H);
    texG = new Float32Array(W * H);
    texB = new Float32Array(W * H);
    for (let i = 0, p = 0; i < W * H; i++, p += 4) {
      texR[i] = pixels[p];
      texG[i] = pixels[p + 1];
      texB[i] = pixels[p + 2];
    }
    dirty = true;
  };

  const render = () => {
    const [crestR, crestG, crestB] = palette.crest;
    const [troughR, troughG, troughB] = palette.trough;
    for (let y = 1; y < H - 1; y++) {
      let i = y * W + 1;
      for (let x = 1; x < W - 1; x++, i++) {
        const dx = current[i - 1] - current[i + 1];
        const dy = current[i - W] - current[i + W];

        let fx = x + dx * REFRACTION;
        let fy = y + dy * REFRACTION;
        if (fx < 0) fx = 0;
        else if (fx > W - 2) fx = W - 2;
        if (fy < 0) fy = 0;
        else if (fy > H - 2) fy = H - 2;
        const ix = fx | 0;
        const iy = fy | 0;
        const tx = fx - ix;
        const ty = fy - iy;
        const j = iy * W + ix;
        const w00 = (1 - tx) * (1 - ty);
        const w10 = tx * (1 - ty);
        const w01 = (1 - tx) * ty;
        const w11 = tx * ty;

        let shade = (dx + dy) * SHADING;
        if (shade > MAX_SHADE) shade = MAX_SHADE;
        else if (shade < -MAX_SHADE) shade = -MAX_SHADE;

        let r = texR[j] * w00 + texR[j + 1] * w10 + texR[j + W] * w01 + texR[j + W + 1] * w11;
        let g = texG[j] * w00 + texG[j + 1] * w10 + texG[j + W] * w01 + texG[j + W + 1] * w11;
        let b = texB[j] * w00 + texB[j + 1] * w10 + texB[j + W] * w01 + texB[j + W + 1] * w11;
        if (shade > 0) {
          r += shade * crestR;
          g += shade * crestG;
          b += shade * crestB;
        } else {
          r += shade * troughR;
          g += shade * troughG;
          b += shade * troughB;
        }
        r = r < 0 ? 0 : r > 255 ? 255 : r | 0;
        g = g < 0 ? 0 : g > 255 ? 255 : g | 0;
        b = b < 0 ? 0 : b > 255 ? 255 : b | 0;
        out[i] = (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
      }
    }
    ctx.putImageData(image, 0, 0);
    dirty = false;
  };

  const resize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    scale = Math.max(3, Math.ceil(Math.sqrt((width * height) / MAX_CELLS)));
    W = Math.max(8, Math.ceil(width / scale));
    H = Math.max(8, Math.ceil(height / scale));
    canvas.width = W;
    canvas.height = H;
    current = new Float32Array(W * H);
    previous = new Float32Array(W * H);
    image = ctx.createImageData(W, H);
    out = new Uint32Array(image.data.buffer);
    paintTexture();
    render();
  };

  const step = () => {
    for (let y = 1; y < H - 1; y++) {
      let i = y * W + 1;
      for (let x = 1; x < W - 1; x++, i++) {
        previous[i] = ((current[i - 1] + current[i + 1] + current[i - W] + current[i + W]) * 0.5 - previous[i]) * DAMPING;
      }
    }
    const swap = current;
    current = previous;
    previous = swap;
  };

  const drop = (x: number, y: number, amplitude: number, radius = 3) => {
    if (!animate) return;
    const cx = x / scale;
    const cy = y / scale;
    const r = Math.max(1.5, radius);
    const x0 = Math.max(1, Math.floor(cx - r));
    const x1 = Math.min(W - 2, Math.ceil(cx + r));
    const y0 = Math.max(1, Math.floor(cy - r));
    const y1 = Math.min(H - 2, Math.ceil(cy + r));
    for (let gy = y0; gy <= y1; gy++) {
      for (let gx = x0; gx <= x1; gx++) {
        const d = Math.hypot(gx - cx, gy - cy);
        if (d < r) current[gy * W + gx] += amplitude * 0.5 * (1 + Math.cos((Math.PI * d) / r));
      }
    }
  };

  const stir = (x0: number, y0: number, x1: number, y1: number, amplitude: number) => {
    if (!animate) return;
    const radius = 3;
    const spacing = radius * scale * 0.9;
    const distance = Math.hypot(x1 - x0, y1 - y0);
    const count = Math.min(24, Math.max(1, Math.ceil(distance / spacing)));
    for (let k = 1; k <= count; k++) {
      const t = k / count;
      drop(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, amplitude, radius);
    }
  };

  const tick = (time: number) => {
    if (destroyed) return;
    accumulator += Math.min(time - (lastTime || time), 100);
    lastTime = time;

    if (time > nextAmbient) {
      // A drop now and then keeps the pool breathing without ever looking busy.
      nextAmbient = time + 900 + Math.random() * 1400;
      drop(Math.random() * W * scale, Math.random() * H * scale, 5 + Math.random() * 7, 4 + Math.random() * 3);
    }

    let steps = 0;
    while (accumulator >= STEP_MS && steps < 3) {
      step();
      accumulator -= STEP_MS;
      steps++;
    }
    if (steps === 3) accumulator = 0;
    if (steps || dirty) render();

    frame = requestAnimationFrame(tick);
  };

  let resizeFrame = 0;
  const onResize = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(resize);
  };

  resize();
  // Poppins arrives via next/font with display: swap, so repaint the glyph once it has loaded.
  document.fonts?.ready.then(() => {
    if (destroyed) return;
    paintTexture();
    render();
  });
  window.addEventListener("resize", onResize);
  // A theme change from elsewhere (system, another tab) repaints the pool in place.
  const unsubscribeTheme = subscribeTheme(() => {
    if (destroyed) return;
    paintTexture();
    render();
  });
  if (animate) frame = requestAnimationFrame(tick);

  return {
    drop,
    stir,
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      cancelAnimationFrame(resizeFrame);
      window.removeEventListener("resize", onResize);
      unsubscribeTheme();
    },
  };
}
