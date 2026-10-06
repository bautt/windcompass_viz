/**
 * SVG needle shapes. Each returns JSX for a needle at 0° (pointing up).
 * Coordinate system: (0,0) is the compass centre / rotation pivot.
 *   negative-y  →  forward (tip direction)
 *   positive-y  →  tail direction
 * length is a fraction of compass radius (0–1), authored against a nominal
 * 100 px radius. WindNeedle scales the result up to the dial's real radius,
 * so shapes here only need to be internally proportionate.
 */

function cleanNeedle(length, needleColor, tailColor) {
    // Minimal, modern pointer: a slender tapered blade for the pointing half,
    // a thin balancing tail, and a small open pivot ring. Reads as precise and
    // uncluttered rather than the bold two-tone lozenge of the classic needle.
    const tip     = -length * 100;  // pointing tip
    const baseHw  = 3.4;            // narrow half-width where the blade meets pivot
    const shoulder = -length * 12;  // slight shoulder just ahead of the pivot
    const tail    =  length * 34;   // short, thin tail
    const ringR   = 3.2;            // open pivot ring
    return (
        <>
            {/* Slender tapered pointing blade */}
            <polygon
                points={`0,${tip} ${-baseHw},${shoulder} ${-baseHw * 0.7},0 ${baseHw * 0.7},0 ${baseHw},${shoulder}`}
                fill={needleColor}
            />
            {/* Thin balancing tail */}
            <line
                x1="0" y1={ringR}
                x2="0" y2={tail}
                stroke={tailColor || needleColor}
                strokeWidth="1.6"
                strokeLinecap="round"
                opacity="0.55"
            />
            {/* Open pivot ring */}
            <circle
                cx="0" cy="0" r={ringR}
                fill="none"
                stroke={needleColor}
                strokeWidth="1.4"
            />
        </>
    );
}

function classicNeedle(length, needleColor, tailColor) {
    // Traditional magnetic-compass needle: a bold two-tone lozenge that is
    // widest at the pivot, with a long pointing (north) half, a shorter tail
    // half, and a small mounted pivot cap.
    const tip    = -length * 100;   // pointing tip
    const tail   =  length * 72;    // tail tip (shorter than the pointer)
    const hw     = 8.5;             // half-width at the pivot (widest point)
    const capR   = 3.6;             // pivot cap radius
    return (
        <>
            {/* Pointing (north) half */}
            <polygon
                points={`0,${tip} ${-hw},0 ${hw},0`}
                fill={needleColor}
            />
            {/* Tail (south) half */}
            <polygon
                points={`${-hw},0 ${hw},0 0,${tail}`}
                fill={tailColor}
            />
            {/* Subtle center spine highlight for depth */}
            <line
                x1="0" y1={tip}
                x2="0" y2={tail}
                stroke={needleColor}
                strokeWidth="0.75"
                strokeOpacity="0.35"
            />
            {/* Mounted pivot cap */}
            <circle
                cx="0" cy="0" r={capR}
                fill={needleColor}
                stroke={tailColor}
                strokeWidth="1.2"
            />
        </>
    );
}

function slimNeedle(length, needleColor, tailColor) {
    const tip  = -length * 100;
    const tail =  length * 22;
    return (
        <>
            <line
                x1="0" y1={tail}
                x2="0" y2={tip}
                stroke={needleColor}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Contrasting tail cap */}
            <line
                x1="0" y1="0"
                x2="0" y2={tail}
                stroke={tailColor || needleColor}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.6"
            />
        </>
    );
}

function barbedNeedle(length, needleColor, tailColor) {
    const tip    = -length * 100;
    const tail   =  length * 24;
    const barbY  = tip + length * 20; // barbs sit just behind tip
    const barbW  = 10;
    return (
        <>
            {/* Main shaft from tail to tip */}
            <line x1="0" y1={tail} x2="0" y2={tip} stroke={needleColor} strokeWidth="2" />
            {/* Barb wings */}
            <polygon points={`0,${tip} ${-barbW},${barbY} 0,${barbY + 6} ${barbW},${barbY}`} fill={needleColor} />
            {/* Coloured tail */}
            <line x1="0" y1="0" x2="0" y2={tail} stroke={tailColor} strokeWidth="3.5" strokeLinecap="round" />
        </>
    );
}

function diamondNeedle(length, needleColor, tailColor) {
    const tip  = -length * 100;
    const mid  = -length * 40;
    const tail =  length * 22;
    return (
        <>
            {/* Forward diamond */}
            <polygon
                points={`0,${tip} ${-6},${mid} 0,0 ${6},${mid}`}
                fill={needleColor}
            />
            {/* Tail diamond */}
            <polygon
                points={`0,0 ${-4},${tail * 0.6} 0,${tail} ${4},${tail * 0.6}`}
                fill={tailColor || needleColor}
                opacity="0.7"
            />
        </>
    );
}

function featherNeedle(length, needleColor, tailColor) {
    const tip  = -length * 100;
    const tail =  length * 22;
    return (
        <>
            <path
                d={`M0,0 Q${-5},${tip * 0.4} ${-2},${tip} L0,${tip + 5} L${2},${tip} Q${5},${tip * 0.4} 0,0`}
                fill={needleColor}
            />
            {/* Tail teardrop */}
            <ellipse cx="0" cy={tail * 0.6} rx="3.5" ry={tail * 0.45} fill={tailColor} />
        </>
    );
}

function dotLineNeedle(length, needleColor) {
    const tip  = -length * 95;
    const tail =  length * 18;
    return (
        <>
            <line x1="0" y1={tail} x2="0" y2={tip} stroke={needleColor} strokeWidth="1.5" strokeDasharray="4 3" />
            <circle cx="0" cy="0" r="5" fill={needleColor} />
        </>
    );
}

function instrumentNeedle(length, needleColor) {
    const tip      = -length * 100;
    const arrowH   = 18;
    const arrowW   = 7;
    const arrowBase = tip + arrowH;
    const tailRingY = length * 70;
    const ringR     = 5;
    // Shaft connects arrowhead base to just above the tail ring
    const shaftEnd  = tailRingY - ringR;

    return (
        <>
            {/* Shaft from arrowhead base down to tail ring */}
            <line
                x1="0" y1={arrowBase}
                x2="0" y2={shaftEnd}
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
        case 'clean':      return cleanNeedle(length, needleColor, tailColor);
        case 'slim':       return slimNeedle(length, needleColor, tailColor);
        case 'barbed':     return barbedNeedle(length, needleColor, tailColor);
        case 'diamond':    return diamondNeedle(length, needleColor, tailColor);
        case 'feather':    return featherNeedle(length, needleColor, tailColor);
        case 'dot_line':   return dotLineNeedle(length, needleColor);
        case 'instrument': return instrumentNeedle(length, needleColor);
        case 'classic':
        default:           return classicNeedle(length, needleColor, tailColor);
    }
}
