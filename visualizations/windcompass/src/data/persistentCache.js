/**
 * TTL cache backed by browser storage, with an in-memory fallback.
 *
 * Open-Meteo's free tier is rate limited, and every dashboard reload otherwise
 * repeats the same lookups from scratch. Persisting results across reloads is
 * what keeps a multi-panel dashboard well clear of the limit:
 *   - geocoding results never change, so they are cached for weeks
 *   - current conditions are cached for minutes (see resolveMaxReadingAgeMs in
 *     hooks/useLiveWeather.js for the window and why it is safe), which makes a
 *     reload nearly free
 *
 * Callers own the TTL: this module stores a timestamp alongside each value and
 * leaves the maximum acceptable age to whoever reads it.
 *
 * Storage may be unavailable (Splunk can sandbox the frame, or the user may
 * have disabled it), so every access is guarded and silently degrades to the
 * in-memory map for the lifetime of the page.
 */

const KEY_PREFIX = 'windcompass:';

const memory = new Map();

function storage(kind) {
    try {
        const store = kind === 'session' ? globalThis.sessionStorage : globalThis.localStorage;
        if (!store) return null;
        // Safari in private mode exposes the API but throws on write.
        const probe = `${KEY_PREFIX}probe`;
        store.setItem(probe, '1');
        store.removeItem(probe);
        return store;
    } catch {
        return null;
    }
}

export function cacheRead(key, { maxAgeMs, kind = 'local', now = Date.now() } = {}) {
    if (!maxAgeMs || maxAgeMs <= 0) return null;
    const full = KEY_PREFIX + key;

    const inMemory = memory.get(full);
    if (inMemory && now - inMemory.at <= maxAgeMs) {
        return inMemory.value;
    }

    const store = storage(kind);
    if (!store) return null;
    try {
        const raw = store.getItem(full);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed.at !== 'number') return null;
        if (now - parsed.at > maxAgeMs) {
            store.removeItem(full);
            return null;
        }
        memory.set(full, parsed);
        return parsed.value;
    } catch {
        return null;
    }
}

export function cacheWrite(key, value, { kind = 'local', now = Date.now() } = {}) {
    const full = KEY_PREFIX + key;
    const entry = { at: now, value };
    memory.set(full, entry);

    const store = storage(kind);
    if (!store) return;
    try {
        store.setItem(full, JSON.stringify(entry));
    } catch {
        // Over quota or blocked mid-session: drop our own stale entries and
        // retry once, then give up and rely on the in-memory copy.
        try {
            for (let i = store.length - 1; i >= 0; i -= 1) {
                const k = store.key(i);
                if (k && k.startsWith(KEY_PREFIX) && k !== full) store.removeItem(k);
            }
            store.setItem(full, JSON.stringify(entry));
        } catch {
            /* in-memory only */
        }
    }
}

export function cacheClear({ kind = 'local' } = {}) {
    memory.clear();
    const store = storage(kind);
    if (!store) return;
    try {
        for (let i = store.length - 1; i >= 0; i -= 1) {
            const k = store.key(i);
            if (k && k.startsWith(KEY_PREFIX)) store.removeItem(k);
        }
    } catch {
        /* nothing to clear */
    }
}
