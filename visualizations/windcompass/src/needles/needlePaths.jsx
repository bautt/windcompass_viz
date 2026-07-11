/**
 * SVG needle shapes. Each returns JSX for a needle at 0° (pointing up).
 * length is fraction of compass radius (0–1).
 */

function classicNeedle(length, needleColor, tailColor) {
    const tip = -length * 100;
    const tail = length * 28;
    const half = 7;
    return (
        <>
            <polygon
                points={`0,${tip} ${-half},8 0,0 ${half},8`}
                fill={needleColor}
            />
            <polygon
                points={`0,0 ${-half * 0.6},${tail} 0,${tail * 0.7} ${half * 0.6},${tail}`}
                fill={tailColor}
            />
        </>
    );
}

function slimNeedle(length, needleColor) {
    const tip = -length * 100;
    return (
        <line
            x1="0"
            y1="8"
            x2="0"
            y2={tip}
            stroke={needleColor}
            strokeWidth="2.5"
            strokeLinecap="round"
        />
    );
}

function barbedNeedle(length, needleColor, tailColor) {
    const tip = -length * 100;
    return (
        <>
            <line x1="0" y1="6" x2="0" y2={tip} stroke={needleColor} strokeWidth="2" />
            <polygon points={`0,${tip} -9,${tip + 18} 0,${tip + 10} 9,${tip + 18}`} fill={needleColor} />
            <line x1="0" y1="6" x2="0" y2={length * 22} stroke={tailColor} strokeWidth="3" strokeLinecap="round" />
        </>
    );
}

function diamondNeedle(length, needleColor) {
    const tip = -length * 100;
    const mid = -length * 35;
    return (
        <polygon
            points={`0,${tip} -5,${mid} 0,6 5,${mid}`}
            fill={needleColor}
        />
    );
}

function featherNeedle(length, needleColor, tailColor) {
    const tip = -length * 100;
    return (
        <>
            <path
                d={`M0,6 Q-4,${tip * 0.4} -2,${tip} L0,${tip + 4} L2,${tip} Q4,${tip * 0.4} 0,6`}
                fill={needleColor}
            />
            <ellipse cx="0" cy={length * 18} rx="3" ry="6" fill={tailColor} />
        </>
    );
}

function dotLineNeedle(length, needleColor) {
    const tip = -length * 95;
    return (
        <>
            <line x1="0" y1="0" x2="0" y2={tip} stroke={needleColor} strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="0" cy="0" r="4" fill={needleColor} />
        </>
    );
}

function instrumentNeedle(length, needleColor) {
    // tip: arrowhead apex; arrowBase: where arrowhead meets shaft
    // tailRing: open circle at tail end
    const tip = -length * 100;
    const arrowH = 18;
    const arrowW = 7;
    const arrowBase = tip + arrowH;
    const tailRingY = length * 70;
    const ringR = 5;
    const shaftStart = tailRingY - ringR;

    return (
        <>
            {/* Shaft — from ring top to arrowhead base */}
            <line
                x1="0" y1={shaftStart}
                x2="0" y2={arrowBase}
                stroke={needleColor}
                strokeWidth="1.5"
                strokeLinecap="butt"
            />
            {/* Solid arrowhead */}
            <polygon
                points={`0,${tip} ${-arrowW},${arrowBase} ${arrowW},${arrowBase}`}
                fill={needleColor}
            />
            {/* Open tail ring */}
            <circle
                cx="0" cy={tailRingY}
                r={ringR}
                fill="none"
                stroke={needleColor}
                strokeWidth="1.5"
            />
        </>
    );
}

export function renderNeedle(type, { length = 0.72, needleColor, tailColor }) {
    switch (type) {
        case 'slim':
            return slimNeedle(length, needleColor);
        case 'barbed':
            return barbedNeedle(length, needleColor, tailColor);
        case 'diamond':
            return diamondNeedle(length, needleColor);
        case 'feather':
            return featherNeedle(length, needleColor, tailColor);
        case 'dot_line':
            return dotLineNeedle(length, needleColor);
        case 'instrument':
            return instrumentNeedle(length, needleColor);
        case 'classic':
        default:
            return classicNeedle(length, needleColor, tailColor);
    }
}
