import { SKINS } from '../themes/skins.js';

/**
 * Strip DS option keys to their bare names and coerce types.
 *
 * DS may deliver both a bare schema key (`showTemperature`) and a prefixed
 * instance key (`windcompass.windcompass.showTemperature`). The prefixed
 * instance value is the user's actual setting and MUST win, regardless of
 * key ordering — so we apply bare keys first, then let prefixed keys override.
 */
export function normalizeOptions(raw = {}, defaults = {}) {
    const out = { ...defaults };

    const entries = Object.entries(raw);
    const bareEntries = entries.filter(([k]) => !k.includes('.'));
    const prefixedEntries = entries.filter(([k]) => k.includes('.'));

    for (const [key, value] of [...bareEntries, ...prefixedEntries]) {
        if (value === undefined || value === null) continue;

        const bare = key.includes('.') ? key.split('.').pop() : key;
        const defaultValue = defaults[bare];

        if (value === '' && typeof defaultValue !== 'string') continue;
        if (value === '' && defaultValue === '') continue;

        out[bare] = coerceValue(bare, value, defaultValue);
    }

    return out;
}

function coerceValue(name, value, defaultValue) {
    if (typeof defaultValue === 'boolean') {
        if (value === true || value === false) return value;
        const s = String(value).trim().toLowerCase();
        if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
        if (s === 'false' || s === '0' || s === 'no' || s === 'off' || s === '') return false;
        return defaultValue;
    }

    if (typeof defaultValue === 'number' && typeof value === 'string' && value !== '') {
        const n = Number(value);
        if (!Number.isNaN(n)) return n;
    }

    if (name === 'skin') {
        const aliases = { minimal: 'clean', marine_dark: 'marine' };
        const resolved = aliases[value] || value;
        if (SKINS[resolved]) return resolved;
    }

    // back-compat: old colorMode/preset string values → boolean useDefaults
    if (name === 'useDefaults') {
        if (value === true || value === 'true' || value === 1 || value === '1') return true;
        if (value === 'defaults' || value === 'skin') return true;
        return false;
    }

    return value;
}
