/**
 * Shared JSON fetch layer for the Open-Meteo APIs.
 *
 * A dashboard with several live panels fires every lookup in the same tick: nine
 * panels means eighteen requests (geocode + forecast each) landing on Open-Meteo
 * simultaneously, and the free tier answers some of them with HTTP 429. This
 * module smooths that out three ways:
 *
 *   1. Request starts are spaced by MIN_REQUEST_GAP_MS, so a burst becomes a
 *      short ramp instead of a spike. Spacing applies to start times only, so
 *      requests still overlap and a slow one never blocks the queue.
 *   2. HTTP 429 is retried with exponential backoff, honouring Retry-After when
 *      the server sends it. A rate-limited panel recovers on its own instead of
 *      showing an error until the user reloads.
 *   3. Identical in-flight requests are shared, so duplicate panels (two panels
 *      on the same city) cost one request rather than two.
 *
 * Only 429 is retried. Other failures surface immediately: a 404 or a malformed
 * city will never succeed on retry, and retrying 5xx would just delay the error
 * the panel needs to show.
 *
 * Shared requests run detached from any caller's AbortSignal. Binding the shared
 * request to whichever caller happened to arrive first would mean that caller
 * unmounting cancels the request every other caller is waiting on; instead each
 * caller races its own signal, and an abandoned request is allowed to finish and
 * warm the cache.
 */

const MIN_REQUEST_GAP_MS = 150;
const RETRY_DELAYS_MS = [700, 1800, 4200];
const MAX_RETRY_AFTER_MS = 15000;

// Next permitted request start, as an epoch timestamp.
let nextSlotAt = 0;

const inFlight = new Map();

function abortError() {
    const err = new Error('Aborted');
    err.name = 'AbortError';
    return err;
}

function sleep(ms) {
    if (ms <= 0) return Promise.resolve();
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Reject as soon as `signal` aborts, and clean the listener up afterwards so a
 * long-lived signal does not accumulate one listener per request.
 */
function abortRace(promise, signal) {
    if (!signal) return promise;
    if (signal.aborted) return Promise.reject(abortError());

    let onAbort;
    const aborted = new Promise((_resolve, reject) => {
        onAbort = () => reject(abortError());
        signal.addEventListener('abort', onAbort, { once: true });
    });

    return Promise.race([promise, aborted]).finally(() => {
        signal.removeEventListener('abort', onAbort);
    });
}

/**
 * Reserve the next spaced request slot and return how long to wait for it.
 * Exported for tests; resets implicitly as time passes.
 */
export function reserveSlot(now = Date.now(), gapMs = MIN_REQUEST_GAP_MS) {
    const startAt = Math.max(now, nextSlotAt);
    nextSlotAt = startAt + gapMs;
    return startAt - now;
}

export function resetSlots() {
    nextSlotAt = 0;
}

/**
 * Open-Meteo sends Retry-After in seconds. Clamp it: an unexpectedly large
 * value would otherwise park the panel for minutes with no feedback.
 */
export function parseRetryAfterMs(headerValue) {
    if (!headerValue) return null;
    const seconds = Number(headerValue);
    if (!Number.isFinite(seconds) || seconds < 0) return null;
    return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
}

function getHeader(res, name) {
    try {
        return res.headers?.get?.(name) ?? null;
    } catch {
        return null;
    }
}

/**
 * Fetch JSON with request spacing and 429 backoff.
 *
 * @param {string} url
 * @param {object} [opts]
 * @param {AbortSignal} [opts.signal]
 * @param {string} [opts.errorLabel] prefix for the thrown error message
 * @param {number[]} [opts.retryDelaysMs] overridable for tests
 */
export async function fetchJson(url, { signal, errorLabel = 'Request', retryDelaysMs = RETRY_DELAYS_MS } = {}) {
    if (signal?.aborted) {
        return Promise.reject(abortError());
    }

    const existing = inFlight.get(url);
    if (existing) {
        return abortRace(existing, signal);
    }

    const pending = (async () => {
        let attempt = 0;
        for (;;) {
            await sleep(reserveSlot());
            const res = await fetch(url);

            if (res.ok) {
                return res.json();
            }

            const canRetry = res.status === 429 && attempt < retryDelaysMs.length;
            if (!canRetry) {
                throw new Error(`${errorLabel} failed (HTTP ${res.status}).`);
            }

            const retryAfterMs = parseRetryAfterMs(getHeader(res, 'retry-after'));
            // Jitter keeps several rate-limited panels from retrying in lockstep.
            const backoffMs = retryAfterMs ?? retryDelaysMs[attempt] * (0.75 + Math.random() * 0.5);
            await sleep(backoffMs);
            attempt += 1;
        }
    })();

    inFlight.set(url, pending);
    // Release the entry once settled. Both handlers are supplied so a failure
    // nobody is waiting on (every caller aborted) cannot surface as an unhandled
    // rejection; real callers still get the error through abortRace.
    const release = () => inFlight.delete(url);
    pending.then(release, release);

    return abortRace(pending, signal);
}

export function inFlightCount() {
    return inFlight.size;
}
