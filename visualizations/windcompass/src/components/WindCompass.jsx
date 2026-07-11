import { useEffect, useMemo, useRef } from 'react';
import { VisualizationAPI } from '@splunk/dashboard-studio-extension';
import { FIELD_DEFAULTS } from '../data/fieldAliases.js';
import { isDataPending } from '../data/dataLoading.js';
import { hasDataRows, parseSearchData } from '../data/parseSearchData.js';
import { useAngleAnimator } from '../animation/useAngleAnimator.js';
import { resolveTheme } from '../themes/resolveTheme.js';
import { SKINS } from '../themes/skins.js';
import { normalizeOptions } from '../hooks/normalizeOptions.js';
import { useVisualizationState } from '../hooks/useVisualizationState.js';
import { normalizeDegrees } from '../data/windAngles.js';
import { CompassDial } from './CompassDial.jsx';
import { ReadoutPanel } from './ReadoutPanel.jsx';

function Message({ children, dark }) {
    const color = dark ? '#c3cbd4' : '#3a4550';
    return (
        <div className="wind-compass wind-compass--empty">
            <div className="wind-compass__message" style={{ color }}>
                {children}
            </div>
        </div>
    );
}

// Keys that survive a reset — identity, mapping, and the reset flag itself.
const PRESERVED_ON_RESET = new Set([
    'skin', 'themeOverride', 'useDefaults',
    ...Object.keys(FIELD_DEFAULTS),
]);

const DEFAULT_OPTIONS = {
    skin: 'clean',
    themeOverride: 'auto',
    useDefaults: false,
    trueNeedleType: '',
    apparentNeedleType: '',
    speedUnit: 'kmh',
    tempUnit: 'c',
    showCardinals: true,
    showMajorTicks: true,
    showMinorTicks: true,
    showTrueWind: true,
    showTrueDirectionReadout: true,
    showTrueSpeedReadout: true,
    showCenterSpeed: false,
    showLocation: true,
    showTemperature: false,
    showApparentWind: false,
    showDirectionLabel: true,
    animationDurationMs: 600,
    // color overrides default to empty (inherit from skin)
    backgroundColor: '',
    bezelColor: '',
    dialColor: '',
    textColor: '',
    tickColor: '',
    tickMajorColor: '',
    hubColor: '',
    trueNeedleColor: '',
    trueTailColor: '',
    apparentNeedleColor: '',
    apparentTailColor: '',
    ...FIELD_DEFAULTS,
};

function useParseResult(pending, dataSources, options) {
    return useMemo(() => {
        if (pending) {
            return { status: 'pending' };
        }

        const data = dataSources?.primary?.data;
        if (!data || !hasDataRows(data)) {
            return { status: 'empty' };
        }

        try {
            const row = parseSearchData(data, options);
            if (!row) {
                return { status: 'empty' };
            }
            return { status: 'ok', row };
        } catch (err) {
            return { status: 'error', message: err.message || String(err) };
        }
    }, [pending, dataSources, options]);
}

export function WindCompass() {
    const { dataSources, loading, options: rawOptions, dimensions, theme: dsTheme, mode } =
        useVisualizationState();

    const options = useMemo(() => {
        const normalized = normalizeOptions(rawOptions, DEFAULT_OPTIONS);
        // useDefaults=true → apply all defaults, preserving only identity/mapping keys.
        // Uncheck the box → immediately back to custom stored settings.
        if (normalized.useDefaults === true) {
            const reset = { ...DEFAULT_OPTIONS };
            for (const key of PRESERVED_ON_RESET) {
                reset[key] = normalized[key];
            }
            return reset;
        }
        return normalized;
    }, [rawOptions]);
    const dark = dsTheme === 'dark';
    const snap = mode === 'edit';
    const animDuration = Number(options.animationDurationMs) || 600;
    const pending = isDataPending(dataSources, loading);

    const parseResult = useParseResult(pending, dataSources, options);
    const lastOkRowRef = useRef(null);

    useEffect(() => {
        if (parseResult.status === 'ok') {
            lastOkRowRef.current = parseResult.row;
        }
    }, [parseResult]);

    useEffect(() => {
        VisualizationAPI.clearError();
    }, [parseResult, pending]);

    const skinId = SKINS[options.skin] ? options.skin : 'clean';

    const theme = useMemo(
        () => resolveTheme({ skinId, dsTheme, options }),
        [skinId, options, dsTheme],
    );

    const displayRow =
        parseResult.status === 'ok'
            ? parseResult.row
            : pending
              ? lastOkRowRef.current
              : null;

    const trueWindTarget = displayRow
        ? normalizeDegrees(displayRow.windDirection)
        : 0;

    const hasApparent = !!displayRow && displayRow.apparentWindDirection != null;

    const apparentWindTarget = hasApparent
        ? normalizeDegrees(displayRow.apparentWindDirection)
        : 0;

    const trueWindAngle = useAngleAnimator(trueWindTarget, {
        durationMs: animDuration,
        snap,
        enabled: !!displayRow,
    });

    const apparentWindAngle = useAngleAnimator(apparentWindTarget, {
        durationMs: animDuration,
        snap,
        enabled: hasApparent && options.showApparentWind,
    });

    const dialRotation = 0;

    const { width, height } = dimensions;
    const size = Math.max(
        160,
        Math.min(width || 400, (height || width || 400) * 0.85),
    );

    if (parseResult.status === 'empty') {
        return (
            <Message dark={dark}>
                No data. Provide one row with required fields{' '}
                <code>{options.fieldWindDirection}</code> (0–360°) and{' '}
                <code>{options.fieldWindSpeed}</code> (numeric).
            </Message>
        );
    }

    if (parseResult.status === 'error') {
        return (
            <Message dark={dark}>
                {parseResult.message}
            </Message>
        );
    }

    return (
        <div
            className="wind-compass"
            style={{ color: theme.textColor, background: theme.backgroundColor || 'transparent' }}
        >
            <div className="wind-compass__dial-wrap">
                <CompassDial
                    key={skinId}
                    skinId={skinId}
                    theme={theme}
                    dialRotation={dialRotation}
                    size={size}
                    options={options}
                    data={displayRow}
                    trueWindAngle={trueWindAngle}
                    apparentWindAngle={
                        options.showApparentWind && hasApparent ? apparentWindAngle : null
                    }
                />
            </div>
            {displayRow ? (
                <ReadoutPanel
                    data={displayRow}
                    options={options}
                    theme={theme}
                />
            ) : null}
        </div>
    );
}
