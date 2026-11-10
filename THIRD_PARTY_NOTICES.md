# Third-party notices

## OpenStreetMap data

© OpenStreetMap contributors. Data available under ODbL 1.0:

- https://www.openstreetmap.org/copyright
- https://opendatacommons.org/licenses/odbl/1-0/

The country boundary datasets in `public/data/boundaries/` are derived from OpenStreetMap. Keep their `source.json` with the files. It records source URLs, relation identifiers, retrieval time and source response hashes. Live analysis results also identify their source and license. The data license is separate from the application code license.

## Software dependencies

The application uses Angular, Angular Material/CDK, OpenLayers, RxJS, tslib, Turf and osmtogeojson, together with their transitive dependencies. Dependency license texts and copyright notices remain applicable.

The production build extracts bundled software notices into `dist/locascore/3rdpartylicenses.txt`. Include this generated file when distributing the built website; do not remove license comments or required notices. The package lock records the exact installed dependency versions.

## External services

Photon provides address search; Overpass instances provide OSM queries; OpenStreetMap provides map tiles. Publishing this code grants no service availability guarantee and does not waive those services' usage policies. Keep visible map attribution.
