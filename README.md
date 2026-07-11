# windcompass

Animated **wind compass** custom visualization for Splunk Dashboard Studio 10.4+.

## Required data (one row)

| Field | Default name | Type | Description |
|-------|--------------|------|-------------|
| **Wind direction** | `wind_direction` | 0–360° | Direction wind comes from (meteorological) |
| **Wind speed** | `wind_speed` | number | Speed value (unit via **Speed unit** option) |

Field names are configurable under **Data fields** in the DS editor. Common aliases are auto-detected (e.g. `wind_direction_10m`, `wind_speed_10m`).

## Optional fields

| Field | Default name |
|-------|--------------|
| Location | `location` |
| Country | `country` |
| Temperature | `temperature` |
| Heading (dial rotation) | `heading` |
| Apparent wind direction | `apparent_wind_direction` |
| Apparent wind speed | `apparent_wind_speed` |
| Wind gusts | `wind_gusts` |

## Build & install

```bash
cd /opt/code/windcompass
yarn install
yarn build:prod
yarn package
```

Install the `.spl` from `dist/` on Splunk 10.4+.

**Demo dashboard:** `Wind Compass — Live Weather` (`/app/windcompass/windcompass_demo`) — city dropdown over `index=s4c_meteo` (splunk4champions2 / TA-open-meteo).

**DS visualization type:** `windcompass.windcompass`

## Example SPL

```spl
| makeresults count=1
| eval location="Station A", wind_direction=273, wind_speed=24, temperature=18
| table location wind_direction wind_speed temperature
```

### Open-Meteo (splunk4champions2) — map fields in SPL

```spl
index=s4c_meteo sourcetype=open_meteo:weather:json city="Berlin"
| sort - _time | head 1
| eval wind_direction=wind_direction_10m, wind_speed=wind_speed_10m
| eval location=city, temperature=temperature_2m
| table location country wind_direction wind_speed temperature
```

Or set **Data fields** in the viz editor to `wind_direction_10m` / `wind_speed_10m` / `city` without renaming in SPL.

## Configuration

All style and colors are editable in Dashboard Studio under panel **Setup**:

- **Style** — skin, theme, dial mode, ticks, cardinals, animation
- **Colors** — background, bezel, dial, text, ticks, hub
- **True wind** — needle type, colors, readouts
- **Apparent wind** — second needle (optional)
- **Readouts** — location, temperature, heading, units
- **Data fields** — map your search column names
