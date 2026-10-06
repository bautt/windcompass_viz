import assert from 'node:assert/strict';
import { hasDataRows, parseSearchData } from './parseSearchData.js';

// Dashboard Studio hands over columnar data: a `fields` list plus one array per
// column. Some data sources use row-major `rows` instead, so both are supported.
function columnar(fields, columns) {
    return { fields: fields.map((name) => ({ name })), columns };
}

function rowMajor(fields, rows) {
    return { fields: fields.map((name) => ({ name })), rows };
}

// Emptiness detection drives the "No data" message, so it has to distinguish a
// result with no rows from one that simply has not arrived yet.
{
    assert.equal(hasDataRows(null), false);
    assert.equal(hasDataRows({}), false);
    assert.equal(hasDataRows(columnar(['wind_direction'], [[]])), false);
    assert.equal(hasDataRows(columnar(['wind_direction'], [[90]])), true);
    assert.equal(hasDataRows(rowMajor(['wind_direction'], [[90]])), true);
    assert.equal(hasDataRows(rowMajor(['wind_direction'], [])), false);
}

// The happy path for both data shapes.
{
    const expected = { windDirection: 273, windSpeed: 24 };
    for (const data of [
        columnar(['wind_direction', 'wind_speed'], [[273], [24]]),
        rowMajor(['wind_direction', 'wind_speed'], [[273, 24]]),
    ]) {
        const row = parseSearchData(data);
        assert.equal(row.windDirection, expected.windDirection);
        assert.equal(row.windSpeed, expected.windSpeed);
    }
}

// Only the first row is read — the viz shows a single current reading.
{
    const row = parseSearchData(columnar(['wind_direction', 'wind_speed'], [[10, 200], [5, 99]]));
    assert.equal(row.windDirection, 10);
    assert.equal(row.windSpeed, 5);
}

// Open-Meteo's own column names are recognised without any field mapping, which
// is what makes the documented example SPL work out of the box.
{
    const row = parseSearchData(
        columnar(
            ['wind_direction_10m', 'wind_speed_10m', 'temperature_2m'],
            [[180], [12], [18.5]],
        ),
    );
    assert.equal(row.windDirection, 180);
    assert.equal(row.windSpeed, 12);
    assert.equal(row.temperature, 18.5);
}

// An explicit mapping wins over an alias that also happens to be present.
{
    const data = columnar(['wind_direction', 'bearing', 'wind_speed'], [[10], [99], [5]]);
    assert.equal(parseSearchData(data).windDirection, 10);
    assert.equal(parseSearchData(data, { fieldWindDirection: 'bearing' }).windDirection, 99);
}

// A mapping pointing at a column that is absent falls back to the aliases
// rather than failing, so a stale mapping does not break a working panel.
{
    const data = columnar(['wind_direction', 'wind_speed'], [[10], [5]]);
    assert.equal(parseSearchData(data, { fieldWindDirection: 'not_there' }).windDirection, 10);
}

// Directions are normalised onto 0–360, so negatives and multiple turns are
// accepted instead of rotating the needle to an impossible angle.
{
    const cases = [[-90, 270], [450, 90], [360, 0], [720.5, 0.5]];
    for (const [input, expected] of cases) {
        const row = parseSearchData(columnar(['wind_direction', 'wind_speed'], [[input], [5]]));
        assert.equal(row.windDirection, expected, `${input}° should normalise to ${expected}°`);
    }
}

// Missing required fields produce a message that names the field and the
// accepted aliases, since that is all the user has to go on in the panel.
{
    assert.throws(
        () => parseSearchData(columnar(['wind_speed'], [[5]])),
        /Missing required field "wind_direction".*wind_direction_10m/s,
    );
    assert.throws(
        () => parseSearchData(columnar(['wind_direction'], [[90]])),
        /Missing required field "wind_speed"/,
    );
    // An explicit mapping is echoed back, not the default field name.
    assert.throws(
        () => parseSearchData(columnar(['wind_speed'], [[5]]), { fieldWindDirection: 'my_dir' }),
        /Missing required field "my_dir"/,
    );
}

// Non-numeric required values are rejected with the offending value quoted.
{
    assert.throws(
        () => parseSearchData(columnar(['wind_direction', 'wind_speed'], [['north'], [5]])),
        /"wind_direction" must be numeric \(got "north"\)/,
    );
}

// Infinity has to be rejected as well as NaN: Number('1e999') is Infinity,
// which would reach an SVG rotate() as NaN and silently break the dial.
{
    for (const bad of ['1e999', 'Infinity', '-Infinity']) {
        assert.throws(
            () => parseSearchData(columnar(['wind_direction', 'wind_speed'], [[bad], [5]])),
            /must be numeric/,
            `${bad} should be rejected`,
        );
    }
}

// Empty strings and nulls count as absent, not as zero.
{
    assert.throws(
        () => parseSearchData(columnar(['wind_direction', 'wind_speed'], [[''], [5]])),
        /Missing required field/,
    );
    assert.throws(
        () => parseSearchData(columnar(['wind_direction', 'wind_speed'], [[null], [5]])),
        /Missing required field/,
    );
}

// Optional fields are resolved by alias, so a search that merely happens to
// contain a string column named "temp" or "gusts" must not blank the panel. A
// value that cannot be used is dropped and the wind still renders.
{
    const row = parseSearchData(
        columnar(
            ['wind_direction', 'wind_speed', 'temp', 'gusts', 'weather_code', 'is_day'],
            [[90], [5], ['warm'], ['gale'], ['not-a-code'], ['maybe']],
        ),
    );
    assert.equal(row.windDirection, 90, 'the required fields still render');
    assert.equal(row.windSpeed, 5);
    assert.equal(row.temperature, null);
    assert.equal(row.windGusts, null);
    assert.equal(row.weatherCode, null);
    assert.equal(row.isDay, null);
}

// Absent optional fields are null, not zero.
{
    const row = parseSearchData(columnar(['wind_direction', 'wind_speed'], [[90], [5]]));
    assert.equal(row.temperature, null);
    assert.equal(row.windGusts, null);
    assert.equal(row.location, null);
    assert.equal(row.weatherCode, null);
}

// A usable optional value is still parsed, including negative temperatures.
{
    const row = parseSearchData(
        columnar(['wind_direction', 'wind_speed', 'temperature', 'wind_gusts'], [[90], [5], [-7.5], [42]]),
    );
    assert.equal(row.temperature, -7.5);
    assert.equal(row.windGusts, 42);
}

// Location and country are joined for display, and country alone is not shown.
{
    const withBoth = parseSearchData(
        columnar(['wind_direction', 'wind_speed', 'city', 'country'], [[90], [5], ['Hamburg'], ['DE']]),
    );
    assert.equal(withBoth.location, 'Hamburg, DE');

    const countryOnly = parseSearchData(
        columnar(['wind_direction', 'wind_speed', 'country'], [[90], [5], ['DE']]),
    );
    assert.equal(countryOnly.location, null, 'a country with no location is not a label');
}

// The resolved field names are reported back so the editor can show what was
// auto-detected.
{
    const row = parseSearchData(columnar(['bearing', 'speed'], [[90], [5]]));
    assert.deepEqual(row.fieldsUsed, { windDirection: 'bearing', windSpeed: 'speed' });
}

// No data is "nothing to show", not an error.
{
    assert.equal(parseSearchData(null), null);
    assert.equal(parseSearchData(columnar(['wind_direction'], [[]])), null);
}

console.log('parseSearchData.test.mjs: all assertions passed');
