/** Shortest-path signed delta between two compass headings (degrees). */
export function shortestDelta(from, to) {
    return ((to - from) % 360 + 540) % 360 - 180;
}

/** Cubic ease-out for smooth needle/dial rotation. */
export function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
}

/**
 * Advance animated angle toward target by one frame.
 * Returns { angle, done }.
 */
export function stepAngle(current, target, durationMs, deltaMs) {
    const delta = shortestDelta(current, target);
    if (Math.abs(delta) < 0.5 || durationMs <= 0) {
        return { angle: target, done: true };
    }
    const step = delta * Math.min(1, (deltaMs / durationMs) * easeOutCubic(0.65));
    let next = current + step;
    if (Math.abs(shortestDelta(next, target)) < 0.5) {
        next = target;
    }
    return { angle: ((next % 360) + 360) % 360, done: next === target };
}
