# Build a Chrome Extension: Jargon Hover

## Goal
When I hover over finance or business terms on any webpage, show me a one-line definition in a tooltip. Let me add and edit terms in my own dictionary.

## What the extension does

On any webpage I visit, the extension scans the text for a list of known jargon terms from my personal dictionary. When I hover over a matched term, a small clean tooltip appears with a plain-English one-line definition. If I right-click a highlighted term, I get an option to edit its definition. An options page lets me add new terms, edit existing ones, or delete entries.

## Features

- Content script that scans page text for dictionary terms (whole words only, case-insensitive)
- Matched terms get a subtle underline with a dotted style
- Hovering shows a tooltip with the definition, styled like a small card
- Tooltip disappears when mouse leaves
- Options page (accessible from extension icon right-click or chrome-extensions page) to manage the dictionary
- Options page shows terms as a table with columns: Term, Definition, Edit, Delete
- "Add new term" form at the top of the options page
- Dictionary persists in chrome.storage.local

## Pre-populated dictionary

Ship the extension with these finance and business terms already in the dictionary. Keep definitions under 15 words each, plain English, no circular jargon.

- EBITDA: Earnings before interest, tax, depreciation, and amortization. A rough proxy for operating cash flow.
- IRR: Internal Rate of Return. The annual growth rate that makes an investment break even.
- CAGR: Compound Annual Growth Rate. The steady yearly rate that would produce the same end result.
- ROCE: Return on Capital Employed. Profit divided by the capital used to run the business.
- ROE: Return on Equity. Profit divided by shareholder equity, showing how well a company uses investor money.
- P/E: Price to Earnings ratio. Share price divided by earnings per share.
- NPV: Net Present Value. Today's value of future cash flows, adjusted for time.
- WACC: Weighted Average Cost of Capital. The blended cost of a company's debt and equity financing.
- Free Cash Flow: Cash left after a business pays for its operations and capital investments.
- DPR: Detailed Project Report. A formal document describing a project for government or funding approval.
- PMC: Project Management Consultant. A firm that manages a project on behalf of the owner.
- Feasibility Study: An early report analyzing whether a project is viable technically and financially.
- Information Ratio: A portfolio's excess return over its benchmark divided by how much it deviates from that benchmark.
- Downside Capture: How much of the market's losses a fund captures during down periods.
- AUM: Assets Under Management. The total market value of investments a fund or advisor manages.
- SEBI: Securities and Exchange Board of India, the regulator for capital markets.
- DDT: Dividend Distribution Tax, historically levied on companies paying dividends in India.
- DGFT: Directorate General of Foreign Trade, the Indian authority for export and import policy.
- GeM: Government eMarketplace, India's procurement portal for government buyers.
- LC: Letter of Credit, a bank's guarantee of payment to a seller on behalf of a buyer.

## Technical specs

- Manifest V3
- Permissions: `storage`, `activeTab`
- Host permissions: `<all_urls>` so it works on any site
- No external APIs, all data local
- Tooltip should have light background, small shadow, rounded corners, max width 300px
- Content script must not break any page layout, use position: absolute for tooltips

## Files I need

Create a complete extension folder, zip it, and give me the download. Include:
- manifest.json
- content.js (scanner and tooltip logic)
- content.css (tooltip and underline styles)
- options.html
- options.css
- options.js
- Default dictionary as a JSON file loaded on first install
- Simple icons at 16px, 48px, 128px (maybe a highlighter pen motif)

## How I'll install it

1. Download and unzip
2. Go to chrome://extensions
3. Turn on Developer mode
4. Click Load unpacked, select the folder
5. Open any finance news article, hover over something like "EBITDA" or "ROE" to test

Please include these steps and a test suggestion at the end of your response.

## Important

First-try working is the goal. I am not a developer. Prefer the simplest approach over the most elegant.
