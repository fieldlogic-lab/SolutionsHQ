# LiDAR Bluff Profile Pipeline — Project Scope

## Purpose
Convert survey-grade LiDAR capture into a simple, repeatable existing-conditions pre-design package for bluff/dune access and similar terrain problems.

## Existing implementation
The R pipeline has already:
- processed LAS/LAZ and DTM data;
- consumed authoritative GeoJSON section-line and pick inputs;
- produced profile CSV and cached processing stages;
- generated `cross_section.png`, `plan_view.png`, and PDF outputs;
- used interactive/manual top-bottom picking;
- supported real East Hampton / Waters Edge and Rocky Point testing.

The target production constraint is a two-day turnaround with a deliberately simple two-page report.

## Boundary
Massi Land Surveying may sell/operate the service and SurveyOS may eventually orchestrate the workflow, but this processing/report engine is a distinct technical asset.

## Proposed repository
`fieldlogic-lab/LiDAR-Bluff-Profile`

## Next step
Consolidate the working R pipeline, eliminate conflicting elevation sources, preserve the two-page report standard, add safe test data, and package the workflow for repeatable MLS production use.
