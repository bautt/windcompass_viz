import { formatSpeed } from '../data/formatters.js';
import { formatDirection } from '../data/compassRose.js';

function formatTemp(tempC, unitKey) {
    if (unitKey === 'f') {
        return `${((tempC * 9) / 5 + 32).toFixed(1)} °F`;
    }
    return `${tempC.toFixed(1)} °C`;
}

export function ReadoutPanel({ data, options, theme }) {
    const items = [];
    const showCompassLabel = options.showDirectionLabel !== false;

    if (options.showLocation !== false && data.location) {
        items.push({ key: 'loc', label: '', value: data.location, primary: true });
    }

    if (options.showTrueDirectionReadout !== false) {
        items.push({
            key: 'twd',
            label: 'Wind',
            value: formatDirection(data.windDirection, { showCompass: showCompassLabel }),
        });
    }

    if (options.showTrueSpeedReadout !== false && !options.showCenterSpeed) {
        const speed = formatSpeed(data.windSpeed, options.speedUnit || 'kmh');
        items.push({
            key: 'tws',
            label: 'Speed',
            value: `${speed.value} ${speed.label}`,
        });
    }

    if (options.showTemperature && data.temperature !== null) {
        items.push({
            key: 'temp',
            label: 'Temp',
            value: formatTemp(data.temperature, options.tempUnit || 'c'),
        });
    }

    if (items.length === 0) return null;

    const position = options.readoutPosition || 'bottom';

    return (
        <div
            className={`wind-compass__readouts wind-compass__readouts--${position}`}
            style={{ color: theme.textColor }}
        >
            {items.map((item) => (
                <div
                    key={item.key}
                    className={`wind-compass__readout${item.primary ? ' wind-compass__readout--primary' : ''}`}
                >
                    {item.label && (
                        <span className="wind-compass__readout-label">{item.label}</span>
                    )}
                    <span className="wind-compass__readout-value">{item.value}</span>
                </div>
            ))}
        </div>
    );
}
