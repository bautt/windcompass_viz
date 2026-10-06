import assert from 'node:assert/strict';
import { resolveRefreshMs } from './useLiveWeather.js';

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

console.log('useLiveWeather.test.mjs: all assertions passed');
