import { useEffect, useRef, useState } from 'react';
import { geocodeCity } from '../data/geocode.js';
import { fetchCurrentWeather } from '../data/liveWeather.js';

// Floor well under Open-Meteo's free-tier non-commercial limits (10k req/day)
// even if several panels/dashboards share this interval.
const MIN_REFRESH_MS = 60 * 1000;
const DEFAULT_REFRESH_SEC = 300;
const MAX_READING_AGE_MS = 10 * 60 * 1000;
// Panels all mount in the same tick, so without a stagger a nine-panel
// dashboard opens with one simultaneous burst of requests.
const STARTUP_JITTER_MS = 400;

export function resolveRefreshMs(refreshSec) {
    const n = Number(refreshSec);
    const seconds = Number.isFinite(n) && n > 0 ? n : DEFAULT_REFRESH_SEC;
    return Math.max(MIN_REFRESH_MS, seconds * 1000);
}

/**
 * How long a cached reading may be reused when a panel mounts.
 *
 * Scheduled polls always bypass the cache, so this window only ever affects
 * dashboard loads and reloads — it can safely exceed the poll interval without
 * a panel that stays open ever showing a stale reading. Capped at 10 minutes
 * because Open-Meteo refreshes its "current" block roughly every 15 minutes, so
 * re-requesting inside that window buys no new information.
 *
 * Scaled down for users who deliberately choose an aggressive refresh: asking
 * for a 60s refresh and then being handed a 10-minute-old reading on load would
 * contradict the setting.
 */
export function resolveMaxReadingAgeMs(refreshMs) {
    return Math.min(MAX_READING_AGE_MS, refreshMs * 2);
}

/**
 * Resolve city/country -> coordinates -> live current weather, polling on an
 * interval. On a transient failure, keeps showing the last good reading
 * (status stays "ok") rather than flashing an error on every missed poll.
 *
 * `enabled: false` is a true no-op (no fetch, no timer) — used when the
 * visualization is in search mode so this hook can still be called
 * unconditionally (Rules of Hooks) without doing any network work.
 */
export function useLiveWeather({ city, country, refreshSec, enabled = true }) {
    const refreshMs = resolveRefreshMs(refreshSec);
    const [state, setState] = useState({ status: 'pending', row: null, error: null, place: null });
    const lastGoodRef = useRef(null);

    useEffect(() => {
        if (!enabled) {
            lastGoodRef.current = null;
            setState({ status: 'pending', row: null, error: null, place: null });
            return undefined;
        }

        const trimmedCity = (city || '').trim();
        if (!trimmedCity) {
            lastGoodRef.current = null;
            setState({ status: 'error', row: null, error: 'City is required.', place: null });
            return undefined;
        }

        let cancelled = false;
        const controller = new AbortController();
        lastGoodRef.current = null;
        setState({ status: 'pending', row: null, error: null, place: null });

        const maxAgeMs = resolveMaxReadingAgeMs(refreshMs);

        async function tick({ allowCached = true } = {}) {
            try {
                const place = await geocodeCity(city, country, { signal: controller.signal });
                const row = await fetchCurrentWeather(place, {
                    signal: controller.signal,
                    maxAgeMs: allowCached ? maxAgeMs : 0,
                });
                if (cancelled) return;
                lastGoodRef.current = row;
                setState({ status: 'ok', row, error: null, place });
            } catch (err) {
                if (cancelled || err?.name === 'AbortError') return;
                setState({
                    status: lastGoodRef.current ? 'ok' : 'error',
                    row: lastGoodRef.current,
                    error: err?.message || String(err),
                    place: null,
                });
            }
        }

        const startupDelay = Math.random() * STARTUP_JITTER_MS;
        const startupTimer = setTimeout(tick, startupDelay);
        // Scheduled polls bypass the reading cache: their whole purpose is to
        // replace the reading the cache would hand back.
        const interval = setInterval(() => tick({ allowCached: false }), refreshMs);
        return () => {
            cancelled = true;
            controller.abort();
            clearTimeout(startupTimer);
            clearInterval(interval);
        };
    }, [enabled, city, country, refreshMs]);

    return state;
}
