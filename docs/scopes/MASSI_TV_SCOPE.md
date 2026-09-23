# Massi TV — Project Scope

## Purpose
Deliver a household television experience that behaves like a personalized local station: passive family-safe broadcast when unattended and remote-navigable household/local information when someone interacts.

## Product boundary
**HELM** is the household operating/intelligence layer.
**Massi TV** is the television presentation and interaction product that consumes HELM plus other approved household/local feeds and applications.

## Existing direction
- weather, boating, fishing, surf, local and regional information;
- rotating passive broadcast;
- remote navigation and story opening;
- RSS/news ticker behavior;
- family-friendly iconography and presentation;
- family photo/art display;
- Samsung/TV integration and future per-TV behavior;
- potential customized physical remote.

## Proposed repository
`fieldlogic-lab/Massi-TV`

## Next step
Extract Massi TV into an explicit application boundary, define its feed/provider contract with HELM, preserve the existing television UI work, and establish the first remote-navigation information architecture.
