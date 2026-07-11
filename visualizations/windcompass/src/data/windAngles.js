export function normalizeDegrees(deg) {
    return ((deg % 360) + 360) % 360;
}

/**
 * Needle angle on the compass rose.
 * Fixed: meteorological degrees (north up).
 * Heading: relative to vessel heading when heading is available.
 */
export function displayWindAngle(windDirection, heading, dialMode) {
    if (dialMode === 'heading' && heading !== null && heading !== undefined) {
        return normalizeDegrees(windDirection - heading);
    }
    return normalizeDegrees(windDirection);
}
