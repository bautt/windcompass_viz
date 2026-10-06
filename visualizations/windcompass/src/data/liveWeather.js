/**
 * Open-Meteo forecast API (api.open-meteo.com) — current wind/temperature
 * for a resolved place. No API key required.
 *
 * Always requested in km/h: the shared formatters (copied from the
 * search-driven windcompass app) assume a km/h base value and convert to
 * the user's chosen display unit from there.
 */
import { normalizeDegrees } from './windAngles.js';

const FORECAST_ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

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

/**
 * Fetch current conditions for a geocoded place and map them onto the same
 * row shape the search-driven app's parseSearchData.js produces, so
 * CompassDial/ReadoutPanel need no changes at all.
 */
export async function fetchCurrentWeather(place, { signal } = {}) {
    const res = await fetch(buildForecastUrl(place), { signal });
    if (!res.ok) {
        throw new Error(`Weather fetch failed (HTTP ${res.status}).`);
    }

    const json = await res.json();
    const current = json?.current;
    if (!current) {
        throw new Error('Open-Meteo response is missing the "current" block.');
    }

    const windDirection = Number(current.wind_direction_10m);
    const windSpeed = Number(current.wind_speed_10m);
    if (Number.isNaN(windDirection) || Number.isNaN(windSpeed)) {
        throw new Error('Open-Meteo response had unexpected wind fields.');
    }

    const temperature = Number(current.temperature_2m);
    const label = place.countryCode ? `${place.label}, ${place.countryCode}` : place.label;

    const weatherCode = current.weather_code;
    const cloudCoverRaw = Number(current.cloud_cover);

    return {
        windDirection: normalizeDegrees(windDirection),
        windSpeed,
        windGusts: null,
        temperature: Number.isNaN(temperature) ? null : temperature,
        location: label,
        weatherCode: weatherCode === undefined || weatherCode === null ? null : Number(weatherCode),
        isDay: current.is_day === undefined || current.is_day === null ? null : Number(current.is_day),
        cloudCover: Number.isNaN(cloudCoverRaw) ? null : cloudCoverRaw,
    };
}
