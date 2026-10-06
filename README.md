# Wind Compass

Animated **wind compass** custom visualization for Splunk Dashboard Studio 10.4+.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)

## Features

- Three skins: **Clean**, **Marine**, **Instrument**
- Animated wind-direction needle (eight needle styles)
- Readouts: direction, speed (panel or center hub), location, temperature
- Configurable speed units (km/h, m/s, knots, mph) and temperature (°C / °F)
- Per-color overrides and light/dark theme support
- Field-name mapping for common weather schemas

**Visualization type:** `windcompass.windcompass`

## Required data (one row)

| Field | Default name | Type | Description |
|-------|--------------|------|-------------|
| **Wind direction** | `wind_direction` | 0–360° | Direction wind comes from (meteorological) |
| **Wind speed** | `wind_speed` | number | Speed value (unit via **Speed unit** option) |

Field names are configurable under **Data fields** in the Dashboard Studio Setup panel. Common aliases are auto-detected (e.g. `wind_direction_10m`, `wind_speed_10m`).

## Optional fields

| Field | Default name |
|-------|--------------|
| Location | `location` |
| Country | `country` |
| Temperature | `temperature` |
| Wind gusts | `wind_gusts` |

## Install

Install the `.spl` package from `dist/` on Splunk Enterprise 10.4+ or Splunk Cloud.

**Demo dashboard:** **Wind Compass — Demo** (`/app/windcompass/windcompass_demo`) — self-contained sample data via `| makeresults`. No index or inputs required.

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

- **Style** — skin, theme, ticks, cardinals, animation
- **Colors** — background, bezel, dial, text, ticks, hub, needle
- **True wind** — needle type, colors, direction/speed readouts, center-hub speed
- **Readouts** — location, temperature, compass labels, units
- **Data fields** — map your search column names

## Splunk Cloud

The app passes AppInspect with the `cloud` tag (no errors, failures, or warnings). See `SPLUNKBASE.md` for listing copy and release notes.

## License

MIT — see [LICENSE](LICENSE).

Bundled third-party components are listed in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Support

Report issues: https://github.com/bautt/windcompass_viz/issues
