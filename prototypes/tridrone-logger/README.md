# TriDrone Logger — Android prototype

Status: **source scaffold committed; hardware validation pending** (2026-10-08).

Target: Motorola Moto G Stylus 5G (2023). Independent phone-based GNSS/depth logger. No autopilot, motor control, cameras, or external GPS required for initial milestone.

## MVP
- Android native Kotlin application.
- Foreground location logging while survey recording is active.
- Append internal GNSS locations with UTC epoch timestamps, elapsed realtime, coordinates, accuracy, speed, bearing and provider to local CSV.
- Raw depth via Bluetooth Classic RFCOMM is **next milestone**, not verified.
- Preserve raw observations; do **not** claim survey-grade vertical or horizontal accuracy.
- All operations offline; export and a visual dashboard are next.

## Build
Create an **Empty Views Activity** Kotlin Android project in Android Studio (package `com.massisolutions.tridrone`, min SDK 26). Copy the files in `app/src/main/` into that project; merge manifest entries with generated manifest. Add Gradle AndroidX Core and AppCompat dependencies only if choosing to use them; current source uses Android platform APIs. Compile with Android SDK 35 or later. This is a minimal source scaffold, **not a verified build or signed APK**.

Permissions: `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `FOREGROUND_SERVICE`, and `FOREGROUND_SERVICE_LOCATION`; on Android 13+, `POST_NOTIFICATIONS` for notification visibility. Location permission must be granted by an active Activity before service startup.

## Files
Sessions written to app-private `filesDir/surveys/`. CSV is comma-separated with header and one record per location callback. Millisecond wall-clock time and monotonic `elapsedRealtimeNanos` are recorded to support future depth/GNSS matching.

## Validation
1. Build and install on Moto G Stylus 5G 2023.
2. Grant precise location; start survey with screen on, then lock screen.
3. Walk outside with clear sky; verify CSV increases and coordinates are plausible.
4. Stop; confirm last record persisted and foreground notification disappears.
5. Simulate GNSS-denied area; verify no invented points.
6. Later: verify Bluetooth HydroLite protocol and timestamp pairing on actual device.

## Deferred
Bluetooth HydroLite Plus communication, RTK/Bad Elf, app export UI, GNSS raw measurement support, waterline/draft/tide/geoid corrections, power integrity, waterproof protection, and automated test suite.

Source of truth (until independent repo exists): `docs/scopes/HYDROGRAPHIC_USV_SCOPE.md`.
