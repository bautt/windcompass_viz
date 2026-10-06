/**
 * Open-Meteo forecast API (api.open-meteo.com) — current wind/temperature
 * for a resolved place. No API key required.
 *
 * Always requested in km/h: the shared formatters (copied from the
 * search-driven windcompass app) assume a km/h base value and convert to
 * the user's chosen display unit from there.
 */
import { normalizeDegrees } from './windAngles.js';
import { fetchJson } from './httpClient.js';
import { cacheRead, cacheWrite } from './persistentCache.js';

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

function numberOrNull(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

export function buildForecastParams({ lat, lon }) {
    return new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        current: 'wind_speed_10m,wind_direction_10m,temperature_2m,weather_code,cloud_cover,is_day',
        wind_speed_unit: 'kmh',
        timezone: 'auto',
    });
}

export function buildForecastUrl(place) {
    return `${FORECAST_ENDPOINT}?${buildForecastParams(place).toString()}`;
}

export function forecastCacheKey({ lat, lon }) {
    // ~100m precision is far finer than a city centroid needs, and rounding
    // keeps panels on the same city sharing one cache entry.
    return `fc:${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`;
}

/**
 * Fetch current conditions for a geocoded place and map them onto the same
 * row shape the search-driven app's parseSearchData.js produces, so
 * CompassDial/ReadoutPanel need no changes at all.
 *
 * `maxAgeMs` controls only whether an already-cached reading may be *served*;
 * it defaults to 0, meaning always fetch. A successful reading is always written
 * to the cache regardless, so scheduled polls (which pass 0 to force a fresh
 * fetch) keep the cache warm for the next dashboard load.
 */
export async function fetchCurrentWeather(place, { signal, maxAgeMs = 0 } = {}) {
    const cacheKey = forecastCacheKey(place);
    if (maxAgeMs > 0) {
        const cached = cacheRead(cacheKey, { maxAgeMs });
        if (cached) return cached;
    }

    const json = await fetchJson(buildForecastUrl(place), { signal, errorLabel: 'Weather fetch' });
    const current = json?.current;
    if (!current) {
        throw new Error('Open-Meteo response is missing the "current" block.');
    }

    // Number(null) is 0, so a null wind direction would otherwise render as a
    // confident "due North" instead of surfacing that the reading is missing.
    const windDirection = numberOrNull(current.wind_direction_10m);
    const windSpeed = numberOrNull(current.wind_speed_10m);
    if (windDirection === null || windSpeed === null) {
        throw new Error('Open-Meteo response had unexpected wind fields.');
    }

    const temperature = numberOrNull(current.temperature_2m);
    const label = place.countryCode ? `${place.label}, ${place.countryCode}` : place.label;

    const row = {
        windDirection: normalizeDegrees(windDirection),
        windSpeed,
        windGusts: null,
        temperature,
        location: label,
        weatherCode: numberOrNull(current.weather_code),
        isDay: numberOrNull(current.is_day),
        cloudCover: numberOrNull(current.cloud_cover),
    };

    cacheWrite(cacheKey, row);
    return row;
}
