# Build a Chrome Extension: Tab Rescue

## Goal
Help me escape my 40+ open tabs by giving me a clean list I can save, then close everything I don't need.

## What the extension does

When I click the Tab Rescue icon in my toolbar, a popup opens showing every tab I have open across all windows, grouped by domain. Next to each tab is a checkbox. At the bottom of the popup are three buttons: "Copy as markdown list" (copies the full grouped list to my clipboard), "Close unchecked tabs" (closes any tab I have not checked), and "Close all except checked."

## Features

- Popup lists all open tabs grouped alphabetically by domain
- Each tab shows favicon, page title, and a checkbox
- Clicking a tab title in the popup switches me to that tab
- "Copy as markdown" button copies a nicely formatted list like `**domain.com**\n- [Page title](url)\n- [Page title](url)`
- "Close unchecked" button closes every tab that does not have a checkbox ticked, with a small confirmation dialog first
- Remember my last selection for 5 minutes in case I close the popup by accident

## Technical specs

- Manifest V3
- Permissions needed: `tabs`, `clipboardWrite`, `storage`
- No external APIs, no servers, nothing leaves my browser
- Clean minimal popup, around 400px wide, 600px tall max with scrolling
- Use system font stack for text, nothing fancy

## Files I need

Please create a complete Chrome extension folder and package it as a downloadable zip. Include:
- manifest.json
- popup.html
- popup.css
- popup.js
- Simple SVG icons at 16px, 48px, 128px (a small tab-with-lifebuoy motif works, or just a clean letter T)

## How I'll install it

After you give me the zip, I will:
1. Download the zip and unzip it somewhere easy to find
2. Open a new Chrome tab and go to `chrome://extensions`
3. Turn on "Developer mode" using the toggle at the top right
4. Click "Load unpacked" and select the folder I unzipped
5. Pin the extension to my toolbar by clicking the puzzle-piece icon and pinning Tab Rescue

Please include these installation steps at the end of your response. Also include one example of what the markdown output looks like so I can verify it works.

## Important

I am not a developer. Please make this work first try. If you need to make judgment calls, prefer the simplest working approach. Keep the code readable so I can tweak small things later.
