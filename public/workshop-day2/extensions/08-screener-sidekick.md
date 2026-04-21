# Build a Chrome Extension: Screener.in Sidekick

## Goal
On Screener.in company pages, add a floating panel that gives me personal notes per company, a peer comparison bookmark list, and a "compare against my tracked companies" shortcut.

## What the extension does

Whenever I visit a page like `https://www.screener.in/company/RELIANCE/`, a small floating panel appears on the right edge of the screen. It stays open by default but I can minimize it to a small tab. The panel has three sections I can switch between with tabs: Notes, Peers, and Tracked.

- **Notes**: A text area where I can type personal notes about this company (things I noticed, my thesis, risks). Notes save automatically every few seconds.
- **Peers**: A bookmarked list of peer companies I've marked for this company. Clicking a peer name opens that company's Screener page. I can add peers by typing their ticker.
- **Tracked**: My global list of tracked companies. I can add the current company to this list with one click. From any Screener page, I can open any tracked company's page by clicking its name.

## Features

- Content script injects panel only on `https://www.screener.in/company/*` URLs
- Panel is ~320px wide, positioned right side, vertically centered, with a subtle shadow
- Minimize button collapses panel to a small vertical tab that shows company ticker
- Notes auto-save to chrome.storage.local keyed by company ticker
- Notes are plain text, support line breaks, no fancy formatting
- Tracked and Peers lists persist across all Screener pages
- Export all my notes + tracked list as JSON from the panel's settings gear

## Technical specs

- Manifest V3
- Permissions: `storage`
- Host permissions: `https://www.screener.in/*`
- Content script waits for page ready before injecting panel
- Panel uses iframe-free injection, just a div with high z-index
- Styles scoped with a prefix class like `ttm-screener-sidekick-` to avoid clobbering Screener's own CSS
- Extract current company ticker and name from the page URL and H1 on load

## Files I need

Complete extension as a downloadable zip:
- manifest.json
- content.js (panel injection, ticker detection, tab switching)
- content.css (panel styling, minimize state)
- popup.html (brief info page and export button)
- Icons at 16, 48, 128 (a magnifying glass with a small chart, or letter S)

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select folder
4. Visit any company page on screener.in (try https://www.screener.in/company/RELIANCE/)
5. The floating panel appears on the right

Include these steps at the end. Also mention: "Your notes are saved locally, nothing is sent to any server."

## Important

Not a developer. Must work first try on Screener.in. If Screener changes layout and the panel collides with their UI, prefer my panel staying visible on the right edge with a shadow over the page content. Keep the code readable so I can tweak colors and positions later.
