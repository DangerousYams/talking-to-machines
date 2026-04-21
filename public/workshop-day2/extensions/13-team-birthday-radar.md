# Build a Chrome Extension: Team Birthday Radar

## Goal
I paste my direct reports' birthdays and work anniversaries once. The extension reminds me two days before each event with a suggested message I can tweak and copy.

## What the extension does

In the options page, I enter my team members one by one: name, birthday (DD/MM format, year optional), and work anniversary date. The extension checks every morning: if anyone has a birthday or anniversary within the next 2 days, I get a Chrome notification. Clicking the notification or the extension icon opens a popup showing the upcoming events with a ready-to-copy message for each.

## Features

- Options page: table of team members with columns Name, Birthday, Anniversary, Actions (edit, delete). Form at top to add new members.
- Background check runs once per day using chrome.alarms (at 8:30 AM local time by default)
- Notification appears 2 days before any birthday or anniversary
- Clicking the extension icon shows popup: "Upcoming this week" list with each event, date, days-until, and a suggested message in a copyable card
- "Copy message" button copies to clipboard
- Import/Export team list as CSV (most HR systems export as CSV)
- Let me customize the message templates in settings

## Default message templates

Ship with these. Let me edit them in settings.

**Birthday template**: "Happy birthday {name}! Hope you have a wonderful day. Grateful to have you on the team."

**Anniversary template (1 year)**: "Hi {name}, completing your first year with us this week. Thank you for everything you've brought to the team. Here's to many more."

**Anniversary template (2-4 years)**: "Hi {name}, {years} years with the team this week. Your contribution has been meaningful and I want you to know it's noticed."

**Anniversary template (5+ years)**: "Hi {name}, {years} years is a real milestone. Thank you for your commitment and for shaping what this team has become."

The extension should pick the right anniversary template based on years elapsed.

## Technical specs

- Manifest V3
- Permissions: `storage`, `alarms`, `notifications`, `clipboardWrite`
- Team data stored in chrome.storage.local
- Daily check at 8:30 AM (configurable) via chrome.alarms
- Calculate days until event in local timezone, handling year wrap correctly (birthday on Jan 5 when today is Dec 30 should say "6 days")
- CSV import expects columns: Name, Birthday (DD/MM/YYYY or DD/MM), Anniversary (DD/MM/YYYY)

## Sample team data

Ship with 3 placeholder rows so the user sees the structure immediately. Make them obvious placeholders to delete:
- "(Example) Priya Sharma", Birthday 15/06, Anniversary 01/03/2023
- "(Example) Rohit Mehta", Birthday 22/11, Anniversary 15/07/2024
- "(Example) Anjali Iyer", Birthday 03/04, Anniversary 20/09/2022

## Files I need

Complete extension as a downloadable zip:
- manifest.json
- background.js (daily alarm, notification, days-until logic)
- popup.html, popup.css, popup.js (upcoming events view)
- options.html, options.css, options.js (team management, CSV import/export)
- settings.html, settings.css, settings.js (message templates, check time)
- Icons at 16, 48, 128 (calendar with a heart or gift motif)

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select the folder
4. Click the extension icon, then "Manage team" to add your team members
5. Allow notifications when Chrome asks

Include these steps at the end. Mention that all data stays on my device and is never sent anywhere.

## Important

Not a developer. First try works. Notifications should be gentle, not intrusive. If I haven't added my team yet, the popup should guide me kindly, not show an empty error state.
