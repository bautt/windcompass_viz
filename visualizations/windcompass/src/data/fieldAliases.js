/**
 * Recognized field aliases (auto-detected when explicit mapping is unset or empty).
 *
 * Required (one row): wind direction (0–360°) and wind speed (numeric).
 * Optional: location, temperature, gusts, country.
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
    windGusts: {
        defaultField: 'wind_gusts',
        aliases: ['wind_gusts', 'wind_gusts_10m', 'gusts'],
    },
    weatherCode: {
        defaultField: 'weather_code',
        aliases: ['weather_code', 'weathercode', 'wmo_code'],
    },
    isDay: {
        defaultField: 'is_day',
        aliases: ['is_day', 'isday', 'daytime'],
    },
};

/** Flat alias lists for parseSearchData */
export const FIELD_ALIASES = {
    windDirection: REQUIRED_FIELDS.windDirection.aliases,
    windSpeed: REQUIRED_FIELDS.windSpeed.aliases,
    windGusts: OPTIONAL_FIELDS.windGusts.aliases,
    temperature: OPTIONAL_FIELDS.temperature.aliases,
    location: OPTIONAL_FIELDS.location.aliases,
    country: OPTIONAL_FIELDS.country.aliases,
    weatherCode: OPTIONAL_FIELDS.weatherCode.aliases,
    isDay: OPTIONAL_FIELDS.isDay.aliases,
};

export const FIELD_DEFAULTS = {
    fieldWindDirection: REQUIRED_FIELDS.windDirection.defaultField,
    fieldWindSpeed: REQUIRED_FIELDS.windSpeed.defaultField,
    fieldLocation: OPTIONAL_FIELDS.location.defaultField,
    fieldTemperature: OPTIONAL_FIELDS.temperature.defaultField,
    fieldWindGusts: OPTIONAL_FIELDS.windGusts.defaultField,
    fieldCountry: OPTIONAL_FIELDS.country.defaultField,
    fieldWeatherCode: OPTIONAL_FIELDS.weatherCode.defaultField,
    fieldIsDay: OPTIONAL_FIELDS.isDay.defaultField,
};
