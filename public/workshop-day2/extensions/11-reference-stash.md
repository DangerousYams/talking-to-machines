# Build a Chrome Extension: Reference Stash

## Goal
Right-click any image on any site, save it to one of my project folders, then browse all my saved references as visual boards in my new tab.

## What the extension does

I right-click on an image while browsing (Pinterest, Instagram, Google Images, a design blog, anywhere). The menu includes "Save to project." I pick an existing project or type a new project name. The image URL, source page URL, source site, and an optional one-line note are saved to that project. My new tab shows all projects as boards with image thumbnails in a grid. Clicking an image opens the original source page in a new tab.

## Features

- Context menu item "Save to project" appears when right-clicking an image
- Clicking it opens a small popup: dropdown of existing projects, or type a new project name, plus an optional note field
- New-tab override shows all projects as cards; clicking a project opens that board
- Project board is a masonry or grid layout of all saved images
- Each image shows: thumbnail, source site favicon, my note (if any), a "delete" x button, and a link icon to open the source page
- Search bar across all projects filters by project name, note, or source site
- Export a project as JSON or as a folder of image URLs (not the actual images, just the URLs and notes)

## Technical specs

- Manifest V3
- Permissions: `contextMenus`, `storage`, `activeTab`
- Host permissions: `<all_urls>`
- New-tab page override
- Store project data in chrome.storage.local as an object keyed by project name
- Each image entry: `{ url, sourcePage, sourceSite, note, savedAt }`
- Thumbnails displayed by loading the image URL directly (no actual storage of image bytes, just references)
- Handle broken image links gracefully: show a placeholder and the source link

## Pre-populated projects

Start with three empty example projects so the user sees the structure:
- "Inspiration"
- "Client: (first project)"
- "Competitive references"

These are empty shells I can rename or delete right away.

## Files I need

Complete extension, downloadable zip:
- manifest.json
- background.js (context menu and save handler)
- save-popup.html, save-popup.css, save-popup.js (the "save to project" dialog)
- newtab.html, newtab.css, newtab.js (the board browser)
- Icons at 16, 48, 128 (image frame or bookmark-with-image motif)

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select folder
4. Open a new Chrome tab to see the board browser
5. Go to Pinterest or Google Images, right-click an image, choose "Save to project"

Include these steps at the end.

## Important

Not a developer. First try works. On sites like Pinterest that use background-image CSS instead of `<img>` tags, the context menu might not appear; that is OK for now. The common case (Instagram posts, Google Images, blog posts) is what matters.
