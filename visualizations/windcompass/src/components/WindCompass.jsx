import { useEffect, useMemo, useRef } from 'react';
import { VisualizationAPI } from '@splunk/dashboard-studio-extension';
import { FIELD_DEFAULTS } from '../data/fieldAliases.js';
import { isDataPending } from '../data/dataLoading.js';
import { hasDataRows, parseSearchData } from '../data/parseSearchData.js';
import { useAngleAnimator } from '../animation/useAngleAnimator.js';
import { useLiveWeather } from '../hooks/useLiveWeather.js';
import { resolveTheme } from '../themes/resolveTheme.js';
import { SKINS } from '../themes/skins.js';
import { normalizeOptions, isOptionEnabled } from '../hooks/normalizeOptions.js';
import { useVisualizationState } from '../hooks/useVisualizationState.js';
import { normalizeDegrees } from '../data/windAngles.js';
import { CompassDial } from './CompassDial.jsx';
import { ReadoutPanel } from './ReadoutPanel.jsx';
import { WeatherConditionBadge } from './WeatherConditionBadge.jsx';
import { WeatherHero } from './WeatherHero.jsx';

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

const DEFAULT_OPTIONS = {
    // "live" needs zero setup (city/country, Open-Meteo); "search" reads
    // dataSources.primary through the field-mapping options below.
    dataMode: 'live',
    city: 'Berlin',
    country: '',
    refreshSec: 300,
    skin: 'clean',
    themeOverride: 'auto',
    trueNeedleType: '',
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
    showDirectionLabel: true,
    showWeatherCondition: true,
    showCompass: true,
    animationDurationMs: 600,
    readoutPosition: 'bottom',
    showFrame: false,
    // color overrides default to empty (inherit from skin)
    backgroundColor: '',
    frameColor: '',
    bezelColor: '',
    dialColor: '',
    textColor: '',
    tickColor: '',
    tickMajorColor: '',
    hubColor: '',
    trueNeedleColor: '',
    trueTailColor: '',
    ...FIELD_DEFAULTS,
};

function useSearchParseResult(pending, dataSources, options) {
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

    const options = useMemo(
        () => normalizeOptions(rawOptions, DEFAULT_OPTIONS),
        [JSON.stringify(rawOptions)],
    );
    const dark = dsTheme === 'dark';
    const snap = mode === 'edit';
    const animDuration = Number(options.animationDurationMs) || 600;
    const isLiveMode = options.dataMode === 'live';

    // Search-mode path — always called (Rules of Hooks), cheap when unused.
    const pending = isDataPending(dataSources, loading);
    const searchResult = useSearchParseResult(pending, dataSources, options);
    const lastOkSearchRowRef = useRef(null);
    useEffect(() => {
        if (searchResult.status === 'ok') {
            lastOkSearchRowRef.current = searchResult.row;
        }
    }, [searchResult]);

    // Live-mode path — `enabled` gates the actual fetch/poll, so switching
    // dataMode to "search" fully stops network activity rather than just
    // ignoring the result.
    const live = useLiveWeather({
        city: options.city,
        country: options.country,
        refreshSec: options.refreshSec,
        enabled: isLiveMode,
    });

    useEffect(() => {
        VisualizationAPI.clearError();
    }, [searchResult, pending, live.status]);

    const skinId = SKINS[options.skin] ? options.skin : 'clean';

    const theme = useMemo(
        () => resolveTheme({ skinId, dsTheme, options }),
        [skinId, options, dsTheme],
    );

    const displayRow = isLiveMode
        ? live.row
        : searchResult.status === 'ok'
          ? searchResult.row
          : pending
            ? lastOkSearchRowRef.current
            : null;

    const trueWindTarget = displayRow
        ? normalizeDegrees(displayRow.windDirection)
        : 0;

    const trueWindAngle = useAngleAnimator(trueWindTarget, {
        durationMs: animDuration,
        snap,
        enabled: !!displayRow,
    });

    const { width, height } = dimensions;
    const size = Math.max(
        160,
        Math.min(width || 400, (height || width || 400) * 0.85),
    );

    if (!displayRow) {
        if (isLiveMode) {
            if (live.status === 'error') {
                return <Message dark={dark}>{live.error}</Message>;
            }
            return (
                <Message dark={dark}>
                    Loading live wind for {options.city || '…'}
                    {options.country ? `, ${options.country}` : ''}…
                </Message>
            );
        }

        if (searchResult.status === 'error') {
            return <Message dark={dark}>{searchResult.message}</Message>;
        }

        return (
            <Message dark={dark}>
                No data. Provide one row with required fields{' '}
                <code>{options.fieldWindDirection}</code> (0–360°) and{' '}
                <code>{options.fieldWindSpeed}</code> (numeric).
            </Message>
        );
    }

    const showCompass = isOptionEnabled(options.showCompass);
    const frameColor = isOptionEnabled(options.showFrame) ? options.frameColor || theme.textColor : '';

    return (
        <div
            className="wind-compass"
            style={{
                color: theme.textColor,
                background: theme.backgroundColor || 'transparent',
                ...(frameColor
                    ? { border: `2px solid ${frameColor}`, borderRadius: '18px' }
                    : null),
            }}
        >
            {showCompass ? (
                <>
                    <div className="wind-compass__dial-wrap">
                        <CompassDial
                            key={skinId}
                            skinId={skinId}
                            theme={theme}
                            dialRotation={0}
                            size={size}
                            options={options}
                            data={displayRow}
                            trueWindAngle={trueWindAngle}
                        />
                    </div>
                    {isOptionEnabled(options.showWeatherCondition) && (
                        <WeatherConditionBadge row={displayRow} theme={theme} />
                    )}
                    <ReadoutPanel
                        data={displayRow}
                        options={options}
                        theme={theme}
                    />
                </>
            ) : (
                <WeatherHero data={displayRow} options={options} theme={theme} size={size} />
            )}
        </div>
    );
}
