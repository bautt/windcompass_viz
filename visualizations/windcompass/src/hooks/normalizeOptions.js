import { SKINS } from '../themes/skins.js';
export function normalizeOptions(raw = {}, defaults = {}) {
    const out = { ...defaults };

    for (const [key, value] of Object.entries(raw)) {
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
        if (value === 'true' || value === 1 || value === '1') return true;
        if (value === 'false' || value === 0 || value === '0') return false;
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

    if (name === 'colorMode') {
        if (value === 'custom' || value === 'skin') return value;
        return 'skin';
    }

    return value;
}
