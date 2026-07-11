export function normalizeDegrees(deg) {
    return ((deg % 360) + 360) % 360;
}
