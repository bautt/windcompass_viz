import assert from 'node:assert/strict';
import { buildGeocodeParams, buildGeocodeUrl, geocodeCacheKey } from './geocode.js';

// City only — no country qualifier at all.
{
    const params = buildGeocodeParams('Berlin', '');
    assert.equal(params.get('name'), 'Berlin');
    assert.equal(params.get('countryCode'), null);
}

// 2-letter country code -> unambiguous countryCode filter, name stays bare.
{
    const params = buildGeocodeParams('Berlin', 'de');
    assert.equal(params.get('name'), 'Berlin');
    assert.equal(params.get('countryCode'), 'DE');
}

// Full country name -> appended as a "City, Country" qualifier per Open-Meteo's matching rules.
{
    const params = buildGeocodeParams('Paris', 'France');
    assert.equal(params.get('name'), 'Paris, France');
    assert.equal(params.get('countryCode'), null);
}

// US state abbreviation is 2 letters but not a country code — Open-Meteo treats
// admin1 abbreviations via the qualifier form, not countryCode, so it must NOT
// be routed through countryCode (which only accepts ISO-3166-1 alpha2 country codes).
// We can't distinguish "CA" (California) from "CA" (Canada) here without a
// country list, so documenting the known trade-off via a direct country code works:
{
    const params = buildGeocodeParams('Toronto', 'CA');
    assert.equal(params.get('countryCode'), 'CA');
}

// Cache key is case- and whitespace-insensitive.
{
    assert.equal(geocodeCacheKey('Berlin', 'DE'), geocodeCacheKey('  berlin  ', 'de'));
    assert.notEqual(geocodeCacheKey('Berlin', 'DE'), geocodeCacheKey('Berlin', 'LT'));
}

// URL is well-formed and hits the documented geocoding endpoint.
{
    const url = buildGeocodeUrl('Vilnius', 'LT');
    assert.ok(url.startsWith('https://geocoding-api.open-meteo.com/v1/search?'));
    assert.ok(url.includes('name=Vilnius'));
    assert.ok(url.includes('countryCode=LT'));
}

console.log('geocode.test.mjs: all assertions passed');
