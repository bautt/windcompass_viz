# Wind Compass

Animated **wind compass** custom visualization for Splunk Dashboard Studio 10.4+.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Features

- **Two data modes** — pick in the editor's **Data source** group:
  - **Live** (default): just type a city. Real-time wind, temperature, and
    weather condition from [Open-Meteo](https://open-meteo.com), no search
    or index required.
  - **Search**: bind your own search result row, with configurable field
    names, exactly like earlier versions of this app.
- Three skins: **Clean**, **Marine**, **Instrument**
- Animated wind-direction needle (eight needle styles)
- Weather condition icon (sun/cloud/rain/snow/fog/thunderstorm/…), on by default, switchable
- **Compass dial itself is optional** — uncheck **Show compass dial** for a weather-only "hero" layout (big icon, temperature, location, and a compact wind readout) when you want current conditions front and center rather than a needle
- Readouts: direction, speed (panel or center hub), location, temperature
- Configurable speed units (km/h, m/s, knots, mph) and temperature (°C / °F)
- Per-color overrides and light/dark theme support
- Field-name mapping for common weather schemas (search mode)

**Visualization type:** `windcompass.windcompass`

## Live mode (default, no search needed)

Set **Data source → Mode** to **Live**, then fill in:

| Option | Default | Notes |
|--------|---------|-------|
| City | `Berlin` | Required |
| Country | *(empty)* | Optional — ISO code (`DE`) or full name, disambiguates same-named cities |
| Refresh interval (seconds) | `300` | Minimum 60 |

Data (wind, temperature, cloud cover, weather condition) comes from Open-Meteo's free geocoding and forecast APIs — see [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## How live mode fetches data

Live mode runs in the **viewer's browser**, not on the Splunk server. Splunk serves
the dashboard definition and the panel's compiled JavaScript, then takes no further
part: no search is dispatched, no index is read, and nothing is written back.

```
 Splunk server                 Viewer's browser                      Open-Meteo
 ─────────────                 ────────────────                      ──────────
 windcompass_demo.xml  ──►  visualization.js
 visualizations.conf        (the panel's code)
                                   │
                            useLiveWeather.js        poll timer, 300s default
                                   ├──► geocode.js      ──►  geocoding-api  /v1/search
                                   │    city → lat/lon        (cached 30 days)
                                   ├──► liveWeather.js   ──►  api            /v1/forecast
                                   │    lat/lon → reading     (cached 10 minutes)
                                   │         ▲
                                   │    httpClient.js  — the only fetch() call site:
                                   │    spacing, 429 backoff, in-flight dedupe
                                   └──► CompassDial.jsx + needles/  → SVG dial in the panel
```

### Which file does what

All paths are relative to `visualizations/windcompass/src/`.

| File | Responsibility |
|------|----------------|
| `visualization.jsx` | Entry point. Mounts the React app into the panel's `#root`. Built to `appserver/static/visualizations/windcompass/visualization.js` and registered with Dashboard Studio through `default/visualizations.conf`. |
| `hooks/useVisualizationState.js` | Bridge to Dashboard Studio. Subscribes to `VisualizationAPI` listeners for options, data sources, panel dimensions, theme and edit/view mode. |
| `components/WindCompass.jsx` | Top-level component. Reads the `dataMode` option and drives either the live path or the search path, then hands one normalized row to the renderer. |
| `hooks/useLiveWeather.js` | Live-mode lifecycle: a small random startup delay so panels don't all fire at once, the poll timer (300s default, 60s floor), abort on unmount or option change, and keeping the last good reading when a poll fails. |
| `data/geocode.js` | City (+ optional country) → coordinates via `geocoding-api.open-meteo.com/v1/search`. Cached for 30 days, since a city's coordinates do not change. |
| `data/liveWeather.js` | Coordinates → current conditions via `api.open-meteo.com/v1/forecast`. Maps the response onto the same row shape search mode produces, so the renderer is identical for both modes. Always requests km/h and converts for display. |
| `data/httpClient.js` | The only place in the app that calls `fetch`. Spaces request starts 150ms apart, retries HTTP 429 with exponential backoff (honouring `Retry-After`), and shares identical in-flight requests. |
| `data/persistentCache.js` | TTL cache over `localStorage`, keys prefixed `windcompass:`, with an in-memory fallback when storage is blocked. |
| `data/parseSearchData.js`, `data/fieldAliases.js` | Search-mode path: picks the configured or aliased field names out of the search row and produces the same row shape as live mode. |
| `components/CompassDial.jsx`, `needles/` | Draws the dial, ticks, cardinals and the rotating needle as SVG. |
| `components/ReadoutPanel.jsx`, `components/WeatherHero.jsx`, `components/WeatherIcon.jsx` | Text readouts, the dial-less "weather only" layout, and the condition icon. |
| `themes/skins.js`, `themes/resolveTheme.js` | Skin geometry and the light/dark palettes, merged with per-option colour overrides. |

### Request volume and rate limits

Open-Meteo's free tier is rate limited, and a dashboard full of live panels would
otherwise fire every lookup in the same instant. For the nine-panel demo dashboard:

| | Geocoding requests | Forecast requests |
|---|---|---|
| First ever load | 9 | 9 |
| Reload within 10 minutes | 0 (cached 30 days) | 0 (cached reading) |
| Reload after 10 minutes | 0 | 9 |
| Each scheduled refresh | 0 | 9 (cache deliberately bypassed) |

Four mechanisms keep this well inside the limits: coordinates are cached for 30
days, readings for up to 10 minutes, request starts are spaced 150ms apart, and
identical in-flight requests are shared. HTTP 429 is retried with backoff, so a
rate-limited panel recovers on its own instead of showing an error until someone
reloads. Only 429 is retried — a 404 or a bad city name will never succeed on a
second attempt.

The reading cache is only consulted when a panel mounts; scheduled polls always
force a fresh fetch and then write the result back, keeping the cache warm. A
panel left open therefore never shows a stale reading, while reloading the
dashboard inside the window costs nothing. The window is capped at 10 minutes
because Open-Meteo only updates its `current` block about every 15 minutes, and
it scales down to twice the refresh interval for anyone who deliberately picks an
aggressive refresh (a 60s refresh gets a 2-minute window, not 10).

### Operational consequences

- **Requests originate from each viewer's browser and IP**, not from the Splunk
  server. Ten people viewing the dashboard means ten browsers each asking
  Open-Meteo, and rate limits apply per viewer rather than per Splunk instance.
- **The browser needs outbound access to `open-meteo.com`.** On an isolated or
  proxied network the panel shows a fetch error even though Splunk is healthy.
  Use search mode there.
- **Nothing from Splunk is sent out.** The only outbound values are a city name
  and a pair of coordinates. There are no credentials and no API key.
- **Live readings are never indexed**, so they cannot be searched, reported on,
  retained as history, or used in alerts. Search mode is the option when any of
  that matters.
- **Browser storage is used** for the two caches (`localStorage`, keys prefixed
  `windcompass:` — coordinates for 30 days, readings for up to 10 minutes). If
  storage is unavailable the app degrades to an in-memory cache for the lifetime
  of the page.
- **The cache is per-browser, not shared between viewers.** Sharing one cache
  across viewers would need a server-side component: the visualization runs in a
  sandboxed iframe with no Splunk session, so it cannot write to a KV Store
  collection. If many concurrent viewers are a concern, poll Open-Meteo
  server-side (modular input or scheduled search), store the result, and point
  the panel at it with search mode — note that outbound internet access from the
  Splunk server is restricted on Splunk Cloud.
- **A failed poll keeps the last good reading on screen** rather than blanking the
  panel, so a brief network blip is not visible to the viewer.

## Search mode (bring your own data)

Set **Data source → Mode** to **Search** and attach a search returning one row:

| Field | Default name | Type | Description |
|-------|--------------|------|-------------|
| **Wind direction** | `wind_direction` | 0–360° | Direction wind comes from (meteorological) |
| **Wind speed** | `wind_speed` | number, **km/h** | See units below |

Field names are configurable under **Search: field mapping** in the Dashboard Studio Setup panel. Common aliases are auto-detected (e.g. `wind_direction_10m`, `wind_speed_10m`).

### Units in search mode

Your search must supply **km/h** for speeds and **°C** for temperature. The
**Speed unit** and **Temperature unit** options are *display* conversions
applied on top of those base units — they do not tell the app what your data is
in. Feeding knots and selecting "Knots" divides your value by 1.852.

Convert in SPL if your source differs:

```spl
| eval wind_speed = wind_speed_knots * 1.852, temperature = (temperature_f - 32) * 5 / 9
```

### Optional fields (search mode)

| Field | Default name | Type |
|-------|--------------|------|
| Location | `location` | text |
| Country | `country` | text (appended to location) |
| Temperature | `temperature` | number, **°C** |
| Wind gusts | `wind_gusts` | number, km/h (shown only in the weather-only layout) |
| Weather code (WMO) | `weather_code` | number |
| Is day (0/1) | `is_day` | 0 or 1 |

A value that is not usable in an optional field is ignored rather than failing
the panel, so a search that happens to contain a text column named `temp` still
renders the wind.

## Install

Install the `.spl` package from `dist/` on Splunk Enterprise 10.4+ or Splunk Cloud.

**Demo dashboard:** **Wind Compass — Demo** (`/app/windcompass/windcompass_demo`) — all rows use Live mode (no setup, no index or inputs required): a dark-themed row, a light-themed row, and a compass-hidden "weather only" row, plus short explanations of both data modes, how live data is fetched, and third-party attribution. Switch any panel's Data source mode to Search to bind your own data instead.

## Build from source

```bash
git clone https://github.com/bautt/windcompass_viz.git
cd windcompass_viz
yarn install
yarn test
yarn build:prod
yarn package
```

Output: `dist/windcompass-<version>-<hash>.spl`, plus a byte-identical
`dist/windcompass-<version>.tar.gz` for Splunkbase, whose uploader wants that
extension.

Use `yarn build:prod`, not `yarn build`, for anything you distribute. The plain
build is a development build: it skips minification, emits a source map that
`package.mjs` also copies into the package, and leaves React in development
mode — roughly 2.8 MB of payload instead of 180 KB. The hash in the filename is
the current git commit, so commit before packaging a release.

## Example SPL

```spl
| makeresults count=1
| eval location="Station A", wind_direction=273, wind_speed=24, temperature=18
| table location wind_direction wind_speed temperature
```

### Open-Meteo — map fields in SPL or in the editor

```spl
index=weather sourcetype=open_meteo:weather:json city="Berlin"
| sort - _time | head 1
| table city country wind_direction_10m wind_speed_10m temperature_2m
```

Or set **Data fields** in the viz editor to `wind_direction_10m`, `wind_speed_10m`, `city`, and `temperature_2m` without renaming in SPL.

## Configuration (Dashboard Studio Setup)

- **Data source** — mode (Live/Search), city, country, refresh interval
- **Style** — show/hide compass dial, skin, theme, ticks, cardinals, animation
- **Colors** — background, bezel, dial, text, ticks, hub, needle
- **True wind** — needle type, colors, direction/speed readouts, center-hub speed
- **Readouts** — location, temperature, weather icon, compass labels, units
- **Search: field mapping** — map your search column names (search mode only)

## Splunk Cloud

The app passes AppInspect with the `cloud` tag (no errors, failures, or warnings). See `SPLUNKBASE.md` for listing copy and release notes.

## License

MIT — see [LICENSE](LICENSE).

Bundled third-party components are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Support

Report issues: https://github.com/bautt/windcompass_viz/issues
