# SolutionsHQ desktop PWA and responsive workspace

The same Next.js application supports mobile browsers, desktop browsers, and an installed Windows PWA window. There is no Electron app, separate desktop codebase, local copy of the project database, or offline synchronization engine.

## Install after an approved HTTPS deployment

- **Microsoft Edge:** open the intended SolutionsHQ HTTPS domain. Use the address-bar install icon when shown, or the browser menu's app installation option. After installation, choose the Windows taskbar pin and desktop shortcut options offered by Edge, or use the installed app's management/settings page to create them.
- **Chrome:** open the same domain. Use the address-bar install icon when shown, or the browser menu's **Cast, save, and share → Install page as app** option. Use Chrome's app management/shortcut options or Windows Start to create/pin the installed app shortcut.
- SolutionsHQ's **Install app** control opens a browser-provided prompt when available and otherwise shows installation instructions. Browser policy, engagement criteria, prior installation, and browser versions affect prompt availability. The application cannot silently create OS shortcuts or taskbar pins.
- Keep ChatGPT open separately on the companion display. On desktop, **Resume in ChatGPT** opens the external companion in a separate browsing context and keeps the SolutionsHQ window open. It does not embed ChatGPT or depend on an undocumented Windows app deep link.

The manifest uses a stable app ID and scope `/`, a standalone display setting, matching dark theme/background, and real PNG icons at 192 and 512 pixels plus a safe-area maskable icon. Apple touch metadata preserves mobile installation support. Use the intended production domain consistently; installing a preview creates a separate app identity/origin and separate authentication state.

## Desktop and mobile layout

Wide project pages use three fluid regions: left project navigation/saved history, center primary workspace/specifications/application access, and right development activity/checks/QA/approvals. Drag the separators or focus them and use arrow keys, Home, or End. Controls collapse either side, expand the center, and restore the default layout. Widths are constrained as proportions of available space, not the user's monitor dimensions.

Narrower layouts retain a single-column experience. Workshop, Next Steps, Prompt Builder, and Development Team remain available as connected views. Existing navigation, project links, re-entry actions, and workstream editing remain present. Layout preferences are stored on the device; they contain no project history or credentials.

## Synchronization, authentication, and updates

Desktop and mobile use the same authenticated server and private Postgres context store. Each device signs in; conversations, facts, recommendations, assignment versions and development evidence persist on the server. Concurrent edits use revision checks instead of silently overwriting each other. Refresh/re-entry loads current context. Repository-defined project status stays distinct from browser-local workstream edits.

No service worker is registered and no offline cache stores pages, private API responses, or old application bundles. Project APIs use `Cache-Control: no-store`. An internet connection is required. Normal approved deployments reach installed applications on navigation/reload/reopening through the same web origin. A window already running JavaScript does not forcibly reload while the owner has unsaved work; use the normal app/browser reload command when ready. Next.js versioned static assets retain normal browser caching.

PWA installation does not weaken server authentication, canonical-origin checks, HttpOnly/SameSite cookies, or approval gates. The install manifest and icons are public metadata; private context remains behind owner access.

## Verification checklist

Automated checks validate standalone/scope metadata and actual PNG dimensions. Independent browser QA must check production manifest responses, page metadata, install-help behavior, desktop region resizing/collapse/keyboard access, narrow single-column layout, and navigation/workstream regressions.

After approved deployment, verify on actual Windows Edge and Chrome:

1. Install from the production HTTPS domain and create a desktop shortcut/taskbar pin.
2. Launch from the shortcut and verify a separate window with the SolutionsHQ icon, correct title, and standalone display mode.
3. Sign in, save Workshop context, and confirm the same context from a separately authenticated mobile browser.
4. Resize/collapse desktop regions at landscape and portrait window sizes; confirm center expansion and no horizontal overflow on mobile.
5. Open ChatGPT as a separate companion and verify SolutionsHQ stays open.
6. After a later approved deployment, reload/reopen and verify the new version and unchanged server data. Confirm no service-worker cache serves an old version.

Browser automation in this session cannot inspect native Windows taskbar/desktop shortcut surfaces. Manifest and browser layout verification must not be reported as actual OS installation verification. Cloud database/API/Codex end-to-end checks also remain pending until credentials and activation are configured.

References: [Edge PWA development](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/), [Chrome web apps](https://support.google.com/chrome/answer/9658361), [Chrome installation criteria](https://developer.chrome.com/blog/update-install-criteria).
