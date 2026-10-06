# Third-Party Notices

Wind Compass bundles the following open-source and Splunk components into
`appserver/static/visualizations/windcompass/visualization.js` at build time.

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

## Build-time only (not shipped in the `.spl` package)

The following packages are used only during development and packaging:

- esbuild (MIT)
- chalk (MIT)
- tar (BlueOak-1.0.0 / ISC components)

See `yarn licenses list` in the source repository for the full development
dependency tree.
