# Build a Chrome Extension: Ticker Peek

## Goal
Underline Indian company names wherever they appear on the web. When I hover, show a small card with live price and a set of stats I can choose to display.

## What the extension does

On any webpage, the extension scans text for company names from my watchlist. Matches get a subtle green underline. When I hover over a match, a small card appears showing live price, daily change %, and a configurable set of other stats pulled from a public market data source. In the options page, I can edit my watchlist (company name and ticker symbol) and pick which stats appear in the hover card.

## Features

- Content script scans page for watchlist company names (whole word match, case-insensitive)
- Matched names get a dotted green underline
- On hover, fetch live data from Yahoo Finance public endpoint and show in a card
- Hover card shows the stats I selected, in order, with labels
- Options page has two sections: Watchlist (add/edit/delete companies and tickers) and Visible Stats (checkboxes for which stats to show)
- Cache fetched data for 5 minutes to avoid hammering the API

## Market data source

Use the Yahoo Finance public quote endpoint:
`https://query1.finance.yahoo.com/v7/finance/quote?symbols=RELIANCE.NS`

For Indian stocks, tickers use the `.NS` suffix for NSE and `.BO` for BSE. Example: RELIANCE.NS, TCS.NS, HDFCBANK.NS.

If the Yahoo endpoint is blocked by CORS in the browser, fall back to showing a cached or placeholder value and put a small "refresh" link in the hover card that opens the Yahoo Finance page in a new tab. Do not crash the extension if the API fails.

## Default stats available for the hover card

Let me toggle each of these on or off in the options page:
- Current price (always on, cannot be toggled off)
- Day change % (default on)
- Day change absolute (default off)
- Day range (high-low)
- 52-week high
- 52-week low
- Market cap
- P/E ratio
- Volume
- Previous close

## Default watchlist

Pre-populate with these popular Indian stocks so the extension has something to show on day one:
- Reliance Industries: RELIANCE.NS
- Tata Consultancy Services: TCS.NS
- HDFC Bank: HDFCBANK.NS
- Infosys: INFY.NS
- ICICI Bank: ICICIBANK.NS
- Hindustan Unilever: HINDUNILVR.NS
- ITC: ITC.NS
- Bharti Airtel: BHARTIARTL.NS
- State Bank of India: SBIN.NS
- Larsen & Toubro: LT.NS
- Bajaj Finance: BAJFINANCE.NS
- Asian Paints: ASIANPAINT.NS
- Maruti Suzuki: MARUTI.NS
- Axis Bank: AXISBANK.NS
- Kotak Mahindra Bank: KOTAKBANK.NS

## Technical specs

- Manifest V3
- Permissions: `storage`, `activeTab`
- Host permissions: `<all_urls>` and `https://query1.finance.yahoo.com/*`
- Cache fetched data in chrome.storage.local with a 5-minute TTL
- Hover card styled clean: white background, small shadow, rounded corners, green/red colors for positive/negative changes
- Do not block page rendering, scan in chunks using MutationObserver for dynamically added content

## Files I need

Complete extension as a downloadable zip. Include:
- manifest.json
- content.js (scanner, hover logic, data fetch)
- content.css (underline and card styles)
- options.html, options.css, options.js (watchlist and stat toggles)
- background.js (data caching helper)
- Default watchlist as JSON loaded on first install
- Simple icons 16, 48, 128 (an upward-trending line chart motif)

## How I'll install it

1. Download and unzip
2. Go to chrome://extensions
3. Turn on Developer mode
4. Click Load unpacked, select the folder
5. Open any news article mentioning Reliance or TCS, hover over the name to test

Please include these steps at the end. Also include a note telling me how to add my own stocks via the options page.

## Important

First-try working on at least the default watchlist is the goal. If the Yahoo Finance API fails due to CORS, the extension should degrade gracefully, not crash. I am not a developer.
