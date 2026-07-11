import { SKINS } from './skins.js';

function pickColor(override, fallback) {
    if (typeof override === 'string' && override.trim() !== '') {
        return override;
    }
    return fallback;
}

/**
 * Merge skin preset, DS theme, and user color overrides into render-ready theme.
 *
 * Skins marked `fixedColors: true` (e.g. instrument) ignore user color overrides
 * so their designed look is always preserved.
 */
export function resolveTheme({ skinId = 'clean', dsTheme = 'light', options = {} }) {
    const skin = SKINS[skinId] || SKINS.clean;
    const themeKey = options.themeOverride === 'auto' || !options.themeOverride
        ? (dsTheme === 'dark' ? 'dark' : 'light')
        : options.themeOverride;
    const palette = skin[themeKey] || skin.light;

    // Fixed-color skins (instrument) always use their palette — no user overrides.
    const pick = skin.fixedColors
        ? (_override, fallback) => fallback
        : pickColor;

    return {
        skin,
        skinId,
        themeKey,
        backgroundColor: pick(options.backgroundColor, palette.backgroundColor || 'transparent'),
        bezelColor: pick(options.bezelColor, palette.bezelColor),
        dialColor: pick(options.dialColor, palette.dialColor),
        innerHubColor: pick(options.innerHubColor, palette.innerHubColor || palette.dialColor),
        textColor: pick(options.textColor, palette.textColor),
        tickColor: pick(options.tickColor, palette.tickColor),
        tickMajorColor: pick(options.tickMajorColor, palette.tickMajorColor),
        hubColor: pick(options.hubColor, palette.textColor),
        trueNeedleColor: pick(options.trueNeedleColor, palette.trueNeedleColor || '#e74c3c'),
        trueTailColor: pick(options.trueTailColor, palette.trueTailColor || '#c0392b'),
        apparentNeedleColor: pick(options.apparentNeedleColor, palette.apparentNeedleColor || '#3498db'),
        apparentTailColor: pick(options.apparentTailColor, palette.apparentTailColor || '#2980b9'),
    };
}
