export type Point = { x: number; y: number };
export type Stroke = Point[];

type Kind = "h" | "v" | "d";

interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  length: number;
  kind: Kind;
}

/* Generous on purpose: a hurried, slanted or wobbly F should still count. */
const AXIS_TOLERANCE = 32; // degrees either side of horizontal / vertical

function toSegment(a: Point, b: Point): Segment {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const angle = (Math.atan2(Math.abs(dy), Math.abs(dx)) * 180) / Math.PI;
  const kind: Kind = angle <= AXIS_TOLERANCE ? "h" : angle >= 90 - AXIS_TOLERANCE ? "v" : "d";
  return { x1: a.x, y1: a.y, x2: b.x, y2: b.y, length: Math.hypot(dx, dy), kind };
}

function distanceToLine(p: Point, a: Point, b: Point) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = Math.hypot(dx, dy);
  if (length === 0) return Math.hypot(p.x - a.x, p.y - a.y);
  return Math.abs(dy * p.x - dx * p.y + b.x * a.y - b.y * a.x) / length;
}

/** Ramer–Douglas–Peucker: reduces a hand-drawn stroke to its few straight-ish legs. */
function simplify(points: Point[], epsilon: number): Point[] {
  if (points.length < 3) return points;
  const first = points[0];
  const last = points[points.length - 1];
  let index = 0;
  let max = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = distanceToLine(points[i], first, last);
    if (distance > max) {
      max = distance;
      index = i;
    }
  }
  if (max <= epsilon) return [first, last];
  const left = simplify(points.slice(0, index + 1), epsilon);
  const right = simplify(points.slice(index), epsilon);
  return left.slice(0, -1).concat(right);
}

/** Splits a stroke into legs, re-joining consecutive legs that a wobble split in two. */
function strokeSegments(stroke: Stroke, epsilon: number): Segment[] {
  const corners = simplify(stroke, epsilon);
  const segments: Segment[] = [];
  for (let i = 1; i < corners.length; i++) {
    const next = toSegment(corners[i - 1], corners[i]);
    const previous = segments[segments.length - 1];
    const sameDirection =
      previous !== undefined &&
      previous.kind === next.kind &&
      next.kind !== "d" &&
      (previous.x2 - previous.x1) * (next.x2 - next.x1) + (previous.y2 - previous.y1) * (next.y2 - next.y1) > 0;
    if (sameDirection) {
      segments[segments.length - 1] = toSegment({ x: previous.x1, y: previous.y1 }, { x: next.x2, y: next.y2 });
    } else {
      segments.push(next);
    }
  }
  return segments;
}

/**
 * Decides whether the strokes read as a capital F: one tall stem, an arm at its top and a
 * second arm around its middle, both reaching right from the stem, and no foot at the bottom
 * (which would make it an E or an L). Works for any stroke order or count.
 */
export function recognizeF(strokes: Stroke[], minHeight: number): boolean {
  const points = strokes.flat();
  if (points.length < 6) return false;

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }
  const height = maxY - minY;
  const size = Math.max(height, maxX - minX);
  if (height < minHeight) return false;

  const epsilon = Math.max(4, size * 0.07);
  const segments = strokes.flatMap((stroke) => strokeSegments(stroke, epsilon)).filter((s) => s.length > size * 0.05);

  const stem = segments.filter((s) => s.kind === "v").sort((a, b) => b.length - a.length)[0];
  if (!stem) return false;

  const L = stem.length;
  if (L < height * 0.6) return false;

  const stemX = (stem.x1 + stem.x2) / 2;
  const stemTop = Math.min(stem.y1, stem.y2);

  // Scribbles: too much diagonal, or far more ink than an F needs.
  const total = segments.reduce((sum, s) => sum + s.length, 0);
  const diagonal = segments.reduce((sum, s) => sum + (s.kind === "d" ? s.length : 0), 0);
  if (diagonal > L * 0.9 || total > L * 6) return false;

  const arms = segments
    .filter((s) => s.kind === "h" && s.length >= L * 0.18)
    .map((s) => ({
      length: s.length,
      left: Math.min(s.x1, s.x2),
      right: Math.max(s.x1, s.x2),
      at: ((s.y1 + s.y2) / 2 - stemTop) / L, // 0 = top of the stem, 1 = its foot
    }))
    .filter((arm) => arm.left >= stemX - L * 0.3 && arm.left <= stemX + L * 0.3 && arm.right >= stemX + L * 0.22);

  const top = arms.find((arm) => arm.at >= -0.25 && arm.at <= 0.25 && arm.length >= L * 0.28);
  const middle = arms.find((arm) => arm !== top && arm.at > 0.25 && arm.at <= 0.78);
  const foot = arms.find((arm) => arm.at > 0.82 && arm.length >= L * 0.28);

  return Boolean(top && middle && !foot);
}
