import { SPEED_UNITS } from '../themes/skins.js';

export function formatSpeed(speedKmh, unitKey) {
    const unit = SPEED_UNITS[unitKey] || SPEED_UNITS.kmh;
    const value = speedKmh * unit.factor;
    return {
        value: value >= 100 ? value.toFixed(0) : value.toFixed(1),
        label: unit.label,
    };
}
