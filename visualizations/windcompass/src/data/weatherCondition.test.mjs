import assert from 'node:assert/strict';
import { resolveWeatherCondition } from './weatherCondition.js';

// Missing/unrecognized codes resolve to null so callers can hide the badge.
assert.equal(resolveWeatherCondition(null, 1), null);
assert.equal(resolveWeatherCondition(undefined, 1), null);
assert.equal(resolveWeatherCondition(''), null);
assert.equal(resolveWeatherCondition(12345, 1), null);

// Daytime clear/partly-cloudy codes use the sun-based icon keys.
assert.deepEqual(resolveWeatherCondition(0, 1), { key: 'clear', label: 'Clear sky' });
assert.deepEqual(resolveWeatherCondition(1, 1), { key: 'mostly-clear', label: 'Mainly clear' });
assert.deepEqual(resolveWeatherCondition(2, 1), { key: 'partly-cloudy', label: 'Partly cloudy' });

// Night (is_day === 0) swaps clear/partly-cloudy to their moon variants.
assert.deepEqual(resolveWeatherCondition(0, 0), { key: 'clear-night', label: 'Clear sky' });
assert.deepEqual(resolveWeatherCondition(1, 0), { key: 'clear-night', label: 'Mainly clear' });
assert.deepEqual(resolveWeatherCondition(2, 0), { key: 'partly-cloudy-night', label: 'Partly cloudy' });

// Overcast/fog/precipitation codes are day/night-invariant.
assert.deepEqual(resolveWeatherCondition(3, 0), { key: 'overcast', label: 'Overcast' });
assert.deepEqual(resolveWeatherCondition(45, 1), { key: 'fog', label: 'Fog' });
assert.deepEqual(resolveWeatherCondition(61, 0), { key: 'rain', label: 'Light rain' });
assert.deepEqual(resolveWeatherCondition(71, 1), { key: 'snow', label: 'Light snow' });
assert.deepEqual(resolveWeatherCondition(95, 1), { key: 'thunderstorm', label: 'Thunderstorm' });

// String numerics (as might arrive from a loosely-typed JSON body) still resolve.
assert.deepEqual(resolveWeatherCondition('61', 1), { key: 'rain', label: 'Light rain' });

console.log('weatherCondition.test.mjs: all assertions passed');
