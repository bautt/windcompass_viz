import { useEffect, useState } from 'react';
import { VisualizationAPI } from '@splunk/dashboard-studio-extension';

/**
 * DS extension listeners should use invokeImmediately — the stock React hooks do not.
 */
export function useVisualizationState() {
    const [dataSources, setDataSources] = useState(null);
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState({});
    const [dimensions, setDimensions] = useState({ width: 400, height: 400 });
    const [theme, setTheme] = useState('dark');
    const [mode, setMode] = useState('view');

    useEffect(() => {
        const unsubs = [
            VisualizationAPI.addDataSourcesListener(
                ({ dataSources: ds, loading: isLoading }) => {
                    setDataSources(ds);
                    setLoading(!!isLoading);
                },
                { invokeImmediately: true },
            ),
            VisualizationAPI.addOptionsListener(
                ({ options: opts }) => setOptions(opts || {}),
                { invokeImmediately: true },
            ),
            VisualizationAPI.addDimensionsListener(
                ({ width, height }) => {
                    setDimensions({
                        width: width > 0 ? width : 400,
                        height: height > 0 ? height : 400,
                    });
                },
                { invokeImmediately: true },
            ),
            VisualizationAPI.addThemeListener(
                ({ theme: t }) => setTheme(t || 'dark'),
                { invokeImmediately: true },
            ),
            VisualizationAPI.addModeListener(
                ({ mode: m }) => setMode(m || 'view'),
                { invokeImmediately: true },
            ),
        ];
        return () => unsubs.forEach((u) => u && u());
    }, []);

    return { dataSources, loading, options, dimensions, theme, mode };
}
