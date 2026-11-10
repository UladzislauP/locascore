# LocaScore

A browser-based map for exploring nearby amenities and location accessibility in Poland and Belarus, powered by OpenStreetMap.

Search for an address, explore its surroundings, and view distances and a preliminary accessibility score. The interface supports Polish, English, Belarusian, and Russian.

## Features

- Interactive OpenStreetMap with country boundaries.
- Address search through Photon.
- Nearby amenities retrieved through Overpass.
- Object counts within 500 m and 1 km, with distances to the nearest facilities.
- A preliminary accessibility score with a breakdown of its factors.
- Geometry processing and scoring performed in the browser.

No application backend, Firebase project, database, or API keys are required.

## Quick start

Requires npm and Node.js 22.22.3+ in the 22.x release line, 24.15.0+ in the 24.x release line, or 26+. A supported LTS release is recommended.

```sh
npm ci
npm start
```

Open [http://localhost:4200](http://localhost:4200). Serve the application over HTTP rather than opening the HTML file directly.

## Checks and production build

```sh
npm run typecheck
npm test
npm run build
```

The built website is written to `dist/locascore/browser/`. Angular also generates `dist/locascore/3rdpartylicenses.txt`; include that file when distributing the website.

The fixture-based checks cover geocoding, caching, OSM conversion, geometry distances, rating metadata, and unavailable-data errors. They do not replace full interface testing or verify live provider availability.

GitHub Actions runs dependency installation, type checking, tests, and the production build. It does not deploy the website automatically.

## Static hosting

Deploy the contents of `dist/locascore/browser/` to a static host and include the generated `3rdpartylicenses.txt` file.

For a GitHub Pages project hosted at `/LocaScore/`, build with:

```sh
npm run build -- --base-href /LocaScore/
```

Match the path, including capitalization, to the repository name. Use `/` when hosting at the domain root.

## Data sources and privacy

An internet connection is required:

| Purpose | Source |
| --- | --- |
| Map tiles | `tile.openstreetmap.org` |
| Address search | Photon at `photon.komoot.io` |
| Nearby amenities | Overpass at `maps.mail.ru`, with `overpass.kumi.systems` as a fallback |
| Country boundaries | Included OSM-derived GeoJSON files |

Search text is sent to Photon, selected coordinates are sent to the Overpass provider, and map tile requests are sent to OpenStreetMap's tile service. Providers receive normal network information, including the user's IP address. The application has no backend for storing searches. The language preference is stored in the browser's localStorage when available.

Public services may impose rate limits or become unavailable. Provider failures are displayed as errors. Higher-traffic deployments may require different providers or self-hosted services. See the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) and [Photon documentation](https://github.com/komoot/photon).

Boundary sources, retrieval dates, and attribution are recorded in `public/data/boundaries/source.json`.

## Understanding the score

The score is a heuristic for access to nearby mapped facilities, not a validated measure of housing, healthcare, or education quality. Distances are geodesic distances to object geometry rather than walking routes. Missing OSM features do not establish that a facility is absent, and data completeness is unknown.

Scoring rules and weights are defined in `src/shared/analysis/rating.ts`.

## Project structure

```text
src/app/                  Interface and map components
src/shared/               Geocoding, geometry, OSM analysis, and scoring
public/data/boundaries/   Country boundaries and source metadata
public/markers/           Map marker assets
tests/                    Fixture-based core checks
.github/workflows/        Continuous integration
```

## Attribution and licensing

© OpenStreetMap contributors. OSM data, including the bundled country boundaries, is available under [ODbL 1.0](https://www.openstreetmap.org/copyright).

The interface and analysis code were adapted from `New_geoportal_BY_UPOS`. This repository contains the browser-based application.

See [LICENSE.md](LICENSE.md), [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), and [THIRD_PARTY_LICENSES.txt](THIRD_PARTY_LICENSES.txt). Third-party software and data retain their respective licenses; no additional open-source license has been assigned to the application-specific code.
