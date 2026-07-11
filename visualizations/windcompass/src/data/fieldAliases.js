/**
 * Recognized field aliases (auto-detected when explicit mapping is unset or empty).
 *
 * Required (one row): wind direction (0–360°) and wind speed (numeric).
 * Optional: location, temperature, heading, apparent wind, gusts, country.
 */

export const REQUIRED_FIELDS = {
    windDirection: {
        label: 'Wind direction',
        description: 'Degrees 0–360 (meteorological: direction wind comes from)',
        defaultField: 'wind_direction',
        aliases: [
            'wind_direction',
            'wind_direction_10m',
            'true_wind_direction',
            'direction',
            'bearing',
        ],
    },
    windSpeed: {
        label: 'Wind speed',
        description: 'Numeric speed (unit set via Speed unit option)',
        defaultField: 'wind_speed',
        aliases: [
            'wind_speed',
            'wind_speed_10m',
            'true_wind_speed',
            'speed',
        ],
    },
};

export const OPTIONAL_FIELDS = {
    location: {
        defaultField: 'location',
        aliases: ['location', 'city', 'station', 'name', 'site'],
    },
    country: {
        defaultField: 'country',
        aliases: ['country', 'country_name', 'country_code'],
    },
    temperature: {
        defaultField: 'temperature',
        aliases: ['temperature', 'temperature_2m', 'temp'],
    },
    heading: {
        defaultField: 'heading',
        aliases: ['heading', 'course', 'bearing', 'ship_heading'],
    },
    apparentWindDirection: {
        defaultField: 'apparent_wind_direction',
        aliases: ['apparent_wind_direction', 'awd'],
    },
    apparentWindSpeed: {
        defaultField: 'apparent_wind_speed',
        aliases: ['apparent_wind_speed', 'aws'],
    },
    windGusts: {
        defaultField: 'wind_gusts',
        aliases: ['wind_gusts', 'wind_gusts_10m', 'gusts'],
    },
};

/** Flat alias lists for parseSearchData */
export const FIELD_ALIASES = {
    windDirection: REQUIRED_FIELDS.windDirection.aliases,
    windSpeed: REQUIRED_FIELDS.windSpeed.aliases,
    windGusts: OPTIONAL_FIELDS.windGusts.aliases,
    heading: OPTIONAL_FIELDS.heading.aliases,
    apparentWindDirection: OPTIONAL_FIELDS.apparentWindDirection.aliases,
    apparentWindSpeed: OPTIONAL_FIELDS.apparentWindSpeed.aliases,
    temperature: OPTIONAL_FIELDS.temperature.aliases,
    location: OPTIONAL_FIELDS.location.aliases,
    country: OPTIONAL_FIELDS.country.aliases,
};

export const FIELD_DEFAULTS = {
    fieldWindDirection: REQUIRED_FIELDS.windDirection.defaultField,
    fieldWindSpeed: REQUIRED_FIELDS.windSpeed.defaultField,
    fieldLocation: OPTIONAL_FIELDS.location.defaultField,
    fieldTemperature: OPTIONAL_FIELDS.temperature.defaultField,
    fieldHeading: OPTIONAL_FIELDS.heading.defaultField,
    fieldApparentDirection: OPTIONAL_FIELDS.apparentWindDirection.defaultField,
    fieldApparentSpeed: OPTIONAL_FIELDS.apparentWindSpeed.defaultField,
    fieldWindGusts: OPTIONAL_FIELDS.windGusts.defaultField,
    fieldCountry: OPTIONAL_FIELDS.country.defaultField,
};
