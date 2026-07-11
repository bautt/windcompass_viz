import { useEffect, useRef, useState } from 'react';
import { stepAngle } from './angleAnimator.js';

/**
 * Smoothly animate a compass angle toward a target value.
 * Snaps instantly in edit mode or when duration is 0.
 */
export function useAngleAnimator(target, { durationMs = 600, enabled = true, snap = false } = {}) {
    const [angle, setAngle] = useState(target ?? 0);
    const angleRef = useRef(angle);
    const rafRef = useRef(null);
    const lastTsRef = useRef(null);

    useEffect(() => {
        if (target === null || target === undefined) return undefined;

        if (snap || !enabled || durationMs <= 0) {
            angleRef.current = target;
            setAngle(target);
            return undefined;
        }

        lastTsRef.current = null;

        const tick = (ts) => {
            if (lastTsRef.current === null) lastTsRef.current = ts;
            const deltaMs = ts - lastTsRef.current;
            lastTsRef.current = ts;

            const { angle: next, done } = stepAngle(angleRef.current, target, durationMs, deltaMs);
            angleRef.current = next;
            setAngle(next);

            if (!done) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [target, durationMs, enabled, snap]);

    return angle;
}
