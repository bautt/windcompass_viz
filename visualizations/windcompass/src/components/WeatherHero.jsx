import { formatSpeed } from '../data/formatters.js';
import { degreesToCompass } from '../data/compassRose.js';
import { resolveWeatherCondition } from '../data/weatherCondition.js';
import { WeatherIcon } from './WeatherIcon.jsx';
import { WindArrow } from './WindArrow.jsx';
import { isOptionEnabled } from '../hooks/normalizeOptions.js';

function formatTemp(tempC, unitKey) {
    if (unitKey === 'f') {
        return `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
    }
    return `${tempC.toFixed(1)}°C`;
}

/**
 * Weather-first alternative to the dial: a centered card with a large
 * condition icon/temperature, location, and a compact wind readout. Used
 * when `showCompass` is off, for dashboards that want the current
 * conditions front and center rather than a needle.
 */
export function WeatherHero({ data, options, theme, size }) {
    const condition = resolveWeatherCondition(data.weatherCode, data.isDay);
    const iconSize = Math.max(48, Math.min(size * 0.3, 140));
    const showIcon = isOptionEnabled(options.showWeatherCondition) && !!condition;
    const showTemp = isOptionEnabled(options.showTemperature) && data.temperature !== null;
    const showDirection = isOptionEnabled(options.showTrueDirectionReadout);
    const showSpeed = isOptionEnabled(options.showTrueSpeedReadout);
    const showCompassLabel = isOptionEnabled(options.showDirectionLabel);
    const speed = formatSpeed(data.windSpeed, options.speedUnit || 'kmh');

    return (
        <div className="wind-hero" style={{ color: theme.textColor }}>
            {(showIcon || showTemp) && (
                <div className="wind-hero__top">
                    {showIcon && (
                        <WeatherIcon conditionKey={condition.key} size={iconSize} color={theme.textColor} />
                    )}
                    {showTemp && (
                        <span className="wind-hero__temp">{formatTemp(data.temperature, options.tempUnit || 'c')}</span>
                    )}
                </div>
            )}
            {showIcon && (
                <div className="weather-condition-label wind-hero__condition-label">{condition.label}</div>
            )}
            {isOptionEnabled(options.showLocation) && data.location && (
                <div className="wind-hero__location">
                    {data.location}
                    {data.country ? <span className="wind-hero__country">, {data.country}</span> : null}
                </div>
            )}
            {(showDirection || showSpeed) && (
                <div className="wind-hero__wind">
                    {showDirection && <WindArrow size={22} angle={data.windDirection} color={theme.trueNeedleColor} />}
                    <span className="wind-hero__wind-value">
                        {showSpeed ? `${speed.value} ${speed.label}` : ''}
                        {showSpeed && showDirection ? ' · ' : ''}
                        {showDirection
                            ? showCompassLabel
                                ? `${Math.round(data.windDirection)}° ${degreesToCompass(data.windDirection)}`
                                : `${Math.round(data.windDirection)}°`
                            : ''}
                    </span>
                </div>
            )}
            {showSpeed && data.windGusts != null && (
                <div className="wind-hero__gusts">Gusts {formatSpeed(data.windGusts, options.speedUnit || 'kmh').value} {speed.label}</div>
            )}
        </div>
    );
}
