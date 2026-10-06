import { useEffect, useRef, useState } from 'react';
import { geocodeCity } from '../data/geocode.js';
import { fetchCurrentWeather } from '../data/liveWeather.js';

// Floor well under Open-Meteo's free-tier non-commercial limits (10k req/day)
// even if several panels/dashboards share this interval.
const MIN_REFRESH_MS = 60 * 1000;
const DEFAULT_REFRESH_SEC = 300;

export function resolveRefreshMs(refreshSec) {
    const n = Number(refreshSec);
    const seconds = Number.isFinite(n) && n > 0 ? n : DEFAULT_REFRESH_SEC;
    return Math.max(MIN_REFRESH_MS, seconds * 1000);
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

        async function tick() {
            try {
                const place = await geocodeCity(city, country, { signal: controller.signal });
                const row = await fetchCurrentWeather(place, { signal: controller.signal });
                if (cancelled) return;
                lastGoodRef.current = row;
                setState({ status: 'ok', row, error: null, place });
            } catch (err) {
                if (cancelled || err.name === 'AbortError') return;
                setState({
                    status: lastGoodRef.current ? 'ok' : 'error',
                    row: lastGoodRef.current,
                    error: err.message || String(err),
                    place: null,
                });
            }
        }

        tick();
        const interval = setInterval(tick, refreshMs);
        return () => {
            cancelled = true;
            controller.abort();
            clearInterval(interval);
        };
    }, [enabled, city, country, refreshMs]);

    return state;
}
