import assert from 'node:assert/strict';
import { cacheRead, cacheWrite, cacheClear } from './persistentCache.js';

function fakeStorage({ throwOnWrite = false } = {}) {
    const map = new Map();
    return {
        get length() { return map.size; },
        key: (i) => [...map.keys()][i] ?? null,
        getItem: (k) => (map.has(k) ? map.get(k) : null),
        setItem: (k, v) => {
            if (throwOnWrite) throw new Error('quota');
            map.set(k, v);
        },
        removeItem: (k) => { map.delete(k); },
        _map: map,
    };
}

// Round-trips a value and honours the TTL window.
{
    const store = fakeStorage();
    globalThis.localStorage = store;
    cacheClear();

    const t0 = 1_000_000;
    cacheWrite('geo:berlin|de', { lat: 52.5, lon: 13.4 }, { now: t0 });
    assert.deepEqual(cacheRead('geo:berlin|de', { maxAgeMs: 1000, now: t0 + 500 }), { lat: 52.5, lon: 13.4 });

    // Expired entries are treated as a miss and dropped from storage.
    assert.equal(cacheRead('geo:berlin|de', { maxAgeMs: 1000, now: t0 + 5000 }), null);
    delete globalThis.localStorage;
}

// A zero or missing TTL disables the cache entirely: fetchCurrentWeather relies
// on this to default to always-fresh behaviour.
{
    const store = fakeStorage();
    globalThis.localStorage = store;
    cacheClear();

    cacheWrite('fc:0.000,0.000', { windSpeed: 5 });
    assert.equal(cacheRead('fc:0.000,0.000', { maxAgeMs: 0 }), null);
    assert.equal(cacheRead('fc:0.000,0.000', {}), null);
    delete globalThis.localStorage;
}

// Keys are namespaced so the app never reads or clears unrelated entries.
{
    const store = fakeStorage();
    globalThis.localStorage = store;
    cacheClear();

    store.setItem('someone-elses-key', 'keep me');
    cacheWrite('geo:x', { a: 1 });
    assert.ok([...store._map.keys()].some((k) => k.startsWith('windcompass:')));

    cacheClear();
    assert.equal(store.getItem('someone-elses-key'), 'keep me', 'must not clear foreign keys');
    delete globalThis.localStorage;
}

// Storage being unavailable or write-blocked must not throw: Splunk can
// sandbox the frame, and the in-memory copy still has to work.
{
    delete globalThis.localStorage;
    cacheClear();
    const t0 = 2_000_000;
    cacheWrite('geo:nostorage', { lat: 1 }, { now: t0 });
    assert.deepEqual(cacheRead('geo:nostorage', { maxAgeMs: 1000, now: t0 }), { lat: 1 },
        'in-memory fallback should still serve the value');
}

{
    globalThis.localStorage = fakeStorage({ throwOnWrite: true });
    cacheClear();
    const t0 = 3_000_000;
    assert.doesNotThrow(() => cacheWrite('geo:quota', { lat: 2 }, { now: t0 }));
    assert.deepEqual(cacheRead('geo:quota', { maxAgeMs: 1000, now: t0 }), { lat: 2 });
    delete globalThis.localStorage;
}

// Corrupt stored JSON degrades to a miss rather than throwing.
{
    const store = fakeStorage();
    store.setItem('windcompass:geo:corrupt', '{not json');
    globalThis.localStorage = store;
    cacheClear();
    assert.equal(cacheRead('geo:corrupt', { maxAgeMs: 10_000 }), null);
    delete globalThis.localStorage;
}

// Cached values are whole row objects that go straight to render, so an entry
// written by another version of the app must never be served — it could be
// missing a field the current renderer expects.
{
    const store = fakeStorage();
    globalThis.localStorage = store;
    cacheClear();

    const t0 = 2_000_000;
    const full = 'windcompass:fc:1.000,2.000';

    store.setItem(full, JSON.stringify({ v: 999, at: t0, value: { stale: true } }));
    assert.equal(
        cacheRead('fc:1.000,2.000', { maxAgeMs: 60_000, now: t0 }),
        null,
        'a foreign cache version must not be served',
    );
    assert.equal(
        store.getItem(full),
        null,
        'the rejected entry is removed rather than re-read on every mount',
    );

    // Entries predating versioning have no `v` at all and are rejected too.
    store.setItem(full, JSON.stringify({ at: t0, value: { old: true } }));
    assert.equal(cacheRead('fc:1.000,2.000', { maxAgeMs: 60_000, now: t0 }), null);

    // The current writer stamps a version that its own reader accepts.
    cacheClear();
    cacheWrite('fc:1.000,2.000', { windSpeed: 7 }, { now: t0 });
    assert.deepEqual(
        cacheRead('fc:1.000,2.000', { maxAgeMs: 60_000, now: t0 + 100 }),
        { windSpeed: 7 },
    );
    assert.equal(JSON.parse(store.getItem(full)).v, 1, 'entries carry an explicit version');

    cacheClear();
    delete globalThis.localStorage;
}

console.log('persistentCache.test.mjs: all assertions passed');
