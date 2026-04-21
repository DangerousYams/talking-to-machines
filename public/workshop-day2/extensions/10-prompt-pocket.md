# Build a Chrome Extension: Prompt Pocket

## Goal
Save my most-used AI prompts, organize them into folders, and insert any of them into any text field on any website with a right-click.

## What the extension does

I collect prompts as I find ones that work well. They live in Prompt Pocket, organized into folders I define (like "Research," "Writing," "Code reviews"). When I'm on any site with a text input or text area (ChatGPT, Claude, Gemini, Gmail, Google Docs, Slack, anything), I right-click in the input and see a "Insert prompt" submenu with my folders and prompts. I pick one, and it types into the field. A keyboard shortcut also opens a quick-pick popup right where my cursor is.

## Features

- Right-click context menu: "Insert prompt" submenu organized by folder
- Keyboard shortcut (default Cmd+Shift+P or Ctrl+Shift+P) opens a quick-pick floating menu at cursor position with fuzzy search
- Options page to manage prompts: create folders, add/edit/delete prompts within folders
- Each prompt has: Title (shown in menus), Body (what gets inserted), Optional shortcut key
- Import / Export all prompts as JSON
- Pre-populated starter prompts included

## Pre-populated starter prompts

Ship with these folders and prompts as a helpful starter library.

**Research**
- "Steelman the other side": "Give me the strongest possible argument against the position I just described. Be rigorous and charitable, not a strawman."
- "What am I missing": "Here is my reasoning. What are three blindspots or assumptions I'm making that could be wrong?"
- "Compare three ways": "Show me three different ways to think about this, each with different assumptions and tradeoffs."

**Writing**
- "Shorter and clearer": "Rewrite this to be 40% shorter without losing any important meaning. Active voice, plain words, no jargon."
- "No AI smell": "Rewrite this without em dashes, without 'delve,' without 'in today's fast-paced world,' without rule-of-three lists. Sound like a human wrote it in one draft."
- "Executive summary": "Summarize this for a senior leader who has 90 seconds. One paragraph, three bullet points, one recommendation."

**Thinking**
- "Decision framework": "Help me think through this decision. What are the inputs, the constraints, the options, and the evaluation criteria? Don't give me an answer yet, help me structure the problem."
- "Red team": "Act as a skeptical reviewer. Poke holes in this. What would go wrong? What are the worst-case outcomes?"

**Meta**
- "Ask before you answer": "Before you answer, ask me any clarifying questions that would meaningfully change your response."
- "Structured output": "Give your answer in three parts: what I should know, what I should do, what I should watch out for."

## Technical specs

- Manifest V3
- Permissions: `contextMenus`, `storage`, `activeTab`
- Host permissions: `<all_urls>`
- Content script handles keyboard shortcut and quick-pick floating menu
- Inserting text uses `document.execCommand('insertText')` with a fallback to manual value assignment for modern React-based inputs
- Floating quick-pick uses a searchable list, styled as a small command palette

## Files I need

Complete extension, downloadable zip:
- manifest.json
- background.js (context menu setup from stored prompts)
- content.js (keyboard shortcut, quick-pick UI, insertion logic)
- content.css (quick-pick styling)
- options.html, options.css, options.js (folder and prompt management)
- default-prompts.json (starter content)
- Icons at 16, 48, 128 (pocket or folded-paper motif)

## How I'll install it

1. Download and unzip
2. chrome://extensions, developer mode on
3. Load unpacked, select folder
4. Open ChatGPT or Claude.ai, right-click in the chat box, try "Insert prompt"
5. Or press Cmd+Shift+P (Ctrl+Shift+P on Windows) for quick-pick

Include these steps at the end.

## Important

Not a developer. First-try works. Inserting text into modern React inputs (like ChatGPT's) is tricky: make sure the insertion triggers a proper input event so the target site recognizes the text. This is the one thing that will make me love or hate this extension.
