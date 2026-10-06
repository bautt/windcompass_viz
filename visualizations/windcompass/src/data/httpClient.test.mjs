import assert from 'node:assert/strict';
import { fetchJson, parseRetryAfterMs, reserveSlot, resetSlots, inFlightCount } from './httpClient.js';

// Retry-After is in seconds and is clamped, so a hostile or buggy value can't
// park a panel indefinitely.
{
    assert.equal(parseRetryAfterMs('2'), 2000);
    assert.equal(parseRetryAfterMs('0'), 0);
    assert.equal(parseRetryAfterMs(null), null);
    assert.equal(parseRetryAfterMs(''), null);
    assert.equal(parseRetryAfterMs('not-a-number'), null);
    assert.equal(parseRetryAfterMs('-5'), null);
    assert.equal(parseRetryAfterMs('99999'), 15000); // clamped
}

// Request starts are spaced: the first goes immediately, later ones are pushed
// out so a burst of panels becomes a ramp instead of a spike.
{
    resetSlots();
    const now = 1_000_000;
    assert.equal(reserveSlot(now, 150), 0);
    assert.equal(reserveSlot(now, 150), 150);
    assert.equal(reserveSlot(now, 150), 300);
    // A caller arriving after the queue has drained waits again from zero.
    assert.equal(reserveSlot(now + 10_000, 150), 0);
    resetSlots();
}

// A 429 is retried and the eventual success is returned, so a rate-limited
// panel recovers without the user reloading.
{
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        if (calls < 3) {
            return { ok: false, status: 429, headers: { get: () => null } };
        }
        return { ok: true, json: async () => ({ ok: true, calls }) };
    };

    try {
        const json = await fetchJson('https://example.test/retry', {
            errorLabel: 'Weather fetch',
            retryDelaysMs: [1, 1, 1],
        });
        assert.deepEqual(json, { ok: true, calls: 3 });
        assert.equal(calls, 3);
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// Retry-After, when present, drives the wait instead of the backoff schedule.
{
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        if (calls === 1) {
            return { ok: false, status: 429, headers: { get: (n) => (n === 'retry-after' ? '0' : null) } };
        }
        return { ok: true, json: async () => ({ done: true }) };
    };

    try {
        const started = Date.now();
        const json = await fetchJson('https://example.test/retry-after', { retryDelaysMs: [5000] });
        assert.deepEqual(json, { done: true });
        // Retry-After: 0 means it must not have waited the 5s backoff.
        assert.ok(Date.now() - started < 2000, 'Retry-After should override the backoff delay');
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// Retries are bounded: once exhausted the 429 surfaces as a readable error.
{
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        return { ok: false, status: 429, headers: { get: () => null } };
    };

    try {
        await assert.rejects(
            () => fetchJson('https://example.test/always-429', {
                errorLabel: 'Weather fetch',
                retryDelaysMs: [1, 1],
            }),
            /Weather fetch failed \(HTTP 429\)\./,
        );
        assert.equal(calls, 3, 'initial attempt plus two retries');
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// Non-429 failures are not retried: a bad city or a 5xx will not fix itself,
// and retrying would only delay the error the panel needs to show.
{
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        return { ok: false, status: 503, headers: { get: () => null } };
    };

    try {
        await assert.rejects(
            () => fetchJson('https://example.test/503', { errorLabel: 'Weather fetch', retryDelaysMs: [1, 1] }),
            /HTTP 503/,
        );
        assert.equal(calls, 1, '5xx must not be retried');
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// Concurrent identical requests share one in-flight promise, so duplicate
// panels on the same city cost a single request.
{
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        return { ok: true, json: async () => ({ n: calls }) };
    };

    try {
        const url = 'https://example.test/shared';
        const [a, b, c] = await Promise.all([fetchJson(url), fetchJson(url), fetchJson(url)]);
        assert.equal(calls, 1, 'three concurrent callers should trigger one fetch');
        assert.deepEqual(a, { n: 1 });
        assert.deepEqual(b, { n: 1 });
        assert.deepEqual(c, { n: 1 });
        assert.equal(inFlightCount(), 0, 'in-flight map must not leak entries');
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// A failed request is also cleared from the in-flight map, so a later attempt
// is not permanently poisoned by one failure.
{
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 404, headers: { get: () => null } });

    try {
        await assert.rejects(() => fetchJson('https://example.test/404'));
        assert.equal(inFlightCount(), 0);
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// One caller aborting must not cancel the request its co-waiters are sharing.
// Two panels on the same city share a request; if the first one unmounts, the
// second must still get its reading.
{
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 20));
        return { ok: true, json: async () => ({ n: calls }) };
    };

    try {
        const url = 'https://example.test/abort-sharing';
        const leaver = new AbortController();
        const stayer = new AbortController();

        const leaving = fetchJson(url, { signal: leaver.signal });
        const staying = fetchJson(url, { signal: stayer.signal });
        leaver.abort();

        await assert.rejects(() => leaving, (err) => err.name === 'AbortError');
        assert.deepEqual(await staying, { n: 1 }, 'the remaining caller must still be served');
        assert.equal(calls, 1);
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// An already-aborted signal rejects without spending a request.
{
    const originalFetch = globalThis.fetch;
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        return { ok: true, json: async () => ({}) };
    };

    try {
        const controller = new AbortController();
        controller.abort();
        await assert.rejects(
            () => fetchJson('https://example.test/pre-aborted', { signal: controller.signal }),
            (err) => err.name === 'AbortError',
        );
        assert.equal(calls, 0, 'an aborted caller must not start a request');
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

// A request every caller abandoned still settles and clears its map entry,
// without surfacing as an unhandled rejection.
{
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return { ok: false, status: 500, headers: { get: () => null } };
    };

    try {
        const controller = new AbortController();
        const abandoned = fetchJson('https://example.test/abandoned', { signal: controller.signal });
        controller.abort();
        await assert.rejects(() => abandoned, (err) => err.name === 'AbortError');
        await new Promise((resolve) => setTimeout(resolve, 40));
        assert.equal(inFlightCount(), 0, 'abandoned requests must not leak map entries');
    } finally {
        globalThis.fetch = originalFetch;
        resetSlots();
    }
}

console.log('httpClient.test.mjs: all assertions passed');
