import { hasDataRows } from './parseSearchData.js';

const IN_FLIGHT_STATUSES = new Set(['running', 'pending', 'progress', 'loading', 'queued']);
const SETTLED_STATUSES = new Set(['done', 'failed', 'error', 'stopped', 'cancelled']);

/**
 * True while the primary search is still in flight — do not parse or show errors yet.
 */
export function isDataPending(dataSources, loading) {
    if (loading) return true;

    const primary = dataSources?.primary;
    const status = primary?.meta?.status;

    if (status && IN_FLIGHT_STATUSES.has(status)) {
        return true;
    }

    const data = primary?.data;
    if (!hasDataRows(data) && (!status || !SETTLED_STATUSES.has(status))) {
        return true;
    }

    return false;
}
