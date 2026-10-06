# Splunkbase listing copy — Wind Compass

Cut-and-paste fields for the Splunkbase developer portal. Adjust support URLs
if needed before publishing.

---

## Package to upload

Build the release artifact in production mode, otherwise the package ships an
unminified bundle plus a source map (roughly 2.8 MB instead of 180 KB) and runs
React in development mode:

```bash
node run-tests.mjs
NODE_ENV=production node build.mjs --entry=visualization.jsx
node package.mjs
splunk-appinspect inspect dist/windcompass-<version>-<hash>.spl --mode precert
```

The `.spl` filename embeds the current git commit hash, so commit first and the
uploaded artifact is traceable to a specific revision.

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
* Rate-limit aware: results are cached in the browser, requests are spaced out, and throttled requests retry automatically, so a dashboard full of live panels loads cleanly

**Live mode data**

City (required), country (optional, disambiguates same-named cities), and refresh interval (seconds, min. 60). Resolved via Open-Meteo's free geocoding and forecast APIs — see Privacy below.

**Search mode data**

One row with:

* Wind direction — numeric, 0–360° (meteorological convention: direction wind comes from)
* Wind speed — numeric, in km/h

Location, country, temperature (°C), wind gusts, weather code, and is-day can also be mapped in the Search: field mapping section.

Speeds are km/h and temperatures °C at the input; the Speed unit and Temperature unit options are display conversions applied on top of those, so convert in SPL if your source uses something else.

**Demo dashboard**

The app ships with **Wind Compass — Demo**, a self-contained Dashboard Studio page built entirely in Live mode: a dark-themed row, a light-themed row, and a compass-hidden "weather only" row, plus short explanations of both data modes and how live data is fetched. It renders real weather for anyone immediately, with no index, inputs, or search data of your own required. Switch any panel's Data source mode to Search if you'd rather bind your own data.

**Privacy**

This app collects no telemetry and has no server-side component. In Search mode it renders only the search results you attach to the panel and makes no external network calls. In Live mode the viewer's browser — not the Splunk server — calls Open-Meteo's free geocoding and forecast APIs to resolve the city you configure; only that city name and its coordinates are sent, and no API key, credentials, or Splunk data are involved. Coordinates and the latest reading are cached in the browser's local storage to stay within Open-Meteo's rate limits. See THIRD_PARTY_NOTICES.md for details.

**Support**

Report issues on GitHub: https://github.com/bautt/windcompass_viz/issues
```

---

## Release notes (v0.5.1)

```
* Fixed: choosing the default red in the "Needle color" picker had no effect —
  the schema default did not match the app's, so the skin's own needle colour
  was used instead. On the Instrument dark skin that rendered a white needle
  for a user who had explicitly picked red.
* Fixed: compass cardinal labels (N/E/S/W) were sized from the panel's pixel
  width inside an already-scaling SVG, so they grew to a third of the dial
  radius on large panels and collided with the needle, while shrinking to
  near-invisible on small ones.
* Fixed: a non-numeric value in an optional, auto-detected column (for example
  a text column named "temp" or "gusts") blanked the whole panel. Unusable
  optional values are now ignored and the wind still renders.
* Fixed: "Speed in center hub" did nothing unless "Speed readout" was also on,
  so turning the panel readout off and the hub on hid the speed entirely.
* Fixed: entering 0 in "Animation (ms)" fell back to 600 ms instead of
  disabling the animation.
* Fixed: status and error messages ignored the Theme option, so Theme = Light
  on a dark dashboard left the text in the wrong palette.
* Added: "Wind gusts" field mapping, which existed in the app but had no
  control in the editor.
* Changed: documented that search mode expects km/h and °C at the input, with
  the unit options being display conversions on top. Editor labels now say so.
* Changed: the browser cache records a schema version, so an entry written by
  a different app version is discarded rather than rendered.
```

## Release notes (v0.5.0)

```
* Fixed: wind needles rendered at roughly half their intended length on the
  Clean and Marine skins. All eight needle styles now reach the dial edge as
  designed.
* New: Live mode caches results in the browser — resolved city coordinates for
  30 days (they never change) and the latest reading for up to 10 minutes. A
  dashboard reload now costs no API requests at all.
* New: requests are spaced out and rate-limit responses (HTTP 429) are retried
  automatically with backoff. A multi-panel dashboard no longer shows
  "Weather fetch failed (HTTP 429)" on some panels during a cold load.
* New: duplicate panels on the same city now share a single request.
* Changed: redesigned demo dashboard — clearer explanation of both data modes,
  how live data is fetched, and third-party attribution.
* Changed: new app icon derived from the Clean skin's dial.
* Fixed: a render-time error now shows a readable message in the panel instead
  of leaving it blank.
```

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
Wind Compass is a client-side Dashboard Studio visualization. It runs entirely
in the browser and contains no server-side code, scheduled searches, modular
inputs, or custom endpoints. It collects no telemetry and never phones home to
the author.

Search mode makes no external network connections at all. It renders only the
search results the dashboard supplies.

Live mode calls two public Open-Meteo endpoints directly from the viewer's
browser — geocoding-api.open-meteo.com to turn the configured city name into
coordinates, and api.open-meteo.com for current conditions. The Splunk server
makes no outbound connection. Only the city/country you configure and the
coordinates it resolves to are sent; no Splunk data, user identity, search
results, or credentials are included, and no API key is used or required.

To stay within Open-Meteo's published rate limits, Live mode caches the
resolved coordinates and the most recent reading in the viewer's browser
(localStorage, keys prefixed "windcompass:"). Nothing is stored on the Splunk
server, and clearing site data removes the cache. Live mode can be disabled
per panel by switching Data source mode to Search, and an environment with no
outbound internet access from end-user browsers simply shows a fetch error on
those panels — nothing else is affected.
```

---

## Keywords / tags (if the portal supports them)

```
wind, compass, weather, meteorology, dashboard studio, visualization, marine,
direction, speed, temperature, open-meteo
```

---

## Screenshot captions (suggested)

1. **Demo dashboard** — nine panels showing live weather for nine cities, no search configured.
2. **Clean skin** — live Berlin conditions with direction, speed, location, and temperature readouts.
3. **Marine skin** — nautical-style bezel and classic needle.
4. **Instrument skin** — HUD-style dial with optional center-hub speed readout.
5. **Weather-only layout** — compass dial switched off: large condition icon, temperature, and location.
6. **Setup panel** — Data source, style, color, readout, and field-mapping options in Dashboard Studio.

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
