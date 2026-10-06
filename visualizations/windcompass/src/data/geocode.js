/**
 * Open-Meteo geocoding (geocoding-api.open-meteo.com) — resolves a free-text
 * city (+ optional country) into coordinates. No API key required.
 *
 * Results are cached in memory for the lifetime of the iframe: the same
 * city/country pair resolves once, no matter how often the poll interval
 * fires or how many panels on a dashboard share it.
 */

const GEOCODE_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';

const cache = new Map();

function isAlpha2(code) {
    return typeof code === 'string' && /^[a-z]{2}$/i.test(code.trim());
}

/**
 * Open-Meteo's matching rules: country/admin1 qualifiers appended to `name`
 * must match exactly, while `countryCode` gives unambiguous ISO-3166-1
 * alpha-2 filtering. Prefer countryCode whenever the user's input looks like
 * a 2-letter code; otherwise fall back to the "City, Country" qualifier form.
 */
export function buildGeocodeParams(city, country) {
    const trimmedCity = (city || '').trim();
    const trimmedCountry = (country || '').trim();
    const params = new URLSearchParams({ count: '1' });

    if (trimmedCountry && isAlpha2(trimmedCountry)) {
        params.set('name', trimmedCity);
        params.set('countryCode', trimmedCountry.toUpperCase());
    } else if (trimmedCountry) {
        params.set('name', `${trimmedCity}, ${trimmedCountry}`);
    } else {
        params.set('name', trimmedCity);
    }

    return params;
}

export function buildGeocodeUrl(city, country) {
    return `${GEOCODE_ENDPOINT}?${buildGeocodeParams(city, country).toString()}`;
}

export function geocodeCacheKey(city, country) {
    return `${(city || '').trim().toLowerCase()}|${(country || '').trim().toLowerCase()}`;
}

/**
 * Resolve a city/country into { lat, lon, label, country, countryCode }.
 * Throws a descriptive error if the city name is empty or has no match.
 */
export async function geocodeCity(city, country, { signal } = {}) {
    const trimmedCity = (city || '').trim();
    if (!trimmedCity) {
        throw new Error('City is required.');
    }

    const key = geocodeCacheKey(city, country);
    if (cache.has(key)) {
        return cache.get(key);
    }

    const res = await fetch(buildGeocodeUrl(city, country), { signal });
    if (!res.ok) {
        throw new Error(`Geocoding lookup failed (HTTP ${res.status}).`);
    }

    const json = await res.json();
    const match = json?.results?.[0];
    if (!match) {
        const suffix = country ? `, ${country}` : '';
        throw new Error(`No location found for "${trimmedCity}${suffix}".`);
    }

    const place = {
        lat: match.latitude,
        lon: match.longitude,
        label: match.name,
        country: match.country,
        countryCode: match.country_code,
    };

    cache.set(key, place);
    return place;
}

export function clearGeocodeCache() {
    cache.clear();
}
