# Build a Chrome Extension: Focus Switch

## Goal
One click blocks my distracting sites for 25 minutes with a Pomodoro countdown visible in my toolbar.

## What the extension does

I click the Focus Switch icon. A popup opens with a big "Start 25-minute focus" button, a list of currently blocked sites with checkboxes, and a small gear icon to edit the block list. When I start a session, the blocked sites become inaccessible (they redirect to a gentle "Focus in progress, come back in X minutes" page), a countdown timer shows in the toolbar badge, and the popup now shows the countdown plus a "Stop early" button. When the session ends, I get a friendly completion notification.

## Features

- Default block list: twitter.com, x.com, instagram.com, youtube.com, reddit.com, facebook.com, linkedin.com
- Popup lets me uncheck sites for this session (for example, I might need LinkedIn today but not YouTube)
- Start button begins a 25-minute timer
- Toolbar badge shows remaining minutes in red
- Blocked sites redirect to a local page called `focus.html` that shows "You are focusing. X minutes remaining" with a reassuring tone
- Notification at end: "Focus session complete. Take a 5-minute break."
- Timer persists if I close the popup
- Settings page lets me change the session length, customize the block list, and edit the blocked-page message

## Technical specs

- Manifest V3
- Permissions: `storage`, `alarms`, `notifications`, `declarativeNetRequest`
- Use `chrome.alarms` for the countdown, not setTimeout
- Use `chrome.declarativeNetRequest` with dynamic rules to block sites during focus
- Badge text should update every minute, not every second, to save battery
- Popup around 320px wide

## Files I need

Complete extension, packaged as a downloadable zip. Include:
- manifest.json
- popup.html, popup.css, popup.js
- background.js (service worker for timer and rules)
- focus.html and focus.css (the blocked-page redirect target)
- options.html, options.css, options.js (settings)
- Simple icons at 16, 48, 128px (a minimalist circle-with-dot focus motif)

## How I'll install it

1. Download, unzip
2. Go to chrome://extensions
3. Developer mode on
4. Load unpacked, select the folder
5. Pin the extension, click it, hit Start, then try opening twitter.com to confirm it redirects

Please include these steps at the end of your response.

## Important

I am not a developer. If there is any risk of blocking a site I am actively logged into for work, prefer to show the redirect page rather than breaking the connection. Make it work first try.
