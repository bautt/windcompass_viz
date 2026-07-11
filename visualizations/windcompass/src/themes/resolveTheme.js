import { SKINS } from './skins.js';

function pickColor(override, fallback) {
    if (typeof override === 'string' && override.trim() !== '') {
        return override;
    }
    return fallback;
}

/**
 * Merge skin preset, DS theme, and user color overrides into render-ready theme.
 */
export function resolveTheme({ skinId = 'minimal', dsTheme = 'light', options = {} }) {
    const skin = SKINS[skinId] || SKINS.minimal;
    const themeKey = options.themeOverride === 'auto' || !options.themeOverride
        ? (dsTheme === 'dark' ? 'dark' : 'light')
        : options.themeOverride;
    const palette = skin[themeKey] || skin.light;

    return {
        skin,
        skinId,
        themeKey,
        backgroundColor: pickColor(options.backgroundColor, palette.backgroundColor || 'transparent'),
        bezelColor: pickColor(options.bezelColor, palette.bezelColor),
        dialColor: pickColor(options.dialColor, palette.dialColor),
        innerHubColor: pickColor(options.innerHubColor, palette.innerHubColor || palette.dialColor),
        textColor: pickColor(options.textColor, palette.textColor),
        tickColor: pickColor(options.tickColor, palette.tickColor),
        tickMajorColor: pickColor(options.tickMajorColor, palette.tickMajorColor),
        hubColor: pickColor(options.hubColor, palette.textColor),
        trueNeedleColor: pickColor(options.trueNeedleColor, palette.trueNeedleColor || '#e74c3c'),
        trueTailColor: pickColor(options.trueTailColor, palette.trueTailColor || '#c0392b'),
        apparentNeedleColor: pickColor(options.apparentNeedleColor, '#3498db'),
        apparentTailColor: pickColor(options.apparentTailColor, '#2980b9'),
    };
}
