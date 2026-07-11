/** 16-point compass rose (meteorological: direction wind comes from). */
const COMPASS_16 = [
    'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export function degreesToCompass(degrees) {
    const normalized = ((Number(degrees) % 360) + 360) % 360;
    return COMPASS_16[Math.round(normalized / 22.5) % 16];
}

export function formatDirection(degrees, { showDegrees = true, showCompass = true } = {}) {
    const rounded = Math.round(degrees);
    const compass = degreesToCompass(degrees);

    if (showDegrees && showCompass) {
        return `${rounded}° ${compass}`;
    }
    if (showCompass) {
        return compass;
    }
    return `${rounded}°`;
}
