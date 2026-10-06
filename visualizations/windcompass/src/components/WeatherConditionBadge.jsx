import { resolveWeatherCondition } from '../data/weatherCondition.js';
import { WeatherIcon } from './WeatherIcon.jsx';

/** Icon + short label, meant to sit directly below the dial. Renders nothing
 * if the condition can't be resolved (missing/unrecognized weather code). */
export function WeatherConditionBadge({ row, theme }) {
    const condition = row ? resolveWeatherCondition(row.weatherCode, row.isDay) : null;
    if (!condition) return null;

    return (
        <div className="wind-compass__condition" style={{ color: theme.textColor }}>
            <WeatherIcon conditionKey={condition.key} size={36} color={theme.textColor} />
            <span className="weather-condition-label">{condition.label}</span>
        </div>
    );
}
