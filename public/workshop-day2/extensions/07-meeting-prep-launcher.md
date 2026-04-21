# Build a Chrome Extension: Meeting Prep Launcher

## Goal
I highlight a person's name on any webpage, click the extension, and it opens three new tabs in a fresh window for fast pre-meeting research: their LinkedIn, Google News, and their company's Wikipedia page.

## What the extension does

I select text on any webpage (usually a name, or a name and a company). I right-click and pick "Prep for meeting with..." from the context menu, or I click the extension toolbar icon. The extension opens a new Chrome window with three pre-configured tabs:

1. LinkedIn search for the selected text
2. Google News search for the selected text with "latest" filter
3. Wikipedia search (if the selection looks like a company, direct Wikipedia page; otherwise a Wikipedia search)

The popup shows a history of my last 10 lookups so I can re-open a prep window in one click.

## Features

- Right-click context menu on selected text: "Prep for meeting with [selection]"
- Clicking the toolbar icon opens a popup with: text box for manual entry, list of last 10 lookups, and a big "Launch prep" button
- Opens a new window (not just tabs in current window) so research stays separate from current work
- Remembers the last 10 lookups in chrome.storage.local
- Small options page to customize the three URL templates (in case I want to use Twitter/X search instead of Wikipedia, for example)

## Default URL templates

Use these by default, with `{query}` as the placeholder:
1. LinkedIn: `https://www.linkedin.com/search/results/people/?keywords={query}`
2. Google News: `https://news.google.com/search?q={query}&hl=en-IN&gl=IN`
3. Wikipedia: `https://en.wikipedia.org/wiki/Special:Search?search={query}`

In the options page, let me reorder these, edit them, add a fourth, or replace one. Save my custom templates so they persist.

## Technical specs

- Manifest V3
- Permissions: `contextMenus`, `storage`, `tabs`
- Host permissions: not needed beyond the URL templates
- Popup around 340px wide with the input box, recent-lookups list, and launch button
- Recent lookups list should show timestamp in relative format ("2 hours ago")

## Files I need

Complete extension, downloadable zip:
- manifest.json
- background.js (context menu setup, window launch logic)
- popup.html, popup.css, popup.js
- options.html, options.css, options.js
- Icons at 16, 48, 128 (rocket or paper-airplane motif suggesting "launch")

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select folder
4. Pin the extension to toolbar
5. Test: highlight someone's name on LinkedIn feed or any article, right-click, choose "Prep for meeting with..." - a new window should open with three tabs

Include these steps at the end. Add a brief usage tip: "Works best with full names, or name plus company."

## Important

Not a developer. First try working is the goal. If no text is selected when I click the toolbar icon, the popup should open cleanly and let me type a name manually.
