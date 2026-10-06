/** Small fixed-size arrow rotated to a wind direction. Shared between the
 * dial's compact readout pill and the compass-less weather hero view, so
 * both "fancy" styles stay visually consistent. */
export function WindArrow({ size = 16, angle = 0, color = 'currentColor' }) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            style={{ transform: `rotate(${angle}deg)`, flexShrink: 0 }}
            role="presentation"
        >
            <path d="M12 2 L17.5 15 L12 11.3 L6.5 15 Z" fill={color} />
            <line x1="12" y1="11.3" x2="12" y2="21.5" stroke={color} strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}
