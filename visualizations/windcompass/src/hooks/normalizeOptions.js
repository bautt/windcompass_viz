import { SKINS } from '../themes/skins.js';

const BOOLEAN_OPTIONS = new Set([
    'showCardinals',
    'showMajorTicks',
    'showMinorTicks',
    'showTrueWind',
    'showTrueDirectionReadout',
    'showTrueSpeedReadout',
    'showCenterSpeed',
    'showTemperature',
    'showLocation',
    'showDirectionLabel',
    'showWeatherCondition',
    'showCompass',
    'showFrame',
]);

function isBooleanOption(name, defaultValue) {
    return typeof defaultValue === 'boolean' || BOOLEAN_OPTIONS.has(name);
}

/** Normalize DS checkbox/toggle values to strict booleans. */
export function isOptionEnabled(value) {
    if (value === true || value === 1) return true;
    if (value === false || value === 0 || value === null || value === undefined) return false;
    const s = String(value).trim().toLowerCase();
    if (s === 'true' || s === '1' || s === 'yes' || s === 'on') return true;
    if (s === 'false' || s === '0' || s === 'no' || s === 'off' || s === '') return false;
    return false;
}

function bareKey(key) {
    return key.includes('.') ? key.split('.').pop() : key;
}

function prefixedBooleanValue(raw, name) {
    let prefixedValue;
    for (const [key, value] of Object.entries(raw)) {
        if (!key.includes('.') || bareKey(key) !== name) continue;
        if (value === undefined || value === null) continue;
        prefixedValue = value;
    }
    return prefixedValue;
}

/**
 * Resolve one boolean option's effective value.
 *
 * Dashboard Studio's checkbox editor writes a bare key (`showCenterSpeed`)
 * ONLY when the value differs from the schema default — toggling a checkbox
 * back to its default is often never serialized. That leaves legacy
 * `windcompass.windcompass.showCenterSpeed` values (baked into older saved
 * dashboards) stuck in control forever, since there's no bare key to
 * override them.
 *
 * Once a panel's options contain ANY bare boolean key, it has been "claimed"
 * by the modern checkbox editor: every boolean in that panel is governed by
 * bare keys, and any boolean without one is treated as the schema default
 * (never a stale prefixed leftover). Panels with no bare boolean keys at all
 * (fully legacy, e.g. hand-authored dashboard JSON) keep using prefixed
 * values so they aren't silently reset.
 */
function resolveBooleanOption(raw, name, editorClaimed) {
    if (Object.prototype.hasOwnProperty.call(raw, name)) {
        const value = raw[name];
        if (value === undefined || value === null) return undefined;
        return isOptionEnabled(value);
    }

    if (editorClaimed) return undefined;

    const prefixedValue = prefixedBooleanValue(raw, name);
    if (prefixedValue === undefined) return undefined;
    return isOptionEnabled(prefixedValue);
}

/**
 * Strip DS option keys to their bare names and coerce types.
 *
 * Saved dashboards may carry prefixed keys (`windcompass.windcompass.skin`)
 * alongside or instead of bare editor keys (`skin`). See
 * `resolveBooleanOption` for how mixed bare/prefixed boolean panels are
 * handled; other option types use natural key order (last wins).
 */
export function normalizeOptions(raw = {}, defaults = {}) {
    const out = { ...defaults };

    const editorClaimed = [...BOOLEAN_OPTIONS].some((name) =>
        Object.prototype.hasOwnProperty.call(raw, name),
    );

    for (const [key, value] of Object.entries(raw)) {
        if (value === undefined || value === null) continue;

        const bare = bareKey(key);
        const defaultValue = defaults[bare];
        if (isBooleanOption(bare, defaultValue)) continue;

        if (value === '' && typeof defaultValue !== 'string') continue;
        if (value === '' && defaultValue === '') continue;

        out[bare] = coerceValue(bare, value, defaultValue);
    }

    for (const name of BOOLEAN_OPTIONS) {
        const resolved = resolveBooleanOption(raw, name, editorClaimed);
        if (resolved !== undefined) {
            out[name] = resolved;
        }
    }

    return out;
}

function coerceValue(name, value, defaultValue) {
    if (isBooleanOption(name, defaultValue)) {
        return isOptionEnabled(value);
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

    return value;
}
