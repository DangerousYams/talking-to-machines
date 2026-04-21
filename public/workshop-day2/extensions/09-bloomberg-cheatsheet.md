# Build a Chrome Extension: Bloomberg Cheatsheet

## Goal
Replace my new-tab page with a searchable cheat sheet of the most useful Bloomberg Terminal function codes, because my firm pays for Bloomberg but I never remember how to use it beyond a handful of commands.

## What the extension does

Every time I open a new Chrome tab, I see a clean single-page reference of Bloomberg functions. A search bar at the top filters the list as I type. Each function shows: the command code, a one-line description, and a small example of how to use it. I can favorite functions; favorites pin to the top.

## Features

- New-tab page override
- Search bar instantly filters by code, description, or keywords
- Each entry is a small card with: Code (bold, monospace), Description (one line), Example (italic)
- Click the star icon to favorite; favorites show at top in a "Starred" section
- Keyboard shortcut: just start typing to focus the search box, Enter to copy the top result's code to clipboard
- Dark mode by default (cheat sheet feels right in terminal aesthetic); toggle available in top-right

## Pre-populated content

Ship with these ~25 Bloomberg functions. Keep descriptions under 12 words. Examples should be realistic.

| Code | Description | Example |
|---|---|---|
| HELP | Shows help menu for any current screen | Press HELP on any Bloomberg screen |
| DES | Company description, basics, and overview | RELIANCE IN Equity DES |
| FA | Full financial analysis with historical financials | TCS IN Equity FA |
| GIP | Graph intraday price chart | HDFCBANK IN Equity GIP |
| GP | Graph historical price chart with customizable periods | INFY IN Equity GP |
| ECO | Economic calendar for a country | IN ECO for India calendar |
| TOP | Top news headlines across markets | TOP |
| N | News stories, filterable | N TECH for tech news |
| MSG | Messaging, internal Bloomberg chat | MSG <contact name> |
| CN | Company news feed | RELIANCE IN Equity CN |
| MGMT | Company management and key executives | ITC IN Equity MGMT |
| CRPR | Credit profile ratings from major agencies | BHARTI IN Equity CRPR |
| DVD | Dividend history and schedule | HDFCBANK IN Equity DVD |
| EQS | Equity screening with custom filters | EQS |
| FLNG | Recent regulatory filings | TCS IN Equity FLNG |
| HP | Historical prices as a data table | RELIANCE IN Equity HP |
| RV | Relative valuation vs peers | INFY IN Equity RV |
| PORT | Portfolio analytics for a saved portfolio | PORT |
| BI | Bloomberg Intelligence research by sector | BI BANKS |
| WEI | World equity indices snapshot | WEI |
| IECO | Indian economic indicators | IECO |
| SECF | Security finder, search any asset | SECF |
| BRIEF | Morning market briefing for your subscribed topics | BRIEF |
| CIX | Create your own custom index | CIX |
| API | Bloomberg API documentation entry point | API |

## Technical specs

- Manifest V3
- Permissions: `storage` (for favorites and theme)
- Chrome URL overrides: new tab page
- Page is one HTML file with embedded CSS and JS, fully local
- Monospace font for codes (use system `ui-monospace, SFMono-Regular, Menlo`)
- Body font clean sans-serif
- Dark mode: background around #0f1115, text around #d0d4dc, accents in Bloomberg orange (#fa8c1e)

## Files I need

Complete extension, downloadable zip:
- manifest.json
- newtab.html (with embedded CSS and JS, or split into separate files, your call)
- newtab.css
- newtab.js
- functions.json (the data)
- Icons at 16, 48, 128 (two horizontal lines with a small block, like a terminal cursor)

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select the folder
4. Open a new tab (Cmd+T or Ctrl+T) to see the cheatsheet
5. Type a function code or keyword to filter; click the star to favorite

Include these steps at the end. Mention that it replaces my default new tab page only in Chrome, not my homepage.

## Important

I am not a developer. The cheatsheet must load instantly and look polished. If I want to add more functions later, I should be able to edit functions.json directly and see them appear without touching code.
