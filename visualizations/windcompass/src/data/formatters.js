import { SPEED_UNITS } from '../themes/skins.js';

/**
 * Readings are Celsius-based (live mode requests °C; search mode documents it),
 * so Fahrenheit is a display conversion only.
 */
export function formatTemp(tempC, unitKey) {
    if (unitKey === 'f') {
        return `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
    }
    return `${tempC.toFixed(1)}°C`;
}

export function formatSpeed(speedKmh, unitKey) {
    const unit = SPEED_UNITS[unitKey] || SPEED_UNITS.kmh;
    const value = speedKmh * unit.factor;
    return {
        value: value >= 100 ? value.toFixed(0) : value.toFixed(1),
        label: unit.label,
    };
}
