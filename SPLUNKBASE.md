# Splunkbase listing copy — Wind Compass

Cut-and-paste fields for the Splunkbase developer portal. Adjust support URLs
if needed before publishing.

---

## App title

```
Wind Compass
```

---

## Short description (≈250 characters)

```
Animated wind compass for Splunk Dashboard Studio. Works instantly with live Open-Meteo data by city, or bind your own search. Direction, speed, temperature, and weather icon on Clean, Marine, and Instrument skins.
```

---

## Long description

```
Wind Compass is a custom visualization for Splunk Dashboard Studio (Splunk 10.4+) that renders an animated compass showing wind direction, speed, and weather condition — with no search required.

**Two data modes, switchable per panel**

* **Live** (default): type a city and go. Real-time wind, temperature, and weather condition from the free Open-Meteo service — no index, no search, no setup.
* **Search**: bind your own search result row for full control over the data source, with configurable field-name mapping.

Three built-in skins — Clean, Marine, and Instrument — suit dashboards from minimal layouts to maritime and instrument-panel looks. Every color, tick mark, needle style, and readout can be configured in the Dashboard Studio Setup panel without editing XML.

**Features**

* Live mode: city/country input, auto-refresh, powered by Open-Meteo — zero data setup
* Search mode: bind your own search, with field-name mapping for common weather schemas (e.g. Open-Meteo `wind_direction_10m`, `wind_speed_10m`, `temperature_2m`)
* Animated wind-direction needle with smooth shortest-path rotation
* Weather condition icon (sun, cloud, rain, snow, fog, thunderstorm, …), on by default and switchable
* Compass dial is itself optional — switch to a weather-only "hero" layout (large icon, temperature, location, compact wind readout) when conditions matter more than the needle
* Three compass skins: Clean, Marine, Instrument
* Optional readouts: location, wind direction, speed (panel or center hub), temperature
* Configurable speed units (km/h, m/s, knots, mph) and temperature units (°C, °F)
* Eight needle styles including a dedicated Instrument needle
* Light/dark theme support with per-color overrides

**Live mode data**

City (required), country (optional, disambiguates same-named cities), and refresh interval (seconds, min. 60). Resolved via Open-Meteo's free geocoding and forecast APIs — see Privacy below.

**Search mode data**

One row with:

* Wind direction — numeric, 0–360° (meteorological convention: direction wind comes from)
* Wind speed — numeric (unit selected in viz options)

Location, country, temperature, wind gusts, weather code, and is-day can also be mapped in the Search: field mapping section.

**Demo dashboard**

The app ships with **Wind Compass — Demo**, a self-contained Dashboard Studio page built entirely in Live mode — a dark-themed row, a light-themed row, and a compass-hidden "weather only" row — so it renders real data for anyone immediately, with no index, inputs, or search data of your own required. Switch any panel's Data source mode to Search if you'd rather bind your own data.

**Privacy**

This app does not collect, store, or transmit telemetry. In Search mode, it renders only the search results you attach to the panel and makes no external network calls. In Live mode, your browser calls Open-Meteo's free geocoding/forecast APIs directly to resolve the city you configure; no API key or Splunk data is sent to Open-Meteo. See THIRD_PARTY_NOTICES.md for details.

**Support**

Report issues on GitHub: https://github.com/bautt/windcompass_viz/issues
```

---

## Release notes (v0.4.0)

```
* New: Live data mode — set a city and get real-time wind, temperature, and
  weather condition from Open-Meteo, with no search or index required
  (switchable back to Search mode per panel)
* New: Weather condition icon (sun, cloud, rain, snow, fog, thunderstorm, …),
  on by default, works in both Live and Search mode
* New: Compass dial is now optional — a weather-only "hero" view (icon,
  temperature, location, compact wind readout) for dashboards that want
  conditions front and center rather than a needle
* New: Data source editor group (mode, city, country, refresh interval)
* Demo dashboard now shows all variants side by side (live, search dark,
  search light, weather-only)
* Fully backward compatible — existing Search-mode panels are unaffected
```

## Release notes (v0.3.7)

```
Initial Splunkbase release.

* Dashboard Studio custom visualization: windcompass.windcompass
* Three skins: Clean, Marine, Instrument
* Animated wind-direction needle with configurable styles
* Readouts for direction, speed (panel or center hub), location, and temperature
* Self-contained demo dashboard (makeresults sample data)
* Splunk 10.4+ and Splunk Cloud compatible
```

---

## Installation instructions

```
1. Download and install the app on Splunk Enterprise 10.4+ or Splunk Cloud (search head).
2. Open Dashboard Studio and add a visualization.
3. Choose **Wind Compass** from the custom visualization picker (type: windcompass.windcompass).
4. By default it's in Live mode — just set a City under Data source and you're done.
5. To use your own data instead, set Data source → Mode to Search, attach a search returning one row with wind direction (0–360°) and wind speed, and map field names under **Search: field mapping** if your column names differ from the defaults.
6. Open **Wind Compass — Demo** from the app nav to see both modes and all three skins.
```

---

## Compatibility

| Setting | Value |
|---------|-------|
| Splunk Enterprise | 10.4 or later |
| Splunk Cloud | Yes (AppInspect cloud tag passed) |
| Dashboard Studio | Required |
| Platform | Search heads (standalone, distributed, SHC) |
| Index requirement | None — Live mode needs no index; Search mode is bring-your-own |

---

## Category suggestion

```
Visualization
```

*(App manifest currently uses `Custom`; pick the closest Splunkbase category available in the portal.)*

---

## Support contact

```
GitHub Issues: https://github.com/bautt/windcompass_viz/issues
Author: Tomas Baublys
Source: https://github.com/bautt/windcompass_viz
```

---

## Privacy statement

```
Wind Compass is a client-side Dashboard Studio visualization. It reads search
results supplied by the dashboard data source and renders them in the browser.
The app does not phone home, collect telemetry, or transmit data to third-party
services. No credentials or external network connections are used at runtime.
```

---

## Keywords / tags (if the portal supports them)

```
wind, compass, weather, meteorology, dashboard studio, visualization, marine,
direction, speed, temperature, open-meteo
```

---

## Screenshot captions (suggested)

1. **Clean skin** — Berlin sample data with direction, speed, location, and temperature readouts.
2. **Marine skin** — nautical-style bezel and classic needle.
3. **Instrument skin** — HUD-style dial with optional center-hub speed readout.
4. **Setup panel** — Style, color, readout, and data-field options in Dashboard Studio.

---

## Example SPL (for documentation field)

```spl
| makeresults count=1
| eval location="Station A", wind_direction=273, wind_speed=24, temperature=18
| table location wind_direction wind_speed temperature
```

---

## Open-Meteo field mapping example

```spl
index=weather sourcetype=open_meteo:weather:json city="Berlin"
| sort - _time | head 1
| table city country wind_direction_10m wind_speed_10m temperature_2m
```

Map **Data fields** in the viz editor to `wind_direction_10m`, `wind_speed_10m`, `city`, and `temperature_2m`.
