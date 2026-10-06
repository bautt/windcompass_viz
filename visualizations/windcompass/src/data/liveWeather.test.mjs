import assert from 'node:assert/strict';
import { buildForecastParams, buildForecastUrl, fetchCurrentWeather } from './liveWeather.js';

// Params always request km/h base units — formatSpeed assumes this and
// converts to the display unit from there; requesting a different base unit
// from Open-Meteo would silently corrupt every non-km/h display.
{
    const params = buildForecastParams({ lat: 52.52, lon: 13.41 });
    assert.equal(params.get('latitude'), '52.52');
    assert.equal(params.get('longitude'), '13.41');
    assert.equal(params.get('wind_speed_unit'), 'kmh');
    assert.equal(
        params.get('current'),
        'wind_speed_10m,wind_direction_10m,temperature_2m,weather_code,cloud_cover,is_day',
    );
}

{
    const url = buildForecastUrl({ lat: 1, lon: 2 });
    assert.ok(url.startsWith('https://api.open-meteo.com/v1/forecast?'));
}

// fetchCurrentWeather maps the Open-Meteo response onto the same row shape
// parseSearchData.js produces, without needing a real network call.
{
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({
            current: {
                wind_direction_10m: 400, // out-of-range on purpose, must normalize to 40
                wind_speed_10m: 12.3,
                temperature_2m: 9.5,
                weather_code: 61,
                cloud_cover: 80,
                is_day: 1,
            },
        }),
    });

    try {
        const row = await fetchCurrentWeather({ lat: 52.52, lon: 13.41, label: 'Berlin', countryCode: 'DE' });
        assert.equal(row.windDirection, 40);
        assert.equal(row.windSpeed, 12.3);
        assert.equal(row.temperature, 9.5);
        assert.equal(row.windGusts, null);
        assert.equal(row.location, 'Berlin, DE');
        assert.equal(row.weatherCode, 61);
        assert.equal(row.cloudCover, 80);
        assert.equal(row.isDay, 1);
    } finally {
        globalThis.fetch = originalFetch;
    }
}

// Missing optional condition fields degrade to null rather than NaN/undefined leaking through.
{
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
        ok: true,
        json: async () => ({
            current: { wind_direction_10m: 10, wind_speed_10m: 5, temperature_2m: 20 },
        }),
    });

    try {
        const row = await fetchCurrentWeather({ lat: 0, lon: 0, label: 'X' });
        assert.equal(row.weatherCode, null);
        assert.equal(row.isDay, null);
        assert.equal(row.cloudCover, null);
    } finally {
        globalThis.fetch = originalFetch;
    }
}

// A non-OK HTTP response surfaces a descriptive error instead of throwing deep inside JSON parsing.
{
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({ ok: false, status: 503 });

    try {
        await assert.rejects(
            () => fetchCurrentWeather({ lat: 0, lon: 0, label: 'Nowhere' }),
            /HTTP 503/,
        );
    } finally {
        globalThis.fetch = originalFetch;
    }
}

// A successful reading is always cached, even when the caller did not opt into
// reading from the cache. Scheduled polls rely on this: they force a fresh fetch
// but still leave a warm entry behind for the next dashboard load.
{
    const originalFetch = globalThis.fetch;
    const place = { lat: 11.111, lon: 22.222, label: 'Cacheville', countryCode: 'XX' };
    let calls = 0;
    globalThis.fetch = async () => {
        calls += 1;
        return {
            ok: true,
            json: async () => ({
                current: { wind_direction_10m: 90, wind_speed_10m: calls, temperature_2m: 1 },
            }),
        };
    };

    try {
        // Poll-style call: no cached reading may be served, so it fetches.
        const first = await fetchCurrentWeather(place, { maxAgeMs: 0 });
        assert.equal(first.windSpeed, 1);
        assert.equal(calls, 1);

        // Mount-style call inside the window: served from cache, no new request.
        const second = await fetchCurrentWeather(place, { maxAgeMs: 60 * 1000 });
        assert.equal(second.windSpeed, 1, 'should return the cached reading');
        assert.equal(calls, 1, 'a cached reading must not trigger a request');

        // Outside the window the cache is ignored. Age the entry past the window
        // first: a write and read in the same millisecond would still be a hit.
        await new Promise((resolve) => setTimeout(resolve, 12));
        const third = await fetchCurrentWeather(place, { maxAgeMs: 10 });
        assert.equal(third.windSpeed, 2);
        assert.equal(calls, 2);

        // maxAgeMs 0 always refetches, which is what the poll timer wants.
        await fetchCurrentWeather(place, { maxAgeMs: 0 });
        assert.equal(calls, 3);
    } finally {
        globalThis.fetch = originalFetch;
    }
}

console.log('liveWeather.test.mjs: all assertions passed');
