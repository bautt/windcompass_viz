# Third-Party Notices

Wind Compass bundles the following open-source and Splunk components into
`appserver/static/visualizations/windcompass/visualization.js` at build time,
and — only when **Live** data mode is selected — calls the third-party web
service listed below directly from the browser.

## Runtime dependencies (bundled)

### React 18.3.1

Copyright (c) Meta Platforms, Inc. and affiliates.

Licensed under the MIT License.

### react-dom 18.3.1

Copyright (c) Meta Platforms, Inc. and affiliates.

Licensed under the MIT License.

### @splunk/dashboard-studio-extension 1.0.0

Copyright Splunk LLC.

Provided under the Splunk General Terms. Use is limited to connection with
Splunk Dashboard Studio on a licensed Splunk platform, in accordance with
Splunk's extension terms.

## Runtime third-party service (Live data mode only, not bundled)

### Open-Meteo (open-meteo.com)

When **Data mode** is set to **Live**, the visualization calls Open-Meteo's
free geocoding and weather forecast APIs directly from the viewer's browser
to resolve the configured city and fetch current wind, temperature, and
weather-condition data. This call does not occur when **Data mode** is set
to **Search**. No API key is transmitted or stored — Open-Meteo's free tier
requires none, and no Splunk data is ever sent to Open-Meteo.

Wind Compass is not affiliated with or endorsed by Open-Meteo. Two separate
sets of terms apply:

* **Data license (copyright):** the weather/geocoding data itself is
  licensed under Creative Commons Attribution 4.0 International (CC BY 4.0).
  This license permits commercial use, provided attribution is given — see
  the on-dashboard "Attribution & third-party data" panel and
  https://open-meteo.com/en/license.
* **Free API tier (terms of use):** the *hosted service* this app calls is
  separately restricted by Open-Meteo to non-commercial use, with rate
  limits (as of this writing: 600 calls/min, 10,000/day). This is a
  usage-terms restriction on the free service, not a copyright restriction
  on the data. See https://open-meteo.com/en/terms. If you redistribute
  this app as part of a commercial product or paid service, you are
  responsible for complying with Open-Meteo's terms, including subscribing
  to one of their paid API plans if required.

## Build-time only (not shipped in the `.spl` package)

The following packages are used only during development and packaging:

- esbuild (MIT)
- chalk (MIT)
- tar (BlueOak-1.0.0 / ISC components)

See `yarn licenses list` in the source repository for the full development
dependency tree.
