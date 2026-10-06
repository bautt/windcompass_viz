import { renderNeedle } from './needlePaths.jsx';

/**
 * Needle shapes are authored against a nominal 100px compass radius, but
 * CompassDial draws the dial at radius 160. Without this scale a needle at
 * length 0.72 reaches only 45% of the dial radius, which reads as a stunted
 * pointer. Scaling the whole group keeps each shape's authored proportions
 * (blade width, pivot ring, stroke weights) intact relative to its length.
 */
const NEEDLE_SCALE = 1.5;

export function WindNeedle({ angle, type, length, needleColor, tailColor, opacity = 1 }) {
    return (
        <g
            transform={`rotate(${angle}) scale(${NEEDLE_SCALE})`}
            style={{ opacity, transition: 'opacity 0.2s' }}
        >
            {renderNeedle(type, { length, needleColor, tailColor })}
        </g>
    );
}
