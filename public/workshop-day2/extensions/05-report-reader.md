# Build a Chrome Extension: Report Reader

## Goal
One click strips ads, popups, and sidebars from Indian finance news sites and gives me a clean reading view tuned to my preferred font size.

## What the extension does

When I visit an article on Moneycontrol, Livemint, Business Standard, Economic Times, or Financial Express, the extension icon becomes active. I click it, and the page transforms into clean reading mode: article title, byline, publish date, and body text centered in a readable column. Everything else (ads, sidebars, related articles, popup newsletter signups, sticky headers) is hidden. A small floating toolbar in the corner lets me adjust font size, switch between light and dark reading modes, and exit reader mode.

## Features

- Works on these domains: moneycontrol.com, livemint.com, business-standard.com, economictimes.indiatimes.com, financialexpress.com, thehindubusinessline.com
- Icon is greyed out on unsupported sites, active on supported ones
- One click to toggle reader mode on or off
- Reader mode shows: article H1, byline, date, body text only
- Floating toolbar with: font size smaller, font size larger, light/dark toggle, exit
- Remembers my last font size and theme preference in storage
- Dark mode uses a warm-toned dark background (like #1a1612), not pure black
- Font is a readable serif like Georgia or system UI serif, line height generous

## Technical specs

- Manifest V3
- Permissions: `storage`, `activeTab`, `scripting`
- Host permissions: the six news domains listed above
- Content script injected on click, not on page load (to keep sites normal until I ask)
- Use site-specific CSS selectors for each of the six sites to find the article body, falling back to `<article>` tag if no specific rule matches
- Reading column max width around 680px
- Save theme and font size preferences globally, not per site

## Files I need

Complete extension as a downloadable zip. Include:
- manifest.json
- content.js (selector logic, reader mode activation)
- reader.css (reader mode styles, light and dark)
- toolbar.js and toolbar.css (floating control bar)
- popup.html (simple on/off toggle and info about supported sites)
- background.js (keeps icon state synced to supported domains)
- Icons at 16, 48, 128 (open book motif or reader-glasses icon)

## Site-specific selector hints

For each site, try these selectors first to find the article body:
- moneycontrol.com: `.article-content-wrapper`, `.article_wrapper`, `[class*="article_content"]`
- livemint.com: `.mainArea`, `.storyContent`, `[class*="storyParagraph"]`
- business-standard.com: `.story-content`, `.storycontent`
- economictimes.indiatimes.com: `.artText`, `.artical-content`, `.content`
- financialexpress.com: `.wp-block-post-content`, `.story-details`
- thehindubusinessline.com: `[itemprop="articleBody"]`, `.article-body`

If none match, fall back to the longest `<article>` element, or the longest text block on the page.

## How I'll install it

1. Download, unzip
2. Chrome extensions page, developer mode on
3. Load unpacked, select the folder
4. Open an article on Moneycontrol or Mint
5. Click the Report Reader icon to test

Include these steps at the end of your response. Also include a one-line note on how to report a site where the selectors miss.

## Important

I am not a developer. Working first try on at least 4 of 6 sites is success. Sites change their HTML regularly, so include comments in the code that tell me where to update selectors when a site breaks.
