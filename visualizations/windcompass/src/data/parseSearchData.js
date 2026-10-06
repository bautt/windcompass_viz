import { FIELD_ALIASES, REQUIRED_FIELDS } from './fieldAliases.js';
import { normalizeDegrees } from './windAngles.js';

function fieldNames(data) {
    return (data.fields || []).map((f) => (f && f.name) || f);
}

export function hasDataRows(data) {
    if (!data) return false;
    if (data.columns?.length) {
        return data.columns.some((col) => col && col.length > 0);
    }
    if (data.rows?.length) {
        return data.rows.length > 0;
    }
    return false;
}

function columnValue(data, fieldName, rowIndex = 0) {
    if (!data || !fieldName) return null;
    const names = fieldNames(data);
    const idx = names.indexOf(fieldName);
    if (idx === -1) return null;

    if (data.columns && data.columns[idx]) {
        return data.columns[idx][rowIndex] ?? null;
    }
    if (data.rows && data.rows[rowIndex]) {
        return data.rows[rowIndex][idx] ?? null;
    }
    return null;
}

function resolveField(data, aliases, explicitField) {
    if (explicitField) {
        const val = columnValue(data, explicitField);
        if (val !== null && val !== undefined && val !== '') {
            return { field: explicitField, value: val };
        }
    }

    for (const candidate of aliases) {
        const val = columnValue(data, candidate);
        if (val !== null && val !== undefined && val !== '') {
            return { field: candidate, value: val };
        }
    }
    return { field: explicitField || aliases[0], value: null };
}

/**
 * Search mode renders whatever a user's SPL produces, so this has to reject
 * Infinity as well as NaN: `Number('1e999')` is Infinity, which would survive
 * into an SVG `rotate()` as NaN and silently break the dial.
 */
function parseNumber(raw, fieldLabel) {
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    if (!Number.isFinite(n)) {
        throw new Error(`"${fieldLabel}" must be numeric (got "${raw}")`);
    }
    return n;
}

function finiteOrNull(raw) {
    if (raw === null || raw === undefined || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
}

/**
 * Parse the first row of DS columnar search data into typed wind compass values.
 */
export function parseSearchData(data, options = {}) {
    if (!data || !hasDataRows(data)) return null;

    const windDir = resolveField(
        data,
        FIELD_ALIASES.windDirection,
        options.fieldWindDirection,
    );
    const windSpd = resolveField(
        data,
        FIELD_ALIASES.windSpeed,
        options.fieldWindSpeed,
    );

    const windDirection = parseNumber(windDir.value, windDir.field);
    const windSpeed = parseNumber(windSpd.value, windSpd.field);

    if (windDirection === null) {
        const expected = options.fieldWindDirection || REQUIRED_FIELDS.windDirection.defaultField;
        throw new Error(
            `Missing required field "${expected}" (wind direction, 0–360°). ` +
            `Also accepts: ${FIELD_ALIASES.windDirection.join(', ')}`,
        );
    }
    if (windSpeed === null) {
        const expected = options.fieldWindSpeed || REQUIRED_FIELDS.windSpeed.defaultField;
        throw new Error(
            `Missing required field "${expected}" (wind speed). ` +
            `Also accepts: ${FIELD_ALIASES.windSpeed.join(', ')}`,
        );
    }

    const tempField = resolveField(
        data,
        FIELD_ALIASES.temperature,
        options.fieldTemperature,
    );
    const locField = resolveField(
        data,
        FIELD_ALIASES.location,
        options.fieldLocation,
    );
    const countryField = resolveField(
        data,
        FIELD_ALIASES.country,
        options.fieldCountry,
    );
    const gustField = resolveField(
        data,
        FIELD_ALIASES.windGusts,
        options.fieldWindGusts,
    );
    const weatherCodeField = resolveField(
        data,
        FIELD_ALIASES.weatherCode,
        options.fieldWeatherCode,
    );
    const isDayField = resolveField(
        data,
        FIELD_ALIASES.isDay,
        options.fieldIsDay,
    );

    const temperature = parseNumber(tempField.value, tempField.field);
    const windGusts = parseNumber(gustField.value, gustField.field);
    // Unlike the required fields these are cosmetic, so a bad value is dropped
    // rather than failing the whole panel.
    const weatherCode = finiteOrNull(weatherCodeField.value);
    const isDay = finiteOrNull(isDayField.value);

    let location = locField.value ? String(locField.value) : null;
    if (location && countryField.value) {
        location = `${location}, ${countryField.value}`;
    }

    return {
        windDirection: normalizeDegrees(windDirection),
        windSpeed,
        windGusts,
        temperature,
        location,
        weatherCode,
        isDay,
        fieldsUsed: {
            windDirection: windDir.field,
            windSpeed: windSpd.field,
        },
    };
}
