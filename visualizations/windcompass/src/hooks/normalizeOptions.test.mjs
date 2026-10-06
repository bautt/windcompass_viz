import assert from 'node:assert/strict';
import { isOptionEnabled, normalizeOptions } from './normalizeOptions.js';

const DEFAULTS = {
    showCardinals: true,
    showMajorTicks: true,
    showMinorTicks: true,
    showTrueWind: true,
    showTrueDirectionReadout: true,
    showTrueSpeedReadout: true,
    showCenterSpeed: false,
    showTemperature: false,
    showLocation: true,
    showDirectionLabel: true,
    showWeatherCondition: true,
    showCompass: true,
    showFrame: false,
    backgroundColor: '',
};

const BOOLEAN_KEYS = [
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
];

function assertDisabled(raw, key) {
    const out = normalizeOptions(raw, DEFAULTS);
    assert.equal(out[key], false, `${key} should be disabled for ${JSON.stringify(raw)}`);
}

function assertEnabled(raw, key) {
    const out = normalizeOptions(raw, DEFAULTS);
    assert.equal(out[key], true, `${key} should be enabled for ${JSON.stringify(raw)}`);
}

assert.equal(isOptionEnabled('false'), false);
assert.equal(isOptionEnabled('true'), true);
assert.equal(isOptionEnabled(''), false);

for (const key of BOOLEAN_KEYS) {
    assertDisabled({ [key]: 'false' }, key);
    assertDisabled({ [key]: '' }, key);
    assertDisabled({ [key]: '0' }, key);
    assertDisabled({ [key]: 'no' }, key);
    assertEnabled({ [key]: 'true' }, key);
    assertEnabled({ [key]: '1' }, key);
    assertEnabled({ [`windcompass.windcompass.${key}`]: 'true' }, key);
    assertDisabled({ [`windcompass.windcompass.${key}`]: 'false' }, key);
}

// Bare editor keys win over stale prefixed dashboard keys.
{
    const out = normalizeOptions(
        {
            showCenterSpeed: false,
            'windcompass.windcompass.showCenterSpeed': true,
        },
        DEFAULTS,
    );
    assert.equal(out.showCenterSpeed, false);
}

{
    const out = normalizeOptions(
        {
            showCenterSpeed: true,
            'windcompass.windcompass.showCenterSpeed': false,
        },
        DEFAULTS,
    );
    assert.equal(out.showCenterSpeed, true);
}

{
    const out = normalizeOptions(
        {
            showTemperature: false,
            'windcompass.windcompass.showTemperature': true,
        },
        DEFAULTS,
    );
    assert.equal(out.showTemperature, false);
}

{
    const out = normalizeOptions(
        {
            'windcompass.windcompass.showCenterSpeed': true,
        },
        DEFAULTS,
    );
    assert.equal(out.showCenterSpeed, true);
}

// Regression: instrument panel on live demo/test dashboards. DS wrote bare
// keys for the two toggles the user actually changed (non-default), but
// never wrote a bare key for "Speed in center hub" because unchecking it
// matches the schema default and DS omits default values. The stale
// prefixed showCenterSpeed:true leftover must NOT win once the panel has
// been claimed by the modern editor.
{
    const out = normalizeOptions(
        {
            'windcompass.windcompass.skin': 'instrument',
            'windcompass.windcompass.showCenterSpeed': true,
            showTrueDirectionReadout: false,
            showTrueSpeedReadout: false,
        },
        DEFAULTS,
    );
    assert.equal(
        out.showCenterSpeed,
        false,
        'stale prefixed showCenterSpeed should not override the editor-claimed default',
    );
    assert.equal(out.showTrueDirectionReadout, false);
    assert.equal(out.showTrueSpeedReadout, false);
}

// Once the user re-checks the box, the fresh bare key must take effect.
{
    const out = normalizeOptions(
        {
            'windcompass.windcompass.showCenterSpeed': true,
            showTrueDirectionReadout: false,
            showCenterSpeed: true,
        },
        DEFAULTS,
    );
    assert.equal(out.showCenterSpeed, true);
}

// A fully legacy panel (no bare boolean keys at all) still honors prefixed
// values so existing hand-authored dashboards aren't silently reset.
{
    const out = normalizeOptions(
        {
            'windcompass.windcompass.skin': 'instrument',
            'windcompass.windcompass.showCenterSpeed': true,
        },
        DEFAULTS,
    );
    assert.equal(out.showCenterSpeed, true);
}

{
    const out = normalizeOptions(
        {
            showTrueDirectionReadout: false,
        },
        DEFAULTS,
    );
    assert.equal(out.showTrueDirectionReadout, false);
}

{
    const out = normalizeOptions({ backgroundColor: '' }, DEFAULTS);
    assert.equal(out.backgroundColor, '');
}

// Regression: turning a default-true toggle off then back on again must
// fully restore it. Dashboard Studio omits bare keys once a value matches
// its schema default, so the "on again" payload may carry no bare key at
// all for this option — normalizeOptions must still resolve it to `true`
// via the schema default, not get stuck on the earlier `false`.
for (const key of ['showMajorTicks', 'showMinorTicks', 'showCardinals', 'showTrueWind']) {
    // Off: explicit non-default bare value.
    let out = normalizeOptions({ [key]: false }, DEFAULTS);
    assert.equal(out[key], false, `${key} should turn off`);

    // On again: DS may omit the bare key since true is the default, but as
    // long as some other option in the panel is non-default (editor has
    // "claimed" this panel), the omitted key must resolve back to true.
    out = normalizeOptions({ [key]: true, showLocation: false }, DEFAULTS);
    assert.equal(out[key], true, `${key} should turn back on when explicitly true`);

    out = normalizeOptions({ showLocation: false }, DEFAULTS);
    assert.equal(
        out[key],
        true,
        `${key} should fall back to its default (on) when DS omits the now-default bare key`,
    );
}

console.log('normalizeOptions boolean checks passed for all editor toggles');
