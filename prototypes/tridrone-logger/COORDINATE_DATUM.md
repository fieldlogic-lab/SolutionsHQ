# TriDrone Coordinate and Vertical Datum Contract — v0.1

Effective 2026-10-08. **Specification only: transformations and vertical solutions not yet implemented or verified.**

## Horizontal
- Project output: NAD83 / New York Long Island State Plane (EPSG:2263), easting/northing in **US survey feet**. Verify applicable realization/epoch and transformation path against project control before survey deliverables.
- Store original GNSS latitude, longitude, source datum/realization when known, UTC and monotonic timestamps, reported accuracy and fix metadata.
- Transform WGS84/geodetic Android locations to EPSG:2263 only through a tested geodetic transformation implementation (e.g. PROJ), documenting operation, source/target CRS, grid availability and expected accuracy. No hand-coded planar approximation and no silent fallback.
- If source datum, required transformation, or GNSS quality is uncertain, record raw geographic coordinates and mark projected coordinate status as **unverified**, not survey-grade.
- EPSG:2263 uses US survey feet; avoid accidental international-foot conversions. If delivering on a modernized state plane datum, define separate CRS explicitly.

## Vertical
- Required corrected output: NAVD88 orthometric elevation in feet, with geoid model, vertical realization, units and source logged.
- Depth below transducer is not an elevation. Compute bottom elevation only if a valid **NAVD88 transducer elevation at sounding time** is available, correcting any offsets and water-level reference. Formula: `bottom_NAVD88_ft = transducer_NAVD88_ft - corrected_depth_ft`, with vertical sign conventions recorded.
- GNSS ellipsoid height requires a validated geoid model and survey-quality GNSS plus lever arm/transducer offsets and motion treatment. Alternatively use an independently observed NAVD88 water-level benchmark/gauge and known transducer immersion.
- **Never** substitute Android phone GPS altitude for NAVD88 or publish a fabricated bottom Z. Depth remains raw until corrected.
- Preserve raw depth units, depth measurement timestamps, transducer draft, sound velocity assumptions and corrections applied.

## Export schema
`session_id,utc_epoch_ms,elapsed_realtime_ns,lat_deg,lon_deg,source_crs,gnss_quality,gnss_accuracy_m,easting_usft,northing_usft,horizontal_crs,horizontal_status,raw_depth_m,transducer_navd88_ft,bottom_navd88_ft,vertical_datum,vertical_status`

Projected and bottom fields are **null** pending validated transforms and vertical control. Store original raw GNSS and hydrographic records independently from corrected observations.

## Acceptance criteria
1. CRS identifiers and output units documented in each session and exported dataset.
2. EPSG:2263 transformation validated against independent control points; reported accuracy sufficient for use case.
3. NAVD88 elevations only populated after control/model/draft validation against independent check soundings and benchmarks.
4. Changing datum or correction values produces an auditable new derived export; never overwrite raw observations.
