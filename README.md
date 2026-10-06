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

## Search mode (bring your own data)

Set **Data source → Mode** to **Search** and attach a search returning one row:

| Field | Default name | Type | Description |
|-------|--------------|------|-------------|
| **Wind direction** | `wind_direction` | 0–360° | Direction wind comes from (meteorological) |
| **Wind speed** | `wind_speed` | number | Speed value (unit via **Speed unit** option) |

Field names are configurable under **Search: field mapping** in the Dashboard Studio Setup panel. Common aliases are auto-detected (e.g. `wind_direction_10m`, `wind_speed_10m`).

### Optional fields (search mode)

| Field | Default name |
|-------|--------------|
| Location | `location` |
| Country | `country` |
| Temperature | `temperature` |
| Wind gusts | `wind_gusts` |
| Weather code (WMO) | `weather_code` |
| Is day (0/1) | `is_day` |

## Install

Install the `.spl` package from `dist/` on Splunk Enterprise 10.4+ or Splunk Cloud.

**Demo dashboard:** **Wind Compass — Demo** (`/app/windcompass/windcompass_demo`) — all rows use Live mode (no setup, no index or inputs required): a dark-themed row, a light-themed row, and a compass-hidden "weather only" row. Switch any panel's Data source mode to Search to bind your own data instead.

## Build from source

```bash
git clone https://github.com/bautt/windcompass_viz.git
cd windcompass_viz
yarn install
yarn build:prod
yarn package
```

Output: `dist/windcompass-<version>-<hash>.spl`

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
