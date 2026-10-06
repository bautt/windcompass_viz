import assert from 'node:assert/strict';
import { resolveRefreshMs, resolveMaxReadingAgeMs } from './useLiveWeather.js';

// Default when missing/invalid.
assert.equal(resolveRefreshMs(undefined), 300 * 1000);
assert.equal(resolveRefreshMs(null), 300 * 1000);
assert.equal(resolveRefreshMs('not-a-number'), 300 * 1000);
assert.equal(resolveRefreshMs(0), 300 * 1000);
assert.equal(resolveRefreshMs(-10), 300 * 1000);

// Floors at 60s even if a user sets something very aggressive.
assert.equal(resolveRefreshMs(5), 60 * 1000);
assert.equal(resolveRefreshMs(30), 60 * 1000);

// Respects valid higher values.
assert.equal(resolveRefreshMs(120), 120 * 1000);
assert.equal(resolveRefreshMs(900), 900 * 1000);

// The reading cache exists to make dashboard loads cheap against Open-Meteo's
// rate limit. Scheduled polls bypass it, so unlike the poll interval it is only
// ever consulted on mount.
{
    for (const refreshSec of [60, 120, 300, 900, 3600]) {
        const maxAgeMs = resolveMaxReadingAgeMs(resolveRefreshMs(refreshSec));
        assert.ok(maxAgeMs > 0, `cache window should be usable for ${refreshSec}s`);
        assert.ok(maxAgeMs <= 10 * 60 * 1000, `cache window must stay within the 10 minute cap`);
    }

    // At the default 300s refresh the window is the full 10 minute cap: Open-Meteo
    // only updates its "current" block about every 15 minutes.
    assert.equal(resolveMaxReadingAgeMs(resolveRefreshMs(300)), 10 * 60 * 1000);
    // A longer interval still caps at 10 minutes rather than growing unbounded.
    assert.equal(resolveMaxReadingAgeMs(resolveRefreshMs(3600)), 10 * 60 * 1000);
    // An aggressive refresh scales the window down, so the setting is not
    // silently contradicted by a much older reading on load.
    assert.equal(resolveMaxReadingAgeMs(resolveRefreshMs(60)), 2 * 60 * 1000);
    assert.equal(resolveMaxReadingAgeMs(resolveRefreshMs(120)), 4 * 60 * 1000);
}

console.log('useLiveWeather.test.mjs: all assertions passed');
