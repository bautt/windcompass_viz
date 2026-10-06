/**
 * Maps Open-Meteo's WMO weather_code (https://open-meteo.com/en/docs — "WMO
 * Weather interpretation codes") onto a small set of icon/label buckets.
 * `isDay` (Open-Meteo's current.is_day, 0|1) swaps clear/partly-cloudy icons
 * between sun/moon variants.
 */
const CODE_TABLE = {
    0: { key: 'clear', label: 'Clear sky' },
    1: { key: 'mostly-clear', label: 'Mainly clear' },
    2: { key: 'partly-cloudy', label: 'Partly cloudy' },
    3: { key: 'overcast', label: 'Overcast' },
    45: { key: 'fog', label: 'Fog' },
    48: { key: 'fog', label: 'Freezing fog' },
    51: { key: 'drizzle', label: 'Light drizzle' },
    53: { key: 'drizzle', label: 'Drizzle' },
    55: { key: 'drizzle', label: 'Dense drizzle' },
    56: { key: 'drizzle', label: 'Freezing drizzle' },
    57: { key: 'drizzle', label: 'Freezing drizzle' },
    61: { key: 'rain', label: 'Light rain' },
    63: { key: 'rain', label: 'Rain' },
    65: { key: 'rain', label: 'Heavy rain' },
    66: { key: 'rain', label: 'Freezing rain' },
    67: { key: 'rain', label: 'Freezing rain' },
    71: { key: 'snow', label: 'Light snow' },
    73: { key: 'snow', label: 'Snow' },
    75: { key: 'snow', label: 'Heavy snow' },
    77: { key: 'snow', label: 'Snow grains' },
    80: { key: 'rain', label: 'Rain showers' },
    81: { key: 'rain', label: 'Rain showers' },
    82: { key: 'rain', label: 'Violent rain showers' },
    85: { key: 'snow', label: 'Snow showers' },
    86: { key: 'snow', label: 'Heavy snow showers' },
    95: { key: 'thunderstorm', label: 'Thunderstorm' },
    96: { key: 'thunderstorm', label: 'Thunderstorm with hail' },
    99: { key: 'thunderstorm', label: 'Severe thunderstorm' },
};

const NIGHT_VARIANT = {
    clear: 'clear-night',
    'mostly-clear': 'clear-night',
    'partly-cloudy': 'partly-cloudy-night',
};

/**
 * Returns null if weatherCode is missing/unrecognized — callers should
 * hide the badge rather than guess at an icon.
 */
export function resolveWeatherCondition(weatherCode, isDay) {
    if (weatherCode === null || weatherCode === undefined || weatherCode === '') return null;

    const entry = CODE_TABLE[Number(weatherCode)];
    if (!entry) return null;

    const night = isDay === 0 || isDay === false || isDay === '0';
    const key = (night && NIGHT_VARIANT[entry.key]) || entry.key;

    return { key, label: entry.label };
}
