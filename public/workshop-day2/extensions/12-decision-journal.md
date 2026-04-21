# Build a Chrome Extension: Decision Journal

## Goal
Replace my new tab with a daily reflection tool. Every morning, it asks me one question: "What is the most important decision you made yesterday, and why?" Answers save locally and I can browse or review them monthly.

## What the extension does

Every new Chrome tab shows a clean full-page view. If I haven't written today's entry yet, I see today's question front and center with a text box. Once I submit, the page thanks me and shows a "View past entries" button. Throughout the rest of the day, new tabs show a calm "You've logged today" screen with the same button to review.

At the start of each month, a small monthly review summary appears: total entries this month, first and last entry dates, and a list of all entries with short previews.

## Features

- New-tab override showing the current question and text area if not logged today
- Date-aware: shows "logged today" state after submission
- Past entries view: chronological list, most recent first, click to expand full text
- Monthly review: triggered on the 1st of each month, shows a summary of last month's entries
- Entries save instantly to chrome.storage.local
- Export all entries as Markdown or JSON
- Small gear icon for settings: change the daily prompt question, adjust the "new month" trigger

## Question rotation

Ship with these prompt variants so the question isn't monotonous. Rotate through the list; use one per day of the week:

- Monday: "What's the most important decision you made last week, and why?"
- Tuesday: "What did you decide yesterday that you're proud of? What's one you'd redo?"
- Wednesday: "What is one thing you learned yesterday that surprised you?"
- Thursday: "What decision are you avoiding? Why?"
- Friday: "What did you say no to this week that gave you back time?"
- Saturday: "This week: one win, one loss, one lesson."
- Sunday: "Looking at next week, what is the one decision that matters most?"

Let me edit any of these in settings.

## Technical specs

- Manifest V3
- Permissions: `storage`
- Chrome URL override: new tab
- Entries stored as an array of `{ date, question, answer, createdAt }` in chrome.storage.local
- Date comparisons use local timezone (IST for India-based user)
- Clean typographic design: serif for the question (Georgia or similar), sans-serif for input and UI
- Warm neutral background (#fafaf7 light mode, #1a1a1a dark mode), auto-detected from system preference

## Files I need

Complete extension as a downloadable zip:
- manifest.json
- newtab.html, newtab.css, newtab.js (the main surface)
- review.html, review.css, review.js (past entries browser)
- settings.html, settings.css, settings.js
- default-questions.json (the rotating prompts)
- Icons at 16, 48, 128 (small book or journal motif)

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select folder
4. Open a new tab to see today's prompt

Include these steps at the end. Also mention that this only changes Chrome's new tab, not my homepage.

## Important

Not a developer. First try working. Writing experience should feel calm and unhurried, not pressured. No word-count targets, no streak counters, no gamification. This is a thinking tool, not a habit tracker.
