import { formatSpeed } from '../data/formatters.js';
import { formatDirection } from '../data/compassRose.js';
import { isOptionEnabled } from '../hooks/normalizeOptions.js';
import { WindArrow } from './WindArrow.jsx';

function formatTemp(tempC, unitKey) {
    if (unitKey === 'f') {
        return `${((tempC * 9) / 5 + 32).toFixed(1)}°F`;
    }
    return `${tempC.toFixed(1)}°C`;
}

/**
 * Compact readouts shown alongside the compass dial. Shares the same wind
 * pill + bold-temperature visual language as `WeatherHero` so the view
 * looks consistent whether or not the dial itself is visible.
 */
export function ReadoutPanel({ data, options, theme }) {
    const showCompassLabel = isOptionEnabled(options.showDirectionLabel);
    const showLocation = isOptionEnabled(options.showLocation) && !!data.location;
    const showDirection = isOptionEnabled(options.showTrueDirectionReadout);
    const showSpeed = isOptionEnabled(options.showTrueSpeedReadout) && !isOptionEnabled(options.showCenterSpeed);
    const showTemp = isOptionEnabled(options.showTemperature) && data.temperature !== null;
    const showWind = showDirection || showSpeed;

    if (!showLocation && !showTemp && !showWind) return null;

    const position = options.readoutPosition || 'bottom';
    const speed = formatSpeed(data.windSpeed, options.speedUnit || 'kmh');

    return (
        <div
            className={`wind-compass__readouts wind-compass__readouts--${position}`}
            style={{ color: theme.textColor }}
        >
            {showLocation && (
                <div className="wind-compass__readout-location">{data.location}</div>
            )}
            {(showTemp || showWind) && (
                <div className="wind-compass__readout-row">
                    {showTemp && (
                        <span className="wind-compass__readout-temp">
                            {formatTemp(data.temperature, options.tempUnit || 'c')}
                        </span>
                    )}
                    {showWind && (
                        <span className="wind-compass__readout-wind" style={{ borderColor: theme.trueNeedleColor }}>
                            {showDirection && (
                                <WindArrow size={16} angle={data.windDirection} color={theme.trueNeedleColor} />
                            )}
                            <span>
                                {showSpeed ? `${speed.value} ${speed.label}` : ''}
                                {showSpeed && showDirection ? ' · ' : ''}
                                {showDirection ? formatDirection(data.windDirection, { showCompass: showCompassLabel }) : ''}
                            </span>
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
