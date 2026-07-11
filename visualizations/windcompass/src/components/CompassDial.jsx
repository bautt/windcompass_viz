import { formatSpeed } from '../data/formatters.js';
import { WindNeedle } from '../needles/WindNeedle.jsx';

const CARDINALS = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
];

function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: cx + r * Math.cos(rad),
        y: cy + r * Math.sin(rad),
    };
}

function tickLine(cx, cy, innerR, outerR, angleDeg) {
    const inner = polarToCartesian(cx, cy, innerR, angleDeg);
    const outer = polarToCartesian(cx, cy, outerR, angleDeg);
    return { x1: inner.x, y1: inner.y, x2: outer.x, y2: outer.y };
}

function scaleRadius(radius, value, fallback) {
    if (typeof value === 'number' && value > 0 && value <= 1) {
        return radius * value;
    }
    return fallback;
}

function buildTicks(cx, cy, radius, skin, theme, options) {
    const ticks = [];
    const minorEvery = skin.minorTickEvery ?? 10;
    const majorEvery = skin.majorTickEvery ?? 30;

    const minorInner = scaleRadius(radius, skin.minorTickInner, radius - 8);
    const minorOuter = scaleRadius(radius, skin.minorTickOuter, radius - 2);
    const majorInner = scaleRadius(radius, skin.majorTickInner, radius - 14);
    const majorOuter = scaleRadius(radius, skin.majorTickOuter, radius);

    if (options.showMinorTicks !== false) {
        for (let deg = 0; deg < 360; deg += minorEvery) {
            if (deg % majorEvery === 0) continue;
            const line = tickLine(cx, cy, minorInner, minorOuter, deg);
            ticks.push(
                <line
                    key={`minor-${deg}`}
                    {...line}
                    stroke={theme.tickColor}
                    strokeWidth="1"
                />,
            );
        }
    }

    if (options.showMajorTicks !== false) {
        for (let deg = 0; deg < 360; deg += majorEvery) {
            const line = tickLine(cx, cy, majorInner, majorOuter, deg);
            ticks.push(
                <line
                    key={`major-${deg}`}
                    {...line}
                    stroke={theme.tickMajorColor}
                    strokeWidth={skin.majorTickEvery === 90 ? '1.5' : '2'}
                />,
            );
        }
    }

    return ticks;
}

function NorthMarker({ cx, cy, radius, color }) {
    const tip = polarToCartesian(cx, cy, radius - 6, 0);
    const left = polarToCartesian(cx, cy, radius - 14, -4);
    const right = polarToCartesian(cx, cy, radius - 14, 4);
    return (
        <polygon
            points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
            fill={color}
        />
    );
}

function CenterSpeedReadout({ cx, cy, speedKmh, unitKey, color }) {
    const { value, label } = formatSpeed(speedKmh, unitKey);
    return (
        <g pointerEvents="none">
            <text
                x={cx}
                y={cy - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize="44"
                fontWeight="700"
                fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            >
                {value}
            </text>
            <text
                x={cx}
                y={cy + 24}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={color}
                fontSize="14"
                fontWeight="400"
                fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
            >
                {label}
            </text>
        </g>
    );
}

export function CompassDial({
    skinId = 'clean',
    theme,
    dialRotation = 0,
    size,
    options,
    data,
    trueWindAngle,
}) {
    const cx = 200;
    const cy = 200;
    const radius = 160;
    const bezelR = radius + 12;
    const { skin } = theme;
    const showBezel = skin.showBezel !== false;
    const labelR = skin.cardinalLabelRadius
        ? radius * skin.cardinalLabelRadius
        : radius + 28;
    const fontSize = Math.max(11, size * 0.045);
    const innerHubR = skin.innerHubRadius ? radius * skin.innerHubRadius : null;
    // User's explicit choice takes priority; otherwise fall back to the skin's
    // default needle, then a global default.
    const trueNeedleType = options.trueNeedleType || skin.trueNeedleType || 'classic';
    const ticks = buildTicks(cx, cy, radius, skin, theme, options);

    const dialFill = skin.dialFlat
        ? theme.dialColor
        : `url(#dialGrad-${skinId})`;

    return (
        <svg
            className="wind-compass__svg"
            viewBox="0 0 400 400"
            width={size}
            height={size}
            role="img"
            aria-label="Wind compass"
        >
            {/* Solid-background skins (or an explicit bg color) fill inside the SVG so panel CSS can't override it */}
            {(skin.solidBackground || (theme.backgroundColor && theme.backgroundColor !== 'transparent')) && (
                <rect x="0" y="0" width="400" height="400" fill={theme.backgroundColor} />
            )}
            <defs>
                {skin.showBezelGradient && (
                    <radialGradient id={`bezelGrad-${skinId}`} cx="50%" cy="45%" r="55%">
                        <stop offset="0%" stopColor={theme.bezelColor} stopOpacity="0.9" />
                        <stop offset="100%" stopColor={theme.bezelColor} stopOpacity="1" />
                    </radialGradient>
                )}
                {!skin.dialFlat && (
                    <radialGradient id={`dialGrad-${skinId}`} cx="50%" cy="45%" r="60%">
                        <stop offset="0%" stopColor={theme.dialColor} />
                        <stop offset="100%" stopColor={theme.dialColor} stopOpacity="0.85" />
                    </radialGradient>
                )}
            </defs>

            {showBezel && (
                <circle
                    cx={cx}
                    cy={cy}
                    r={bezelR}
                    fill={skin.showBezelGradient ? `url(#bezelGrad-${skinId})` : theme.bezelColor}
                    stroke={theme.tickMajorColor}
                    strokeWidth={skin.bezelWidth}
                />
            )}

            <g transform={`rotate(${dialRotation} ${cx} ${cy})`}>
                <circle
                    cx={cx}
                    cy={cy}
                    r={radius}
                    fill={dialFill}
                    stroke={showBezel ? 'none' : theme.dialRingColor}
                    strokeWidth={showBezel ? 0 : 1.5}
                    strokeOpacity={showBezel ? 0 : 1}
                />

                {ticks}

                {options.showCardinals !== false &&
                    CARDINALS.map(({ label, angle }) => {
                        const pos = polarToCartesian(cx, cy, labelR, angle);
                        return (
                            <text
                                key={label}
                                x={pos.x}
                                y={pos.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill={theme.textColor}
                                fontSize={label === 'N' ? fontSize + 2 : fontSize}
                                fontWeight={skin.cardinalFontWeight}
                                fontFamily="system-ui, sans-serif"
                            >
                                {label}
                            </text>
                        );
                    })}

                {skin.showNorthMarker && (
                    <NorthMarker cx={cx} cy={cy} radius={radius} color={theme.tickMajorColor} />
                )}

                {innerHubR ? (
                    <circle
                        cx={cx}
                        cy={cy}
                        r={innerHubR}
                        fill={theme.innerHubColor}
                    />
                ) : (
                    <>
                        <circle cx={cx} cy={cy} r="6" fill={theme.hubColor} opacity="0.35" />
                        <circle cx={cx} cy={cy} r="3" fill={theme.hubColor} />
                    </>
                )}
            </g>

            <g transform={`translate(${cx} ${cy})`}>
                {options.showTrueWind !== false && (
                    <WindNeedle
                        angle={trueWindAngle}
                        type={trueNeedleType}
                        length={trueNeedleType === 'instrument' ? 0.78 : 0.72}
                        needleColor={theme.trueNeedleColor}
                        tailColor={theme.trueTailColor}
                    />
                )}
            </g>

            {options.showCenterSpeed &&
                data &&
                options.showTrueSpeedReadout !== false && (
                    <CenterSpeedReadout
                        cx={cx}
                        cy={cy}
                        speedKmh={data.windSpeed}
                        unitKey={options.speedUnit || 'kmh'}
                        color={theme.textColor}
                    />
                )}
        </svg>
    );
}
