/** Compass skin presets — geometry + default colors per light/dark theme. */

export const SKINS = {
    clean: {
        // Fully transparent/minimal — user colors drive everything via the editor pickers.
        trueNeedleType: 'clean',
        showBezel: false,
        bezelWidth: 0,
        majorTickEvery: 30,
        minorTickEvery: 10,
        minorTickInner: 0.92,
        minorTickOuter: 1,
        majorTickInner: 0.82,
        majorTickOuter: 1,
        showBezelGradient: false,
        dialFlat: true,
        cardinalFontWeight: 400,
        cardinalLabelRadius: 0.74,
        showNorthMarker: false,
        // No fixedColors — all color pickers apply.
        // Subtle translucent dial + ring so the skin always reads as a distinct
        // compass on ANY dashboard background (transparent looked "invisible"/broken).
        dialRing: true,
        light: {
            backgroundColor: 'transparent',
            bezelColor: 'transparent',
            dialColor: 'rgba(0,0,0,0.035)',
            dialRingColor: 'rgba(0,0,0,0.30)',
            textColor: '#2c3e50',
            tickColor: 'rgba(0,0,0,0.20)',
            tickMajorColor: 'rgba(0,0,0,0.50)',
            trueNeedleColor: '#e74c3c',
            trueTailColor: '#c0392b',
        },
        dark: {
            backgroundColor: 'transparent',
            bezelColor: 'transparent',
            dialColor: 'rgba(255,255,255,0.05)',
            dialRingColor: 'rgba(255,255,255,0.30)',
            textColor: '#ecf0f1',
            tickColor: 'rgba(255,255,255,0.20)',
            tickMajorColor: 'rgba(255,255,255,0.55)',
            trueNeedleColor: '#e74c3c',
            trueTailColor: '#c0392b',
        },
    },
    marine: {
        trueNeedleType: 'classic',
        bezelWidth: 4,
        majorTickEvery: 30,
        minorTickEvery: 10,
        showBezelGradient: true,
        cardinalFontWeight: 700,
        light: {
            bezelColor: '#2a4a6b',
            dialColor: '#e8f0f8',
            textColor: '#1a3050',
            tickColor: '#6a8aaa',
            tickMajorColor: '#2a5080',
        },
        dark: {
            bezelColor: '#1e3a5f',
            dialColor: '#0d1a2a',
            textColor: '#a8c8e8',
            tickColor: '#3a5a7a',
            tickMajorColor: '#5a8ab8',
        },
    },
    instrument: {
        // Dark HUD look by default; every color is still overridable via the pickers.
        trueNeedleType: 'instrument',
        solidBackground: true,
        showBezel: true,
        bezelWidth: 3,
        majorTickEvery: 90,
        minorTickEvery: 5,
        minorTickInner: 0.90,
        minorTickOuter: 1,
        majorTickInner: 0.82,
        majorTickOuter: 1,
        showBezelGradient: false,
        dialFlat: true,
        cardinalFontWeight: 600,
        cardinalLabelRadius: 0.76,
        innerHubRadius: 0.32,
        showNorthMarker: false,
        light: {
            backgroundColor: '#111111',
            bezelColor: '#2a2a2a',
            dialColor: '#1a1a1a',
            innerHubColor: '#242424',
            textColor: '#e8e8e8',
            tickColor: '#555555',
            tickMajorColor: '#aaaaaa',
            trueNeedleColor: '#ffffff',
            trueTailColor: '#cccccc',
        },
        dark: {
            backgroundColor: '#111111',
            bezelColor: '#2a2a2a',
            dialColor: '#1a1a1a',
            innerHubColor: '#242424',
            textColor: '#e8e8e8',
            tickColor: '#555555',
            tickMajorColor: '#aaaaaa',
            trueNeedleColor: '#ffffff',
            trueTailColor: '#cccccc',
        },
    },
};

export const SKIN_IDS = Object.keys(SKINS);

export const NEEDLE_TYPES = ['clean', 'classic', 'slim', 'barbed', 'diamond', 'feather', 'dot_line', 'instrument'];

export const SPEED_UNITS = {
    kmh: { label: 'km/h', factor: 1 },
    ms: { label: 'm/s', factor: 1 / 3.6 },
    knots: { label: 'kn', factor: 1 / 1.852 },
    mph: { label: 'mph', factor: 1 / 1.60934 },
};
