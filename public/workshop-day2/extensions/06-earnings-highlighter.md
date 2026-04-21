# Build a Chrome Extension: Earnings Week Highlighter

## Goal
Adds a small 📅 badge next to any Indian company name on any webpage if that company has earnings announcement in the next 7 days.

## What the extension does

The extension carries a local JSON file mapping company names to their next earnings date. On any webpage I visit, the content script scans for these company names. If a company's next earnings date is within 7 days, its name gets a small calendar emoji badge beside it. Hovering over the badge shows a tooltip with the exact date and reporting quarter.

An options page lets me edit the earnings calendar: add companies, update dates, delete entries. A button in the options page called "Refresh calendar" re-scans the current page with updated data.

## Features

- Content script scans for company names from the local earnings calendar
- Matched names where earnings are within 7 days get a 📅 badge inserted right after the name
- Badge on hover shows tooltip: "Earnings: 24 April 2026, Q4 FY26"
- Options page to manage the calendar (add, edit, delete rows)
- Import / Export the calendar as JSON (helpful for sharing across my team)
- Badge colors: calendar emoji on orange background for within 3 days, yellow for 4-7 days

## Pre-populated earnings calendar

Ship with a starter dataset. Use plausible future dates within the next 30 days relative to today, so students see something working immediately. Include at minimum these companies (you can make up reasonable-looking dates for a demo, with a comment in the data file that says "Update these to real dates before serious use"):

- Reliance Industries
- Tata Consultancy Services
- HDFC Bank
- Infosys
- ICICI Bank
- Wipro
- HCL Technologies
- Tech Mahindra
- State Bank of India
- Axis Bank
- Bajaj Finance
- Asian Paints
- Hindustan Unilever
- ITC
- Larsen & Toubro
- Maruti Suzuki
- Bharti Airtel
- Tata Motors
- Mahindra & Mahindra
- Sun Pharma

## Technical specs

- Manifest V3
- Permissions: `storage`, `activeTab`
- Host permissions: `<all_urls>`
- Calendar stored in chrome.storage.local, loaded from a default JSON on first install
- Date comparisons in local timezone (IST)
- Badge uses inline-flex, does not disturb surrounding layout
- Scan efficiently: walk text nodes only, skip scripts and styles

## Files I need

Complete extension as a downloadable zip:
- manifest.json
- content.js (scanner, badge injection, tooltip)
- content.css (badge and tooltip styles)
- options.html, options.css, options.js (calendar editor with import/export)
- default-calendar.json (initial data)
- Icons at 16, 48, 128 (calendar with a small exclamation or star)

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select folder
4. Open any finance news site
5. If an article mentions Reliance, Infosys, or any pre-loaded company, you should see a 📅 badge

Include these steps at the end. Also mention how to update the calendar from the options page.

## Important

I am not a developer. The extension should work first try with the pre-populated data. Sites with dynamic content should still get badges as the content loads; use MutationObserver for this.
