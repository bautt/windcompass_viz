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
Animated wind compass for Splunk Dashboard Studio. Display wind direction, speed, and optional temperature on a configurable compass dial with Clean, Marine, and Instrument skins. Requires one search row per panel.
```

---

## Long description

```
Wind Compass is a custom visualization for Splunk Dashboard Studio (Splunk 10.4+) that turns a single search result row into an animated compass showing wind direction and speed.

Three built-in skins — Clean, Marine, and Instrument — suit dashboards from minimal layouts to maritime and instrument-panel looks. Every color, tick mark, needle style, and readout can be configured in the Dashboard Studio Setup panel without editing XML.

**Features**

* Animated wind-direction needle with smooth shortest-path rotation
* Three compass skins: Clean, Marine, Instrument
* Optional readouts: location, wind direction, speed (panel or center hub), temperature
* Configurable speed units (km/h, m/s, knots, mph) and temperature units (°C, °F)
* Eight needle styles including a dedicated Instrument needle
* Light/dark theme support with per-color overrides
* Field-name mapping for common weather schemas (e.g. Open-Meteo `wind_direction_10m`, `wind_speed_10m`, `temperature_2m`)

**Required data**

One row with:

* Wind direction — numeric, 0–360° (meteorological convention: direction wind comes from)
* Wind speed — numeric (unit selected in viz options)

**Optional fields**

Location, country, temperature, and wind gusts can be mapped in the Data fields section.

**Demo dashboard**

The app ships with **Wind Compass — Demo**, a self-contained Dashboard Studio page using `| makeresults` sample data. No index or inputs are required — install the app and open the demo immediately.

**Privacy**

This app does not collect, store, or transmit data outside your Splunk deployment. It renders only the search results you attach to the visualization panel.

**Support**

Report issues on GitHub: https://github.com/bautt/windcompass_viz/issues
```

---

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
4. Attach a search that returns one row with wind direction (0–360°) and wind speed.
5. Map field names under **Data fields** in the Setup panel if your column names differ from the defaults.
6. Open **Wind Compass — Demo** from the app nav to see all three skins with sample data.
```

---

## Compatibility

| Setting | Value |
|---------|-------|
| Splunk Enterprise | 10.4 or later |
| Splunk Cloud | Yes (AppInspect cloud tag passed) |
| Dashboard Studio | Required |
| Platform | Search heads (standalone, distributed, SHC) |
| Index requirement | None (demo is self-contained) |

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
