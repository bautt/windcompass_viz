import { renderNeedle } from './needlePaths.jsx';

export function WindNeedle({ angle, type, length, needleColor, tailColor, opacity = 1 }) {
    return (
        <g
            transform={`rotate(${angle})`}
            style={{ opacity, transition: 'opacity 0.2s' }}
        >
            {renderNeedle(type, { length, needleColor, tailColor })}
        </g>
    );
}
