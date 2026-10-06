/** Shortest-path signed delta between two compass headings (degrees). */
export function shortestDelta(from, to) {
    return ((to - from) % 360 + 540) % 360 - 180;
}

/**
 * Fraction of the remaining distance covered per `durationMs` of elapsed time.
 *
 * Each frame closes a fixed proportion of what is left, which is exponential
 * decay rather than an easing curve over a fixed timeline: the needle moves
 * fastest at the start and settles asymptotically, the way a real instrument
 * does. `durationMs` is therefore a speed constant, not a wall-clock duration —
 * a move visibly settles over a few multiples of it.
 */
const SETTLE_FRACTION = 0.957125;

/**
 * Advance animated angle toward target by one frame.
 * Returns { angle, done }.
 */
export function stepAngle(current, target, durationMs, deltaMs) {
    const delta = shortestDelta(current, target);
    if (Math.abs(delta) < 0.5 || durationMs <= 0) {
        return { angle: target, done: true };
    }
    const step = delta * Math.min(1, (deltaMs / durationMs) * SETTLE_FRACTION);
    let next = current + step;
    if (Math.abs(shortestDelta(next, target)) < 0.5) {
        next = target;
    }
    return { angle: ((next % 360) + 360) % 360, done: next === target };
}
