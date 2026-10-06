/**
 * Small, monochrome-friendly SVG icon set for the resolved weather
 * condition keys from `data/weatherCondition.js`. Deliberately simple
 * shapes (no external image assets) so they stay crisp at badge size and
 * recolor cleanly against any skin/theme.
 */
function Sun({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <circle cx="12" cy="12" r="5" fill="#f5a623" />
            <g stroke="#f5a623" strokeWidth="1.6" strokeLinecap="round">
                <line x1="12" y1="1.5" x2="12" y2="4.5" />
                <line x1="12" y1="19.5" x2="12" y2="22.5" />
                <line x1="1.5" y1="12" x2="4.5" y2="12" />
                <line x1="19.5" y1="12" x2="22.5" y2="12" />
                <line x1="4.4" y1="4.4" x2="6.5" y2="6.5" />
                <line x1="17.5" y1="17.5" x2="19.6" y2="19.6" />
                <line x1="4.4" y1="19.6" x2="6.5" y2="17.5" />
                <line x1="17.5" y1="6.5" x2="19.6" y2="4.4" />
            </g>
        </svg>
    );
}

function Moon({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <path
                d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
                fill="#8fa6c7"
            />
        </svg>
    );
}

function CloudShape({ fill, opacity = 1 }) {
    return (
        <path
            d="M7 17.5a4 4 0 0 1-.6-7.95A5 5 0 0 1 16 9a4.2 4.2 0 0 1 .6 8.5Z"
            fill={fill}
            opacity={opacity}
        />
    );
}

function CloudSun({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <circle cx="16" cy="7" r="3.6" fill="#f5a623" />
            <CloudShape fill={color} opacity={0.85} />
        </svg>
    );
}

function CloudMoon({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <path d="M18.5 8.2A3.6 3.6 0 1 1 14.3 4a3 3 0 0 0 4.2 4.2Z" fill="#8fa6c7" />
            <CloudShape fill={color} opacity={0.85} />
        </svg>
    );
}

function Overcast({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <g opacity="0.55">
                <path d="M3.5 15.5a3.3 3.3 0 0 1-.4-6.57A4.3 4.3 0 0 1 11 8a3.5 3.5 0 0 1 .4 6.95Z" fill={color} />
            </g>
            <CloudShape fill={color} />
        </svg>
    );
}

function Fog({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <CloudShape fill={color} opacity={0.75} />
            <g stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.8">
                <line x1="4" y1="20" x2="20" y2="20" />
                <line x1="6" y1="22.5" x2="18" y2="22.5" />
            </g>
        </svg>
    );
}

function RainDrops({ color, count }) {
    const xs = count === 2 ? [9, 15] : [7.5, 12, 16.5];
    return xs.map((x) => (
        <path
            key={x}
            d={`M${x} 19c-1.1 1.3-1.1 2.4 0 3.2 1.1-0.8 1.1-1.9 0-3.2Z`}
            fill="#4a90d9"
        />
    ));
}

function Rain({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <CloudShape fill={color} opacity={0.85} />
            <RainDrops color={color} count={3} />
        </svg>
    );
}

function Drizzle({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <CloudShape fill={color} opacity={0.85} />
            <RainDrops color={color} count={2} />
        </svg>
    );
}

function Snowflake({ x, y }) {
    return (
        <g stroke="#cfe6f7" strokeWidth="1.3" strokeLinecap="round" transform={`translate(${x} ${y})`}>
            <line x1="0" y1="-2.2" x2="0" y2="2.2" />
            <line x1="-1.9" y1="-1.1" x2="1.9" y2="1.1" />
            <line x1="-1.9" y1="1.1" x2="1.9" y2="-1.1" />
        </g>
    );
}

function Snow({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <CloudShape fill={color} opacity={0.85} />
            <Snowflake x={9} y={20} />
            <Snowflake x={15} y={20} />
        </svg>
    );
}

function Thunderstorm({ size, color }) {
    return (
        <svg viewBox="0 0 24 24" width={size} height={size} role="presentation">
            <CloudShape fill={color} opacity={0.85} />
            <path d="M12.5 15.5 9.5 20h2.6l-1 3.3 4-4.8h-2.6l1-3Z" fill="#f1c40f" />
        </svg>
    );
}

const ICONS = {
    clear: Sun,
    'clear-night': Moon,
    'mostly-clear': Sun,
    'partly-cloudy': CloudSun,
    'partly-cloudy-night': CloudMoon,
    overcast: Overcast,
    fog: Fog,
    drizzle: Drizzle,
    rain: Rain,
    snow: Snow,
    thunderstorm: Thunderstorm,
};

export function WeatherIcon({ conditionKey, size = 28, color = 'currentColor' }) {
    const Icon = ICONS[conditionKey];
    if (!Icon) return null;
    return <Icon size={size} color={color} />;
}
